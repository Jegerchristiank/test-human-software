const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { getUserFromRequest } = require("./_lib/auth");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { LIMITS, clampNumber, isValidLanguage } = require("./_lib/limits");
const { validatePayload } = require("./_lib/validate");
const { logEvaluationEvent } = require("./_lib/evaluationLog");

const POLICY_ID = "sygdomslaere:v1";
const STUDIO_ID = "sygdomslaere";
const RUBRIC_MATCH_RATIO = 0.35;
const RUBRIC_MIN_MATCH_TOKENS = 2;
const RUBRIC_SCORE_STEP = 0.5;
const RUBRIC_MAX_LIST = 12;
const RUBRIC_TOKEN_REGEX = /[a-z0-9\u00e6\u00f8\u00e5]+/gi;
const RUBRIC_STOPWORDS = new Set([
  "og",
  "eller",
  "der",
  "som",
  "med",
  "for",
  "til",
  "fra",
  "ved",
  "hos",
  "om",
  "uden",
  "inden",
  "efter",
  "over",
  "under",
  "mellem",
  "samt",
  "men",
  "er",
  "var",
  "har",
  "kan",
  "skal",
  "ikke",
  "en",
  "et",
  "den",
  "det",
  "de",
  "da",
  "af",
  "på",
  "i",
]);

function normalizeRubricText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenizeRubricText(value) {
  const normalized = normalizeRubricText(value);
  const tokens = normalized.match(RUBRIC_TOKEN_REGEX) || [];
  return tokens.filter((token) => {
    if (!token) return false;
    if (RUBRIC_STOPWORDS.has(token)) return false;
    if (token.length >= 3) return true;
    return /\d/.test(token);
  });
}

function splitRubricCriteria(text) {
  const normalized = String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[.;:]+/g, "\n");
  return normalized
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

function scoreRubric({ rubricText, userAnswer, maxPoints }) {
  const criteria = splitRubricCriteria(rubricText);
  const answerTokens = new Set(tokenizeRubricText(userAnswer));
  let matchedCount = 0;
  const matched = [];
  const missing = [];

  criteria.forEach((criterion, index) => {
    const tokens = tokenizeRubricText(criterion);
    if (!tokens.length) return;
    const overlap = tokens.filter((token) => answerTokens.has(token));
    const ratio = overlap.length / tokens.length;
    const isMatch =
      overlap.length >= RUBRIC_MIN_MATCH_TOKENS || ratio >= RUBRIC_MATCH_RATIO;
    const label = `c${index + 1}`;
    if (isMatch) {
      matchedCount += 1;
      if (matched.length < RUBRIC_MAX_LIST) matched.push(label);
    } else if (missing.length < RUBRIC_MAX_LIST) {
      missing.push(label);
    }
  });

  const total = criteria.length;
  const ratio = total ? matchedCount / total : 0;
  const rawScore = ratio * maxPoints;
  const roundedScore =
    Math.round(rawScore / RUBRIC_SCORE_STEP) * RUBRIC_SCORE_STEP;
  const score = Math.min(maxPoints, Math.max(0, roundedScore));

  return {
    score,
    matched,
    missing,
    rubric: {
      matched: matchedCount,
      total,
      percent: total ? ratio * 100 : 0,
    },
  };
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

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }

  if (
    !(await enforceRateLimit(req, res, {
      scope: "rubric:score",
      limit: 60,
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
      rubric: {
        type: "string",
        maxLen: LIMITS.maxModelAnswerChars,
        maxLenMessage: "Rubric too long",
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
      language: {
        type: "string",
        pattern: LIMITS.languagePattern,
        patternMessage: "Invalid language",
      },
      studio: { type: "string", enum: [STUDIO_ID], enumMessage: "Invalid studio" },
      policyId: { type: "string", enum: [POLICY_ID], enumMessage: "Invalid policyId" },
      questionKey: { type: "string", maxLen: 160 },
      groupKey: { type: "string", maxLen: 160 },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const prompt = String(payload.prompt || "").trim();
  const rubric = String(payload.rubric || "").trim();
  const userAnswer = String(payload.userAnswer || "").trim();
  const maxPoints = clampNumber(payload.maxPoints || 0, {
    min: 0,
    max: LIMITS.maxPoints,
  });
  const language = String(payload.language || "da").trim().toLowerCase();
  const studio = payload.studio || STUDIO_ID;
  const policyId = payload.policyId || POLICY_ID;

  if (!prompt || !rubric || !userAnswer) {
    return sendError(res, 400, "Missing prompt, rubric, or userAnswer");
  }
  if (!isValidLanguage(language)) {
    return sendError(res, 400, "Invalid language");
  }
  if (studio !== STUDIO_ID || policyId !== POLICY_ID) {
    return sendError(res, 400, "Invalid scoring policy");
  }
  if (prompt.length + rubric.length + userAnswer.length > LIMITS.maxTotalChars) {
    return sendError(res, 413, "Input too long");
  }
  if (maxPoints === null) {
    return sendError(res, 400, "Invalid maxPoints");
  }

  const result = scoreRubric({ rubricText: rubric, userAnswer, maxPoints });
  const feedback =
    result.rubric.total > 0
      ? `Rubric dækning: ${result.rubric.matched}/${result.rubric.total} kriterier.`
      : "Rubric dækning: ingen kriterier.";

  await logEvaluationEvent(user.id, {
    studio,
    policyId,
    evaluationType: "rubric",
    questionKey: payload.questionKey || null,
    groupKey: payload.groupKey || null,
    inputVersion: "v1",
    outputVersion: "v1",
    input: {
      prompt,
      rubric,
      userAnswer,
      maxPoints,
      language,
    },
    output: {
      score: result.score,
      feedback,
      matched: result.matched,
      missing: result.missing,
      rubric: result.rubric,
    },
    meta: {
      promptChars: prompt.length,
      rubricChars: rubric.length,
      userAnswerChars: userAnswer.length,
      maxPoints,
      score: result.score,
      rubricMatched: result.rubric.matched,
      rubricTotal: result.rubric.total,
    },
  });

  return sendJson(res, 200, {
    score: result.score,
    feedback,
    matched: result.matched,
    missing: result.missing,
    rubric: result.rubric,
  });
};
