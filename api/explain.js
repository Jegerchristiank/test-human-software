const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");

function formatMcqOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => {
      const label = String(option.label || "").trim().toUpperCase();
      const text = String(option.text || "").trim();
      if (!label) return null;
      return `${label}. ${text}`;
    })
    .filter(Boolean);
}

function findOptionText(options, label) {
  if (!Array.isArray(options)) return "";
  const normalized = String(label || "").trim().toUpperCase();
  const match = options.find(
    (option) => String(option.label || "").trim().toUpperCase() === normalized
  );
  return match ? String(match.text || "").trim() : "";
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

  const questionType = String(payload.type || "").trim().toLowerCase();
  const question = String(payload.question || "").trim();
  const language = String(payload.language || "da").trim().toLowerCase();
  const previousExplanation = String(payload.previousExplanation || "").trim();
  const expand = Boolean(payload.expand) && Boolean(previousExplanation);
  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  if (!questionType || !question) {
    return sendError(res, 400, "Missing type or question");
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (questionType === "mcq") {
    const options = payload.options || [];
    const correctLabel = String(payload.correctLabel || "").trim().toUpperCase();
    const userLabel = String(payload.userLabel || "").trim().toUpperCase();
    const skipped = Boolean(payload.skipped);

    if (!correctLabel) {
      return sendError(res, 400, "Missing correctLabel");
    }

    const formattedOptions = formatMcqOptions(options);
    const correctText = findOptionText(options, correctLabel);
    const userText = findOptionText(options, userLabel);

    if (expand) {
      systemPrompt =
        "Du er en hjælpsom tutor. " +
        "Udvid den eksisterende forklaring med flere detaljer og sammenhænge. " +
        "Gå et lag dybere i mekanismerne uden at gentage den eksisterende forklaring ordret. " +
        "Svar i 4-7 korte sætninger. " +
        "Returnér kun JSON med feltet: explanation. " +
        languageInstruction(language);
    } else {
      systemPrompt =
        "Du er en hjælpsom tutor. " +
        "Forklar kort hvorfor det korrekte svar passer. " +
        "Hvis et elevsvar er angivet, forklar også kort hvorfor det ikke gør. " +
        "Fokusér på den centrale begrundelse fremfor bare rigtigt/forkert. " +
        "Svar i 2-4 korte sætninger. " +
        "Returnér kun JSON med feltet: explanation. " +
        languageInstruction(language);
    }

    const studentLine = skipped || !userLabel
      ? "Studerendes svar: Sprunget over"
      : `Studerendes svar: ${userLabel}. ${userText}`;

    userPrompt =
      `Sprog: ${language}\n` +
      `Spørgsmål: ${question}\n` +
      `Muligheder: ${formattedOptions.join(" | ")}\n` +
      `Korrekt svar: ${correctLabel}. ${correctText}\n` +
      `${studentLine}\n` +
      (expand ? `Eksisterende forklaring: ${previousExplanation}\n` : "") +
      "Returnér kun JSON.";
  } else if (questionType === "short") {
    const modelAnswer = String(payload.modelAnswer || "").trim();
    const userAnswer = String(payload.userAnswer || "").trim();
    const maxPoints = Number(payload.maxPoints || 0) || 0;
    const awardedPoints = Number(payload.awardedPoints || 0) || 0;
    const ignoreSketch = Boolean(payload.ignoreSketch);
    const skipped = Boolean(payload.skipped);

    if (expand) {
      systemPrompt =
        "Du er en hjælpsom tutor. " +
        "Udvid den eksisterende forklaring med flere detaljer og faglige sammenhænge. " +
        "Gå et lag dybere uden at gentage den eksisterende forklaring ordret. " +
        "Svar i 4-7 korte sætninger uden at kopiere facit. " +
        "Returnér kun JSON med feltet: explanation. " +
        languageInstruction(language);
    } else {
      systemPrompt =
        "Du er en hjælpsom tutor. " +
        "Forklar kort hvad et godt svar skal indeholde, og hvad der evt. mangler eller er misforstået. " +
        "Hvis der ikke er givet et svar, forklar kort det centrale indhold. " +
        "Svar i 2-4 korte sætninger uden at kopiere facit. " +
        "Returnér kun JSON med feltet: explanation. " +
        languageInstruction(language);
    }

    if (ignoreSketch) {
      systemPrompt += " Ignorér krav om skitse/tegning; vurder kun tekstsvaret.";
    }

    const studentLine = skipped || !userAnswer
      ? "Studerendes svar: Sprunget over"
      : `Studerendes svar: ${userAnswer}`;

    userPrompt =
      `Sprog: ${language}\n` +
      `Spørgsmål: ${question}\n` +
      `Modelbesvarelse: ${modelAnswer}\n` +
      `${studentLine}\n` +
      `Point: ${awardedPoints} / ${maxPoints}\n` +
      (expand ? `Eksisterende forklaring: ${previousExplanation}\n` : "") +
      "Returnér kun JSON.";
  } else {
    return sendError(res, 400, "Unknown type");
  }

  try {
    const result = await callOpenAiJson({
      apiKey: access.key,
      systemPrompt,
      userPrompt,
    });

    const explanation = String(result.explanation || "").trim();

    await logUsageEvent(user.id, {
      eventType: "explain",
      model,
      mode: access.mode,
      promptChars: question.length,
    });

    return sendJson(res, 200, {
      explanation,
      model,
    });
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
