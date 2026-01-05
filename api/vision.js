const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiVision } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { isDataUrl, parseImageDataUrl, loadImageAsDataUrl } = require("./_lib/media");
const { logUsageEvent } = require("./_lib/usage");
const { enforceRateLimit } = require("./_lib/rateLimit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req, 10 * 1024 * 1024);
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
      scope: "ai:vision",
      limit: 20,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const task = String(payload.task || "").trim().toLowerCase();
  const language = String(payload.language || "da").trim().toLowerCase();
  const imagePath = String(payload.imagePath || "").trim();
  const imageData = String(payload.imageData || "").trim();
  const model = process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-5.2";

  let imageUrl = "";
  try {
    if (imagePath) {
      imageUrl = loadImageAsDataUrl(imagePath, { allowedPrefixes: ["billeder/"] });
    } else if (imageData) {
      if (!isDataUrl(imageData)) {
        return sendError(res, 400, "Invalid imageData");
      }
      parseImageDataUrl(imageData);
      imageUrl = imageData;
    }
  } catch (error) {
    const message = error.message || "Invalid image";
    return sendError(res, 400, message);
  }

  if (!imageUrl) {
    return sendError(res, 400, "Missing image");
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (task === "figure") {
    systemPrompt =
      "Du er en præcis beskriver af medicinske illustrationer. " +
      "Beskriv kun det, der er synligt i billedet, uden at gætte. " +
      "Returnér kun JSON med felterne: description (string), labels (list), topics (list). " +
      languageInstruction(language);
    userPrompt =
      `Sprog: ${language}\n` +
      "Beskriv figuren for en studerende i 2-4 korte sætninger. " +
      "Inkludér nøgleetiketter og relationer, hvis de er vist.";
  } else if (task === "sketch") {
    const question = String(payload.question || "").trim();
    const modelAnswer = String(payload.modelAnswer || "").trim();
    if (!question) {
      return sendError(res, 400, "Missing question");
    }
    systemPrompt =
      "Du er en underviser, der vurderer en studerendes skitse. " +
      "Beskriv først hvad skitsen viser, og sammenlign derefter med modelsvaret. " +
      "Returnér kun JSON med felterne: description (string), match (number 0-1), " +
      "matched (list), missing (list), feedback (string). " +
      languageInstruction(language);
    userPrompt =
      `Sprog: ${language}\n` +
      `Spørgsmål: ${question}\n` +
      `Modelbesvarelse: ${modelAnswer}\n` +
      "Vurdér hvor godt skitsen matcher modelbesvarelsen.";
  } else {
    return sendError(res, 400, "Unknown task");
  }

  try {
    const result = await callOpenAiVision({
      apiKey: access.key,
      systemPrompt,
      userPrompt,
      imageUrl,
    });

    const responsePayload = { model };
    if (task === "figure") {
      responsePayload.description = String(result.description || "").trim();
      responsePayload.labels = result.labels || [];
      responsePayload.topics = result.topics || [];
    } else {
      responsePayload.description = String(result.description || "").trim();
      responsePayload.match = Number(result.match || 0) || 0;
      responsePayload.matched = result.matched || [];
      responsePayload.missing = result.missing || [];
      responsePayload.feedback = String(result.feedback || "").trim();
    }

    await logUsageEvent(user.id, {
      eventType: task === "figure" ? "vision_figure" : "vision_sketch",
      model,
      mode: access.mode,
    });

    return sendJson(res, 200, responsePayload);
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
