const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { callOpenAiTranscribe } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { parseAudioDataUrl, guessAudioFilename } = require("./_lib/media");
const { logUsageEvent } = require("./_lib/usage");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { isValidLanguage } = require("./_lib/limits");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req, 30 * 1024 * 1024);
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
      scope: "ai:transcribe",
      limit: 20,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const audioData = String(payload.audioData || "").trim();
  const language = String(payload.language || "da").trim().toLowerCase();
  const model = process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1";

  if (!audioData) {
    return sendError(res, 400, "Missing audioData");
  }
  if (!isValidLanguage(language)) {
    return sendError(res, 400, "Invalid language");
  }

  let audio;
  try {
    audio = parseAudioDataUrl(audioData);
  } catch (error) {
    return sendError(res, 400, error.message || "Invalid audio data");
  }

  try {
    const result = await callOpenAiTranscribe({
      apiKey: access.key,
      audioBytes: audio.buffer,
      mimeType: audio.mimeType,
      filename: guessAudioFilename(audio.mimeType),
      language,
    });

    const text = String(result.text || "").trim();

    await logUsageEvent(user.id, {
      eventType: "transcribe",
      model,
      mode: access.mode,
    });

    return sendJson(res, 200, {
      text,
      model,
    });
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
