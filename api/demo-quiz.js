const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { enforceRateLimit } = require("./_lib/rateLimit");

const MCQ_COUNT = 5;
const OPTIONS_COUNT = 4;
const DAILY_WINDOW_SECONDS = 24 * 60 * 60;

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return null;
  const cleaned = options.map(cleanText).filter(Boolean);
  const unique = [...new Set(cleaned)];
  if (unique.length < OPTIONS_COUNT) return null;
  return unique.slice(0, OPTIONS_COUNT);
}

function normalizeMcq(item) {
  const question = cleanText(item?.question);
  const options = normalizeOptions(item?.options);
  const correctIndex = Number(item?.correctIndex);
  if (!question || !options || !Number.isFinite(correctIndex)) return null;
  return {
    question,
    options,
    correctIndex: Math.min(OPTIONS_COUNT - 1, Math.max(0, Math.floor(correctIndex))),
    explanation: cleanText(item?.explanation),
  };
}

function buildFallbackKeywords(answer) {
  return cleanText(answer)
    .split(/[\s,.;:]+/)
    .filter((word) => word.length > 3)
    .slice(0, 3);
}

function normalizeQuiz(result) {
  const title = cleanText(result?.title) || "Prøvespil";
  const mcqRaw = Array.isArray(result?.mcq) ? result.mcq : [];
  const mcq = [];
  for (const item of mcqRaw) {
    const normalized = normalizeMcq(item);
    if (normalized) mcq.push(normalized);
    if (mcq.length === MCQ_COUNT) break;
  }
  if (mcq.length < MCQ_COUNT) {
    throw new Error("Invalid MCQ payload");
  }

  const short = result?.short || null;
  const shortQuestion = cleanText(short?.question);
  const shortAnswer = cleanText(short?.answer);
  if (!shortQuestion || !shortAnswer) {
    throw new Error("Invalid short answer payload");
  }
  let keywords = Array.isArray(short?.keywords)
    ? short.keywords.map(cleanText).filter(Boolean)
    : [];
  if (keywords.length === 0) {
    keywords = buildFallbackKeywords(shortAnswer);
  }

  return {
    title,
    mcq,
    short: {
      question: shortQuestion,
      answer: shortAnswer,
      keywords,
      explanation: cleanText(short?.explanation),
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload = {};
  try {
    payload = await readJson(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  if (
    !(await enforceRateLimit(req, res, {
      scope: "demo:quiz",
      limit: 1,
      windowSeconds: DAILY_WINDOW_SECONDS,
    }))
  ) {
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendError(res, 503, "missing_key");
  }

  const language = cleanText(payload?.language || "da").toLowerCase();
  const systemPrompt =
    "Du er underviser i human biologi på gymnasieniveau. " +
    "Lav et mini-prøvespil med præcis 5 multiple choice spørgsmål og 1 kortsvarsopgave. " +
    "MCQ skal have 4 svarmuligheder og kun ét korrekt svar. " +
    "Kortsvar skal kunne besvares med 1-2 sætninger. " +
    "Returnér kun JSON med formatet: " +
    '{ "title": string, "mcq": [{ "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string } x5], ' +
    '"short": { "question": string, "answer": string, "keywords": [string], "explanation": string } }. ' +
    "Hold spørgsmålene klare og korte. " +
    languageInstruction(language);
  const userPrompt = "Lav quizzen nu.";

  try {
    const result = await callOpenAiJson({
      apiKey,
      systemPrompt,
      userPrompt,
    });
    const payloadOut = normalizeQuiz(result);
    return sendJson(res, 200, payloadOut);
  } catch (error) {
    return sendError(res, 502, error.message || "OpenAI error");
  }
};
