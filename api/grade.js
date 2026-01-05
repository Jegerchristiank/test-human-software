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

  const prompt = String(payload.prompt || "").trim();
  const modelAnswer = String(payload.modelAnswer || "").trim();
  const userAnswer = String(payload.userAnswer || "").trim();
  const maxPoints = Number(payload.maxPoints || 0) || 0;
  const ignoreSketch = Boolean(payload.ignoreSketch);
  const language = String(payload.language || "da").trim().toLowerCase();
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  if (!prompt || !userAnswer) {
    return sendError(res, 400, "Missing prompt or userAnswer");
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
