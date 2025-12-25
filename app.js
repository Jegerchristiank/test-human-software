const STORAGE_KEYS = {
  bestScore: "ku_mcq_best_score",
  settings: "ku_mcq_settings",
  seen: "ku_mcq_seen_questions",
  mistakes: "ku_mcq_last_mistakes",
  theme: "ku_mcq_theme",
};

const DEFAULT_SETTINGS = {
  questionCount: 24,
  shuffleQuestions: true,
  shuffleOptions: true,
  balancedMix: true,
  showMeta: true,
  autoAdvance: false,
  autoAdvanceDelay: 1200,
  avoidRepeats: false,
  focusMistakes: false,
  focusMode: false,
  includeMcq: true,
  includeShort: true,
};

const SHORT_TOTAL_POINTS = 72;
const SHORT_FAIL_THRESHOLD = 5;

const GRADE_SCALE = [
  { min: 92, grade: "12" },
  { min: 80, grade: "10" },
  { min: 65, grade: "7" },
  { min: 55, grade: "4" },
  { min: 45, grade: "02" },
  { min: 30, grade: "00" },
  { min: 0, grade: "-3" },
];

const FEEDBACK = [
  { min: 85, text: "Du er i topform! Eksamen bliver en leg." },
  { min: 70, text: "Stærkt arbejde – du er godt på vej." },
  { min: 55, text: "Solid indsats, hold tempoet og finpuds detaljerne." },
  { min: 0, text: "Fortsæt øvelsen, og brug facit strategisk." },
];

const SUBJECT_LABELS = {
  cell: "Cellebiologi",
  metabolism: "Metabolisme (energiomsætning og temperaturregulering)",
  neuro: "Nervesystemet og sanserne",
  endo: "Endokrinologi",
  movement: "Bevægeapparatet",
  blood: "Blodet og immunsystemet",
  lungs: "Lunger",
  digestion: "Mave-tarm og lever-galde",
  repro: "Reproduktion",
  cardio: "Hjerte-kredsløb",
  kidneys: "Nyrer",
};

const CATEGORY_ORDER = [
  SUBJECT_LABELS.cell,
  SUBJECT_LABELS.metabolism,
  SUBJECT_LABELS.neuro,
  SUBJECT_LABELS.endo,
  SUBJECT_LABELS.movement,
  SUBJECT_LABELS.blood,
  SUBJECT_LABELS.lungs,
  SUBJECT_LABELS.digestion,
  SUBJECT_LABELS.repro,
  SUBJECT_LABELS.cardio,
  SUBJECT_LABELS.kidneys,
];

const CATEGORY_ALIASES = {
  "Anatomi": SUBJECT_LABELS.movement,
  "Bevægeapparatet": SUBJECT_LABELS.movement,
  "Skelettet": SUBJECT_LABELS.movement,
  "Skeletmuskulatur": SUBJECT_LABELS.movement,
  "Mekaniske egenskaber af tværstribet muskulatur (skeletmuskulatur)": SUBJECT_LABELS.movement,

  "Cellebiologi": SUBJECT_LABELS.cell,
  "Cellens byggesten": SUBJECT_LABELS.cell,
  "Cellulære transportmekanismer": SUBJECT_LABELS.cell,
  "Histologi": SUBJECT_LABELS.cell,
  "Histologi / anatomi": SUBJECT_LABELS.cell,

  "Metabolisme": SUBJECT_LABELS.metabolism,
  "Den kemiske basis for liv": SUBJECT_LABELS.metabolism,
  "Mitokondriet": SUBJECT_LABELS.metabolism,
  "Cellebiologi – mitochondriet": SUBJECT_LABELS.metabolism,
  "Nedbrydning af glukose": SUBJECT_LABELS.metabolism,
  "Grundlæggende kemi og fysik – proteiner": SUBJECT_LABELS.metabolism,
  "Termoregulering": SUBJECT_LABELS.metabolism,
  "Temperaturregulering": SUBJECT_LABELS.metabolism,
  "Kroppens temperaturregulering": SUBJECT_LABELS.metabolism,
  "Negativ feedback og temperaturregulering": SUBJECT_LABELS.metabolism,

  "Nervesystemet": SUBJECT_LABELS.neuro,
  "Sanserne": SUBJECT_LABELS.neuro,
  "Lugtesansen": SUBJECT_LABELS.neuro,
  "Smerte": SUBJECT_LABELS.neuro,

  "Endokrinologi": SUBJECT_LABELS.endo,
  "Hormoner": SUBJECT_LABELS.endo,
  "Hormoner – hypofysen": SUBJECT_LABELS.endo,
  "Binyren": SUBJECT_LABELS.endo,

  "Blodet": SUBJECT_LABELS.blood,
  "Blod og immunsystemet": SUBJECT_LABELS.blood,
  "Blodet og immunsystemet": SUBJECT_LABELS.blood,
  "Immunsystemet": SUBJECT_LABELS.blood,
  "Lymfesystemet": SUBJECT_LABELS.blood,

  "Respiration": SUBJECT_LABELS.lungs,
  "Lunger": SUBJECT_LABELS.lungs,
  "Lungefysiologi": SUBJECT_LABELS.lungs,
  "Respirationssystemet": SUBJECT_LABELS.lungs,
  "Det respiratoriske system": SUBJECT_LABELS.lungs,
  "Åndedrættet": SUBJECT_LABELS.lungs,
  "Ventilation": SUBJECT_LABELS.lungs,
  "Respirationsorganerne": SUBJECT_LABELS.lungs,
  "Respirationsorganerne – lungevolumen": SUBJECT_LABELS.lungs,
  "Lungefysiologi – alveolen og den respiratoriske membran": SUBJECT_LABELS.lungs,

  "Fordøjelse": SUBJECT_LABELS.digestion,
  "Fordøjelseskanalen": SUBJECT_LABELS.digestion,
  "Fordøjelsessystemet": SUBJECT_LABELS.digestion,
  "Fordøjelsessystemet – leveren": SUBJECT_LABELS.digestion,
  "Mave-tarmkanalen": SUBJECT_LABELS.digestion,
  "Mave-tarmkanalen – tyndtarmen": SUBJECT_LABELS.digestion,
  "Tyndtarmen": SUBJECT_LABELS.digestion,
  "Leverens portåresystem": SUBJECT_LABELS.digestion,
  "Lever og kredsløb": SUBJECT_LABELS.digestion,

  "Reproduktion": SUBJECT_LABELS.repro,
  "Reproduktion (forplantning)": SUBJECT_LABELS.repro,
  "Positiv feedback og generering af veer": SUBJECT_LABELS.repro,
  "Mælkeproduktion": SUBJECT_LABELS.repro,

  "Kredsløb": SUBJECT_LABELS.cardio,
  "Kredsløbet": SUBJECT_LABELS.cardio,
  "Kredsløb/respiration": SUBJECT_LABELS.cardio,
  "Hjerte og kredsløb": SUBJECT_LABELS.cardio,
  "Hjertet": SUBJECT_LABELS.cardio,
  "Hjertet og lungerne": SUBJECT_LABELS.cardio,
  "Blodkar": SUBJECT_LABELS.cardio,
  "Blodtryksregulering": SUBJECT_LABELS.cardio,

  "Nyrer": SUBJECT_LABELS.kidneys,
  "Nyren": SUBJECT_LABELS.kidneys,
  "Nyrer og urinveje": SUBJECT_LABELS.kidneys,
  "Syre-base": SUBJECT_LABELS.kidneys,
  "Syre-base-regulering": SUBJECT_LABELS.kidneys,
};

const DEPRECATED_CATEGORY = /udgået/i;
const SESSION_ORDER = {
  ordinær: 0,
  sygeeksamen: 1,
};

const SKETCH_CUE = /\b(skitse|skitser|tegn|tegning|diagram)\b/i;

const state = {
  allQuestions: [],
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  scoreBreakdown: {
    mcq: 0,
    short: 0,
  },
  scoreSummary: {
    mcqPercent: 0,
    shortPercent: 0,
    overallPercent: 0,
    grade: "-",
  },
  sessionScoreMeta: {
    mcqCount: 0,
    mcqMax: 0,
    mcqMin: 0,
    shortCount: 0,
    shortMax: 0,
  },
  startTime: null,
  locked: false,
  results: [],
  bestScore: (() => {
    const saved = Number(localStorage.getItem(STORAGE_KEYS.bestScore) || 0);
    if (!Number.isFinite(saved)) return 0;
    if (saved > 100 || saved < 0) return 0;
    return saved;
  })(),
  settings: loadSettings(),
  aiStatus: {
    available: false,
    model: null,
  },
  figureVisible: false,
  shortAnswerDrafts: new Map(),
  shortAnswerAI: new Map(),
  filters: {
    years: new Set(),
    categories: new Set(),
  },
  available: {
    years: [],
    categories: [],
  },
  counts: {
    years: new Map(),
    categories: new Map(),
  },
  countsByType: {
    mcq: 0,
    short: 0,
  },
  seenKeys: new Set(loadStoredArray(STORAGE_KEYS.seen)),
  lastMistakeKeys: new Set(loadStoredArray(STORAGE_KEYS.mistakes)),
  flaggedKeys: new Set(),
  autoAdvanceTimer: null,
  sessionSettings: { ...DEFAULT_SETTINGS },
  search: {
    category: "",
  },
};

const screens = {
  menu: document.getElementById("menu-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
};

const elements = {
  startButtons: [
    document.getElementById("start-btn"),
    document.getElementById("modal-start-btn"),
  ].filter(Boolean),
  rulesButton: document.getElementById("rules-btn"),
  closeModal: document.getElementById("close-modal"),
  modalClose: document.getElementById("modal-close-btn"),
  modal: document.getElementById("rules-modal"),
  themeToggle: document.getElementById("theme-toggle"),
  questionCountRange: document.getElementById("question-count"),
  questionCountInput: document.getElementById("question-count-input"),
  questionCountChip: document.getElementById("question-count-chip"),
  poolCountChip: document.getElementById("pool-count-chip"),
  poolCount: document.getElementById("pool-count"),
  roundCount: document.getElementById("round-count"),
  mixSummary: document.getElementById("mix-summary"),
  yearSummary: document.getElementById("year-summary"),
  categorySummary: document.getElementById("category-summary"),
  repeatSummary: document.getElementById("repeat-summary"),
  selectionHint: document.getElementById("selection-hint"),
  yearChips: document.getElementById("year-chips"),
  categoryChips: document.getElementById("category-chips"),
  categorySearch: document.getElementById("category-search"),
  selectAllYears: document.getElementById("select-all-years"),
  clearYears: document.getElementById("clear-years"),
  selectAllCategories: document.getElementById("select-all-categories"),
  clearCategories: document.getElementById("clear-categories"),
  toggleShuffleQuestions: document.getElementById("toggle-shuffle-questions"),
  toggleShuffleOptions: document.getElementById("toggle-shuffle-options"),
  toggleBalanced: document.getElementById("toggle-balanced"),
  toggleShowMeta: document.getElementById("toggle-show-meta"),
  toggleAutoAdvance: document.getElementById("toggle-auto-advance"),
  toggleAvoidRepeats: document.getElementById("toggle-avoid-repeats"),
  toggleFocusMistakes: document.getElementById("toggle-focus-mistakes"),
  toggleFocusMode: document.getElementById("toggle-focus-mode"),
  toggleIncludeMcq: document.getElementById("toggle-include-mcq"),
  toggleIncludeShort: document.getElementById("toggle-include-short"),
  autoAdvanceDelay: document.getElementById("auto-advance-delay"),
  autoAdvanceLabel: document.getElementById("auto-advance-label"),
  backToMenu: document.getElementById("back-to-menu"),
  sessionPill: document.getElementById("session-pill"),
  progressText: document.getElementById("progress-text"),
  tempoText: document.getElementById("tempo-text"),
  progressFill: document.getElementById("progress-fill"),
  scoreValue: document.getElementById("score-value"),
  mcqScoreValue: document.getElementById("mcq-score-value"),
  shortScoreValue: document.getElementById("short-score-value"),
  bestScoreValue: document.getElementById("best-score-value"),
  questionCategory: document.getElementById("question-category"),
  questionYear: document.getElementById("question-year"),
  questionNumber: document.getElementById("question-number"),
  questionType: document.getElementById("question-type"),
  questionIntro: document.getElementById("question-intro"),
  questionText: document.getElementById("question-text"),
  questionFigure: document.getElementById("question-figure"),
  questionFigureMedia: document.getElementById("question-figure-media"),
  questionFigureCaption: document.getElementById("question-figure-caption"),
  figureToolbar: document.getElementById("figure-toolbar"),
  figureToggleBtn: document.getElementById("figure-toggle-btn"),
  figureToggleHint: document.getElementById("figure-toggle-hint"),
  optionsContainer: document.getElementById("options-container"),
  shortAnswerContainer: document.getElementById("short-answer-container"),
  shortAnswerInput: document.getElementById("short-answer-text"),
  shortAnswerScoreRange: document.getElementById("short-score-range"),
  shortAnswerScoreInput: document.getElementById("short-score-input"),
  shortAnswerMaxPoints: document.getElementById("short-max-points"),
  shortAnswerAiButton: document.getElementById("short-ai-grade-btn"),
  shortAnswerAiFeedback: document.getElementById("short-ai-feedback"),
  shortAnswerShowAnswer: document.getElementById("short-show-answer-btn"),
  shortAnswerModel: document.getElementById("short-model-answer"),
  shortAnswerSources: document.getElementById("short-sources"),
  shortAnswerHint: document.getElementById("short-score-hint"),
  shortSketchHint: document.getElementById("short-sketch-hint"),
  feedbackArea: document.getElementById("feedback-area"),
  skipBtn: document.getElementById("skip-btn"),
  nextBtn: document.getElementById("next-btn"),
  flagBtn: document.getElementById("flag-btn"),
  toggleFocus: document.getElementById("toggle-focus"),
  toggleMeta: document.getElementById("toggle-meta"),
  questionMeta: document.getElementById("question-meta"),
  finalScore: document.getElementById("final-score"),
  finalGrade: document.getElementById("final-grade"),
  finalPercent: document.getElementById("final-percent"),
  resultMcqPoints: document.getElementById("result-mcq-points"),
  resultMcqPercent: document.getElementById("result-mcq-percent"),
  resultShortPoints: document.getElementById("result-short-points"),
  resultShortPercent: document.getElementById("result-short-percent"),
  resultGrade: document.getElementById("result-grade"),
  finalMessage: document.getElementById("final-message"),
  statCorrect: document.getElementById("stat-correct"),
  statWrong: document.getElementById("stat-wrong"),
  statSkipped: document.getElementById("stat-skipped"),
  statShortScore: document.getElementById("stat-short-score"),
  statPace: document.getElementById("stat-pace"),
  statFlagged: document.getElementById("stat-flagged"),
  bestBadge: document.getElementById("best-badge"),
  playAgainBtn: document.getElementById("play-again-btn"),
  returnMenuBtn: document.getElementById("return-menu-btn"),
  reviewList: document.getElementById("review-list"),
};

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  if (!saved) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn("Kunne ikke indlæse settings", error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function loadStoredArray(key) {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored) return stored;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  if (elements.themeToggle) {
    elements.themeToggle.checked = nextTheme === "dark";
    elements.themeToggle.setAttribute("aria-checked", String(nextTheme === "dark"));
  }
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
}

function showScreen(target) {
  Object.entries(screens).forEach(([key, el]) => {
    if (key === target) {
      el.classList.add("active");
      el.classList.remove("hidden");
    } else {
      el.classList.remove("active");
      el.classList.add("hidden");
    }
  });

  document.body.classList.toggle("mode-game", target === "quiz");
  document.body.classList.toggle("mode-result", target === "result");
  if (target !== "quiz") {
    document.body.classList.remove("focus-mode");
    document.body.classList.remove("meta-hidden");
  }
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getQuestionKey(question) {
  const sessionKey = question.session ? formatSessionLabel(question.session) : "standard";
  const typeKey = question.type || "mcq";
  const labelKey = question.label ? `-${question.label}` : "";
  return `${question.year}-${sessionKey}-${typeKey}-${question.number}-${question.category}${labelKey}`;
}

function normalizeCategory(category) {
  const trimmed = category.trim();
  if (DEPRECATED_CATEGORY.test(trimmed)) return null;
  return CATEGORY_ALIASES[trimmed] || trimmed;
}

function formatSessionLabel(session) {
  if (!session) return "";
  const cleaned = session.trim().toLowerCase();
  if (cleaned.includes("syge")) return "sygeeksamen";
  if (cleaned.includes("ordin")) return "ordinær";
  return cleaned;
}

function formatSessionTitle(session) {
  if (!session) return "";
  return session.charAt(0).toUpperCase() + session.slice(1);
}

function parseYearLabel(label) {
  const parts = String(label).trim().split(" ");
  const year = Number(parts[0]);
  const session = formatSessionLabel(parts.slice(1).join(" "));
  return { year, session };
}

function buildCounts(questions) {
  const years = new Map();
  const categories = new Map();
  const types = new Map();
  questions.forEach((question) => {
    years.set(question.yearLabel, (years.get(question.yearLabel) || 0) + 1);
    categories.set(question.category, (categories.get(question.category) || 0) + 1);
    types.set(question.type, (types.get(question.type) || 0) + 1);
  });
  return { years, categories, types };
}

function formatTempoValue() {
  if (!state.startTime) return null;
  const elapsed = (Date.now() - state.startTime) / 1000;
  const perQuestion = elapsed / Math.max(1, state.results.length || state.currentIndex || 1);
  return perQuestion;
}

function formatTempo() {
  const value = formatTempoValue();
  if (value === null) return "—";
  return `${value.toFixed(1)}s / spørgsmål`;
}

function getGradeForPercent(percent) {
  for (const rule of GRADE_SCALE) {
    if (percent >= rule.min) return rule.grade;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1].grade;
}

function calculateScoreSummary() {
  const meta = state.sessionScoreMeta;
  const mcqMax = meta.mcqMax || 0;
  const mcqMin = meta.mcqMin || 0;
  const shortMax = meta.shortMax || 0;
  const mcqCount = meta.mcqCount || 0;
  const shortCount = meta.shortCount || 0;

  let mcqPercent = 0;
  if (mcqCount > 0 && mcqMax !== mcqMin) {
    mcqPercent =
      ((state.scoreBreakdown.mcq - mcqMin) / (mcqMax - mcqMin)) * 100;
  }
  mcqPercent = clamp(mcqPercent, 0, 100);

  let shortPercent = 0;
  if (shortCount > 0 && shortMax > 0) {
    shortPercent = (state.scoreBreakdown.short / shortMax) * 100;
  }
  shortPercent = clamp(shortPercent, 0, 100);

  let overallPercent = 0;
  if (mcqCount > 0 && shortCount > 0) {
    overallPercent = 0.5 * mcqPercent + 0.5 * shortPercent;
  } else if (mcqCount > 0) {
    overallPercent = mcqPercent;
  } else if (shortCount > 0) {
    overallPercent = shortPercent;
  }

  const grade = getGradeForPercent(overallPercent);

  return {
    mcqPercent,
    shortPercent,
    overallPercent,
    grade,
  };
}

function isShortFailed(entry) {
  return entry.type === "short" && !entry.skipped && entry.awardedPoints < SHORT_FAIL_THRESHOLD;
}

function requiresSketch(question) {
  if (!question) return false;
  return (
    SKETCH_CUE.test(question.text || "") ||
    SKETCH_CUE.test(question.prompt || "") ||
    SKETCH_CUE.test(question.opgaveIntro || "")
  );
}

function updateTopBar() {
  const total = state.activeQuestions.length || 0;
  const current = Math.min(state.currentIndex + 1, total);
  state.scoreSummary = calculateScoreSummary();
  elements.progressText.textContent = `${current} / ${total}`;
  elements.progressFill.style.width = total ? `${(state.currentIndex / total) * 100}%` : "0%";
  if (elements.mcqScoreValue) {
    elements.mcqScoreValue.textContent = state.scoreBreakdown.mcq;
  }
  if (elements.shortScoreValue) {
    elements.shortScoreValue.textContent = state.scoreBreakdown.short.toFixed(1);
  }
  elements.scoreValue.textContent = `${state.scoreSummary.overallPercent.toFixed(1)}%`;
  elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
  elements.tempoText.textContent = `Tempo: ${formatTempo()}`;
}

function clearOptions() {
  elements.optionsContainer.innerHTML = "";
}

function setFeedback(message, tone) {
  elements.feedbackArea.textContent = message;
  if (tone) {
    elements.feedbackArea.setAttribute("data-state", tone);
  } else {
    elements.feedbackArea.removeAttribute("data-state");
  }
}

function getQuestionNumberDisplay(question) {
  if (question.type === "short") {
    const label = question.label ? question.label.toUpperCase() : "";
    return `Opg. ${question.opgave}${label ? label : ""}`;
  }
  return `#${question.number}`;
}

function setFigureVisibility(visible) {
  state.figureVisible = visible;
  if (!elements.questionFigure) return;
  elements.questionFigure.classList.toggle("hidden", !visible);
  if (elements.figureToggleBtn) {
    elements.figureToggleBtn.textContent = visible ? "Skjul figur" : "Vis figur";
  }
  if (elements.figureToggleHint) {
    elements.figureToggleHint.textContent = visible
      ? "Figuren vises nu."
      : "Figuren er skjult indtil du vælger at se den.";
  }
}

function updateQuestionFigure(question) {
  if (!elements.questionFigure || !elements.questionFigureMedia) return;
  if (!question.images || !question.images.length) {
    elements.questionFigure.classList.add("hidden");
    elements.questionFigureMedia.innerHTML = "";
    if (elements.questionFigureCaption) {
      elements.questionFigureCaption.textContent = "";
    }
    if (elements.figureToolbar) {
      elements.figureToolbar.classList.add("hidden");
    }
    return;
  }

  elements.questionFigureMedia.innerHTML = "";
  question.images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Figur ${index + 1} til ${question.category}`;
    elements.questionFigureMedia.appendChild(img);
  });

  if (elements.questionFigureCaption) {
    elements.questionFigureCaption.textContent =
      question.images.length > 1 ? "Flere figurer" : "Figur";
  }

  if (elements.figureToolbar) {
    elements.figureToolbar.classList.remove("hidden");
  }
  setFigureVisibility(false);
}

function resetShortAnswerUI() {
  if (!elements.shortAnswerContainer) return;
  elements.shortAnswerInput.value = "";
  elements.shortAnswerScoreRange.value = "0";
  elements.shortAnswerScoreInput.value = "0";
  elements.shortAnswerMaxPoints.textContent = "0";
  elements.shortAnswerAiFeedback.textContent = "";
  elements.shortAnswerHint.textContent = "";
  elements.shortAnswerModel.classList.add("hidden");
  elements.shortAnswerModel.querySelector("p").textContent = "";
  elements.shortAnswerSources.textContent = "";
  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.textContent = "Vis facit";
  }
  if (elements.shortSketchHint) {
    elements.shortSketchHint.classList.add("hidden");
    elements.shortSketchHint.textContent = "";
  }
}

function renderMcqQuestion(question) {
  elements.optionsContainer.classList.remove("hidden");
  elements.shortAnswerContainer.classList.add("hidden");
  elements.skipBtn.textContent = "Spring over (0 point)";
  elements.nextBtn.disabled = true;
  elements.questionText.textContent = question.text;

  const options = state.sessionSettings.shuffleOptions ? shuffle(question.options) : question.options;
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.label = option.label;
    btn.innerHTML = `<span class="label">${option.label}</span>${option.text}`;
    btn.addEventListener("click", () => handleMcqAnswer(option.label));
    elements.optionsContainer.appendChild(btn);
  });
}

function renderShortQuestion(question) {
  elements.optionsContainer.classList.add("hidden");
  elements.shortAnswerContainer.classList.remove("hidden");
  elements.skipBtn.textContent = "Spring over (0 point)";
  elements.nextBtn.disabled = false;
  elements.questionText.textContent = question.text;

  const cached = state.shortAnswerDrafts.get(question.key);
  elements.shortAnswerInput.value = cached?.text || "";
  const maxPoints = question.maxPoints || 0;
  const rangeStep = 0.5;
  elements.shortAnswerScoreRange.min = "0";
  elements.shortAnswerScoreRange.max = String(maxPoints);
  elements.shortAnswerScoreRange.step = String(rangeStep);
  elements.shortAnswerScoreInput.min = "0";
  elements.shortAnswerScoreInput.max = String(maxPoints);
  elements.shortAnswerScoreInput.step = String(rangeStep);
  elements.shortAnswerMaxPoints.textContent = maxPoints.toFixed(1);
  const savedPoints = cached?.points ?? 0;
  elements.shortAnswerScoreRange.value = String(savedPoints);
  elements.shortAnswerScoreInput.value = String(savedPoints);
  elements.shortAnswerHint.textContent = `Max ${maxPoints.toFixed(1)} point. Under ${SHORT_FAIL_THRESHOLD} point tæller som fejlet.`;

  const aiState = state.shortAnswerAI.get(question.key);
  if (aiState?.feedback) {
    elements.shortAnswerAiFeedback.textContent = aiState.feedback;
  } else {
    elements.shortAnswerAiFeedback.textContent = "";
  }

  if (elements.shortSketchHint) {
    if (requiresSketch(question)) {
      elements.shortSketchHint.textContent =
        "Skitse er ikke en del af AI-bedømmelsen. Beskriv din skitse kort i tekstfeltet.";
      elements.shortSketchHint.classList.remove("hidden");
    } else {
      elements.shortSketchHint.textContent = "";
      elements.shortSketchHint.classList.add("hidden");
    }
  }

  elements.shortAnswerModel.classList.add("hidden");
  const modelAnswer = question.answer && question.answer.trim() ? question.answer : "Ingen facit tilgængelig.";
  elements.shortAnswerModel.querySelector("p").textContent = modelAnswer;
  elements.shortAnswerSources.textContent = question.sources?.length
    ? `Kilder: ${question.sources.join(" ")}`
    : "";

  if (elements.shortAnswerAiButton) {
    elements.shortAnswerAiButton.disabled = !state.aiStatus.available;
  }
}

function renderQuestion() {
  clearAutoAdvance();
  state.locked = false;
  elements.skipBtn.disabled = false;
  setFeedback("");
  clearOptions();
  resetShortAnswerUI();
  state.figureVisible = false;

  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (!currentQuestion) return;

  elements.questionCategory.textContent = currentQuestion.category;
  elements.questionYear.textContent = `År ${currentQuestion.yearDisplay}`;
  elements.questionNumber.textContent = getQuestionNumberDisplay(currentQuestion);
  if (elements.questionType) {
    elements.questionType.textContent = currentQuestion.type === "short" ? "Kortsvar" : "MCQ";
  }
  if (elements.questionIntro) {
    elements.questionIntro.textContent = currentQuestion.opgaveIntro || "";
    elements.questionIntro.classList.toggle("hidden", !currentQuestion.opgaveIntro);
  }
  updateQuestionFigure(currentQuestion);

  if (currentQuestion.type === "short") {
    renderShortQuestion(currentQuestion);
  } else {
    renderMcqQuestion(currentQuestion);
  }

  updateFlagButton();
  updateTopBar();
}

function lockOptions() {
  const optionButtons = elements.optionsContainer.querySelectorAll(".option-btn");
  optionButtons.forEach((btn) => btn.classList.add("locked"));
}

function highlightOptions(selectedLabel, correctLabel) {
  const optionButtons = elements.optionsContainer.querySelectorAll(".option-btn");
  optionButtons.forEach((btn) => {
    const label = btn.dataset.label;
    if (label === correctLabel) {
      btn.classList.add("correct");
    } else if (label === selectedLabel) {
      btn.classList.add("incorrect");
    }
  });
}

function handleMcqAnswer(label) {
  if (state.locked) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "mcq") return;
  const isCorrect = question.correctLabel === label;
  const delta = isCorrect ? 3 : -1;
  state.score += delta;
  state.scoreBreakdown.mcq += delta;
  state.results.push({
    question,
    type: "mcq",
    selected: label,
    isCorrect,
    skipped: false,
    delta,
  });

  state.locked = true;
  setFeedback(
    isCorrect ? "Korrekt! +3 point" : `Forkert. Rigtigt svar: ${question.correctLabel} (-1)`,
    isCorrect ? "success" : "error"
  );
  highlightOptions(label, question.correctLabel);
  lockOptions();
  elements.nextBtn.disabled = false;
  elements.skipBtn.disabled = true;
  updateTopBar();
  maybeAutoAdvance();
}

function skipQuestion() {
  if (state.locked) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  if (question.type === "short") {
    state.results.push({
      question,
      type: "short",
      response: "",
      awardedPoints: 0,
      maxPoints: question.maxPoints || 0,
      skipped: true,
      ai: state.shortAnswerAI.get(question.key) || null,
    });
    setFeedback("Sprunget over – 0 point.");
    state.locked = true;
    elements.nextBtn.disabled = false;
    elements.skipBtn.disabled = true;
    updateTopBar();
    return;
  }
  state.results.push({
    question,
    type: "mcq",
    selected: null,
    isCorrect: false,
    skipped: true,
    delta: 0,
  });
  setFeedback("Sprunget over – ingen point ændret.");
  state.locked = true;
  elements.nextBtn.disabled = false;
  elements.skipBtn.disabled = true;
  lockOptions();
  updateTopBar();
  maybeAutoAdvance();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function saveShortDraft(questionKey, data) {
  state.shortAnswerDrafts.set(questionKey, data);
}

function syncShortScoreInputs(value) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const maxPoints = question.maxPoints || 0;
  const numeric = Number(clamp(Number(value) || 0, 0, maxPoints).toFixed(1));
  elements.shortAnswerScoreRange.value = String(numeric);
  elements.shortAnswerScoreInput.value = String(numeric);
  saveShortDraft(question.key, {
    text: elements.shortAnswerInput.value,
    points: numeric,
  });
}

function finalizeShortAnswer() {
  if (state.locked) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const response = elements.shortAnswerInput.value.trim();
  const maxPoints = question.maxPoints || 0;
  const awardedPoints = clamp(Number(elements.shortAnswerScoreInput.value) || 0, 0, maxPoints);
  state.score += awardedPoints;
  state.scoreBreakdown.short += awardedPoints;
  state.results.push({
    question,
    type: "short",
    response,
    awardedPoints,
    maxPoints,
    skipped: false,
    ai: state.shortAnswerAI.get(question.key) || null,
  });
  state.locked = true;
  elements.skipBtn.disabled = true;
  setFeedback(`Svar gemt: ${awardedPoints.toFixed(1)} / ${maxPoints.toFixed(1)} point.`, "success");
  updateTopBar();
}

function toggleFigure() {
  setFigureVisibility(!state.figureVisible);
}

async function gradeShortAnswer() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  if (!state.aiStatus.available) {
    elements.shortAnswerAiFeedback.textContent = "AI-bedømmelse er ikke sat op endnu.";
    return;
  }
  const userAnswer = elements.shortAnswerInput.value.trim();
  if (!userAnswer) {
    elements.shortAnswerAiFeedback.textContent = "Skriv et svar før du beder om AI-bedømmelse.";
    return;
  }

  elements.shortAnswerAiButton.disabled = true;
  elements.shortAnswerAiFeedback.textContent = "AI vurderer dit svar …";

  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: question.text,
        modelAnswer: question.answer,
        userAnswer,
        maxPoints: question.maxPoints || 0,
        sources: question.sources || [],
        language: "da",
        ignoreSketch: requiresSketch(question),
      }),
    });
    if (!res.ok) {
      throw new Error(`AI response ${res.status}`);
    }
    const data = await res.json();
    const suggested = clamp(Number(data.score) || 0, 0, question.maxPoints || 0);
    syncShortScoreInputs(suggested);
    elements.shortAnswerAiFeedback.textContent =
      data.feedback || "AI-vurdering klar. Justér point efter behov.";
    state.shortAnswerAI.set(question.key, {
      score: suggested,
      feedback: data.feedback || "",
      missing: data.missing || [],
      matched: data.matched || [],
    });
  } catch (error) {
    elements.shortAnswerAiFeedback.textContent =
      "Kunne ikke hente AI-bedømmelse. Tjek serveren og din API-nøgle.";
  } finally {
    elements.shortAnswerAiButton.disabled = !state.aiStatus.available;
  }
}

function handleNextClick() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  if (question.type === "short" && !state.locked) {
    finalizeShortAnswer();
  }
  if (question.type === "mcq" && !state.locked) {
    return;
  }
  goToNextQuestion();
}

function maybeAutoAdvance() {
  if (!state.sessionSettings.autoAdvance) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "mcq") return;
  clearAutoAdvance();
  state.autoAdvanceTimer = setTimeout(() => {
    if (!elements.nextBtn.disabled) {
      goToNextQuestion();
    }
  }, state.sessionSettings.autoAdvanceDelay);
}

function clearAutoAdvance() {
  if (state.autoAdvanceTimer) {
    clearTimeout(state.autoAdvanceTimer);
    state.autoAdvanceTimer = null;
  }
}

function goToNextQuestion() {
  const finalQuestion = state.currentIndex >= state.activeQuestions.length - 1;
  if (finalQuestion) {
    showResults();
    return;
  }
  state.currentIndex += 1;
  renderQuestion();
}

function updateFlagButton() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  const isFlagged = state.flaggedKeys.has(question.key);
  elements.flagBtn.textContent = isFlagged ? "Markeret" : "Marker spørgsmål";
  elements.flagBtn.classList.toggle("active", isFlagged);
}

function toggleFlag() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  const key = question.key;
  if (state.flaggedKeys.has(key)) {
    state.flaggedKeys.delete(key);
  } else {
    state.flaggedKeys.add(key);
  }
  updateFlagButton();
}

function buildReviewList(results) {
  elements.reviewList.innerHTML = "";
  results.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "review-card";
    const isShort = entry.type === "short";
    if (isShort) {
      card.classList.add("short");
      if (entry.skipped) {
        card.classList.add("skipped");
      } else if (entry.awardedPoints >= entry.maxPoints) {
        card.classList.add("correct");
      } else if (entry.awardedPoints < SHORT_FAIL_THRESHOLD) {
        card.classList.add("wrong");
      } else {
        card.classList.add("partial");
      }
    } else if (entry.skipped) {
      card.classList.add("skipped");
    } else {
      card.classList.add(entry.isCorrect ? "correct" : "wrong");
    }

    if (state.flaggedKeys.has(entry.question.key)) {
      card.classList.add("flagged");
    }

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${index + 1}. ${entry.question.text}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    const labelTag = entry.question.label ? entry.question.label.toUpperCase() : "";
    const numberTag = isShort ? `Opg. ${entry.question.opgave}${labelTag}` : `#${entry.question.number}`;
    const typeLabel = isShort ? "Kortsvar" : "MCQ";
    meta.textContent = `${entry.question.category} • ${entry.question.yearLabel} • ${numberTag} • ${typeLabel}`;

    const lines = [];
    if (isShort) {
      const responseLine = document.createElement("div");
      responseLine.className = "answer-line";
      if (entry.skipped) {
        responseLine.textContent = "Dit svar: Sprunget over";
        responseLine.classList.add("muted");
      } else if (entry.response) {
        responseLine.textContent = `Dit svar: ${entry.response}`;
      } else {
        responseLine.textContent = "Dit svar: (tomt)";
        responseLine.classList.add("muted");
      }
      lines.push(responseLine);

      const scoreLine = document.createElement("div");
      scoreLine.className = "answer-line";
      scoreLine.textContent = `Point: ${entry.awardedPoints.toFixed(1)} / ${entry.maxPoints.toFixed(1)}`;
      lines.push(scoreLine);

      if (!entry.skipped) {
        const statusLine = document.createElement("div");
        statusLine.className = "answer-line";
        if (entry.awardedPoints >= SHORT_FAIL_THRESHOLD) {
          statusLine.textContent = "Status: Bestået";
          statusLine.classList.add("correct");
        } else {
          statusLine.textContent = "Status: Fejlet";
          statusLine.classList.add("wrong");
        }
        lines.push(statusLine);
      }

      if (entry.question.answer) {
        const modelLine = document.createElement("div");
        modelLine.className = "answer-line";
        modelLine.textContent = `Facit: ${entry.question.answer}`;
        lines.push(modelLine);
      }

      if (entry.ai?.feedback) {
        const aiLine = document.createElement("div");
        aiLine.className = "answer-line muted";
        aiLine.textContent = `AI: ${entry.ai.feedback}`;
        lines.push(aiLine);
      }
    } else {
      const selectedOption = entry.selected
        ? entry.question.options.find((option) => option.label === entry.selected)
        : null;
      const correctOption = entry.question.options.find(
        (option) => option.label === entry.question.correctLabel
      );

      const selectedLine = document.createElement("div");
      selectedLine.className = "answer-line";
      if (entry.skipped) {
        selectedLine.textContent = "Dit svar: Sprunget over";
        selectedLine.classList.add("muted");
      } else if (entry.isCorrect) {
        selectedLine.textContent = `Dit svar: ${entry.selected}. ${selectedOption?.text || ""}`;
        selectedLine.classList.add("correct");
      } else {
        selectedLine.textContent = `Dit svar: ${entry.selected}. ${selectedOption?.text || ""}`;
        selectedLine.classList.add("wrong");
      }

      const correctLine = document.createElement("div");
      correctLine.className = "answer-line correct";
      correctLine.textContent = `Korrekt svar: ${entry.question.correctLabel}. ${
        correctOption?.text || ""
      }`;
      lines.push(selectedLine, correctLine);
    }

    card.appendChild(title);
    card.appendChild(meta);
    lines.forEach((line) => card.appendChild(line));
    elements.reviewList.appendChild(card);
  });
}

function getFeedbackText(percent) {
  for (const rule of FEEDBACK) {
    if (percent >= rule.min) return rule.text;
  }
  return FEEDBACK[FEEDBACK.length - 1].text;
}

function showResults() {
  state.scoreSummary = calculateScoreSummary();
  const correct = state.results.filter((r) => r.type === "mcq" && r.isCorrect).length;
  const wrong = state.results.filter((r) => r.type === "mcq" && !r.isCorrect && !r.skipped).length;
  const skipped = state.results.filter((r) => r.skipped).length;
  const timePerQuestion = formatTempo();
  elements.progressFill.style.width = "100%";

  elements.finalScore.textContent = `${state.scoreSummary.overallPercent.toFixed(1)}%`;
  if (elements.finalPercent) {
    elements.finalPercent.textContent = `${state.scoreSummary.overallPercent.toFixed(1)}%`;
  }
  if (elements.finalGrade) {
    elements.finalGrade.textContent = state.scoreSummary.grade;
  }
  if (elements.resultGrade) {
    elements.resultGrade.textContent = state.scoreSummary.grade;
  }
  elements.finalMessage.textContent = getFeedbackText(state.scoreSummary.overallPercent);
  elements.statCorrect.textContent = correct;
  elements.statWrong.textContent = wrong;
  elements.statSkipped.textContent = skipped;
  if (elements.statShortScore) {
    if (state.sessionScoreMeta.shortMax > 0) {
      elements.statShortScore.textContent = `${state.scoreBreakdown.short.toFixed(1)} / ${state.sessionScoreMeta.shortMax.toFixed(1)}`;
    } else {
      elements.statShortScore.textContent = "—";
    }
  }
  if (elements.resultMcqPoints) {
    if (state.sessionScoreMeta.mcqMax > 0) {
      elements.resultMcqPoints.textContent = `${state.scoreBreakdown.mcq} / ${state.sessionScoreMeta.mcqMax}`;
    } else {
      elements.resultMcqPoints.textContent = "—";
    }
  }
  if (elements.resultMcqPercent) {
    elements.resultMcqPercent.textContent = state.sessionScoreMeta.mcqMax > 0
      ? `${state.scoreSummary.mcqPercent.toFixed(1)}%`
      : "—";
  }
  if (elements.resultShortPoints) {
    elements.resultShortPoints.textContent = state.sessionScoreMeta.shortMax > 0
      ? `${state.scoreBreakdown.short.toFixed(1)} / ${state.sessionScoreMeta.shortMax.toFixed(1)}`
      : "—";
  }
  if (elements.resultShortPercent) {
    elements.resultShortPercent.textContent = state.sessionScoreMeta.shortMax > 0
      ? `${state.scoreSummary.shortPercent.toFixed(1)}%`
      : "—";
  }
  elements.statPace.textContent = timePerQuestion;
  elements.statFlagged.textContent = state.flaggedKeys.size;

  const isNewBest = state.scoreSummary.overallPercent > state.bestScore;
  if (isNewBest) {
    state.bestScore = state.scoreSummary.overallPercent;
    localStorage.setItem(STORAGE_KEYS.bestScore, String(state.bestScore.toFixed(1)));
  }
  elements.bestBadge.style.display = isNewBest ? "inline-flex" : "none";
  elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;

  const mistakeKeys = state.results
    .filter((result) => {
      if (result.type === "short") {
        return isShortFailed(result);
      }
      return !result.isCorrect;
    })
    .map((result) => result.question.key);
  state.lastMistakeKeys = new Set(mistakeKeys);
  localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify([...state.lastMistakeKeys]));

  state.activeQuestions.forEach((question) => state.seenKeys.add(question.key));
  localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));

  buildReviewList(state.results);
  showScreen("result");
}

function sortQuestions(questions) {
  return [...questions].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const sessionDelta =
      (SESSION_ORDER[formatSessionLabel(a.session)] ?? 99) -
      (SESSION_ORDER[formatSessionLabel(b.session)] ?? 99);
    if (sessionDelta !== 0) return sessionDelta;
    if (a.number !== b.number) return a.number - b.number;
    if (a.type === "short" || b.type === "short") {
      const labelA = a.label ? a.label.toLowerCase() : "";
      const labelB = b.label ? b.label.toLowerCase() : "";
      if (labelA !== labelB) return labelA.localeCompare(labelB);
    }
    return String(a.category).localeCompare(String(b.category));
  });
}

function pickBalancedQuestions(pool, count) {
  const groups = new Map();
  pool.forEach((question) => {
    if (!groups.has(question.category)) {
      groups.set(question.category, []);
    }
    groups.get(question.category).push(question);
  });

  const groupList = shuffle(
    [...groups.values()].map((group) => shuffle(group))
  );

  const selected = [];
  while (selected.length < count && groupList.length) {
    for (let i = 0; i < groupList.length && selected.length < count; i += 1) {
      const group = groupList[i];
      if (group.length) {
        selected.push(group.pop());
      }
    }
    for (let i = groupList.length - 1; i >= 0; i -= 1) {
      if (!groupList[i].length) {
        groupList.splice(i, 1);
      }
    }
  }

  return state.sessionSettings.shuffleQuestions ? shuffle(selected) : selected;
}

function pickFromPool(pool, count) {
  if (count <= 0) return [];
  if (state.sessionSettings.balancedMix) {
    return pickBalancedQuestions(pool, count);
  }
  const ordered = state.sessionSettings.shuffleQuestions ? shuffle(pool) : sortQuestions(pool);
  return ordered.slice(0, count);
}

function buildQuestionSet(pool) {
  const baseCount = Math.min(state.sessionSettings.questionCount, pool.length);
  if (baseCount <= 0) return [];

  const includeMcq = state.sessionSettings.includeMcq;
  const includeShort = state.sessionSettings.includeShort;

  if (includeMcq && includeShort) {
    const mcqPool = pool.filter((q) => q.type === "mcq");
    const shortPool = pool.filter((q) => q.type === "short");
    let mcqTarget = Math.min(state.sessionSettings.questionCount, mcqPool.length);
    let shortTarget = Math.min(Math.max(1, Math.round(mcqTarget / 4)), shortPool.length);

    let selectedShort = pickFromPool(shortPool, shortTarget);
    let selectedMcq = pickFromPool(mcqPool, mcqTarget);

    let selected = [...selectedShort, ...selectedMcq];
    const desiredTotal = mcqTarget + shortTarget;
    if (selected.length < desiredTotal) {
      const remaining = pool.filter((q) => !selected.includes(q));
      const fill = pickFromPool(remaining, desiredTotal - selected.length);
      selected = selected.concat(fill);
    }

    return state.sessionSettings.shuffleQuestions ? shuffle(selected) : sortQuestions(selected);
  }

  if (includeShort) {
    return pickFromPool(
      pool.filter((q) => q.type === "short"),
      baseCount
    );
  }

  if (includeMcq) {
    return pickFromPool(
      pool.filter((q) => q.type === "mcq"),
      baseCount
    );
  }

  return [];
}

function assignShortPoints(questions) {
  const shortQuestions = questions.filter((q) => q.type === "short");
  if (!shortQuestions.length) return;
  const step = 0.5;
  const base = SHORT_TOTAL_POINTS / shortQuestions.length;
  const roundedBase = Math.floor(base / step) * step;
  let remaining = SHORT_TOTAL_POINTS - roundedBase * shortQuestions.length;

  shortQuestions.forEach((question) => {
    let points = roundedBase;
    if (remaining >= step) {
      points += step;
      remaining -= step;
    }
    question.maxPoints = Number(points.toFixed(1));
  });
}

function updateSessionScoreMeta(questions) {
  const mcqCount = questions.filter((q) => q.type === "mcq").length;
  const shortQuestions = questions.filter((q) => q.type === "short");
  const shortCount = shortQuestions.length;
  const shortMax = shortQuestions.reduce((sum, q) => sum + (q.maxPoints || 0), 0);
  state.sessionScoreMeta = {
    mcqCount,
    mcqMax: mcqCount * 3,
    mcqMin: mcqCount * -1,
    shortCount,
    shortMax,
  };
}

function resolvePool() {
  const allowedTypes = [];
  if (state.settings.includeMcq) allowedTypes.push("mcq");
  if (state.settings.includeShort) allowedTypes.push("short");

  const basePool = state.allQuestions.filter(
    (question) =>
      allowedTypes.includes(question.type) &&
      state.filters.years.has(question.yearLabel) &&
      state.filters.categories.has(question.category)
  );

  let pool = basePool;
  let focusMistakesActive = false;
  if (state.settings.focusMistakes && state.lastMistakeKeys.size) {
    const mistakePool = basePool.filter((question) => state.lastMistakeKeys.has(question.key));
    if (mistakePool.length) {
      pool = mistakePool;
      focusMistakesActive = true;
    }
  }

  if (state.settings.avoidRepeats) {
    pool = pool.filter((question) => !state.seenKeys.has(question.key));
  }

  return { pool, focusMistakesActive };
}

function describeSelection(selected, all, label) {
  if (!selected.length) return "Ingen valgt";
  if (selected.length === all.length) return `Alle ${label}`;
  if (selected.length <= 2) return selected.join(", ");
  return `${selected.length} ${label}`;
}

function updateSummary() {
  const { pool, focusMistakesActive } = resolvePool();
  const selectedYears = [...state.filters.years].sort((a, b) => {
    const aParsed = parseYearLabel(a);
    const bParsed = parseYearLabel(b);
    if (aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
    return (SESSION_ORDER[aParsed.session] ?? 99) - (SESSION_ORDER[bParsed.session] ?? 99);
  });
  const selectedCategories = [...state.filters.categories].sort((a, b) =>
    a.localeCompare(b, "da")
  );
  const mcqPoolCount = pool.filter((q) => q.type === "mcq").length;
  const shortPoolCount = pool.filter((q) => q.type === "short").length;
  let roundSize = Math.min(state.settings.questionCount, pool.length);
  if (state.settings.includeMcq && state.settings.includeShort) {
    const mcqTarget = Math.min(state.settings.questionCount, mcqPoolCount);
    const shortTarget = Math.min(Math.max(1, Math.round(mcqTarget / 4)), shortPoolCount);
    roundSize = mcqTarget + shortTarget;
  }
  const poolMcq = mcqPoolCount;
  const poolShort = shortPoolCount;

  elements.poolCount.textContent = pool.length;
  elements.poolCountChip.textContent = `${pool.length} i puljen · ${poolMcq} MCQ · ${poolShort} kortsvar`;
  let roundLabel = String(roundSize);
  if (state.settings.includeMcq && state.settings.includeShort && roundSize > 0) {
    const mcqTarget = Math.min(state.settings.questionCount, mcqPoolCount);
    const shortTarget = Math.min(Math.max(1, Math.round(mcqTarget / 4)), shortPoolCount);
    roundLabel = `${roundSize} (${mcqTarget} MCQ / ${shortTarget} kortsvar)`;
  }
  elements.roundCount.textContent = roundLabel;

  const mixParts = [];
  if (state.settings.balancedMix) mixParts.push("Balanceret");
  if (state.settings.shuffleQuestions) mixParts.push("Shuffle");
  if (state.settings.includeMcq && state.settings.includeShort) {
    mixParts.push("Ratio 4:1");
  }
  if (!mixParts.length) mixParts.push("Fast rækkefølge");
  elements.mixSummary.textContent = mixParts.join(" · ");

  elements.yearSummary.textContent = describeSelection(
    selectedYears,
    state.available.years,
    "sæt"
  );
  elements.categorySummary.textContent = describeSelection(
    selectedCategories,
    state.available.categories,
    "emner"
  );

  let hint = "Klar til start.";
  let canStart = true;
  const hasMistakes = state.lastMistakeKeys.size > 0;
  const repeatParts = [];
  if (state.settings.focusMistakes) {
    repeatParts.push(
      focusMistakesActive ? "Kun fejl" : hasMistakes ? "Fejl (ingen match)" : "Fejl (ingen endnu)"
    );
  }
  if (state.settings.avoidRepeats) repeatParts.push("Udelukker sete");
  elements.repeatSummary.textContent = repeatParts.length ? repeatParts.join(" · ") : "Alt";

  if (!state.settings.includeMcq && !state.settings.includeShort) {
    hint = "Vælg mindst én opgavetype (MCQ eller kortsvar).";
    canStart = false;
  } else if (!selectedYears.length || !selectedCategories.length) {
    hint = "Vælg mindst ét emne og ét sæt for at starte.";
    canStart = false;
  } else if (state.settings.focusMistakes && !focusMistakesActive) {
    hint = hasMistakes
      ? "Fokus på fejl er slået til, men ingen fejl matcher dine filtre – runden bruger alle spørgsmål."
      : "Fokus på fejl er slået til, men der er ingen fejl endnu – runden bruger alle spørgsmål.";
  } else if (!pool.length) {
    hint = "Ingen spørgsmål matcher dine filtre.";
    canStart = false;
  } else if (pool.length < roundSize) {
    hint = `Kun ${pool.length} spørgsmål matcher – runden forkortes.`;
  }

  elements.selectionHint.textContent = hint;
  elements.startButtons.forEach((btn) => {
    btn.disabled = !canStart;
  });

  updateAutoAdvanceLabel();
}

function updateSessionPill() {
  const yearCount = state.filters.years.size;
  const categoryCount = state.filters.categories.size;
  const mcqCount = state.activeQuestions.filter((q) => q.type === "mcq").length;
  const shortCount = state.activeQuestions.filter((q) => q.type === "short").length;
  const label = `${state.activeQuestions.length} spørgsmål · ${mcqCount} MCQ · ${shortCount} kortsvar · ${yearCount} sæt · ${categoryCount} emner`;
  elements.sessionPill.textContent = label;
}

function applySessionDisplaySettings() {
  document.body.classList.toggle("focus-mode", state.sessionSettings.focusMode);
  document.body.classList.toggle("meta-hidden", !state.sessionSettings.showMeta);
  elements.toggleFocus.textContent = state.sessionSettings.focusMode ? "Fokus: Til" : "Fokus";
  elements.toggleMeta.textContent = state.sessionSettings.showMeta ? "Skjul metadata" : "Vis metadata";
}

function startGame() {
  const { pool, focusMistakesActive } = resolvePool();
  if (!pool.length) return;

  hideRules();
  state.sessionSettings = { ...state.settings, focusMistakes: focusMistakesActive };
  state.activeQuestions = buildQuestionSet(pool);
  assignShortPoints(state.activeQuestions);
  updateSessionScoreMeta(state.activeQuestions);
  state.currentIndex = 0;
  state.score = 0;
  state.scoreBreakdown = { mcq: 0, short: 0 };
  state.results = [];
  state.flaggedKeys = new Set();
  state.shortAnswerDrafts = new Map();
  state.shortAnswerAI = new Map();
  state.startTime = Date.now();
  state.locked = false;

  updateSessionPill();
  applySessionDisplaySettings();
  showScreen("quiz");
  renderQuestion();
}

function showRules() {
  elements.modal.classList.remove("hidden");
}

function hideRules() {
  elements.modal.classList.add("hidden");
}

function goToMenu() {
  clearAutoAdvance();
  showScreen("menu");
}

function renderChips(container, values, selectedSet, counts, type) {
  container.innerHTML = "";
  values.forEach((value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.dataset.type = type;
    btn.dataset.value = String(value);
    btn.dataset.label = String(value).toLowerCase();
    btn.innerHTML = `<span>${value}</span><span class="chip-count">${counts.get(value) || 0}</span>`;
    if (selectedSet.has(value)) {
      btn.classList.add("active");
    }
    btn.setAttribute("aria-pressed", selectedSet.has(value));
    btn.addEventListener("click", () => toggleSelection(type, value));
    container.appendChild(btn);
  });
}

function getFilteredCategories() {
  const term = state.search.category;
  if (!term) return state.available.categories;
  return state.available.categories.filter((category) =>
    category.toLowerCase().includes(term)
  );
}

function applyCategorySearch() {
  if (!elements.categorySearch) return;
  const term = elements.categorySearch.value.trim().toLowerCase();
  if (term === state.search.category) return;
  state.search.category = term;
  updateChips();
}

function updateChips() {
  renderChips(
    elements.yearChips,
    state.available.years,
    state.filters.years,
    state.counts.years,
    "years"
  );
  const filteredCategories = getFilteredCategories();
  renderChips(
    elements.categoryChips,
    filteredCategories,
    state.filters.categories,
    state.counts.categories,
    "categories"
  );
}

function toggleSelection(type, value) {
  const set = state.filters[type];
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  updateChips();
  updateSummary();
}

function setSelection(type, values) {
  state.filters[type] = new Set(values);
  updateChips();
  updateSummary();
}

function updateQuestionCount(value) {
  const min = Number(elements.questionCountRange.min) || 5;
  const max = Number(elements.questionCountRange.max) || 40;
  const nextValue = Math.max(min, Math.min(max, Number(value) || min));
  state.settings.questionCount = nextValue;
  elements.questionCountRange.value = nextValue;
  elements.questionCountInput.value = nextValue;
  saveSettings();
  updateSummary();
}

function updateAutoAdvanceLabel() {
  const seconds = state.settings.autoAdvanceDelay / 1000;
  elements.autoAdvanceLabel.textContent = `${seconds.toFixed(1)}s`;
  elements.autoAdvanceDelay.disabled = !state.settings.autoAdvance;
}

async function checkAiAvailability() {
  if (!elements.shortAnswerAiButton) return;
  try {
    const res = await fetch("/api/health");
    if (!res.ok) {
      state.aiStatus = { available: false, model: null };
      elements.shortAnswerAiButton.disabled = true;
      return;
    }
    const data = await res.json();
    state.aiStatus = { available: true, model: data.model || null };
    elements.shortAnswerAiButton.disabled = false;
  } catch (error) {
    state.aiStatus = { available: false, model: null };
    elements.shortAnswerAiButton.disabled = true;
  }
}

function handleSettingToggle(key, value) {
  state.settings[key] = value;
  saveSettings();
  updateSummary();
}

function handleKeyDown(event) {
  if (!screens.quiz.classList.contains("active")) return;
  if (elements.modal && !elements.modal.classList.contains("hidden")) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  const key = event.key.toLowerCase();
  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (key === "a" || key === "b" || key === "c" || key === "d") {
    if (currentQuestion?.type === "mcq") {
      handleMcqAnswer(key.toUpperCase());
    }
  } else if (key === "n") {
    if (!elements.nextBtn.disabled) {
      handleNextClick();
    }
  } else if (key === "k") {
    skipQuestion();
  } else if (key === "f") {
    toggleFlag();
  }
}

function attachEvents() {
  elements.startButtons.forEach((btn) => btn.addEventListener("click", startGame));
  elements.skipBtn.addEventListener("click", skipQuestion);
  elements.nextBtn.addEventListener("click", handleNextClick);
  elements.rulesButton.addEventListener("click", showRules);
  elements.closeModal.addEventListener("click", hideRules);
  elements.modalClose.addEventListener("click", hideRules);
  elements.backToMenu.addEventListener("click", goToMenu);
  elements.returnMenuBtn.addEventListener("click", goToMenu);
  elements.playAgainBtn.addEventListener("click", startGame);
  elements.flagBtn.addEventListener("click", toggleFlag);
  if (elements.figureToggleBtn) {
    elements.figureToggleBtn.addEventListener("click", toggleFigure);
  }

  elements.toggleFocus.addEventListener("click", () => {
    state.sessionSettings.focusMode = !state.sessionSettings.focusMode;
    applySessionDisplaySettings();
  });

  elements.toggleMeta.addEventListener("click", () => {
    state.sessionSettings.showMeta = !state.sessionSettings.showMeta;
    applySessionDisplaySettings();
  });

  if (elements.shortAnswerInput) {
    elements.shortAnswerInput.addEventListener("input", () => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      saveShortDraft(question.key, {
        text: elements.shortAnswerInput.value,
        points: Number(elements.shortAnswerScoreInput.value) || 0,
      });
    });
  }

  if (elements.shortAnswerScoreRange) {
    elements.shortAnswerScoreRange.addEventListener("input", (event) => {
      syncShortScoreInputs(event.target.value);
    });
  }

  if (elements.shortAnswerScoreInput) {
    elements.shortAnswerScoreInput.addEventListener("input", (event) => {
      syncShortScoreInputs(event.target.value);
    });
    elements.shortAnswerScoreInput.addEventListener("change", (event) => {
      syncShortScoreInputs(event.target.value);
    });
  }

  if (elements.shortAnswerAiButton) {
    elements.shortAnswerAiButton.addEventListener("click", gradeShortAnswer);
  }

  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.addEventListener("click", () => {
      if (!elements.shortAnswerModel) return;
      elements.shortAnswerModel.classList.toggle("hidden");
      const isHidden = elements.shortAnswerModel.classList.contains("hidden");
      elements.shortAnswerShowAnswer.textContent = isHidden ? "Vis facit" : "Skjul facit";
    });
  }

  elements.modal.addEventListener("click", (evt) => {
    if (evt.target === elements.modal) {
      hideRules();
    }
  });

  elements.questionCountRange.addEventListener("input", (event) => {
    updateQuestionCount(event.target.value);
  });
  elements.questionCountInput.addEventListener("change", (event) => {
    updateQuestionCount(event.target.value);
  });

  elements.autoAdvanceDelay.addEventListener("input", (event) => {
    state.settings.autoAdvanceDelay = Number(event.target.value);
    saveSettings();
    updateSummary();
  });

  elements.toggleShuffleQuestions.addEventListener("change", (event) => {
    handleSettingToggle("shuffleQuestions", event.target.checked);
  });
  elements.toggleShuffleOptions.addEventListener("change", (event) => {
    handleSettingToggle("shuffleOptions", event.target.checked);
  });
  elements.toggleBalanced.addEventListener("change", (event) => {
    handleSettingToggle("balancedMix", event.target.checked);
  });
  elements.toggleShowMeta.addEventListener("change", (event) => {
    handleSettingToggle("showMeta", event.target.checked);
  });
  elements.toggleAutoAdvance.addEventListener("change", (event) => {
    handleSettingToggle("autoAdvance", event.target.checked);
  });
  elements.toggleAvoidRepeats.addEventListener("change", (event) => {
    handleSettingToggle("avoidRepeats", event.target.checked);
  });
  elements.toggleFocusMistakes.addEventListener("change", (event) => {
    handleSettingToggle("focusMistakes", event.target.checked);
  });
  elements.toggleFocusMode.addEventListener("change", (event) => {
    handleSettingToggle("focusMode", event.target.checked);
  });
  if (elements.toggleIncludeMcq) {
    elements.toggleIncludeMcq.addEventListener("change", (event) => {
      handleSettingToggle("includeMcq", event.target.checked);
    });
  }
  if (elements.toggleIncludeShort) {
    elements.toggleIncludeShort.addEventListener("change", (event) => {
      handleSettingToggle("includeShort", event.target.checked);
    });
  }

  elements.selectAllYears.addEventListener("click", () => {
    setSelection("years", state.available.years);
  });
  elements.clearYears.addEventListener("click", () => {
    setSelection("years", []);
  });
  elements.selectAllCategories.addEventListener("click", () => {
    setSelection("categories", state.available.categories);
  });
  elements.clearCategories.addEventListener("click", () => {
    setSelection("categories", []);
  });

  if (elements.categorySearch) {
    elements.categorySearch.addEventListener("input", applyCategorySearch);
    elements.categorySearch.addEventListener("search", applyCategorySearch);
    elements.categorySearch.addEventListener("change", applyCategorySearch);
  }
  document.addEventListener("keydown", handleKeyDown);

  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("change", (event) => {
      applyTheme(event.target.checked ? "dark" : "light");
    });
  }
}

function syncSettingsToUI() {
  updateQuestionCount(state.settings.questionCount);
  elements.toggleShuffleQuestions.checked = state.settings.shuffleQuestions;
  elements.toggleShuffleOptions.checked = state.settings.shuffleOptions;
  elements.toggleBalanced.checked = state.settings.balancedMix;
  elements.toggleShowMeta.checked = state.settings.showMeta;
  elements.toggleAutoAdvance.checked = state.settings.autoAdvance;
  elements.toggleAvoidRepeats.checked = state.settings.avoidRepeats;
  elements.toggleFocusMistakes.checked = state.settings.focusMistakes;
  elements.toggleFocusMode.checked = state.settings.focusMode;
  if (elements.toggleIncludeMcq) {
    elements.toggleIncludeMcq.checked = state.settings.includeMcq;
  }
  if (elements.toggleIncludeShort) {
    elements.toggleIncludeShort.checked = state.settings.includeShort;
  }
  elements.autoAdvanceDelay.value = state.settings.autoAdvanceDelay;
  updateAutoAdvanceLabel();
}

async function loadQuestions() {
  const [mcqRes, shortRes] = await Promise.all([
    fetch("data/questions.json"),
    fetch("data/kortsvar.json"),
  ]);
  const mcqData = await mcqRes.json();
  const shortData = shortRes.ok ? await shortRes.json() : [];

  const mcqQuestions = mcqData
    .map((question) => {
      const normalizedCategory = normalizeCategory(question.category);
      if (!normalizedCategory) return null;
      const rawCategory = question.category;
      const sessionLabel = formatSessionLabel(question.session || "");
      const sessionTitle = sessionLabel ? formatSessionTitle(sessionLabel) : "";
      const yearLabel = sessionTitle ? `${question.year} ${sessionTitle}` : String(question.year);
      const yearDisplay = sessionTitle ? `${question.year} · ${sessionTitle}` : String(question.year);
      const payload = {
        ...question,
        type: "mcq",
        rawCategory,
        category: normalizedCategory,
        session: sessionLabel || null,
        yearLabel,
        yearDisplay,
      };
      return {
        ...payload,
        key: getQuestionKey(payload),
      };
    })
    .filter(Boolean);

  const shortQuestions = shortData
    .map((question) => {
      const normalizedCategory = normalizeCategory(question.category);
      if (!normalizedCategory) return null;
      const rawCategory = question.category;
      const sessionLabel = formatSessionLabel(question.session || "");
      const sessionTitle = sessionLabel ? formatSessionTitle(sessionLabel) : "";
      const yearLabel = sessionTitle ? `${question.year} ${sessionTitle}` : String(question.year);
      const yearDisplay = sessionTitle ? `${question.year} · ${sessionTitle}` : String(question.year);
      const payload = {
        ...question,
        type: "short",
        text: question.prompt,
        rawCategory,
        category: normalizedCategory,
        session: sessionLabel || null,
        yearLabel,
        yearDisplay,
        number: question.opgave,
      };
      return {
        ...payload,
        key: getQuestionKey(payload),
      };
    })
    .filter(Boolean);

  state.allQuestions = [...mcqQuestions, ...shortQuestions];
  const availableKeys = new Set(state.allQuestions.map((question) => question.key));
  state.seenKeys = new Set([...state.seenKeys].filter((key) => availableKeys.has(key)));
  state.lastMistakeKeys = new Set(
    [...state.lastMistakeKeys].filter((key) => availableKeys.has(key))
  );
  localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
  localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify([...state.lastMistakeKeys]));
  state.counts = buildCounts(state.allQuestions);
  state.countsByType = {
    mcq: state.counts.types.get("mcq") || 0,
    short: state.counts.types.get("short") || 0,
  };
  state.available.years = [...state.counts.years.keys()].sort((a, b) => {
    const aParsed = parseYearLabel(a);
    const bParsed = parseYearLabel(b);
    if (aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
    return (SESSION_ORDER[aParsed.session] ?? 99) - (SESSION_ORDER[bParsed.session] ?? 99);
  });
  const categoryOrder = new Map(CATEGORY_ORDER.map((label, index) => [label, index]));
  state.available.categories = [...state.counts.categories.keys()].sort((a, b) => {
    const aIndex = categoryOrder.get(a);
    const bIndex = categoryOrder.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 999) - (bIndex ?? 999);
    }
    return a.localeCompare(b, "da");
  });
  state.filters.years = new Set(state.available.years);
  state.filters.categories = new Set(state.available.categories);
  elements.questionCountChip.textContent = `${mcqQuestions.length} MCQ · ${shortQuestions.length} kortsvar`;
  updateChips();
  updateSummary();
}

async function init() {
  attachEvents();
  updateTopBar();
  elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
  applyTheme(getInitialTheme());
  syncSettingsToUI();
  try {
    await loadQuestions();
  } catch (err) {
    console.error("Kunne ikke indlæse spørgsmål", err);
    elements.questionCountChip.textContent = "Fejl: kunne ikke indlæse spørgsmål";
    elements.poolCountChip.textContent = "Ingen data";
  }
  await checkAiAvailability();
}

document.addEventListener("DOMContentLoaded", init);
