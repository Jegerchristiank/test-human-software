const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { languageInstruction } = require("./_lib/prompts");
const { callOpenAiJson } = require("./_lib/openai");
const { requireAiAccess } = require("./_lib/aiGate");
const { logUsageEvent } = require("./_lib/usage");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { LIMITS, clampNumber, isValidLanguage } = require("./_lib/limits");
const { validatePayload } = require("./_lib/validate");
const { applyTraceId } = require("./_lib/trace");

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
      scope: "ai:explain",
      limit: 30,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const validation = validatePayload(payload, {
    fields: {
      type: { type: "string" },
      question: {
        type: "string",
        maxLen: LIMITS.maxQuestionChars,
        maxLenMessage: "Question too long",
        maxLenStatus: 413,
      },
      language: {
        type: "string",
        pattern: LIMITS.languagePattern,
        patternMessage: "Invalid language",
      },
      previousExplanation: {
        type: "string",
        maxLen: LIMITS.maxPreviousChars,
        maxLenMessage: "Previous explanation too long",
        maxLenStatus: 413,
      },
      expand: { type: "boolean" },
      options: {
        type: "array",
        maxItems: LIMITS.maxOptions,
        maxItemsMessage: "Too many options",
        maxItemsStatus: 413,
        item: {
          type: "object",
          allowUnknown: true,
          fields: {
            label: {
              type: "string",
              required: true,
              requiredMessage: "Invalid options",
              minLen: 1,
              minLenMessage: "Invalid options",
              typeMessage: "Invalid options",
              maxLen: LIMITS.maxOptionLabelChars,
              maxLenMessage: "Option label too long",
              maxLenStatus: 413,
            },
            text: {
              type: "string",
              required: true,
              requiredMessage: "Invalid options",
              minLen: 1,
              minLenMessage: "Invalid options",
              typeMessage: "Invalid options",
              maxLen: LIMITS.maxOptionTextChars,
              maxLenMessage: "Option text too long",
              maxLenStatus: 413,
            },
          },
        },
      },
      correctLabel: {
        type: "string",
        maxLen: LIMITS.maxOptionLabelChars,
        maxLenMessage: "Correct label too long",
        maxLenStatus: 413,
      },
      userLabel: {
        type: "string",
        maxLen: LIMITS.maxOptionLabelChars,
        maxLenMessage: "User label too long",
        maxLenStatus: 413,
      },
      skipped: { type: "boolean" },
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
      awardedPoints: {
        type: "number",
        coerce: true,
        min: 0,
        max: LIMITS.maxPoints,
        typeMessage: "Invalid awardedPoints",
        rangeMessage: "Invalid awardedPoints",
      },
      ignoreSketch: { type: "boolean" },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
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
  if (!isValidLanguage(language)) {
    return sendError(res, 400, "Invalid language");
  }
  if (question.length > LIMITS.maxQuestionChars) {
    return sendError(res, 413, "Question too long");
  }
  if (previousExplanation.length > LIMITS.maxPreviousChars) {
    return sendError(res, 413, "Previous explanation too long");
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (questionType === "mcq") {
    const rawOptions = Array.isArray(payload.options) ? payload.options : [];
    const correctLabel = String(payload.correctLabel || "").trim().toUpperCase();
    const userLabel = String(payload.userLabel || "").trim().toUpperCase();
    const skipped = Boolean(payload.skipped);

    if (!correctLabel) {
      return sendError(res, 400, "Missing correctLabel");
    }
    if (correctLabel.length > LIMITS.maxOptionLabelChars) {
      return sendError(res, 413, "Correct label too long");
    }
    if (userLabel && userLabel.length > LIMITS.maxOptionLabelChars) {
      return sendError(res, 413, "User label too long");
    }

    if (!rawOptions.length) {
      return sendError(res, 400, "Missing options");
    }
    if (rawOptions.length > LIMITS.maxOptions) {
      return sendError(res, 413, "Too many options");
    }
    const options = [];
    for (const option of rawOptions) {
      const label = String(option?.label || "").trim().toUpperCase();
      const text = String(option?.text || "").trim();
      if (!label || !text) {
        return sendError(res, 400, "Invalid options");
      }
      if (label.length > LIMITS.maxOptionLabelChars) {
        return sendError(res, 413, "Option label too long");
      }
      if (text.length > LIMITS.maxOptionTextChars) {
        return sendError(res, 413, "Option text too long");
      }
      options.push({ label, text });
    }

    const formattedOptions = formatMcqOptions(options);
    const correctText = findOptionText(options, correctLabel);
    const userText = findOptionText(options, userLabel);
    const optionsText = formattedOptions.join(" | ");
    if (
      question.length +
        optionsText.length +
        correctText.length +
        userText.length +
        previousExplanation.length >
      LIMITS.maxTotalChars
    ) {
      return sendError(res, 413, "Input too long");
    }

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
    const maxPoints = clampNumber(payload.maxPoints || 0, {
      min: 0,
      max: LIMITS.maxPoints,
    });
    const awardedPoints = clampNumber(payload.awardedPoints || 0, {
      min: 0,
      max: LIMITS.maxPoints,
    });
    const ignoreSketch = Boolean(payload.ignoreSketch);
    const skipped = Boolean(payload.skipped);

    if (modelAnswer.length > LIMITS.maxModelAnswerChars) {
      return sendError(res, 413, "Model answer too long");
    }
    if (userAnswer.length > LIMITS.maxUserAnswerChars) {
      return sendError(res, 413, "User answer too long");
    }
    if (maxPoints === null) {
      return sendError(res, 400, "Invalid maxPoints");
    }
    if (awardedPoints === null) {
      return sendError(res, 400, "Invalid awardedPoints");
    }
    const safeAwardedPoints = Math.min(awardedPoints ?? 0, maxPoints ?? 0);
    if (
      question.length + modelAnswer.length + userAnswer.length + previousExplanation.length >
      LIMITS.maxTotalChars
    ) {
      return sendError(res, 413, "Input too long");
    }

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
      `Point: ${safeAwardedPoints} / ${maxPoints}\n` +
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
