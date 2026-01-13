const LIMITS = {
  maxPromptChars: 3000,
  maxQuestionChars: 3000,
  maxModelAnswerChars: 6000,
  maxUserAnswerChars: 4000,
  maxPreviousChars: 2000,
  maxTotalChars: 12000,
  maxPoints: 200,
  maxSourceItems: 16,
  maxSourceTextChars: 600,
  maxOptions: 8,
  maxOptionLabelChars: 3,
  maxOptionTextChars: 500,
  maxTtsChars: 2000,
  languagePattern: /^[a-z-]{2,12}$/,
};

function clampNumber(value, { min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric < min || numeric > max) return null;
  return numeric;
}

function isValidLanguage(value) {
  const language = String(value || "").trim().toLowerCase();
  if (!language) return false;
  return LIMITS.languagePattern.test(language);
}

module.exports = {
  LIMITS,
  clampNumber,
  isValidLanguage,
};
