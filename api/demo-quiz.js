const fs = require("fs");
const path = require("path");
const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { validatePayload } = require("./_lib/validate");

const MCQ_COUNT = 5;
const OPTIONS_COUNT = 4;
const DAILY_WINDOW_SECONDS = 24 * 60 * 60;
const SHORT_MIN_PARTS = 2;
const SHORT_MAX_PARTS = 3;
const SHORT_LABEL_ORDER = "abcdefghijklmnopqrstuvwxyz".split("");
const SHORT_LABEL_INDEX = new Map(SHORT_LABEL_ORDER.map((label, index) => [label, index]));

function cleanText(value) {
  return String(value || "").trim();
}

function readJsonFile(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function shuffle(values) {
  const items = [...values];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function pickRandomUnique(values, count) {
  return shuffle(values).slice(0, count);
}

function formatSessionLabel(session) {
  const cleaned = cleanText(session).toLowerCase();
  if (!cleaned) return "";
  if (cleaned.includes("syge")) return "sygeeksamen";
  if (cleaned.includes("ordin")) return "ordinær";
  return cleaned;
}

function formatSessionTitle(session) {
  if (!session) return "";
  return session.charAt(0).toUpperCase() + session.slice(1);
}

function buildYearDisplay(year, sessionLabel) {
  const numeric = Number(year);
  const yearText = Number.isFinite(numeric) ? String(numeric) : cleanText(year);
  if (!yearText) return "";
  if (!sessionLabel) return yearText;
  const sessionTitle = formatSessionTitle(sessionLabel);
  return sessionTitle ? `${yearText} · ${sessionTitle}` : yearText;
}

function buildKeywords(answer) {
  const tokens = cleanText(answer)
    .split(/[\s,.;:()]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3);
  return [...new Set(tokens)].slice(0, 4);
}

function normalizeMcq(item) {
  const question = cleanText(item?.text);
  if (!question) return null;
  const rawOptions = Array.isArray(item?.options) ? item.options : [];
  const options = rawOptions
    .map((option) => ({
      label: cleanText(option?.label).toUpperCase(),
      text: cleanText(option?.text),
      isCorrect: Boolean(option?.isCorrect),
    }))
    .filter((option) => option.text);
  if (options.length < OPTIONS_COUNT) return null;

  let correctIndex = -1;
  const correctLabel = cleanText(item?.correctLabel).toUpperCase();
  if (correctLabel) {
    correctIndex = options.findIndex((option) => option.label === correctLabel);
  }
  if (correctIndex < 0) {
    correctIndex = options.findIndex((option) => option.isCorrect);
  }
  if (correctIndex < 0) return null;

  let selectedOptions = options;
  if (options.length > OPTIONS_COUNT) {
    const correctOption = options[correctIndex];
    const others = options.filter((_, index) => index !== correctIndex);
    selectedOptions = shuffle([correctOption, ...pickRandomUnique(others, OPTIONS_COUNT - 1)]);
    correctIndex = selectedOptions.findIndex((option) => option === correctOption);
  } else {
    selectedOptions = options.slice(0, OPTIONS_COUNT);
  }

  const sessionLabel = formatSessionLabel(item?.session || "");
  return {
    question,
    options: selectedOptions.map((option) => option.text),
    correctIndex,
    explanation: "",
    category: cleanText(item?.category),
    year: item?.year ?? null,
    yearDisplay: buildYearDisplay(item?.year, sessionLabel),
    session: sessionLabel || null,
    number: item?.number ?? null,
  };
}

function getShortLabelIndex(label) {
  const normalized = cleanText(label).toLowerCase();
  return SHORT_LABEL_INDEX.get(normalized) ?? 99;
}

function buildShortGroups(items) {
  const groups = new Map();
  items.forEach((item) => {
    const year = Number(item?.year);
    const opgave = Number(item?.opgave);
    if (!Number.isFinite(year) || !Number.isFinite(opgave)) return;
    const sessionLabel = formatSessionLabel(item?.session || "");
    const key = `${year}-${sessionLabel || "standard"}-${opgave}`;
    if (!groups.has(key)) {
      groups.set(key, {
        year,
        session: sessionLabel || null,
        category: cleanText(item?.category),
        opgave,
        opgaveTitle: cleanText(item?.opgaveTitle),
        opgaveIntro: cleanText(item?.opgaveIntro),
        parts: [],
      });
    }
    groups.get(key).parts.push(item);
  });
  const output = [];
  groups.forEach((group) => {
    group.parts.sort((a, b) => getShortLabelIndex(a?.label) - getShortLabelIndex(b?.label));
    output.push(group);
  });
  return output;
}

function buildShortPayload(group) {
  let parts = group.parts
    .map((part) => {
      const question = cleanText(part?.prompt);
      const answer = cleanText(part?.answer);
      if (!question || !answer) return null;
      return {
        label: cleanText(part?.label),
        question,
        answer,
        keywords: buildKeywords(answer),
        explanation: "",
      };
    })
    .filter(Boolean);
  if (!parts.length) return null;
  if (parts.length > SHORT_MAX_PARTS) {
    parts = parts.slice(0, SHORT_MAX_PARTS);
  }
  const intro =
    cleanText(group.opgaveTitle) ||
    cleanText(group.opgaveIntro) ||
    cleanText(group.category) ||
    "Kortsvar";
  return {
    intro,
    parts,
    category: cleanText(group.category),
    year: group.year,
    yearDisplay: buildYearDisplay(group.year, group.session),
    session: group.session || null,
    opgave: group.opgave,
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

  if (
    !(await enforceRateLimit(req, res, {
      scope: "demo:quiz",
      limit: 1,
      windowSeconds: DAILY_WINDOW_SECONDS,
    }))
  ) {
    return;
  }

  const validation = validatePayload(payload, { fields: {} });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  let mcqData = [];
  let shortData = [];
  try {
    mcqData = readJsonFile("data/questions.json");
    shortData = readJsonFile("data/kortsvar.json");
  } catch (error) {
    return sendError(res, 500, "data_missing");
  }

  if (!Array.isArray(mcqData) || !Array.isArray(shortData)) {
    return sendError(res, 500, "data_missing");
  }

  const mcqPool = mcqData.map(normalizeMcq).filter(Boolean);
  if (mcqPool.length < MCQ_COUNT) {
    return sendError(res, 500, "data_missing");
  }
  const mcq = pickRandomUnique(mcqPool, MCQ_COUNT);

  const shortGroups = buildShortGroups(shortData)
    .map(buildShortPayload)
    .filter((group) => group && Array.isArray(group.parts) && group.parts.length);
  if (!shortGroups.length) {
    return sendError(res, 500, "data_missing");
  }
  const preferredGroups = shortGroups.filter(
    (group) => group.parts.length >= SHORT_MIN_PARTS && group.parts.length <= SHORT_MAX_PARTS
  );
  const shortPool = preferredGroups.length ? preferredGroups : shortGroups;
  const short = shortPool[Math.floor(Math.random() * shortPool.length)];

  return sendJson(res, 200, {
    title: "Prøvespil",
    mcq,
    short,
  });
};
