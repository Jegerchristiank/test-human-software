const { readJson } = require("./_lib/body");
const { sendError } = require("./_lib/response");
const { callOpenAiTts } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");

const TTS_VOICES = new Set(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]);

function clampTtsSpeed(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return 1.0;
  return Math.max(0.25, Math.min(speed, 4.0));
}

function cleanTtsText(text) {
  return String(text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

  const text = cleanTtsText(payload.text || "");
  const voice = String(payload.voice || "alloy").trim().toLowerCase() || "alloy";
  const speed = clampTtsSpeed(payload.speed || 1.0);
  const model = process.env.OPENAI_TTS_MODEL || "tts-1";

  if (!text) {
    return sendError(res, 400, "Missing text");
  }
  if (!TTS_VOICES.has(voice)) {
    return sendError(res, 400, "Unknown voice");
  }

  try {
    const audioBytes = await callOpenAiTts({
      apiKey: access.key,
      voice,
      speed,
      text,
    });

    await logUsageEvent(user.id, {
      eventType: "tts",
      model,
      mode: access.mode,
      promptChars: text.length,
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.end(audioBytes);
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
