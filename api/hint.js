const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { LIMITS, clampNumber, isValidLanguage } = require("./_lib/limits");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const { error, user, access } = await requireAiAccess(req);
  if (error) {
    const status = error === "missing_key" ? 503 : error === "unauthenticated" ? 401 : 402;
    return sendError(res, status, error);
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "ai:hint",
      limit: 40,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const question = String(payload.question || "").trim();
  const modelAnswer = String(payload.modelAnswer || "").trim();
  const userAnswer = String(payload.userAnswer || "").trim();
  const maxPoints = clampNumber(payload.maxPoints || 0, {
    min: 0,
    max: LIMITS.maxPoints,
  });
  const awardedPoints = clampNumber(payload.awardedPoints || 0, {
    min: 0,
    max: LIMITS.maxPoints,
  });
  const ignoreSketch = Boolean(payload.ignoreSketch);
  const language = String(payload.language || "da").trim().toLowerCase();
  const previousHint = String(payload.previousHint || "").trim();
  const expand = Boolean(payload.expand) && Boolean(previousHint);
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  if (!question || !modelAnswer) {
    return sendError(res, 400, "Missing question or modelAnswer");
  }
  if (!isValidLanguage(language)) {
    return sendError(res, 400, "Invalid language");
  }
  if (question.length > LIMITS.maxQuestionChars) {
    return sendError(res, 413, "Question too long");
  }
  if (modelAnswer.length > LIMITS.maxModelAnswerChars) {
    return sendError(res, 413, "Model answer too long");
  }
  if (userAnswer.length > LIMITS.maxUserAnswerChars) {
    return sendError(res, 413, "User answer too long");
  }
  if (previousHint.length > LIMITS.maxPreviousChars) {
    return sendError(res, 413, "Previous hint too long");
  }
  if (question.length + modelAnswer.length + userAnswer.length > LIMITS.maxTotalChars) {
    return sendError(res, 413, "Input too long");
  }
  if (maxPoints === null) {
    return sendError(res, 400, "Invalid maxPoints");
  }
  if (awardedPoints === null) {
    return sendError(res, 400, "Invalid awardedPoints");
  }
  const safeAwardedPoints = Math.min(awardedPoints ?? 0, maxPoints ?? 0);

  let systemPrompt;
  if (expand) {
    systemPrompt =
      "Du er en hjælpsom underviser. " +
      "Udvid det eksisterende hint med flere detaljer og sammenhænge. " +
      "Bevar hint-formatet og afslør ikke facit. " +
      "Returnér kun JSON med feltet: hint (string). " +
      "Hint må være 3-5 korte sætninger. " +
      languageInstruction(language);
  } else {
    systemPrompt =
      "Du er en hjælpsom underviser. " +
      "Giv et kort hint, der hjælper den studerende mod det rigtige svar uden at afsløre facit. " +
      "Fokusér på det vigtigste, der mangler eller er misforstået. " +
      "Returnér kun JSON med feltet: hint (string). " +
      "Hint må være 1-2 korte sætninger. " +
      languageInstruction(language);
  }

  if (ignoreSketch) {
    systemPrompt += " Ignorér krav om skitse/tegning; giv kun hint til tekstsvaret.";
  }

  const userPrompt =
    `Sprog: ${language}\n` +
    `Spørgsmål: ${question}\n` +
    `Modelbesvarelse: ${modelAnswer}\n` +
    `Studerendes svar: ${userAnswer}\n` +
    `Point: ${safeAwardedPoints} / ${maxPoints}\n` +
    (expand ? `Eksisterende hint: ${previousHint}\n` : "") +
    "Giv et hint (ikke facit). Returnér kun JSON.";

  try {
    const result = await callOpenAiJson({
      apiKey: access.key,
      systemPrompt,
      userPrompt,
    });

    const hint = String(result.hint || "").trim();

    await logUsageEvent(user.id, {
      eventType: "hint",
      model,
      mode: access.mode,
      promptChars: question.length + userAnswer.length,
    });

    return sendJson(res, 200, {
      hint,
      model,
    });
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
