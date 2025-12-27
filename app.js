const STORAGE_KEYS = {
  bestScore: "ku_mcq_best_score",
  settings: "ku_mcq_settings",
  seen: "ku_mcq_seen_questions",
  mistakes: "ku_mcq_last_mistakes",
  theme: "ku_mcq_theme",
  history: "ku_mcq_history",
  performance: "ku_mcq_performance",
  figureCaptions: "ku_mcq_figure_captions",
};

const DEFAULT_SETTINGS = {
  questionCount: 24,
  shuffleQuestions: true,
  shuffleOptions: true,
  balancedMix: true,
  adaptiveMix: false,
  showMeta: true,
  autoAdvance: false,
  autoAdvanceDelay: 1200,
  infiniteMode: false,
  avoidRepeats: false,
  focusMistakes: false,
  focusMode: false,
  includeMcq: true,
  includeShort: true,
  ratioMcq: 4,
  ratioShort: 1,
  ttsEnabled: true,
  ttsAuto: false,
  ttsIncludeOptions: true,
  ttsVoice: "alloy",
  ttsSpeed: 1.0,
  ttsCollapsed: false,
  autoFigureCaptions: true,
};

const SHORT_TOTAL_POINTS = 72;
const SHORT_FAIL_THRESHOLD = 5;
const HISTORY_LIMIT = 12;
const TARGET_GRADE_PERCENT = 92;

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
const FIGURE_ANSWER_CUE = /\b(tegning|figur|angivet nedenfor|se figur|vist i figuren|tilhørende figur)\b/i;

const TTS_VOICES = [
  { value: "alloy", label: "Alloy · Klar" },
  { value: "nova", label: "Nova · Varm" },
  { value: "echo", label: "Echo · Tydelig" },
  { value: "fable", label: "Fable · Rolig" },
  { value: "onyx", label: "Onyx · Dyb" },
  { value: "shimmer", label: "Shimmer · Lys" },
];
const TTS_SAMPLE_TEXT = "Hej! Jeg kan læse spørgsmål og svarmuligheder op.";
const TTS_SPEED_MIN = 0.7;
const TTS_SPEED_MAX = 1.3;
const TTS_SPEED_STEP = 0.05;
const TTS_MAX_CHARS = 2000;
const SKETCH_MAX_BYTES = 5 * 1024 * 1024;
const FIGURE_CAPTION_QUEUE_DELAY = 450;

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
    message: "AI tjekkes...",
  },
  ttsStatus: {
    available: false,
    model: null,
    message: "Oplæsning tjekkes...",
  },
  ttsPlayer: {
    audio: null,
    objectUrl: null,
    isPlaying: false,
    isLoading: false,
    requestId: 0,
    abortController: null,
    autoTimer: null,
  },
  ttsPrefetch: {
    key: null,
    text: "",
    voice: null,
    speed: null,
    includeOptions: null,
    blob: null,
    promise: null,
    requestId: 0,
    abortController: null,
    timer: null,
    defer: false,
  },
  optionOrder: new Map(),
  figureVisible: false,
  shortAnswerDrafts: new Map(),
  shortAnswerAI: new Map(),
  figureCaptions: loadFigureCaptions(),
  figureCaptionLibrary: {},
  figureCaptionRequests: new Map(),
  figureCaptionQueue: [],
  figureCaptionQueued: new Set(),
  figureCaptionProcessing: false,
  figureCaptionTimer: null,
  sketchUploads: new Map(),
  sketchAnalysis: new Map(),
  performance: loadPerformance(),
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
  history: loadStoredArray(STORAGE_KEYS.history),
  flaggedKeys: new Set(),
  autoAdvanceTimer: null,
  questionStartedAt: null,
  sessionSettings: { ...DEFAULT_SETTINGS },
  infiniteState: null,
  search: {
    category: "",
  },
};

const screens = {
  landing: document.getElementById("landing-screen"),
  menu: document.getElementById("menu-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
};

const elements = {
  startButtons: [
    document.getElementById("start-btn"),
    document.getElementById("modal-start-btn"),
  ].filter(Boolean),
  landingStartBtn: document.getElementById("landing-start-btn"),
  landingQuickBtn: document.getElementById("landing-quick-btn"),
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
  aiStatusPill: document.getElementById("ai-status-pill"),
  historyLatest: document.getElementById("history-latest"),
  historyLatestMeta: document.getElementById("history-latest-meta"),
  historyTrend: document.getElementById("history-trend"),
  historyTrendMeta: document.getElementById("history-trend-meta"),
  historyBest: document.getElementById("history-best"),
  historyBestMeta: document.getElementById("history-best-meta"),
  historyList: document.getElementById("history-list"),
  landingHistoryList: document.getElementById("landing-history-list"),
  heroRank: document.getElementById("hero-rank"),
  heroRankMeta: document.getElementById("hero-rank-meta"),
  heroTarget: document.getElementById("hero-target"),
  heroTargetMeta: document.getElementById("hero-target-meta"),
  heroProgressFill: document.getElementById("hero-progress-fill"),
  heroStreak: document.getElementById("hero-streak"),
  heroStreakMeta: document.getElementById("hero-streak-meta"),
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
  toggleAdaptiveMix: document.getElementById("toggle-adaptive-mix"),
  toggleShowMeta: document.getElementById("toggle-show-meta"),
  toggleAutoAdvance: document.getElementById("toggle-auto-advance"),
  toggleInfiniteMode: document.getElementById("toggle-infinite-mode"),
  toggleAvoidRepeats: document.getElementById("toggle-avoid-repeats"),
  toggleFocusMistakes: document.getElementById("toggle-focus-mistakes"),
  toggleFocusMode: document.getElementById("toggle-focus-mode"),
  toggleIncludeMcq: document.getElementById("toggle-include-mcq"),
  toggleIncludeShort: document.getElementById("toggle-include-short"),
  toggleTts: document.getElementById("toggle-tts"),
  toggleAutoFigure: document.getElementById("toggle-auto-figure"),
  ratioMcqInput: document.getElementById("ratio-mcq"),
  ratioShortInput: document.getElementById("ratio-short"),
  autoAdvanceDelay: document.getElementById("auto-advance-delay"),
  autoAdvanceLabel: document.getElementById("auto-advance-label"),
  backToMenu: document.getElementById("back-to-menu"),
  endRoundBtn: document.getElementById("end-round-btn"),
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
  ttsToolbar: document.getElementById("tts-toolbar"),
  ttsPlayBtn: document.getElementById("tts-play-btn"),
  ttsStopBtn: document.getElementById("tts-stop-btn"),
  ttsPreviewBtn: document.getElementById("tts-preview-btn"),
  ttsAutoToggle: document.getElementById("tts-auto-toggle"),
  ttsOptionsToggle: document.getElementById("tts-options-toggle"),
  ttsVoiceSelect: document.getElementById("tts-voice"),
  ttsSpeedRange: document.getElementById("tts-speed"),
  ttsSpeedLabel: document.getElementById("tts-speed-label"),
  ttsStatus: document.getElementById("tts-status"),
  ttsCollapseBtn: document.getElementById("tts-collapse-btn"),
  ttsBody: document.getElementById("tts-body"),
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
  shortAnswerAiStatus: document.getElementById("ai-status-inline"),
  shortAnswerShowAnswer: document.getElementById("short-show-answer-btn"),
  shortAnswerModel: document.getElementById("short-model-answer"),
  shortModelTitle: document.getElementById("short-model-title"),
  shortModelText: document.getElementById("short-model-text"),
  shortModelTag: document.getElementById("short-model-tag"),
  shortFigureAnswer: document.getElementById("short-figure-answer"),
  shortFigureText: document.getElementById("short-figure-text"),
  shortFigureStatus: document.getElementById("short-figure-status"),
  shortFigureGenerateBtn: document.getElementById("short-figure-generate-btn"),
  shortAnswerSources: document.getElementById("short-sources"),
  shortAnswerHint: document.getElementById("short-score-hint"),
  shortSketchHint: document.getElementById("short-sketch-hint"),
  sketchPanel: document.getElementById("sketch-panel"),
  sketchToggleBtn: document.getElementById("sketch-toggle-btn"),
  sketchPanelBody: document.getElementById("sketch-panel-body"),
  sketchUpload: document.getElementById("sketch-upload"),
  sketchAnalyzeBtn: document.getElementById("sketch-analyze-btn"),
  sketchStatus: document.getElementById("sketch-status"),
  sketchFeedback: document.getElementById("sketch-feedback"),
  sketchPreview: document.getElementById("sketch-preview"),
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

function loadPerformance() {
  const stored = localStorage.getItem(STORAGE_KEYS.performance);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch (error) {
    return {};
  }
}

function savePerformance() {
  localStorage.setItem(STORAGE_KEYS.performance, JSON.stringify(state.performance));
}

function loadFigureCaptions() {
  const stored = localStorage.getItem(STORAGE_KEYS.figureCaptions);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch (error) {
    return {};
  }
}

function saveFigureCaptions() {
  localStorage.setItem(STORAGE_KEYS.figureCaptions, JSON.stringify(state.figureCaptions));
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

  document.body.classList.toggle("mode-landing", target === "landing");
  document.body.classList.toggle("mode-menu", target === "menu");
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

function isReviewWrong(entry) {
  if (entry.skipped) return false;
  if (entry.type === "mcq") return !entry.isCorrect;
  return entry.awardedPoints < entry.maxPoints;
}

function requiresSketch(question) {
  if (!question) return false;
  return (
    SKETCH_CUE.test(question.text || "") ||
    SKETCH_CUE.test(question.prompt || "") ||
    SKETCH_CUE.test(question.opgaveIntro || "")
  );
}

function isFigureAnswer(answer) {
  const text = String(answer || "").trim();
  if (!text) return false;
  if (text.length > 240) return false;
  return FIGURE_ANSWER_CUE.test(text);
}

function getQuestionImagePaths(question) {
  if (!question || !Array.isArray(question.images)) return [];
  return question.images.filter(Boolean);
}

function getFigureCaptionForImage(imagePath) {
  if (!imagePath) return "";
  const library = state.figureCaptionLibrary;
  if (library && typeof library === "object") {
    const libraryEntry = library[imagePath];
    if (typeof libraryEntry === "string") return libraryEntry;
    if (libraryEntry && typeof libraryEntry.description === "string") {
      return libraryEntry.description;
    }
  }
  const cached = state.figureCaptions[imagePath];
  if (typeof cached === "string") return cached;
  if (cached && typeof cached.description === "string") return cached.description;
  return "";
}

function setFigureCaptionForImage(imagePath, description) {
  if (!imagePath || !description) return;
  state.figureCaptions[imagePath] = description;
  saveFigureCaptions();
}

function getCombinedFigureCaption(question) {
  const images = getQuestionImagePaths(question);
  if (!images.length) return "";
  const parts = images
    .map((path, index) => {
      const caption = getFigureCaptionForImage(path);
      if (!caption) return "";
      if (images.length > 1) {
        return `Figur ${index + 1}: ${caption}`;
      }
      return caption;
    })
    .filter(Boolean);
  return parts.join("\n");
}

function shouldUseFigureCaption(question) {
  if (!question) return false;
  if (!getQuestionImagePaths(question).length) return false;
  return isFigureAnswer(question.answer);
}

function getEffectiveModelAnswer(question) {
  if (!question) return "";
  const answer = String(question.answer || "").trim();
  if (shouldUseFigureCaption(question)) {
    const caption = getCombinedFigureCaption(question);
    if (caption) return caption;
  }
  return answer;
}

function buildSketchModelAnswer(question) {
  if (!question) return "";
  const answer = String(question.answer || "").trim();
  const caption = getCombinedFigureCaption(question);
  if (!caption) return answer;
  if (isFigureAnswer(answer)) return caption;
  if (!answer) return caption;
  return `${answer}\n\nFigurbeskrivelse: ${caption}`;
}

function updateTopBar() {
  const total = state.activeQuestions.length || 0;
  const current = Math.min(state.currentIndex + 1, total);
  state.scoreSummary = calculateScoreSummary();
  if (state.sessionSettings.infiniteMode) {
    elements.progressText.textContent = `${current} / ∞`;
    elements.progressFill.style.width = "100%";
    elements.progressFill.classList.add("infinite");
  } else {
    elements.progressText.textContent = `${current} / ${total}`;
    elements.progressFill.style.width = total ? `${(state.currentIndex / total) * 100}%` : "0%";
    elements.progressFill.classList.remove("infinite");
  }
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

function setShortFigureStatus(message, isWarn = false) {
  if (!elements.shortFigureStatus) return;
  elements.shortFigureStatus.textContent = message;
  elements.shortFigureStatus.classList.toggle("warn", Boolean(isWarn));
}

function updateShortAnswerModel(question) {
  if (!question || !elements.shortAnswerModel) return;
  const rawAnswer = String(question.answer || "").trim();
  const fallbackAnswer = rawAnswer || "Ingen facit tilgængelig.";
  const hasImages = getQuestionImagePaths(question).length > 0;
  const useFigureCaption = shouldUseFigureCaption(question);
  const figureCaption = getCombinedFigureCaption(question);

  let modelTitle = "Modelbesvarelse";
  let modelText = fallbackAnswer;
  let showTag = false;

  if (useFigureCaption) {
    modelTitle = figureCaption ? "Facit (AI-figur)" : "Facit (figur)";
    if (figureCaption) {
      modelText = figureCaption;
      showTag = true;
    }
  }

  if (elements.shortModelTitle) {
    elements.shortModelTitle.textContent = modelTitle;
  }
  if (elements.shortModelText) {
    elements.shortModelText.textContent = modelText;
  } else {
    const textEl = elements.shortAnswerModel.querySelector("p");
    if (textEl) textEl.textContent = modelText;
  }
  if (elements.shortModelTag) {
    elements.shortModelTag.classList.toggle("hidden", !showTag);
  }

  if (elements.shortFigureGenerateBtn) {
    elements.shortFigureGenerateBtn.disabled = !state.aiStatus.available;
    elements.shortFigureGenerateBtn.textContent = figureCaption ? "Opdater" : "Generér";
  }

  if (elements.shortFigureAnswer) {
    const showFigureBlock = hasImages && (!useFigureCaption || !figureCaption);
    elements.shortFigureAnswer.classList.toggle("hidden", !showFigureBlock);
    if (showFigureBlock) {
      if (!useFigureCaption && figureCaption) {
        if (elements.shortFigureText) {
          elements.shortFigureText.textContent = figureCaption;
        }
        setShortFigureStatus("AI-beskrivelse klar.", false);
      } else if (useFigureCaption) {
        if (elements.shortFigureText) {
          elements.shortFigureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Facit henviser til figuren. Generér en beskrivelse."
            : "AI offline. Start scripts/dev_server.py.",
          !state.aiStatus.available
        );
      } else {
        if (elements.shortFigureText) {
          elements.shortFigureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Generér en figurbeskrivelse hvis du vil."
            : "AI offline. Start scripts/dev_server.py.",
          !state.aiStatus.available
        );
      }
    } else {
      setShortFigureStatus("", false);
    }
  }

  elements.shortAnswerSources.textContent = question.sources?.length
    ? `Kilder: ${question.sources.join(" ")}`
    : "";
}

function updateSketchPanel(question) {
  if (!elements.sketchPanel) return;
  if (!question || !requiresSketch(question)) {
    elements.sketchPanel.classList.add("hidden");
    return;
  }
  elements.sketchPanel.classList.remove("hidden");
  if (elements.sketchAnalyzeBtn) {
    elements.sketchAnalyzeBtn.disabled = !state.aiStatus.available;
  }
  if (elements.sketchStatus && !state.aiStatus.available) {
    elements.sketchStatus.textContent = state.aiStatus.message || "AI offline";
  }
  const analysis = state.sketchAnalysis.get(question.key);
  if (analysis && elements.sketchFeedback) {
    elements.sketchFeedback.textContent = formatSketchFeedback(analysis);
  }
  const upload = state.sketchUploads.get(question.key);
  if (upload && elements.sketchStatus) {
    elements.sketchStatus.textContent = upload.label || "Skitse valgt";
  }
  if (upload && elements.sketchPreview) {
    elements.sketchPreview.src = upload.dataUrl;
    elements.sketchPreview.classList.remove("hidden");
  }
}

function resetShortAnswerUI() {
  if (!elements.shortAnswerContainer) return;
  elements.shortAnswerInput.value = "";
  elements.shortAnswerScoreRange.value = "0";
  elements.shortAnswerScoreInput.value = "0";
  elements.shortAnswerMaxPoints.textContent = "0";
  elements.shortAnswerAiFeedback.textContent = "";
  if (elements.shortAnswerAiStatus) {
    elements.shortAnswerAiStatus.textContent = "";
    elements.shortAnswerAiStatus.classList.remove("warn");
  }
  elements.shortAnswerHint.textContent = "";
  elements.shortAnswerModel.classList.add("hidden");
  if (elements.shortModelTitle) {
    elements.shortModelTitle.textContent = "Modelbesvarelse";
  }
  if (elements.shortModelText) {
    elements.shortModelText.textContent = "";
  } else {
    elements.shortAnswerModel.querySelector("p").textContent = "";
  }
  if (elements.shortModelTag) {
    elements.shortModelTag.classList.add("hidden");
  }
  if (elements.shortFigureAnswer) {
    elements.shortFigureAnswer.classList.add("hidden");
  }
  if (elements.shortFigureText) {
    elements.shortFigureText.textContent = "";
  }
  if (elements.shortFigureStatus) {
    elements.shortFigureStatus.textContent = "";
    elements.shortFigureStatus.classList.remove("warn");
  }
  elements.shortAnswerSources.textContent = "";
  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.textContent = "Vis facit";
  }
  if (elements.shortSketchHint) {
    elements.shortSketchHint.classList.add("hidden");
    elements.shortSketchHint.textContent = "";
  }
  if (elements.sketchPanel) {
    elements.sketchPanel.classList.add("hidden");
  }
  if (elements.sketchPanelBody) {
    elements.sketchPanelBody.classList.add("hidden");
  }
  if (elements.sketchToggleBtn) {
    elements.sketchToggleBtn.textContent = "Vis";
  }
  if (elements.sketchUpload) {
    elements.sketchUpload.value = "";
  }
  if (elements.sketchStatus) {
    elements.sketchStatus.textContent = "";
  }
  if (elements.sketchFeedback) {
    elements.sketchFeedback.textContent = "";
  }
  if (elements.sketchPreview) {
    elements.sketchPreview.src = "";
    elements.sketchPreview.classList.add("hidden");
  }
}

function getDisplayLabels(count) {
  const labels = [];
  for (let i = 0; i < count; i += 1) {
    if (i < 26) {
      labels.push(String.fromCharCode(65 + i));
    } else {
      const suffix = Math.floor(i / 26);
      const letter = String.fromCharCode(65 + (i % 26));
      labels.push(`${letter}${suffix}`);
    }
  }
  return labels;
}

function getOptionMapping(question) {
  if (!question?.options) {
    return { options: [], correctLabel: "" };
  }
  const key = question.key || getQuestionKey(question);
  if (!state.optionOrder.has(key)) {
    const shouldShuffle =
      state.sessionSettings?.shuffleOptions ?? state.settings.shuffleOptions;
    const baseOptions = shouldShuffle ? shuffle(question.options) : question.options;
    const labels = getDisplayLabels(baseOptions.length);
    const displayOptions = baseOptions.map((option, index) => ({
      label: labels[index],
      text: option.text,
      originalLabel: option.label,
    }));
    const correctIndex = baseOptions.findIndex(
      (option) =>
        String(option.label || "").toUpperCase() === String(question.correctLabel || "").toUpperCase()
    );
    const correctLabel = labels[correctIndex] || labels[0] || "";
    state.optionOrder.set(key, { options: displayOptions, correctLabel });
  }
  return state.optionOrder.get(key);
}

function renderMcqQuestion(question) {
  elements.optionsContainer.classList.remove("hidden");
  elements.shortAnswerContainer.classList.add("hidden");
  elements.skipBtn.textContent = "Spring over (0 point)";
  elements.nextBtn.disabled = true;
  elements.questionText.textContent = question.text;

  const mapping = getOptionMapping(question);
  const options = mapping.options || [];
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.label = option.label;
    btn.dataset.text = option.text;
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
  if (elements.shortAnswerAiStatus) {
    const label = state.aiStatus.available
      ? `AI klar${state.aiStatus.model ? ` (${state.aiStatus.model})` : ""}`
      : state.aiStatus.message || "AI offline";
    elements.shortAnswerAiStatus.textContent = label;
    elements.shortAnswerAiStatus.classList.toggle("warn", !state.aiStatus.available);
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
  updateShortAnswerModel(question);
  updateSketchPanel(question);

  if (elements.shortAnswerAiButton) {
    elements.shortAnswerAiButton.disabled = !state.aiStatus.available;
  }
}

function renderQuestion() {
  clearAutoAdvance();
  stopTts();
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
  queueFigureCaptionsForQuestions(currentQuestion);

  if (currentQuestion.type === "short") {
    renderShortQuestion(currentQuestion);
  } else {
    renderMcqQuestion(currentQuestion);
  }

  updateFlagButton();
  updateTopBar();
  state.questionStartedAt = Date.now();
  maybeAutoReadQuestion();
  scheduleTtsPrefetch();
}

function enqueueFigureCaption(imagePath) {
  if (!imagePath) return;
  if (getFigureCaptionForImage(imagePath)) return;
  if (state.figureCaptionRequests.has(imagePath)) return;
  if (state.figureCaptionQueued.has(imagePath)) return;
  state.figureCaptionQueue.push(imagePath);
  state.figureCaptionQueued.add(imagePath);
}

function queueFigureCaptionsForQuestions(questions) {
  if (!state.settings.autoFigureCaptions || !state.aiStatus.available) return;
  const list = Array.isArray(questions) ? questions : [questions];
  list.forEach((question) => {
    getQuestionImagePaths(question).forEach((path) => enqueueFigureCaption(path));
  });
  scheduleFigureCaptionQueue();
}

function clearFigureCaptionQueue() {
  if (state.figureCaptionTimer) {
    clearTimeout(state.figureCaptionTimer);
    state.figureCaptionTimer = null;
  }
  state.figureCaptionQueue = [];
  state.figureCaptionQueued.clear();
}

function scheduleFigureCaptionQueue(delay = FIGURE_CAPTION_QUEUE_DELAY) {
  if (state.figureCaptionTimer || state.figureCaptionProcessing) return;
  state.figureCaptionTimer = setTimeout(() => {
    state.figureCaptionTimer = null;
    processFigureCaptionQueue();
  }, delay);
}

async function processFigureCaptionQueue() {
  if (!state.settings.autoFigureCaptions || !state.aiStatus.available || document.hidden) return;
  if (state.figureCaptionProcessing) return;
  const next = state.figureCaptionQueue.shift();
  if (!next) return;
  state.figureCaptionQueued.delete(next);
  state.figureCaptionProcessing = true;
  await fetchFigureCaptionByPath(next, { silent: true });
  state.figureCaptionProcessing = false;
  if (state.figureCaptionQueue.length) {
    scheduleFigureCaptionQueue();
  }
}

async function fetchFigureCaptionByPath(imagePath, { force = false, silent = false } = {}) {
  if (!imagePath) return "";
  const existing = getFigureCaptionForImage(imagePath);
  if (existing && !force) return existing;

  const inFlight = state.figureCaptionRequests.get(imagePath);
  if (inFlight) return inFlight;

  if (!state.aiStatus.available) {
    if (!silent) {
      setShortFigureStatus(state.aiStatus.message || "AI offline", true);
    }
    return "";
  }

  const promise = (async () => {
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "figure",
          imagePath,
          language: "da",
        }),
      });
      if (!res.ok) {
        let detail = `AI response ${res.status}`;
        try {
          const data = await res.json();
          if (data.error) detail = data.error;
        } catch (error) {
          detail = `AI response ${res.status}`;
        }
        throw new Error(detail);
      }
      const data = await res.json();
      const description = String(data.description || "").trim();
      if (!description) {
        return "";
      }
      setFigureCaptionForImage(imagePath, description);
      const current = state.activeQuestions[state.currentIndex];
      if (current && getQuestionImagePaths(current).includes(imagePath)) {
        updateShortAnswerModel(current);
      }
      return description;
    } catch (error) {
      if (!silent) {
        setShortFigureStatus(
          `Kunne ikke hente figurbeskrivelse. ${error.message || "Tjek serveren."}`,
          true
        );
      }
      return "";
    } finally {
      if (state.figureCaptionRequests.get(imagePath) === promise) {
        state.figureCaptionRequests.delete(imagePath);
      }
    }
  })();

  state.figureCaptionRequests.set(imagePath, promise);
  return promise;
}

async function fetchFigureCaptionForQuestion(question, { force = false, silent = false } = {}) {
  if (!question) return "";
  const images = getQuestionImagePaths(question);
  if (!images.length) return "";
  if (!state.aiStatus.available) {
    if (!silent) {
      setShortFigureStatus(state.aiStatus.message || "AI offline", true);
    }
    return "";
  }

  if (!silent) {
    setShortFigureStatus("Genererer figurbeskrivelse …");
  }
  let gotAny = false;
  for (const imagePath of images) {
    const description = await fetchFigureCaptionByPath(imagePath, { force, silent: true });
    if (description) gotAny = true;
  }
  if (!silent) {
    setShortFigureStatus(
      gotAny ? "AI-beskrivelse klar." : "Kunne ikke aflæse figuren.",
      !gotAny
    );
  }
  return getCombinedFigureCaption(question);
}

function formatSketchFeedback(result) {
  const lines = [];
  if (result.description) {
    lines.push(`Beskrivelse: ${result.description}`);
  }
  if (Array.isArray(result.matched) && result.matched.length) {
    lines.push(`Matcher: ${result.matched.join(", ")}`);
  }
  if (Array.isArray(result.missing) && result.missing.length) {
    lines.push(`Mangler: ${result.missing.join(", ")}`);
  }
  if (typeof result.match === "number" && Number.isFinite(result.match)) {
    lines.push(`Match: ${(result.match * 100).toFixed(0)}%`);
  }
  if (result.feedback) {
    lines.push(`Vurdering: ${result.feedback}`);
  }
  return lines.join("\n");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Kunne ikke læse filen."));
    reader.readAsDataURL(file);
  });
}

async function handleSketchUpload(file) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  if (!file) return;
  if (file.size > SKETCH_MAX_BYTES) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = "Filen er for stor. Vælg en mindre fil.";
    }
    return;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const label = `${file.name} · ${sizeMb} MB`;
    state.sketchUploads.set(question.key, { dataUrl, label });
    state.sketchAnalysis.delete(question.key);
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = `Valgt: ${label}`;
    }
    if (elements.sketchFeedback) {
      elements.sketchFeedback.textContent = "";
    }
    if (elements.sketchPreview) {
      elements.sketchPreview.src = dataUrl;
      elements.sketchPreview.classList.remove("hidden");
    }
  } catch (error) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = error.message || "Kunne ikke læse filen.";
    }
  }
}

async function analyzeSketch() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  if (!state.aiStatus.available) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = state.aiStatus.message || "AI offline";
    }
    return;
  }
  const upload = state.sketchUploads.get(question.key);
  if (!upload) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = "Vælg en skitse først.";
    }
    return;
  }
  if (elements.sketchAnalyzeBtn) {
    elements.sketchAnalyzeBtn.disabled = true;
  }
  if (elements.sketchStatus) {
    elements.sketchStatus.textContent = "Analyserer skitse …";
  }

  let modelAnswer = buildSketchModelAnswer(question);
  if (getQuestionImagePaths(question).length && !getCombinedFigureCaption(question)) {
    const generated = await fetchFigureCaptionForQuestion(question, { silent: true });
    if (generated) {
      modelAnswer = buildSketchModelAnswer(question);
    }
  }

  try {
    const res = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "sketch",
        imageData: upload.dataUrl,
        question: question.text,
        modelAnswer,
        language: "da",
      }),
    });
    if (!res.ok) {
      let detail = `AI response ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) detail = data.error;
      } catch (error) {
        detail = `AI response ${res.status}`;
      }
      throw new Error(detail);
    }
    const data = await res.json();
    const result = {
      description: String(data.description || "").trim(),
      match: Number(data.match || 0),
      matched: Array.isArray(data.matched) ? data.matched : [],
      missing: Array.isArray(data.missing) ? data.missing : [],
      feedback: String(data.feedback || "").trim(),
    };
    state.sketchAnalysis.set(question.key, result);
    if (elements.sketchFeedback) {
      elements.sketchFeedback.textContent = formatSketchFeedback(result);
    }
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = "AI-vurdering klar.";
    }
  } catch (error) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent =
        `Kunne ikke analysere skitsen. ${error.message || "Tjek serveren."}`;
    }
  } finally {
    if (elements.sketchAnalyzeBtn) {
      elements.sketchAnalyzeBtn.disabled = !state.aiStatus.available;
    }
  }
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
  stopTts();
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "mcq") return;
  const mapping = getOptionMapping(question);
  const correctLabel = mapping?.correctLabel || "";
  const isCorrect = correctLabel === label;
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
  recordPerformance(question, isCorrect ? 1 : 0, getQuestionTimeMs());

  state.locked = true;
  setFeedback(
    isCorrect ? "Korrekt! +3 point" : `Forkert. Rigtigt svar: ${correctLabel} (-1)`,
    isCorrect ? "success" : "error"
  );
  highlightOptions(label, correctLabel);
  lockOptions();
  elements.nextBtn.disabled = false;
  elements.skipBtn.disabled = true;
  updateTopBar();
  maybeAutoAdvance();
}

function skipQuestion() {
  if (state.locked) return;
  stopTts();
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
    recordPerformance(question, 0, getQuestionTimeMs());
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
  recordPerformance(question, 0, getQuestionTimeMs());
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

function clampInt(value, min, max, fallback) {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(numeric, min), max);
}

function getQuestionTimeMs() {
  const startedAt = state.questionStartedAt;
  state.questionStartedAt = null;
  if (!startedAt) return 0;
  return Math.max(0, Date.now() - startedAt);
}

function recordPerformance(question, score, timeMs) {
  if (!question?.key) return;
  const key = question.key;
  const entry = state.performance[key] || {
    seen: 0,
    totalScore: 0,
    totalTimeMs: 0,
    lastSeen: 0,
  };
  const normalizedScore = clamp(Number(score) || 0, 0, 1);
  entry.seen += 1;
  entry.totalScore += normalizedScore;
  entry.totalTimeMs += Math.max(0, Number(timeMs) || 0);
  entry.lastSeen = Date.now();
  state.performance[key] = entry;
  savePerformance();
}

function getQuestionWeight(question) {
  if (!question?.key) return 1;
  const stats = state.performance[question.key];
  if (!stats || !stats.seen) return 1.15;
  const avgScore = stats.totalScore / stats.seen;
  const errorBoost = 1 + (1 - avgScore) * 2;
  const avgTimeMs = stats.totalTimeMs / stats.seen;
  const timeBoost = 1 + Math.min(avgTimeMs / 45000, 0.7);
  const ageDays = stats.lastSeen ? (Date.now() - stats.lastSeen) / 86400000 : 7;
  const recencyBoost = 1 + Math.min(ageDays / 7, 0.6);
  const weight = errorBoost * timeBoost * recencyBoost;
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

function getRatioValues(settings) {
  const mcqRatio = clampInt(settings.ratioMcq, 1, 12, DEFAULT_SETTINGS.ratioMcq);
  const shortRatio = clampInt(settings.ratioShort, 1, 12, DEFAULT_SETTINGS.ratioShort);
  return { mcqRatio, shortRatio };
}

function getShortTargetFromRatio(mcqTarget, shortPoolCount, settings) {
  if (shortPoolCount <= 0) return 0;
  const { mcqRatio, shortRatio } = getRatioValues(settings);
  const raw = Math.round((mcqTarget * shortRatio) / mcqRatio);
  return Math.min(Math.max(raw, 1), shortPoolCount);
}

function formatRatioLabel(settings) {
  const { mcqRatio, shortRatio } = getRatioValues(settings);
  return `${mcqRatio}:${shortRatio}`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatHistoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("da-DK", { day: "2-digit", month: "short" });
  const time = date.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

function setAiStatus(status) {
  state.aiStatus = {
    available: status.available,
    model: status.model || null,
    message: status.message || "",
  };

  if (elements.shortAnswerAiButton) {
    elements.shortAnswerAiButton.disabled = !status.available;
  }
  if (elements.aiStatusPill) {
    const label = status.available
      ? `AI klar${status.model ? ` · ${status.model}` : ""}`
      : status.message || "AI offline";
    elements.aiStatusPill.textContent = label;
    elements.aiStatusPill.classList.toggle("warn", !status.available);
  }
  if (elements.shortAnswerAiStatus) {
    const label = status.available
      ? `AI klar${status.model ? ` (${status.model})` : ""}`
      : status.message || "AI offline";
    elements.shortAnswerAiStatus.textContent = label;
    elements.shortAnswerAiStatus.classList.toggle("warn", !status.available);
  }

  const current = state.activeQuestions[state.currentIndex];
  if (current && current.type === "short") {
    updateShortAnswerModel(current);
    updateSketchPanel(current);
  }
  if (status.available && state.settings.autoFigureCaptions) {
    queueFigureCaptionsForQuestions(state.activeQuestions);
  }
}

function getTtsBaseLabel() {
  if (!state.ttsStatus.available) {
    return state.ttsStatus.message || "Oplæsning offline";
  }
  return `Oplæsning klar${state.ttsStatus.model ? ` (${state.ttsStatus.model})` : ""}`;
}

function updateTtsLabel(message, isWarn = false) {
  if (!elements.ttsStatus) return;
  elements.ttsStatus.textContent = message;
  elements.ttsStatus.classList.toggle("warn", isWarn);
}

function updateTtsControls() {
  const enabled = Boolean(state.settings.ttsEnabled);
  const available = enabled && state.ttsStatus.available;
  const isLoading = state.ttsPlayer.isLoading;
  const isPlaying = state.ttsPlayer.isPlaying;
  if (elements.ttsToolbar) {
    if (isLoading) {
      elements.ttsToolbar.dataset.state = "loading";
    } else if (isPlaying) {
      elements.ttsToolbar.dataset.state = "playing";
    } else {
      elements.ttsToolbar.dataset.state = "";
    }
  }
  if (elements.ttsPlayBtn) {
    elements.ttsPlayBtn.disabled = !available || isLoading;
  }
  if (elements.ttsStopBtn) {
    elements.ttsStopBtn.disabled = !isPlaying && !isLoading;
  }
  if (elements.ttsPreviewBtn) {
    elements.ttsPreviewBtn.disabled = !available || isLoading;
  }
  if (elements.ttsAutoToggle) {
    elements.ttsAutoToggle.disabled = !available;
  }
  if (elements.ttsOptionsToggle) {
    elements.ttsOptionsToggle.disabled = !available;
  }
  if (elements.ttsVoiceSelect) {
    elements.ttsVoiceSelect.disabled = !available;
  }
  if (elements.ttsSpeedRange) {
    elements.ttsSpeedRange.disabled = !available;
  }
}

function applyTtsVisibility() {
  const enabled = Boolean(state.settings.ttsEnabled);
  if (elements.ttsToolbar) {
    elements.ttsToolbar.classList.toggle("hidden", !enabled);
  }
  if (!enabled) {
    stopTts();
    clearTtsPrefetch();
  }
  updateTtsControls();
  applyTtsCollapsedState();
}

function applyTtsCollapsedState() {
  const collapsed = Boolean(state.settings.ttsCollapsed);
  if (elements.ttsToolbar) {
    elements.ttsToolbar.dataset.collapsed = collapsed ? "true" : "false";
  }
  if (elements.ttsCollapseBtn) {
    elements.ttsCollapseBtn.textContent = collapsed ? "Vis" : "Skjul";
    elements.ttsCollapseBtn.setAttribute("aria-expanded", String(!collapsed));
  }
  if (elements.ttsBody) {
    elements.ttsBody.setAttribute("aria-hidden", String(collapsed));
  }
}

function setTtsStatus(status) {
  state.ttsStatus = {
    available: status.available,
    model: status.model || null,
    message: status.message || "",
  };

  if (!state.ttsStatus.available) {
    stopTts();
    clearTtsPrefetch();
    return;
  }

  updateTtsControls();
  updateTtsLabel(getTtsBaseLabel(), false);
}

function normalizeTtsVoice(value) {
  const match = TTS_VOICES.find((voice) => voice.value === value);
  return match ? match.value : TTS_VOICES[0].value;
}

function updateTtsSpeedLabel(value = state.settings.ttsSpeed) {
  if (!elements.ttsSpeedLabel) return;
  const speed = Number(value) || 1;
  const formatted = speed.toFixed(2).replace(/\.?0+$/, "");
  elements.ttsSpeedLabel.textContent = `${formatted}x`;
}

function sanitizeTtsText(text) {
  return String(text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getOptionLinesForQuestion(question) {
  if (!question || question.type !== "mcq" || !question.options) return [];
  const mapping = getOptionMapping(question);
  const options = mapping.options || [];
  return options
    .map((option) => {
      const optionText = String(option.text || "").trim();
      if (!optionText) return "";
      return optionText;
    })
    .filter(Boolean);
}

function buildTtsText(question) {
  if (!question) return "";
  const parts = [];
  if (question.opgaveIntro) {
    parts.push(`Opgaveintro: ${question.opgaveIntro}`);
  }
  if (question.text) {
    parts.push(question.text);
  }
  if (question.images?.length) {
    parts.push("Der er en figur til dette spørgsmål.");
  }
  if (question.type === "short") {
    parts.push("Skriv dit svar i tekstfeltet.");
  } else if (state.settings.ttsIncludeOptions) {
    const optionLines = getOptionLinesForQuestion(question);
    if (optionLines.length) {
      parts.push("");
      optionLines.forEach((line) => parts.push(line));
    }
  }
  return sanitizeTtsText(parts.join("\n"));
}

function clearTtsPrefetch() {
  const prefetch = state.ttsPrefetch;
  if (prefetch.abortController) {
    prefetch.abortController.abort();
  }
  if (prefetch.timer) {
    clearTimeout(prefetch.timer);
  }
  prefetch.requestId += 1;
  prefetch.key = null;
  prefetch.text = "";
  prefetch.voice = null;
  prefetch.speed = null;
  prefetch.includeOptions = null;
  prefetch.blob = null;
  prefetch.promise = null;
  prefetch.abortController = null;
  prefetch.timer = null;
  prefetch.defer = false;
}

function consumeTtsPrefetch(questionKey) {
  const prefetch = state.ttsPrefetch;
  if (!questionKey || prefetch.key !== questionKey) return;
  const shouldReschedule = prefetch.defer;
  prefetch.key = null;
  prefetch.text = "";
  prefetch.voice = null;
  prefetch.speed = null;
  prefetch.includeOptions = null;
  prefetch.blob = null;
  prefetch.promise = null;
  prefetch.abortController = null;
  prefetch.defer = false;
  if (shouldReschedule) {
    scheduleTtsPrefetch();
  }
}

function shouldDeferTtsPrefetch() {
  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (!currentQuestion) return false;
  const prefetch = state.ttsPrefetch;
  if (prefetch.key !== currentQuestion.key) return false;
  return Boolean(prefetch.promise || prefetch.blob);
}

function scheduleTtsPrefetch() {
  if (!state.settings.ttsEnabled || !state.settings.ttsAuto || !state.ttsStatus.available || document.hidden) {
    clearTtsPrefetch();
    return;
  }
  const prefetch = state.ttsPrefetch;
  if (prefetch.timer) {
    clearTimeout(prefetch.timer);
  }
  prefetch.timer = setTimeout(() => {
    prefetch.timer = null;
    if (shouldDeferTtsPrefetch()) {
      prefetch.defer = true;
      return;
    }
    prefetchNextQuestionTts();
  }, 350);
}

function isPrefetchMatch(question, text, voice, speed, includeOptions) {
  const prefetch = state.ttsPrefetch;
  return (
    prefetch.key === question.key &&
    prefetch.voice === voice &&
    prefetch.speed === speed &&
    prefetch.includeOptions === includeOptions &&
    prefetch.text === text
  );
}

function prefetchNextQuestionTts() {
  if (!state.settings.ttsEnabled || !state.settings.ttsAuto || !state.ttsStatus.available || document.hidden) {
    clearTtsPrefetch();
    return;
  }
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.activeQuestions.length) {
    clearTtsPrefetch();
    return;
  }
  const question = state.activeQuestions[nextIndex];
  if (!question) {
    clearTtsPrefetch();
    return;
  }
  const text = buildTtsText(question);
  if (!text || text.length > TTS_MAX_CHARS) {
    clearTtsPrefetch();
    return;
  }

  const voice = normalizeTtsVoice(state.settings.ttsVoice);
  const speed = Math.min(
    Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
    TTS_SPEED_MAX
  );
  const includeOptions = state.settings.ttsIncludeOptions;

  const prefetch = state.ttsPrefetch;
  if (isPrefetchMatch(question, text, voice, speed, includeOptions)) {
    if (prefetch.blob || prefetch.promise) return;
  }

  clearTtsPrefetch();

  const controller = new AbortController();
  const requestId = prefetch.requestId + 1;
  prefetch.requestId = requestId;
  prefetch.key = question.key;
  prefetch.text = text;
  prefetch.voice = voice;
  prefetch.speed = speed;
  prefetch.includeOptions = includeOptions;
  prefetch.abortController = controller;

  const promise = fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, speed }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        let detail = `TTS response ${res.status}`;
        try {
          const data = await res.json();
          if (data.error) detail = data.error;
        } catch (error) {
          detail = `TTS response ${res.status}`;
        }
        throw new Error(detail);
      }
      return res.blob();
    })
    .then((blob) => {
      if (state.ttsPrefetch.requestId !== requestId) return null;
      state.ttsPrefetch.blob = blob;
      state.ttsPrefetch.abortController = null;
      state.ttsPrefetch.promise = null;
      return blob;
    })
    .catch((error) => {
      if (error.name === "AbortError") return null;
      if (state.ttsPrefetch.requestId === requestId) {
        state.ttsPrefetch.abortController = null;
        state.ttsPrefetch.promise = null;
        state.ttsPrefetch.blob = null;
        state.ttsPrefetch.key = null;
        state.ttsPrefetch.text = "";
      }
      return null;
    });

  prefetch.promise = promise;
}

function stopTts(message, isWarn = false) {
  if (state.ttsPlayer.abortController) {
    state.ttsPlayer.abortController.abort();
    state.ttsPlayer.abortController = null;
  }
  if (state.ttsPlayer.autoTimer) {
    clearTimeout(state.ttsPlayer.autoTimer);
    state.ttsPlayer.autoTimer = null;
  }
  if (state.ttsPlayer.audio) {
    state.ttsPlayer.audio.pause();
    state.ttsPlayer.audio.src = "";
  }
  if (state.ttsPlayer.objectUrl) {
    URL.revokeObjectURL(state.ttsPlayer.objectUrl);
  }
  state.ttsPlayer.audio = null;
  state.ttsPlayer.objectUrl = null;
  state.ttsPlayer.isPlaying = false;
  state.ttsPlayer.isLoading = false;
  updateTtsControls();
  if (message) {
    updateTtsLabel(message, isWarn);
  } else {
    updateTtsLabel(getTtsBaseLabel(), !state.ttsStatus.available);
  }
}

async function playTtsBlob(audioBlob, { source = "manual" } = {}) {
  if (!audioBlob || !audioBlob.size) {
    stopTts("Ingen lyd at afspille.", true);
    return;
  }
  stopTts();
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  state.ttsPlayer.audio = audio;
  state.ttsPlayer.objectUrl = url;
  state.ttsPlayer.isLoading = false;
  state.ttsPlayer.isPlaying = true;
  updateTtsControls();
  updateTtsLabel("Afspiller oplæsning …");

  audio.addEventListener("ended", () => {
    stopTts();
  });
  audio.addEventListener("error", () => {
    stopTts("Kunne ikke afspille lyd.", true);
  });

  try {
    await audio.play();
  } catch (error) {
    const isAuto = source === "auto";
    stopTts(
      isAuto
        ? "Browseren blokerer auto-oplæsning. Klik \"Læs op\" for at starte."
        : "Browseren blokerer lyd. Klik \"Læs op\" igen.",
      true
    );
  }
}

async function playTtsText(text, { source = "manual" } = {}) {
  if (!state.settings.ttsEnabled) return;
  const cleanText = sanitizeTtsText(text);
  if (!cleanText) {
    stopTts("Ingen tekst at læse op.", true);
    return;
  }
  if (!state.ttsStatus.available) {
    stopTts(getTtsBaseLabel(), true);
    return;
  }
  if (cleanText.length > TTS_MAX_CHARS) {
    stopTts("Teksten er for lang til oplæsning. Slå evt. svarmuligheder fra.", true);
    return;
  }

  stopTts();
  const controller = new AbortController();
  state.ttsPlayer.abortController = controller;
  state.ttsPlayer.isLoading = true;
  updateTtsControls();
  updateTtsLabel("Henter oplæsning …");

  const voice = normalizeTtsVoice(state.settings.ttsVoice);
  const speed = Math.min(
    Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
    TTS_SPEED_MAX
  );

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, voice, speed }),
      signal: controller.signal,
    });
    if (!res.ok) {
      let detail = `TTS response ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) detail = data.error;
      } catch (error) {
        detail = `TTS response ${res.status}`;
      }
      throw new Error(detail);
    }
    const audioBlob = await res.blob();
    state.ttsPlayer.abortController = null;
    if (!audioBlob || !audioBlob.size) {
      throw new Error("Tom lydfil");
    }
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    state.ttsPlayer.audio = audio;
    state.ttsPlayer.objectUrl = url;
    state.ttsPlayer.isLoading = false;
    state.ttsPlayer.isPlaying = true;
    updateTtsControls();
    updateTtsLabel("Afspiller oplæsning …");

    audio.addEventListener("ended", () => {
      stopTts();
    });
    audio.addEventListener("error", () => {
      stopTts("Kunne ikke afspille lyd.", true);
    });

    try {
      await audio.play();
    } catch (error) {
      const isAuto = source === "auto";
      stopTts(
        isAuto
          ? "Browseren blokerer auto-oplæsning. Klik \"Læs op\" for at starte."
          : "Browseren blokerer lyd. Klik \"Læs op\" igen.",
        true
      );
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    state.ttsPlayer.abortController = null;
    stopTts(`Kunne ikke hente oplæsning. ${error.message || "Tjek serveren."}`, true);
  }
}

async function getPrefetchedBlob(question, text, voice, speed, includeOptions) {
  if (!isPrefetchMatch(question, text, voice, speed, includeOptions)) return null;
  const prefetch = state.ttsPrefetch;
  if (prefetch.blob) return prefetch.blob;
  if (!prefetch.promise) return null;
  try {
    const blob = await prefetch.promise;
    if (!blob) return null;
    if (!isPrefetchMatch(question, text, voice, speed, includeOptions)) return null;
    return blob;
  } catch (error) {
    return null;
  }
}

async function playTtsForCurrentQuestion(source = "manual") {
  if (!state.settings.ttsEnabled) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  const text = buildTtsText(question);
  const voice = normalizeTtsVoice(state.settings.ttsVoice);
  const speed = Math.min(
    Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
    TTS_SPEED_MAX
  );
  const includeOptions = state.settings.ttsIncludeOptions;
  const prefetched = await getPrefetchedBlob(question, text, voice, speed, includeOptions);
  if (prefetched) {
    consumeTtsPrefetch(question.key);
    await playTtsBlob(prefetched, { source });
    return;
  }
  playTtsText(text, { source });
}

function toggleTtsPlayback() {
  if (!state.settings.ttsEnabled) return;
  if (state.ttsPlayer.isLoading || state.ttsPlayer.isPlaying) {
    stopTts();
    return;
  }
  playTtsForCurrentQuestion("manual");
}

function maybeAutoReadQuestion() {
  if (!state.settings.ttsEnabled) return;
  if (!state.settings.ttsAuto) return;
  if (!state.ttsStatus.available) return;
  if (document.hidden) return;
  if (state.ttsPlayer.autoTimer) {
    clearTimeout(state.ttsPlayer.autoTimer);
  }
  state.ttsPlayer.autoTimer = setTimeout(() => {
    state.ttsPlayer.autoTimer = null;
    playTtsForCurrentQuestion("auto");
  }, 200);
}

function getHistoryEntries() {
  const entries = Array.isArray(state.history) ? state.history : [];
  return entries.filter((entry) => entry && typeof entry.overallPercent === "number");
}

function saveHistoryEntries(entries) {
  state.history = entries.slice(-HISTORY_LIMIT);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
}

function getBestHistoryEntry(entries) {
  if (!entries.length) return null;
  return entries.reduce((best, current) =>
    current.overallPercent > best.overallPercent ? current : best
  );
}

function getImprovementStreak(entries) {
  if (entries.length < 2) return 0;
  let streak = 0;
  for (let i = entries.length - 1; i > 0; i -= 1) {
    if (entries[i].overallPercent > entries[i - 1].overallPercent) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function renderHistoryList(container, entries) {
  if (!container) return;
  container.innerHTML = "";
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Ingen runder endnu. Start en runde for at låse progressionen op.";
    container.appendChild(empty);
    return;
  }

  const visible = entries.slice(-6).reverse();
  visible.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "history-item";
    if (index === 0) row.classList.add("latest");

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = `${entry.grade || "-"} · ${formatPercent(entry.overallPercent)}`;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const mcqPoints = Number(entry.mcqPoints) || 0;
    const mcqMax = Number(entry.mcqMax) || 0;
    const shortPoints = Number(entry.shortPoints) || 0;
    const shortMax = Number(entry.shortMax) || 0;
    const mcqMeta = mcqMax
      ? `MCQ ${mcqPoints}/${mcqMax}`
      : "MCQ —";
    const shortMeta = shortMax
      ? `Kortsvar ${shortPoints.toFixed(1)}/${shortMax.toFixed(1)}`
      : "Kortsvar —";
    meta.textContent = `${formatHistoryDate(entry.date)} · ${mcqMeta} · ${shortMeta}`;

    row.appendChild(title);
    row.appendChild(meta);
    container.appendChild(row);
  });
}

function renderHistory() {
  const entries = getHistoryEntries();
  const latest = entries[entries.length - 1] || null;
  const prev = entries[entries.length - 2] || null;
  const fallbackBest = !entries.length && state.bestScore > 0
    ? { overallPercent: state.bestScore, grade: getGradeForPercent(state.bestScore) }
    : null;
  const best = getBestHistoryEntry(entries) || fallbackBest;

  if (elements.historyLatest) {
    elements.historyLatest.textContent = latest
      ? `${latest.grade || "-"} · ${formatPercent(latest.overallPercent)}`
      : "—";
  }
  if (elements.historyLatestMeta) {
    if (latest) {
      const mcqPoints = Number(latest.mcqPoints) || 0;
      const mcqMax = Number(latest.mcqMax) || 0;
      const shortPoints = Number(latest.shortPoints) || 0;
      const shortMax = Number(latest.shortMax) || 0;
      const mcqMeta = mcqMax ? `${mcqPoints}/${mcqMax} MCQ` : "MCQ —";
      const shortMeta = shortMax ? `${shortPoints.toFixed(1)}/${shortMax.toFixed(1)} kortsvar` : "Kortsvar —";
      elements.historyLatestMeta.textContent = `${mcqMeta} · ${shortMeta}`;
    } else {
      elements.historyLatestMeta.textContent = "Ingen runder endnu";
    }
  }
  if (elements.historyBest) {
    elements.historyBest.textContent = best
      ? `${best.grade || "-"} · ${formatPercent(best.overallPercent)}`
      : "—";
  }
  if (elements.historyBestMeta) {
    elements.historyBestMeta.textContent = `Mål: 12 (${TARGET_GRADE_PERCENT}%)`;
  }

  if (elements.historyTrend) {
    if (latest && prev) {
      const delta = latest.overallPercent - prev.overallPercent;
      const prefix = delta > 0 ? "+" : "";
      elements.historyTrend.textContent = `${prefix}${delta.toFixed(1)}%`;
      elements.historyTrend.classList.toggle("positive", delta > 0);
      elements.historyTrend.classList.toggle("negative", delta < 0);
    } else {
      elements.historyTrend.textContent = "—";
      elements.historyTrend.classList.remove("positive", "negative");
    }
  }
  if (elements.historyTrendMeta) {
    elements.historyTrendMeta.textContent = latest && prev ? "Siden sidste runde" : "Afventer 2 runder";
  }

  if (elements.heroRank) {
    const rankSource = best || latest;
    elements.heroRank.textContent = rankSource ? `Niveau ${rankSource.grade || "-"}` : "Niveau —";
  }
  if (elements.heroRankMeta) {
    elements.heroRankMeta.textContent = best
      ? `Personlig rekord: ${formatPercent(best.overallPercent)}`
      : "Ingen rekord endnu";
  }
  if (elements.heroTarget) {
    elements.heroTarget.textContent = `Mål: 12`;
  }
  if (elements.heroTargetMeta) {
    if (latest) {
      const missing = Math.max(0, TARGET_GRADE_PERCENT - latest.overallPercent);
      elements.heroTargetMeta.textContent = missing > 0
        ? `${missing.toFixed(1)}% fra topkarakter`
        : "Du er i målzonen!";
    } else {
      elements.heroTargetMeta.textContent = `${TARGET_GRADE_PERCENT}% for topkarakter`;
    }
  }
  if (elements.heroProgressFill) {
    const progressValue = latest ? Math.min((latest.overallPercent / TARGET_GRADE_PERCENT) * 100, 100) : 0;
    elements.heroProgressFill.style.width = `${progressValue.toFixed(1)}%`;
  }
  if (elements.heroStreak) {
    const streak = getImprovementStreak(entries);
    elements.heroStreak.textContent = `${streak}`;
  }
  if (elements.heroStreakMeta) {
    const streak = getImprovementStreak(entries);
    elements.heroStreakMeta.textContent = streak > 0 ? "Runder i streg med fremgang" : "Ingen streak endnu";
  }

  renderHistoryList(elements.historyList, entries);
  renderHistoryList(elements.landingHistoryList, entries);
}

function recordHistoryEntry() {
  const entry = {
    date: new Date().toISOString(),
    overallPercent: state.scoreSummary.overallPercent,
    grade: state.scoreSummary.grade,
    mcqPercent: state.scoreSummary.mcqPercent,
    shortPercent: state.scoreSummary.shortPercent,
    mcqPoints: state.scoreBreakdown.mcq,
    shortPoints: state.scoreBreakdown.short,
    mcqMax: state.sessionScoreMeta.mcqMax,
    shortMax: state.sessionScoreMeta.shortMax,
    mcqCount: state.sessionScoreMeta.mcqCount,
    shortCount: state.sessionScoreMeta.shortCount,
    totalQuestions: state.activeQuestions.length,
  };
  const entries = getHistoryEntries().concat(entry);
  saveHistoryEntries(entries);
  renderHistory();
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
  stopTts();
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
  const ratio = maxPoints > 0 ? awardedPoints / maxPoints : 0;
  recordPerformance(question, ratio, getQuestionTimeMs());
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
    elements.shortAnswerAiFeedback.textContent =
      state.aiStatus.message || "AI-bedømmelse er ikke sat op endnu.";
    return;
  }
  const userAnswer = elements.shortAnswerInput.value.trim();
  if (!userAnswer) {
    elements.shortAnswerAiFeedback.textContent = "Skriv et svar før du beder om AI-bedømmelse.";
    return;
  }

  elements.shortAnswerAiButton.disabled = true;
  elements.shortAnswerAiFeedback.textContent = "AI vurderer dit svar …";

  let modelAnswer = getEffectiveModelAnswer(question);
  if (shouldUseFigureCaption(question) && !getCombinedFigureCaption(question)) {
    const generated = await fetchFigureCaptionForQuestion(question, { silent: true });
    if (generated) {
      modelAnswer = getEffectiveModelAnswer(question);
    }
  }

  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: question.text,
        modelAnswer,
        userAnswer,
        maxPoints: question.maxPoints || 0,
        sources: question.sources || [],
        language: "da",
        ignoreSketch: requiresSketch(question),
      }),
    });
    if (!res.ok) {
      let detail = `AI response ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) detail = data.error;
      } catch (error) {
        detail = `AI response ${res.status}`;
      }
      throw new Error(detail);
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
      `Kunne ikke hente AI-bedømmelse. ${error.message || "Tjek serveren og din API-nøgle."}`;
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
    if (state.sessionSettings.infiniteMode) {
      const extended = extendInfiniteQuestionSet();
      if (!extended) {
        showResults();
        return;
      }
    } else {
      showResults();
      return;
    }
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

function buildExplainPayload(entry) {
  if (entry.type === "mcq") {
    const mapping = getOptionMapping(entry.question);
    return {
      type: "mcq",
      question: entry.question.text,
      options: mapping.options || [],
      correctLabel: mapping.correctLabel || entry.question.correctLabel,
      userLabel: entry.selected,
      language: "da",
    };
  }
  return {
    type: "short",
    question: entry.question.text,
    modelAnswer: getEffectiveModelAnswer(entry.question),
    userAnswer: entry.response,
    maxPoints: entry.maxPoints,
    awardedPoints: entry.awardedPoints,
    language: "da",
    ignoreSketch: requiresSketch(entry.question),
  };
}

function toggleExplanationDisplay(entry, textEl, button) {
  if (!entry.aiExplanation) return false;
  const isHidden = textEl.classList.contains("hidden");
  if (isHidden) {
    textEl.textContent = entry.aiExplanation;
    textEl.classList.remove("hidden");
    button.textContent = "Skjul forklaring";
  } else {
    textEl.classList.add("hidden");
    button.textContent = "Få forklaring";
  }
  return true;
}

async function handleExplainClick(entry, textEl, button) {
  if (toggleExplanationDisplay(entry, textEl, button)) return;
  if (entry.type === "short" && !entry.response) {
    textEl.textContent = "Du svarede ikke på spørgsmålet.";
    textEl.classList.remove("hidden");
    return;
  }
  if (!state.aiStatus.available) {
    textEl.textContent = state.aiStatus.message || "AI offline. Tjek server og API-nøgle.";
    textEl.classList.remove("hidden");
    return;
  }

  button.disabled = true;
  button.textContent = "Henter forklaring …";
  textEl.textContent = "Henter forklaring …";
  textEl.classList.add("loading");
  textEl.classList.remove("hidden");

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildExplainPayload(entry)),
    });
    if (!res.ok) {
      let detail = `AI response ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) detail = data.error;
      } catch (error) {
        detail = `AI response ${res.status}`;
      }
      throw new Error(detail);
    }
    const data = await res.json();
    const explanation = String(data.explanation || "").trim();
    entry.aiExplanation = explanation || "AI kunne ikke lave en forklaring.";
    textEl.textContent = entry.aiExplanation;
    button.textContent = "Skjul forklaring";
  } catch (error) {
    textEl.textContent = `Kunne ikke hente forklaring. ${error.message || "Tjek server og API-nøgle."}`;
    button.textContent = "Prøv igen";
  } finally {
    textEl.classList.remove("loading");
    button.disabled = !state.aiStatus.available && !entry.aiExplanation;
  }
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
      const mapping = getOptionMapping(entry.question);
      const displayOptions = mapping.options || [];
      const selectedOption = entry.selected
        ? displayOptions.find((option) => option.label === entry.selected)
        : null;
      const correctOption = displayOptions.find(
        (option) => option.label === mapping.correctLabel
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
      correctLine.textContent = `Korrekt svar: ${mapping.correctLabel || "-"}. ${
        correctOption?.text || ""
      }`;
      lines.push(selectedLine, correctLine);
    }

    card.appendChild(title);
    card.appendChild(meta);
    lines.forEach((line) => card.appendChild(line));

    if (isReviewWrong(entry)) {
      const explainWrap = document.createElement("div");
      explainWrap.className = "review-explain";

      const explainActions = document.createElement("div");
      explainActions.className = "review-explain-actions";

      const explainBtn = document.createElement("button");
      explainBtn.type = "button";
      explainBtn.className = "btn ghost small";
      explainBtn.textContent = entry.aiExplanation ? "Skjul forklaring" : "Få forklaring";
      explainBtn.disabled = !state.aiStatus.available && !entry.aiExplanation;
      if (!state.aiStatus.available && !entry.aiExplanation) {
        explainBtn.title = state.aiStatus.message || "AI offline. Start scripts/dev_server.py.";
      }

      const explainStatus = document.createElement("span");
      explainStatus.className = "review-explain-status";
      explainStatus.textContent = state.aiStatus.available ? "AI-forklaring" : "AI offline";

      const explainText = document.createElement("div");
      explainText.className = "review-explain-text";
      if (entry.aiExplanation) {
        explainText.textContent = entry.aiExplanation;
      } else {
        explainText.classList.add("hidden");
      }

      explainBtn.addEventListener("click", () => {
        handleExplainClick(entry, explainText, explainBtn);
      });

      explainActions.appendChild(explainBtn);
      explainActions.appendChild(explainStatus);
      explainWrap.appendChild(explainActions);
      explainWrap.appendChild(explainText);
      card.appendChild(explainWrap);
    }

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
  stopTts();
  clearTtsPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
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

  recordHistoryEntry();

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

function pickWeightedOne(list) {
  if (!list.length) return null;
  const weights = list.map((item) => getQuestionWeight(item));
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) {
    const index = Math.floor(Math.random() * list.length);
    return list.splice(index, 1)[0];
  }
  let roll = Math.random() * total;
  for (let i = 0; i < list.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return list.splice(i, 1)[0];
    }
  }
  return list.pop();
}

function pickWeightedQuestions(pool, count) {
  const remaining = [...pool];
  const selected = [];
  while (selected.length < count && remaining.length) {
    const picked = pickWeightedOne(remaining);
    if (!picked) break;
    selected.push(picked);
  }
  return selected;
}

function pickBalancedQuestions(pool, count) {
  const groups = new Map();
  pool.forEach((question) => {
    if (!groups.has(question.category)) {
      groups.set(question.category, []);
    }
    groups.get(question.category).push(question);
  });

  const useAdaptive = state.sessionSettings.adaptiveMix;
  const groupList = shuffle(
    [...groups.values()].map((group) => (useAdaptive ? [...group] : shuffle(group)))
  );

  const selected = [];
  while (selected.length < count && groupList.length) {
    for (let i = 0; i < groupList.length && selected.length < count; i += 1) {
      const group = groupList[i];
      if (group.length) {
        const picked = useAdaptive ? pickWeightedOne(group) : group.pop();
        if (picked) {
          selected.push(picked);
        }
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
  if (state.sessionSettings.adaptiveMix && state.sessionSettings.balancedMix) {
    return pickBalancedQuestions(pool, count);
  }
  if (state.sessionSettings.adaptiveMix) {
    const selection = pickWeightedQuestions(pool, count);
    return state.sessionSettings.shuffleQuestions ? shuffle(selection) : selection;
  }
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
    let shortTarget = getShortTargetFromRatio(
      mcqTarget,
      shortPool.length,
      state.sessionSettings
    );

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
    const shortTarget = getShortTargetFromRatio(mcqTarget, shortPoolCount, state.settings);
    roundSize = mcqTarget + shortTarget;
  }
  const poolMcq = mcqPoolCount;
  const poolShort = shortPoolCount;

  elements.poolCount.textContent = pool.length;
  elements.poolCountChip.textContent = `${pool.length} i puljen · ${poolMcq} MCQ · ${poolShort} kortsvar`;
  const isInfinite = state.settings.infiniteMode;
  let roundLabel = String(roundSize);
  if (state.settings.includeMcq && state.settings.includeShort && roundSize > 0) {
    const mcqTarget = Math.min(state.settings.questionCount, mcqPoolCount);
    const shortTarget = getShortTargetFromRatio(mcqTarget, shortPoolCount, state.settings);
    roundLabel = `${roundSize} (${mcqTarget} MCQ / ${shortTarget} kortsvar)`;
    if (isInfinite) {
      roundLabel = `Uendelig · batch ${roundLabel}`;
    }
  } else if (isInfinite) {
    roundLabel = roundSize > 0 ? `Uendelig · batch ${roundSize}` : "Uendelig";
  }
  elements.roundCount.textContent = roundLabel;

  const mixParts = [];
  if (state.settings.balancedMix) mixParts.push("Balanceret");
  if (state.settings.adaptiveMix) mixParts.push("Adaptiv");
  if (state.settings.shuffleQuestions) mixParts.push("Shuffle");
  if (state.settings.infiniteMode) mixParts.push("Uendelig");
  if (state.settings.includeMcq && state.settings.includeShort) {
    mixParts.push(`Ratio ${formatRatioLabel(state.settings)}`);
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
    hint = state.settings.infiniteMode
      ? `Puljen har kun ${pool.length} spørgsmål – uendelig mode gentager efter en runde.`
      : `Kun ${pool.length} spørgsmål matcher – runden forkortes.`;
  }

  elements.selectionHint.textContent = hint;
  elements.startButtons.forEach((btn) => {
    btn.disabled = !canStart;
  });

  updateRatioControls();
  updateAutoAdvanceLabel();
}

function updateSessionPill() {
  const yearCount = state.filters.years.size;
  const categoryCount = state.filters.categories.size;
  const mcqCount = state.activeQuestions.filter((q) => q.type === "mcq").length;
  const shortCount = state.activeQuestions.filter((q) => q.type === "short").length;
  const totalLabel = state.sessionSettings.infiniteMode
    ? "∞ spørgsmål"
    : `${state.activeQuestions.length} spørgsmål`;
  const label = `${totalLabel} · ${mcqCount} MCQ · ${shortCount} kortsvar · ${yearCount} sæt · ${categoryCount} emner`;
  elements.sessionPill.textContent = label;
}

function applySessionDisplaySettings() {
  document.body.classList.toggle("focus-mode", state.sessionSettings.focusMode);
  document.body.classList.toggle("meta-hidden", !state.sessionSettings.showMeta);
  elements.toggleFocus.textContent = state.sessionSettings.focusMode ? "Fokus: Til" : "Fokus";
  elements.toggleMeta.textContent = state.sessionSettings.showMeta ? "Skjul metadata" : "Vis metadata";
  if (elements.endRoundBtn) {
    elements.endRoundBtn.classList.toggle("hidden", !state.sessionSettings.infiniteMode);
  }
}

function initInfiniteState(pool, activeQuestions) {
  const usedKeys = new Set(activeQuestions.map((question) => question.key));
  return {
    pool: [...pool],
    remaining: pool.filter((question) => !usedKeys.has(question.key)),
    usedKeys,
    cycle: 0,
  };
}

function extendInfiniteQuestionSet() {
  if (!state.infiniteState) return false;
  let batch = buildQuestionSet(state.infiniteState.remaining);
  if (!batch.length) {
    if (!state.infiniteState.pool.length) return false;
    state.infiniteState.cycle += 1;
    state.infiniteState.usedKeys = new Set();
    state.infiniteState.remaining = [...state.infiniteState.pool];
    batch = buildQuestionSet(state.infiniteState.remaining);
  }
  if (!batch.length) return false;
  assignShortPoints(batch);
  batch.forEach((question) => state.infiniteState.usedKeys.add(question.key));
  state.infiniteState.remaining = state.infiniteState.remaining.filter(
    (question) => !state.infiniteState.usedKeys.has(question.key)
  );
  state.activeQuestions = state.activeQuestions.concat(batch);
  updateSessionScoreMeta(state.activeQuestions);
  updateSessionPill();
  queueFigureCaptionsForQuestions(batch);
  return true;
}

function finishSession() {
  if (!state.results.length) {
    setFeedback("Svar mindst et spørgsmål før du afslutter runden.");
    return;
  }
  state.activeQuestions = state.results.map((result) => result.question);
  updateSessionScoreMeta(state.activeQuestions);
  showResults();
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
  state.optionOrder = new Map();
  state.sketchUploads = new Map();
  state.sketchAnalysis = new Map();
  clearFigureCaptionQueue();
  clearTtsPrefetch();
  state.questionStartedAt = null;
  state.startTime = Date.now();
  state.locked = false;
  state.infiniteState = state.sessionSettings.infiniteMode
    ? initInfiniteState(pool, state.activeQuestions)
    : null;

  updateSessionPill();
  applySessionDisplaySettings();
  applyTtsVisibility();
  queueFigureCaptionsForQuestions(state.activeQuestions);
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
  stopTts();
  clearTtsPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
  showScreen("menu");
}

function goToLanding() {
  clearAutoAdvance();
  stopTts();
  clearTtsPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
  showScreen("landing");
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

function updateRatioSettings(mcqValue, shortValue) {
  const mcqRatio = clampInt(mcqValue, 1, 12, DEFAULT_SETTINGS.ratioMcq);
  const shortRatio = clampInt(shortValue, 1, 12, DEFAULT_SETTINGS.ratioShort);
  state.settings.ratioMcq = mcqRatio;
  state.settings.ratioShort = shortRatio;
  if (elements.ratioMcqInput) {
    elements.ratioMcqInput.value = String(mcqRatio);
  }
  if (elements.ratioShortInput) {
    elements.ratioShortInput.value = String(shortRatio);
  }
  saveSettings();
  updateSummary();
}

function updateRatioControls() {
  const enabled = state.settings.includeMcq && state.settings.includeShort;
  if (elements.ratioMcqInput) {
    elements.ratioMcqInput.disabled = !enabled;
  }
  if (elements.ratioShortInput) {
    elements.ratioShortInput.disabled = !enabled;
  }
}

function updateAutoAdvanceLabel() {
  const seconds = state.settings.autoAdvanceDelay / 1000;
  elements.autoAdvanceLabel.textContent = `${seconds.toFixed(1)}s`;
  elements.autoAdvanceDelay.disabled = !state.settings.autoAdvance;
}

async function checkAiAvailability() {
  if (!elements.shortAnswerAiButton && !elements.ttsPlayBtn) return;
  try {
    const res = await fetch("/api/health");
    if (!res.ok) {
      let aiMessage = "AI offline. Start scripts/dev_server.py.";
      let ttsMessage = "Oplæsning offline. Start scripts/dev_server.py.";
      if (res.status === 503) {
        try {
          const data = await res.json();
          if (data.status === "missing_key") {
            aiMessage = "AI mangler OPENAI_API_KEY i .env.";
            ttsMessage = "Oplæsning mangler OPENAI_API_KEY i .env.";
          }
        } catch (error) {
          aiMessage = "AI offline. Tjek .env og server.";
          ttsMessage = "Oplæsning offline. Tjek .env og server.";
        }
      }
      if (res.status === 404) {
        aiMessage = "AI offline. Kør scripts/dev_server.py i stedet for http.server.";
        ttsMessage = "Oplæsning offline. Kør scripts/dev_server.py i stedet for http.server.";
      }
      setAiStatus({ available: false, model: null, message: aiMessage });
      setTtsStatus({ available: false, model: null, message: ttsMessage });
      return;
    }
    const data = await res.json();
    setAiStatus({ available: true, model: data.model || null, message: "" });
    setTtsStatus({ available: true, model: data.tts_model || null, message: "" });
  } catch (error) {
    setAiStatus({
      available: false,
      model: null,
      message: "AI offline. Tjek server og netværk.",
    });
    setTtsStatus({
      available: false,
      model: null,
      message: "Oplæsning offline. Tjek server og netværk.",
    });
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
  } else if (key === "l") {
    toggleTtsPlayback();
  } else if (key === "f") {
    toggleFlag();
  }
}

function attachEvents() {
  if (elements.landingStartBtn) {
    elements.landingStartBtn.addEventListener("click", () => showScreen("menu"));
  }
  if (elements.landingQuickBtn) {
    elements.landingQuickBtn.addEventListener("click", startGame);
  }
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
  if (elements.endRoundBtn) {
    elements.endRoundBtn.addEventListener("click", finishSession);
  }
  if (elements.figureToggleBtn) {
    elements.figureToggleBtn.addEventListener("click", toggleFigure);
  }

  if (elements.ttsPlayBtn) {
    elements.ttsPlayBtn.addEventListener("click", () => playTtsForCurrentQuestion("manual"));
  }
  if (elements.ttsStopBtn) {
    elements.ttsStopBtn.addEventListener("click", () => stopTts());
  }
  if (elements.ttsPreviewBtn) {
    elements.ttsPreviewBtn.addEventListener("click", () => playTtsText(TTS_SAMPLE_TEXT));
  }
  if (elements.ttsCollapseBtn) {
    elements.ttsCollapseBtn.addEventListener("click", () => {
      state.settings.ttsCollapsed = !state.settings.ttsCollapsed;
      saveSettings();
      applyTtsCollapsedState();
    });
  }
  if (elements.ttsAutoToggle) {
    elements.ttsAutoToggle.addEventListener("change", (event) => {
      state.settings.ttsAuto = event.target.checked;
      saveSettings();
      if (state.settings.ttsAuto) {
        maybeAutoReadQuestion();
        scheduleTtsPrefetch();
      } else {
        stopTts();
        clearTtsPrefetch();
      }
    });
  }
  if (elements.ttsOptionsToggle) {
    elements.ttsOptionsToggle.addEventListener("change", (event) => {
      state.settings.ttsIncludeOptions = event.target.checked;
      saveSettings();
      clearTtsPrefetch();
      scheduleTtsPrefetch();
    });
  }
  if (elements.ttsVoiceSelect) {
    elements.ttsVoiceSelect.addEventListener("change", (event) => {
      const nextVoice = normalizeTtsVoice(event.target.value);
      state.settings.ttsVoice = nextVoice;
      event.target.value = nextVoice;
      saveSettings();
      clearTtsPrefetch();
      scheduleTtsPrefetch();
    });
  }
  if (elements.ttsSpeedRange) {
    elements.ttsSpeedRange.addEventListener("input", (event) => {
      const nextSpeed = Math.min(
        Math.max(Number(event.target.value) || 1, TTS_SPEED_MIN),
        TTS_SPEED_MAX
      );
      const normalized = Number(nextSpeed.toFixed(2));
      state.settings.ttsSpeed = normalized;
      elements.ttsSpeedRange.value = String(normalized);
      updateTtsSpeedLabel(normalized);
      saveSettings();
      clearTtsPrefetch();
      scheduleTtsPrefetch();
    });
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

  if (elements.shortFigureGenerateBtn) {
    elements.shortFigureGenerateBtn.addEventListener("click", () => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      fetchFigureCaptionForQuestion(question, { force: true });
    });
  }

  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.addEventListener("click", async () => {
      if (!elements.shortAnswerModel) return;
      elements.shortAnswerModel.classList.toggle("hidden");
      const isHidden = elements.shortAnswerModel.classList.contains("hidden");
      elements.shortAnswerShowAnswer.textContent = isHidden ? "Vis facit" : "Skjul facit";
      if (!isHidden) {
        const question = state.activeQuestions[state.currentIndex];
        if (question && question.type === "short" && shouldUseFigureCaption(question)) {
          if (!getCombinedFigureCaption(question)) {
            await fetchFigureCaptionForQuestion(question);
          }
        }
      }
    });
  }

  if (elements.sketchToggleBtn && elements.sketchPanelBody) {
    elements.sketchToggleBtn.addEventListener("click", () => {
      elements.sketchPanelBody.classList.toggle("hidden");
      const isHidden = elements.sketchPanelBody.classList.contains("hidden");
      elements.sketchToggleBtn.textContent = isHidden ? "Vis" : "Skjul";
    });
  }

  if (elements.sketchUpload) {
    elements.sketchUpload.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      handleSketchUpload(file);
    });
  }

  if (elements.sketchAnalyzeBtn) {
    elements.sketchAnalyzeBtn.addEventListener("click", analyzeSketch);
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
  if (elements.ratioMcqInput && elements.ratioShortInput) {
    const handleRatioChange = () => {
      updateRatioSettings(elements.ratioMcqInput.value, elements.ratioShortInput.value);
    };
    elements.ratioMcqInput.addEventListener("change", handleRatioChange);
    elements.ratioShortInput.addEventListener("change", handleRatioChange);
  }

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
  if (elements.toggleAdaptiveMix) {
    elements.toggleAdaptiveMix.addEventListener("change", (event) => {
      handleSettingToggle("adaptiveMix", event.target.checked);
    });
  }
  elements.toggleShowMeta.addEventListener("change", (event) => {
    handleSettingToggle("showMeta", event.target.checked);
  });
  elements.toggleAutoAdvance.addEventListener("change", (event) => {
    handleSettingToggle("autoAdvance", event.target.checked);
  });
  if (elements.toggleInfiniteMode) {
    elements.toggleInfiniteMode.addEventListener("change", (event) => {
      handleSettingToggle("infiniteMode", event.target.checked);
    });
  }
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
  if (elements.toggleTts) {
    elements.toggleTts.addEventListener("change", (event) => {
      state.settings.ttsEnabled = event.target.checked;
      saveSettings();
      applyTtsVisibility();
      if (state.settings.ttsEnabled) {
        maybeAutoReadQuestion();
        scheduleTtsPrefetch();
      }
    });
  }
  if (elements.toggleAutoFigure) {
    elements.toggleAutoFigure.addEventListener("change", (event) => {
      handleSettingToggle("autoFigureCaptions", event.target.checked);
      if (state.settings.autoFigureCaptions) {
        queueFigureCaptionsForQuestions(state.activeQuestions);
      } else {
        clearFigureCaptionQueue();
      }
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
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      scheduleFigureCaptionQueue();
    }
  });

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
  if (elements.toggleAdaptiveMix) {
    elements.toggleAdaptiveMix.checked = state.settings.adaptiveMix;
  }
  elements.toggleShowMeta.checked = state.settings.showMeta;
  elements.toggleAutoAdvance.checked = state.settings.autoAdvance;
  if (elements.toggleInfiniteMode) {
    elements.toggleInfiniteMode.checked = state.settings.infiniteMode;
  }
  elements.toggleAvoidRepeats.checked = state.settings.avoidRepeats;
  elements.toggleFocusMistakes.checked = state.settings.focusMistakes;
  elements.toggleFocusMode.checked = state.settings.focusMode;
  if (elements.toggleIncludeMcq) {
    elements.toggleIncludeMcq.checked = state.settings.includeMcq;
  }
  if (elements.toggleIncludeShort) {
    elements.toggleIncludeShort.checked = state.settings.includeShort;
  }
  if (elements.toggleTts) {
    elements.toggleTts.checked = state.settings.ttsEnabled;
  }
  if (elements.toggleAutoFigure) {
    elements.toggleAutoFigure.checked = state.settings.autoFigureCaptions;
  }
  if (elements.ratioMcqInput && elements.ratioShortInput) {
    const { mcqRatio, shortRatio } = getRatioValues(state.settings);
    elements.ratioMcqInput.value = String(mcqRatio);
    elements.ratioShortInput.value = String(shortRatio);
  }
  if (elements.ttsAutoToggle) {
    elements.ttsAutoToggle.checked = state.settings.ttsAuto;
  }
  if (elements.ttsOptionsToggle) {
    elements.ttsOptionsToggle.checked = state.settings.ttsIncludeOptions;
  }
  if (elements.ttsVoiceSelect) {
    const normalizedVoice = normalizeTtsVoice(state.settings.ttsVoice);
    state.settings.ttsVoice = normalizedVoice;
    elements.ttsVoiceSelect.value = normalizedVoice;
  }
  if (elements.ttsSpeedRange) {
    const normalizedSpeed = Math.min(
      Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
      TTS_SPEED_MAX
    );
    state.settings.ttsSpeed = normalizedSpeed;
    elements.ttsSpeedRange.min = String(TTS_SPEED_MIN);
    elements.ttsSpeedRange.max = String(TTS_SPEED_MAX);
    elements.ttsSpeedRange.step = String(TTS_SPEED_STEP);
    elements.ttsSpeedRange.value = String(normalizedSpeed);
    updateTtsSpeedLabel(normalizedSpeed);
  }
  elements.autoAdvanceDelay.value = state.settings.autoAdvanceDelay;
  updateAutoAdvanceLabel();
  updateRatioControls();
  applyTtsVisibility();
}

async function loadQuestions() {
  const [mcqRes, shortRes, captionsRes] = await Promise.all([
    fetch("data/questions.json"),
    fetch("data/kortsvar.json"),
    fetch("data/figure_captions.json"),
  ]);
  const mcqData = await mcqRes.json();
  const shortData = shortRes.ok ? await shortRes.json() : [];
  const captionData = captionsRes.ok ? await captionsRes.json() : {};
  state.figureCaptionLibrary =
    captionData && typeof captionData === "object" ? captionData : {};

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
  const availableImages = new Set();
  state.allQuestions.forEach((question) => {
    if (Array.isArray(question.images)) {
      question.images.forEach((path) => availableImages.add(path));
    }
  });
  const filteredCaptions = {};
  Object.entries(state.figureCaptions).forEach(([path, value]) => {
    if (availableImages.has(path)) {
      filteredCaptions[path] = value;
    }
  });
  state.figureCaptions = filteredCaptions;
  saveFigureCaptions();
  const availableKeys = new Set(state.allQuestions.map((question) => question.key));
  state.seenKeys = new Set([...state.seenKeys].filter((key) => availableKeys.has(key)));
  state.lastMistakeKeys = new Set(
    [...state.lastMistakeKeys].filter((key) => availableKeys.has(key))
  );
  const filteredPerformance = {};
  Object.entries(state.performance).forEach(([key, value]) => {
    if (availableKeys.has(key)) {
      filteredPerformance[key] = value;
    }
  });
  state.performance = filteredPerformance;
  savePerformance();
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
  showScreen("landing");
  updateTopBar();
  elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
  applyTheme(getInitialTheme());
  syncSettingsToUI();
  setAiStatus(state.aiStatus);
  setTtsStatus(state.ttsStatus);
  try {
    await loadQuestions();
  } catch (err) {
    console.error("Kunne ikke indlæse spørgsmål", err);
    elements.questionCountChip.textContent = "Fejl: kunne ikke indlæse spørgsmål";
    elements.poolCountChip.textContent = "Ingen data";
  }
  await checkAiAvailability();
  renderHistory();
}

document.addEventListener("DOMContentLoaded", init);
