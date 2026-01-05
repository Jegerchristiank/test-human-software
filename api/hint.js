const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");

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

  const question = String(payload.question || "").trim();
  const modelAnswer = String(payload.modelAnswer || "").trim();
  const userAnswer = String(payload.userAnswer || "").trim();
  const maxPoints = Number(payload.maxPoints || 0) || 0;
  const awardedPoints = Number(payload.awardedPoints || 0) || 0;
  const ignoreSketch = Boolean(payload.ignoreSketch);
  const language = String(payload.language || "da").trim().toLowerCase();
  const previousHint = String(payload.previousHint || "").trim();
  const expand = Boolean(payload.expand) && Boolean(previousHint);
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  if (!question || !modelAnswer) {
    return sendError(res, 400, "Missing question or modelAnswer");
  }

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
    `Point: ${awardedPoints} / ${maxPoints}\n` +
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
