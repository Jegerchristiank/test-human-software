const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");
const { logEvaluationEvent } = require("./_lib/evaluationLog");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { LIMITS, clampNumber, isValidLanguage } = require("./_lib/limits");
const { validatePayload } = require("./_lib/validate");
const { applyTraceId } = require("./_lib/trace");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  applyTraceId(req, res);

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
      scope: "ai:grade",
      limit: 30,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const validation = validatePayload(payload, {
    fields: {
      prompt: {
        type: "string",
        maxLen: LIMITS.maxPromptChars,
        maxLenMessage: "Prompt too long",
        maxLenStatus: 413,
      },
      modelAnswer: {
        type: "string",
        maxLen: LIMITS.maxModelAnswerChars,
        maxLenMessage: "Model answer too long",
        maxLenStatus: 413,
      },
      userAnswer: {
        type: "string",
        maxLen: LIMITS.maxUserAnswerChars,
        maxLenMessage: "User answer too long",
        maxLenStatus: 413,
      },
      maxPoints: {
        type: "number",
        coerce: true,
        min: 0,
        max: LIMITS.maxPoints,
        typeMessage: "Invalid maxPoints",
        rangeMessage: "Invalid maxPoints",
      },
      ignoreSketch: { type: "boolean" },
      language: {
        type: "string",
        pattern: LIMITS.languagePattern,
        patternMessage: "Invalid language",
      },
      studio: {
        type: "string",
        enum: ["human", "sygdomslaere"],
        enumMessage: "Invalid studio",
      },
      policyId: { type: "string", maxLen: 64 },
      questionKey: { type: "string", maxLen: 160 },
      groupKey: { type: "string", maxLen: 160 },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const prompt = String(payload.prompt || "").trim();
  const modelAnswer = String(payload.modelAnswer || "").trim();
  const userAnswer = String(payload.userAnswer || "").trim();
  const maxPoints = clampNumber(payload.maxPoints || 0, {
    min: 0,
    max: LIMITS.maxPoints,
  });
  const ignoreSketch = Boolean(payload.ignoreSketch);
  const language = String(payload.language || "da").trim().toLowerCase();
  const model = process.env.OPENAI_MODEL || "gpt-5.2";
  const studio = payload.studio || "human";
  const policyId = payload.policyId || "humanbiologi:v1";

  if (!prompt || !userAnswer) {
    return sendError(res, 400, "Missing prompt or userAnswer");
  }
  if (!isValidLanguage(language)) {
    return sendError(res, 400, "Invalid language");
  }
  if (studio !== "human" || policyId !== "humanbiologi:v1") {
    return sendError(res, 400, "Invalid scoring policy");
  }
  if (prompt.length > LIMITS.maxPromptChars) {
    return sendError(res, 413, "Prompt too long");
  }
  if (modelAnswer.length > LIMITS.maxModelAnswerChars) {
    return sendError(res, 413, "Model answer too long");
  }
  if (userAnswer.length > LIMITS.maxUserAnswerChars) {
    return sendError(res, 413, "User answer too long");
  }
  if (prompt.length + modelAnswer.length + userAnswer.length > LIMITS.maxTotalChars) {
    return sendError(res, 413, "Input too long");
  }
  if (maxPoints === null) {
    return sendError(res, 400, "Invalid maxPoints");
  }

  let systemPrompt =
    "Du er en streng, men fair eksaminator. " +
    "Vurdér den studerendes svar mod modelsvaret. " +
    "Returnér kun JSON med felterne: " +
    "score (number), feedback (short text), missing (list), matched (list). " +
    `Score skal være mellem 0 og ${maxPoints}. ` +
    "Feedback skal være kort, konkret og på dansk. " +
    languageInstruction(language);

  if (ignoreSketch) {
    systemPrompt += " Ignorér krav om skitse/tegning; vurder kun tekstsvaret.";
  }

  const userPrompt =
    `Sprog: ${language}\n` +
    `Spørgsmål: ${prompt}\n` +
    `Modelbesvarelse: ${modelAnswer}\n` +
    `Studerendes svar: ${userAnswer}\n` +
    `Maks point: ${maxPoints}\n` +
    "Returnér kun JSON.";

  try {
    const result = await callOpenAiJson({
      apiKey: access.key,
      systemPrompt,
      userPrompt,
    });

    const scoreRaw = Number(result.score || 0) || 0;
    const score = Math.max(0, Math.min(scoreRaw, maxPoints));
    const feedback = String(result.feedback || "").trim();
    const missing = Array.isArray(result.missing) ? result.missing : [];
    const matched = Array.isArray(result.matched) ? result.matched : [];

    await logUsageEvent(user.id, {
      eventType: "grade",
      model,
      mode: access.mode,
      promptChars: prompt.length + userAnswer.length,
    });

    await logEvaluationEvent(user.id, {
      studio,
      policyId,
      evaluationType: "short",
      questionKey: payload.questionKey || null,
      groupKey: payload.groupKey || null,
      inputVersion: "v1",
      outputVersion: "v1",
      input: {
        prompt,
        modelAnswer,
        userAnswer,
        maxPoints,
        ignoreSketch,
        language,
      },
      output: {
        score,
        feedback,
        missing,
        matched,
        model,
      },
      meta: {
        promptChars: prompt.length,
        modelAnswerChars: modelAnswer.length,
        userAnswerChars: userAnswer.length,
        maxPoints,
        score,
        missingCount: missing.length,
        matchedCount: matched.length,
      },
    });

    return sendJson(res, 200, {
      score,
      feedback,
      missing,
      matched,
      model,
    });
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
