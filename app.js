const STORAGE_KEYS = {
  bestScore: "ku_mcq_best_score",
  settings: "ku_mcq_settings",
  seen: "ku_mcq_seen_questions",
  mistakes: "ku_mcq_last_mistakes",
  theme: "ku_mcq_theme",
  history: "ku_mcq_history",
  performance: "ku_mcq_performance",
  figureCaptions: "ku_mcq_figure_captions",
  userOpenAiKey: "hbs_user_openai_key",
  useOwnKey: "hbs_use_own_key",
  userStateUpdatedAt: "hbs_user_state_updated_at",
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
  preferUnseen: true,
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
  assistantCollapsed: false,
};

const AUTH_PROVIDERS = {
  google: "google",
  apple: "apple",
};

const SHORT_TOTAL_POINTS = 72;
const SHORT_FAIL_THRESHOLD = 5;
const HISTORY_LIMIT = 12;
const TARGET_GRADE_PERCENT = 92;
const DUPLICATE_QUESTION_SIMILARITY = 0.95;
const DUPLICATE_ANSWER_SIMILARITY = 0.95;
const PREFER_UNSEEN_SHARE = 0.7;
const SHORTCUT_STATUS_DURATION = 3000;
const USER_STATE_SYNC_DELAY = 1800;
const SHORT_LABEL_ORDER = ["a", "b", "c", "d", "e"];
const SHORT_LABEL_INDEX = new Map(SHORT_LABEL_ORDER.map((label, index) => [label, index]));
const CONTEXT_STRONG_CUE = /\b(dis?se|ovenfor|ovenstående|førnævnte|sidstnævnte|førstnævnte)\b/i;
const CONTEXT_COUNT_WORDS = new Set(["to", "tre", "fire", "fem", "seks"]);
const CONTEXT_COUNT_SKIP = new Set([
  "vigtigste",
  "centrale",
  "primære",
  "samme",
  "følgende",
  "relevante",
  "førnævnte",
  "sidstnævnte",
  "førstnævnte",
  "ovenstående",
]);
const CONTEXT_COUNT_STOP = new Set([
  "i",
  "på",
  "fra",
  "med",
  "som",
  "af",
  "til",
  "for",
  "hos",
  "ved",
  "over",
  "under",
  "mellem",
  "om",
  "inden",
  "efter",
]);
const CONTEXT_STOPWORDS = new Set([
  "angiv",
  "angives",
  "beskriv",
  "redegør",
  "forklar",
  "nævn",
  "navn",
  "besvar",
  "skitser",
  "skitse",
  "kort",
  "korte",
  "kortfattet",
  "kortfattede",
  "hvad",
  "hvilke",
  "hvilken",
  "hvilket",
  "hvor",
  "hvordan",
  "hvorfor",
  "hvorledes",
  "hvornår",
  "denne",
  "dette",
  "disse",
  "deres",
  "begge",
  "samme",
  "sådan",
  "således",
  "der",
  "og",
  "eller",
  "samt",
  "men",
  "fordi",
  "derfor",
  "mens",
  "når",
  "af",
  "på",
  "i",
  "med",
  "til",
  "fra",
  "for",
  "om",
  "som",
  "hos",
  "ved",
  "over",
  "under",
  "mellem",
  "efter",
  "inden",
]);

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
const BOOK_STOPWORDS = new Set([
  "og",
  "i",
  "på",
  "af",
  "for",
  "til",
  "med",
  "som",
  "det",
  "den",
  "der",
  "de",
  "en",
  "et",
  "at",
  "er",
  "har",
  "hvor",
  "hvad",
  "hvordan",
  "hvilke",
  "hvilken",
  "hvorfor",
  "hvem",
  "når",
  "fra",
  "over",
  "under",
  "bliver",
  "viser",
  "vis",
  "vises",
  "samt",
  "eller",
  "mellem",
  "via",
  "kun",
  "også",
  "ofte",
  "kan",
  "skal",
  "være",
  "deres",
  "din",
  "dit",
  "dine",
  "spørgsmål",
  "opgave",
  "svar",
  "figur",
  "figuren",
  "diagram",
  "illustration",
  "billede",
  "billedet",
]);
const BOOK_SHORT_TOKENS = new Set(["na", "k", "ca", "cl"]);

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
const TRANSCRIBE_LANGUAGE = "da";
const AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
];

const PRESET_CONFIGS = {
  exam: {
    questionCount: 24,
    includeMcq: true,
    includeShort: true,
    ratioMcq: 4,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: true,
    adaptiveMix: false,
    focusMistakes: false,
    avoidRepeats: false,
    preferUnseen: true,
    autoAdvance: false,
    autoAdvanceDelay: 1200,
    infiniteMode: false,
    focusMode: false,
    showMeta: true,
  },
  review: {
    questionCount: 30,
    includeMcq: true,
    includeShort: true,
    ratioMcq: 3,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: true,
    adaptiveMix: true,
    focusMistakes: false,
    avoidRepeats: true,
    preferUnseen: true,
    autoAdvance: false,
    autoAdvanceDelay: 1200,
    infiniteMode: false,
    focusMode: false,
    showMeta: true,
  },
  weak: {
    questionCount: 20,
    includeMcq: true,
    includeShort: true,
    ratioMcq: 4,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: false,
    adaptiveMix: true,
    focusMistakes: true,
    avoidRepeats: false,
    preferUnseen: true,
    autoAdvance: false,
    autoAdvanceDelay: 1200,
    infiniteMode: false,
    focusMode: false,
    showMeta: true,
  },
  tempo: {
    questionCount: 18,
    includeMcq: true,
    includeShort: true,
    ratioMcq: 5,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: false,
    adaptiveMix: false,
    focusMistakes: false,
    avoidRepeats: false,
    preferUnseen: true,
    autoAdvance: true,
    autoAdvanceDelay: 900,
    infiniteMode: false,
    focusMode: true,
    showMeta: false,
  },
};

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
  config: null,
  supabase: null,
  session: null,
  user: null,
  profile: null,
  subscription: null,
  backendAvailable: true,
  configError: "",
  demoMode: false,
  authReady: false,
  userStateSyncTimer: null,
  userStateSyncInFlight: false,
  userStateApplying: false,
  useOwnKey: localStorage.getItem(STORAGE_KEYS.useOwnKey) === "true",
  userOpenAiKey: String(localStorage.getItem(STORAGE_KEYS.userOpenAiKey) || ""),
  lastPreset: null,
  isApplyingPreset: false,
  aiStatus: {
    available: false,
    model: null,
    message: "Hjælp tjekkes...",
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
  mic: {
    recorder: null,
    stream: null,
    chunks: [],
    mimeType: "",
    isRecording: false,
    isTranscribing: false,
    discardOnStop: false,
    requestId: 0,
    abortController: null,
  },
  optionOrder: new Map(),
  figureVisible: false,
  shortAnswerDrafts: new Map(),
  shortAnswerAI: new Map(),
  shortAnswerPending: false,
  shortQuestionGroups: new Map(),
  reviewHintQueue: [],
  reviewHintProcessing: false,
  reviewFilters: {
    correct: false,
    wrong: true,
    skipped: true,
  },
  figureCaptions: loadFigureCaptions(),
  figureCaptionLibrary: {},
  figureAuditIndex: new Map(),
  bookCaptionLibrary: {},
  bookCaptionIndex: [],
  figureCaptionRequests: new Map(),
  figureCaptionQueue: [],
  figureCaptionQueued: new Set(),
  figureCaptionProcessing: false,
  figureCaptionTimer: null,
  sketchUploads: new Map(),
  sketchAnalysis: new Map(),
  questionHints: new Map(),
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
  autoAdvanceTimer: null,
  questionStartedAt: null,
  sessionSettings: { ...DEFAULT_SETTINGS },
  infiniteState: null,
  search: {
    category: "",
  },
  lastAppScreen: "menu",
};

const screens = {
  auth: document.getElementById("auth-screen"),
  landing: document.getElementById("landing-screen"),
  menu: document.getElementById("menu-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  account: document.getElementById("account-screen"),
};

const shortcutStatusTimers = new Map();

const elements = {
  startButtons: [document.getElementById("start-btn")].filter(Boolean),
  landingStartBtn: document.getElementById("landing-start-btn"),
  landingQuickBtn: document.getElementById("landing-quick-btn"),
  authGoogleBtn: document.getElementById("auth-google-btn"),
  authAppleBtn: document.getElementById("auth-apple-btn"),
  authEmailInput: document.getElementById("auth-email-input"),
  authEmailBtn: document.getElementById("auth-email-btn"),
  authDemoBtn: document.getElementById("auth-demo-btn"),
  authStatus: document.getElementById("auth-status"),
  accountBtn: document.getElementById("account-btn"),
  accountBackBtn: document.getElementById("account-back-btn"),
  accountStatus: document.getElementById("account-status"),
  userChip: document.getElementById("user-chip"),
  profileNameInput: document.getElementById("profile-name-input"),
  profileEmail: document.getElementById("profile-email"),
  profileSaveBtn: document.getElementById("profile-save-btn"),
  planStatus: document.getElementById("plan-status"),
  subscriptionStatus: document.getElementById("subscription-status"),
  upgradeBtn: document.getElementById("upgrade-btn"),
  portalBtn: document.getElementById("portal-btn"),
  ownKeyToggle: document.getElementById("own-key-toggle"),
  ownKeyInput: document.getElementById("own-key-input"),
  ownKeySaveBtn: document.getElementById("own-key-save-btn"),
  ownKeyClearBtn: document.getElementById("own-key-clear-btn"),
  consentTerms: document.getElementById("consent-terms"),
  consentPrivacy: document.getElementById("consent-privacy"),
  consentSaveBtn: document.getElementById("consent-save-btn"),
  exportDataBtn: document.getElementById("export-data-btn"),
  deleteAccountBtn: document.getElementById("delete-account-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  rulesButton: document.getElementById("rules-btn"),
  closeModal: document.getElementById("close-modal"),
  modalClose: document.getElementById("modal-close-btn"),
  modal: document.getElementById("rules-modal"),
  figureModal: document.getElementById("figure-modal"),
  figureModalClose: document.getElementById("figure-modal-close"),
  figureModalTitle: document.getElementById("figure-modal-title"),
  figureModalImg: document.getElementById("figure-modal-img"),
  figureModalCaption: document.getElementById("figure-modal-caption"),
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
  presetGrid: document.getElementById("preset-grid"),
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
  togglePreferUnseen: document.getElementById("toggle-prefer-unseen"),
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
  questionContext: document.getElementById("question-context"),
  questionContextTitle: document.getElementById("question-context-title"),
  questionContextList: document.getElementById("question-context-list"),
  questionText: document.getElementById("question-text"),
  questionSubtitle: document.getElementById("question-subtitle"),
  questionHint: document.getElementById("question-hint"),
  questionHintText: document.getElementById("question-hint-text"),
  questionHintStatus: document.getElementById("question-hint-status"),
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
  figureToggleBtn: document.getElementById("figure-toggle-btn"),
  figureToggleHint: document.getElementById("figure-toggle-hint"),
  optionsContainer: document.getElementById("options-container"),
  shortAnswerContainer: document.getElementById("short-answer-container"),
  shortAnswerInputWrap: document.getElementById("short-answer-input-wrap"),
  shortAnswerInput: document.getElementById("short-answer-text"),
  transcribeIndicator: document.getElementById("transcribe-indicator"),
  transcribeText: document.getElementById("transcribe-text"),
  shortAnswerScoreRange: document.getElementById("short-score-range"),
  shortAnswerScoreInput: document.getElementById("short-score-input"),
  shortAnswerMaxPoints: document.getElementById("short-max-points"),
  shortAnswerAiFeedback: document.getElementById("short-ai-feedback"),
  shortAnswerAiRetryBtn: document.getElementById("short-ai-retry-btn"),
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
  shortReviewDrawer: document.getElementById("short-review-drawer"),
  sketchPanel: document.getElementById("sketch-panel"),
  sketchPanelTitle: document.getElementById("sketch-panel-title"),
  sketchPanelBody: document.getElementById("sketch-panel-body"),
  sketchUpload: document.getElementById("sketch-upload"),
  sketchStatus: document.getElementById("sketch-status"),
  sketchRetryBtn: document.getElementById("sketch-retry-btn"),
  sketchFeedback: document.getElementById("sketch-feedback"),
  sketchPreview: document.getElementById("sketch-preview"),
  sketchDropzone: document.getElementById("sketch-dropzone"),
  feedbackArea: document.getElementById("feedback-area"),
  shortcutInline: document.getElementById("shortcut-inline"),
  shortcutFigure: document.getElementById("shortcut-figure"),
  skipBtn: document.getElementById("skip-btn"),
  nextBtn: document.getElementById("next-btn"),
  micBtn: document.getElementById("mic-btn"),
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
  bestBadge: document.getElementById("best-badge"),
  playAgainBtn: document.getElementById("play-again-btn"),
  restartRoundBtn: document.getElementById("restart-round-btn"),
  returnMenuBtn: document.getElementById("return-menu-btn"),
  reviewQueue: document.getElementById("review-queue"),
  reviewQueueList: document.getElementById("review-queue-list"),
  reviewQueueStatus: document.getElementById("review-queue-status"),
  reviewFilterCorrect: document.getElementById("review-filter-correct"),
  reviewFilterWrong: document.getElementById("review-filter-wrong"),
  reviewFilterSkipped: document.getElementById("review-filter-skipped"),
  reviewList: document.getElementById("review-list"),
};

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  if (!saved) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed, assistantCollapsed: false };
  } catch (error) {
    console.warn("Kunne ikke indlæse settings", error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  scheduleUserStateSync();
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
  scheduleUserStateSync();
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
  scheduleUserStateSync();
}

function touchUserStateUpdatedAt() {
  if (state.userStateApplying) return;
  localStorage.setItem(STORAGE_KEYS.userStateUpdatedAt, new Date().toISOString());
}

function getLocalUserStateUpdatedAt() {
  const stored = localStorage.getItem(STORAGE_KEYS.userStateUpdatedAt);
  if (!stored) return null;
  const parsed = Date.parse(stored);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildUserStatePayload() {
  if (!state.session?.user) return null;
  return {
    user_id: state.session.user.id,
    settings: state.settings,
    history: getHistoryEntries(),
    seen: [...state.seenKeys],
    mistakes: [...state.lastMistakeKeys],
    performance: state.performance,
    figure_captions: state.figureCaptions,
    best_score: state.bestScore,
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "light",
  };
}

function scheduleUserStateSync() {
  touchUserStateUpdatedAt();
  if (state.userStateApplying) return;
  if (!state.backendAvailable || !state.supabase || !state.session?.user) return;
  if (state.userStateSyncTimer) return;
  state.userStateSyncTimer = setTimeout(() => {
    state.userStateSyncTimer = null;
    syncUserStateNow();
  }, USER_STATE_SYNC_DELAY);
}

async function syncUserStateNow() {
  if (state.userStateApplying) return;
  if (!state.backendAvailable || !state.supabase || !state.session?.user) return;
  if (state.userStateSyncInFlight) return;
  const payload = buildUserStatePayload();
  if (!payload) return;
  state.userStateSyncInFlight = true;
  const { error } = await state.supabase.from("user_state").upsert(payload, {
    onConflict: "user_id",
  });
  if (error) {
    console.warn("Kunne ikke synkronisere brugerdata", error);
  }
  state.userStateSyncInFlight = false;
}

function applyUserState(remote) {
  if (!remote) return;
  state.userStateApplying = true;
  if (remote.settings && typeof remote.settings === "object") {
    state.settings = { ...DEFAULT_SETTINGS, ...remote.settings, assistantCollapsed: false };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }
  if (Array.isArray(remote.history)) {
    saveHistoryEntries(remote.history);
  }
  if (Array.isArray(remote.seen)) {
    state.seenKeys = new Set(remote.seen);
    localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
  }
  if (Array.isArray(remote.mistakes)) {
    state.lastMistakeKeys = new Set(remote.mistakes);
    localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify([...state.lastMistakeKeys]));
  }
  if (remote.performance && typeof remote.performance === "object") {
    state.performance = remote.performance;
    localStorage.setItem(STORAGE_KEYS.performance, JSON.stringify(state.performance));
  }
  if (remote.figure_captions && typeof remote.figure_captions === "object") {
    state.figureCaptions = remote.figure_captions;
    localStorage.setItem(STORAGE_KEYS.figureCaptions, JSON.stringify(state.figureCaptions));
  }
  if (typeof remote.best_score === "number") {
    state.bestScore = Math.max(state.bestScore, remote.best_score);
    localStorage.setItem(STORAGE_KEYS.bestScore, String(state.bestScore.toFixed(1)));
  }
  if (remote.theme) {
    applyTheme(remote.theme);
  }
  state.userStateApplying = false;
  syncSettingsToUI();
  updateSummary();
  renderHistory();
  updateChips();
  updateTopBar();
  if (elements.bestScoreValue) {
    elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
  }
}

async function loadUserStateFromSupabase() {
  if (!state.supabase || !state.session?.user) return;
  const { data, error } = await state.supabase
    .from("user_state")
    .select("settings, history, seen, mistakes, performance, figure_captions, best_score, theme, updated_at")
    .eq("user_id", state.session.user.id)
    .maybeSingle();

  if (error) {
    console.warn("Kunne ikke hente brugerdata", error);
    return;
  }
  if (!data) {
    scheduleUserStateSync();
    return;
  }
  const localUpdatedAt = getLocalUserStateUpdatedAt();
  const remoteUpdatedAt = data.updated_at ? Date.parse(data.updated_at) : null;
  if (!localUpdatedAt || (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt)) {
    applyUserState(data);
  } else {
    scheduleUserStateSync();
  }
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
  scheduleUserStateSync();
}

function updatePresetButtons() {
  if (!elements.presetGrid) return;
  const cards = elements.presetGrid.querySelectorAll(".preset-card");
  cards.forEach((card) => {
    const isActive = card.dataset.preset === state.lastPreset;
    card.setAttribute("aria-pressed", String(isActive));
  });
}

function clearPresetSelection() {
  if (!state.lastPreset) return;
  state.lastPreset = null;
  updatePresetButtons();
}

function applySettingsPatch(patch) {
  state.settings = { ...state.settings, ...patch };
  saveSettings();
  syncSettingsToUI();
  updateSummary();
}

function applyPreset(presetId) {
  const preset = PRESET_CONFIGS[presetId];
  if (!preset) return;
  state.isApplyingPreset = true;
  applySettingsPatch(preset);
  state.lastPreset = presetId;
  state.isApplyingPreset = false;
  updatePresetButtons();
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

  document.body.classList.toggle("mode-auth", target === "auth");
  document.body.classList.toggle("mode-landing", target === "landing");
  document.body.classList.toggle("mode-menu", target === "menu" || target === "account");
  document.body.classList.toggle("mode-game", target === "quiz");
  document.body.classList.toggle("mode-result", target === "result");
  if (["menu", "landing", "quiz", "result"].includes(target)) {
    state.lastAppScreen = target;
  }
  if (target !== "quiz") {
    document.body.classList.remove("focus-mode");
    document.body.classList.remove("meta-hidden");
    cancelMicRecording();
  }
}

function setAuthStatus(message, isWarn = false) {
  if (!elements.authStatus) return;
  elements.authStatus.textContent = message || "";
  elements.authStatus.classList.toggle("warn", isWarn);
}

function setAccountStatus(message, isWarn = false) {
  if (!elements.accountStatus) return;
  elements.accountStatus.textContent = message || "";
  elements.accountStatus.classList.toggle("warn", isWarn);
}

function setAuthControlsEnabled(enabled) {
  const controls = [
    elements.authEmailInput,
    elements.authEmailBtn,
    elements.authGoogleBtn,
    elements.authAppleBtn,
  ];
  controls.forEach((control) => {
    if (control) {
      control.disabled = !enabled;
    }
  });
}

function setAccountControlsEnabled(enabled) {
  const controls = [
    elements.profileSaveBtn,
    elements.upgradeBtn,
    elements.portalBtn,
    elements.ownKeyToggle,
    elements.ownKeySaveBtn,
    elements.ownKeyClearBtn,
    elements.consentSaveBtn,
    elements.exportDataBtn,
    elements.deleteAccountBtn,
    elements.logoutBtn,
  ];
  controls.forEach((control) => {
    if (control) {
      control.disabled = !enabled;
    }
  });
  if (elements.accountBtn) {
    elements.accountBtn.disabled = !enabled;
    elements.accountBtn.textContent = enabled ? "Konto" : "Konto (login)";
  }
}

function formatPlanLabel(plan) {
  const normalized = String(plan || "free").toLowerCase();
  if (normalized === "paid") return "Pro";
  if (normalized === "trial") return "Trial";
  return "Gratis";
}

function formatSubscriptionStatus(subscription) {
  if (!subscription) return "Ingen aktiv betaling endnu.";
  const status = String(subscription.status || "").toLowerCase();
  const labelMap = {
    trialing: "Prøveperiode",
    active: "Aktiv",
    past_due: "Betaling afventer",
    unpaid: "Ubetalt",
    canceled: "Opsagt",
  };
  const label = labelMap[status] || "Status ukendt";
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("da-DK")
    : null;
  return periodEnd ? `${label} · fornyes ${periodEnd}` : label;
}

function updateUserChip() {
  if (!elements.userChip) return;
  if (state.demoMode && !state.session?.user) {
    elements.userChip.textContent = "Demo · Lokal";
    return;
  }
  if (!state.session?.user) {
    elements.userChip.textContent = "Ikke logget ind";
    return;
  }
  const name =
    state.profile?.full_name ||
    state.session.user.user_metadata?.full_name ||
    state.session.user.user_metadata?.name ||
    state.session.user.email ||
    "Konto";
  const planLabel = formatPlanLabel(state.profile?.plan);
  elements.userChip.textContent = `${name} · ${planLabel}`;
}

function updateAccountUI() {
  if (elements.profileNameInput) {
    elements.profileNameInput.value = state.profile?.full_name || "";
  }
  if (elements.profileEmail) {
    elements.profileEmail.textContent = state.session?.user?.email || "—";
  }
  if (elements.planStatus) {
    elements.planStatus.textContent = `Plan: ${formatPlanLabel(state.profile?.plan)}`;
  }
  if (elements.subscriptionStatus) {
    elements.subscriptionStatus.textContent = formatSubscriptionStatus(state.subscription);
  }
  if (elements.ownKeyToggle) {
    elements.ownKeyToggle.checked = state.useOwnKey;
  }
  if (elements.ownKeyInput) {
    elements.ownKeyInput.value = state.userOpenAiKey || "";
  }
  if (elements.consentTerms) {
    elements.consentTerms.checked = Boolean(state.profile?.terms_accepted_at);
  }
  if (elements.consentPrivacy) {
    elements.consentPrivacy.checked = Boolean(state.profile?.privacy_accepted_at);
  }
}

function updateAuthUI() {
  if (!state.authReady) return;
  const canAuth = Boolean(state.supabase);
  const hasUser = Boolean(state.session?.user);
  if (hasUser) {
    state.demoMode = false;
  }

  setAuthControlsEnabled(canAuth);
  setAccountControlsEnabled(hasUser && state.backendAvailable);

  if (!hasUser && state.demoMode) {
    showScreen(state.lastAppScreen || "menu");
  } else if (!hasUser) {
    showScreen("auth");
    if (!canAuth) {
      const message =
        state.configError || "Backend offline. Tjek /api/config og Vercel env.";
      setAuthStatus(message, true);
    } else {
      setAuthStatus("Log ind for at fortsætte");
    }
  } else if (screens.auth?.classList.contains("active")) {
    showScreen(state.lastAppScreen || "menu");
  }
  updateUserChip();
  updateAccountUI();
}

function requireAuthGuard(message = "Log ind for at fortsætte", options = {}) {
  if (state.session?.user) return true;
  if (options.allowDemo && state.demoMode) return true;
  setAuthStatus(message, true);
  showScreen("auth");
  return false;
}

function enableDemoMode() {
  state.demoMode = true;
  setAuthStatus("Demo mode aktiv.");
  updateAuthUI();
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.session?.access_token) {
    headers.Authorization = `Bearer ${state.session.access_token}`;
  }
  if (state.useOwnKey && state.userOpenAiKey) {
    headers["x-user-openai-key"] = state.userOpenAiKey;
  }
  return fetch(url, { ...options, headers });
}

async function loadRuntimeConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) {
    let detail = "Backend offline. Tjek /api/config og Vercel env.";
    try {
      const data = await res.json();
      if (data?.error) {
        detail = data.error;
      }
    } catch (error) {
      // Ignore JSON parse errors.
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  state.config = await res.json();
  state.backendAvailable = true;
}

function initSupabaseClient() {
  if (!state.config || !window.supabase) {
    state.backendAvailable = false;
    state.configError = "Supabase SDK ikke indlæst.";
    state.authReady = true;
    return;
  }
  state.supabase = window.supabase.createClient(
    state.config.supabaseUrl,
    state.config.supabaseAnonKey
  );
}

async function refreshSession() {
  if (!state.supabase) return;
  const { data } = await state.supabase.auth.getSession();
  state.session = data?.session || null;
  state.user = data?.session?.user || null;
  if (state.session?.user) {
    state.demoMode = false;
  }
  state.authReady = true;
}

function subscribeToAuthChanges() {
  if (!state.supabase) return;
  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    state.user = session?.user || null;
    if (session?.user) {
      state.demoMode = false;
    }
    if (session?.user) {
      await refreshProfile();
    } else {
      state.profile = null;
      state.subscription = null;
    }
    updateAuthUI();
    await checkAiAvailability();
  });
}

async function refreshProfile() {
  if (!state.session?.user) return;
  try {
    const res = await apiFetch("/api/me", { method: "GET" });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    state.profile = data.profile || null;
    state.subscription = data.subscription || null;
    updateAccountUI();
    updateUserChip();
    await loadUserStateFromSupabase();
  } catch (error) {
    // Ignore profile fetch errors for now.
  }
}

async function signInWithProvider(provider) {
  if (!state.supabase) {
    setAuthStatus(state.configError || "Login er ikke klar endnu.", true);
    return;
  }
  setAuthStatus("Åbner login …");
  const { error } = await state.supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.href,
    },
  });
  if (error) {
    const message =
      error.message?.includes("provider") || error.message?.includes("enabled")
        ? "OAuth er ikke aktiveret i Supabase."
        : "Kunne ikke starte login.";
    setAuthStatus(message, true);
  }
}

async function signInWithEmail() {
  if (!state.supabase) {
    setAuthStatus(state.configError || "Login er ikke klar endnu.", true);
    return;
  }
  const email = elements.authEmailInput ? elements.authEmailInput.value.trim() : "";
  if (!email) {
    setAuthStatus("Skriv din email først.", true);
    return;
  }
  setAuthStatus("Sender loginlink …");
  const { error } = await state.supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.href,
    },
  });
  if (error) {
    const message =
      error.message?.includes("email") || error.message?.includes("disabled")
        ? "Email login er ikke aktiveret i Supabase."
        : "Kunne ikke sende loginlink.";
    setAuthStatus(message, true);
    return;
  }
  setAuthStatus("Tjek din email for loginlink.");
}

async function handleProfileSave() {
  if (!requireAuthGuard()) return;
  const fullName = elements.profileNameInput ? elements.profileNameInput.value.trim() : "";
  const res = await apiFetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName }),
  });
  if (res.ok) {
    const data = await res.json();
    state.profile = data.profile || state.profile;
    updateAccountUI();
    updateUserChip();
    setAccountStatus("Profil opdateret.");
  } else {
    setAccountStatus("Kunne ikke gemme profil.", true);
  }
}

async function handleConsentSave() {
  if (!requireAuthGuard()) return;
  const acceptTerms = Boolean(elements.consentTerms?.checked);
  const acceptPrivacy = Boolean(elements.consentPrivacy?.checked);
  const res = await apiFetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acceptTerms, acceptPrivacy }),
  });
  if (res.ok) {
    const data = await res.json();
    state.profile = data.profile || state.profile;
    updateAccountUI();
    setAccountStatus("Samtykke gemt.");
  } else {
    setAccountStatus("Kunne ikke gemme samtykke.", true);
  }
}

async function handleCheckout() {
  if (!requireAuthGuard()) return;
  const res = await apiFetch("/api/stripe/create-checkout-session", { method: "POST" });
  if (!res.ok) {
    setAccountStatus("Kunne ikke starte betaling.", true);
    return;
  }
  const data = await res.json();
  if (data.url) {
    setAccountStatus("Åbner Stripe Checkout …");
    window.location.href = data.url;
  }
}

async function handlePortal() {
  if (!requireAuthGuard()) return;
  const res = await apiFetch("/api/stripe/create-portal-session", { method: "POST" });
  if (!res.ok) {
    setAccountStatus("Kunne ikke åbne betalingsportal.", true);
    return;
  }
  const data = await res.json();
  if (data.url) {
    setAccountStatus("Åbner betalingsportal …");
    window.location.href = data.url;
  }
}

function persistOwnKeyState() {
  localStorage.setItem(STORAGE_KEYS.useOwnKey, String(state.useOwnKey));
  if (state.userOpenAiKey) {
    localStorage.setItem(STORAGE_KEYS.userOpenAiKey, state.userOpenAiKey);
  } else {
    localStorage.removeItem(STORAGE_KEYS.userOpenAiKey);
  }
}

function setOwnKeyEnabled(enabled) {
  state.useOwnKey = Boolean(enabled);
  persistOwnKeyState();
  updateAccountUI();
  checkAiAvailability();
  syncOwnKeyPreference();
}

function saveOwnKey() {
  const key = elements.ownKeyInput ? elements.ownKeyInput.value.trim() : "";
  state.userOpenAiKey = key;
  if (key) {
    state.useOwnKey = true;
  }
  persistOwnKeyState();
  updateAccountUI();
  checkAiAvailability();
  syncOwnKeyPreference();
}

function clearOwnKey() {
  state.userOpenAiKey = "";
  state.useOwnKey = false;
  persistOwnKeyState();
  updateAccountUI();
  checkAiAvailability();
  syncOwnKeyPreference();
}

async function syncOwnKeyPreference() {
  if (!state.session?.user) return;
  try {
    const res = await apiFetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownKeyEnabled: state.useOwnKey }),
    });
    if (res.ok) {
      const data = await res.json();
      state.profile = data.profile || state.profile;
      updateAccountUI();
    }
  } catch (error) {
    // No-op.
  }
}

async function handleExportData() {
  if (!requireAuthGuard()) return;
  const res = await apiFetch("/api/account/export", { method: "GET" });
  if (!res.ok) {
    setAccountStatus("Kunne ikke hente data.", true);
    return;
  }
  const data = await res.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "human-biologi-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setAccountStatus("Download startet.");
}

async function handleDeleteAccount() {
  if (!requireAuthGuard()) return;
  const confirmed = window.confirm(
    "Er du sikker? Dette sletter din konto og alle data permanent."
  );
  if (!confirmed) return;
  const res = await apiFetch("/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true }),
  });
  if (res.ok) {
    setAccountStatus("Konto slettet.");
    await handleLogout();
  } else {
    setAccountStatus("Kunne ikke slette konto.", true);
  }
}

async function handleLogout() {
  if (!state.supabase) return;
  await state.supabase.auth.signOut();
  state.session = null;
  state.user = null;
  state.profile = null;
  state.subscription = null;
  state.demoMode = false;
  updateAuthUI();
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

function normalizeShortLabel(label) {
  return String(label || "").trim().toLowerCase();
}

function tokenizeContextText(text) {
  const tokens = String(text || "")
    .toLowerCase()
    .match(/[a-zæøå]+/gi);
  return tokens ? tokens.map((token) => token.toLowerCase()) : [];
}

function extractContentTokens(text) {
  const tokens = tokenizeContextText(text);
  const filtered = tokens.filter(
    (token) => token.length >= 3 && !CONTEXT_STOPWORDS.has(token)
  );
  return new Set(filtered);
}

function extractCountCueNoun(prompt) {
  const tokens = tokenizeContextText(prompt);
  for (let i = 0; i < tokens.length - 2; i += 1) {
    if (tokens[i] !== "de") continue;
    const countWord = tokens[i + 1];
    if (!CONTEXT_COUNT_WORDS.has(countWord)) continue;
    let noun = "";
    for (let j = i + 2; j < tokens.length; j += 1) {
      const token = tokens[j];
      if (CONTEXT_COUNT_STOP.has(token)) break;
      if (CONTEXT_COUNT_SKIP.has(token)) continue;
      noun = token;
    }
    if (noun) return noun;
  }
  return "";
}

function getShortGroupKey(question) {
  if (!question || question.type !== "short") return null;
  const sessionKey = question.session ? formatSessionLabel(question.session) : "standard";
  return `${question.year}-${sessionKey}-${question.opgave}`;
}

function getShortLabelIndex(label) {
  const normalized = normalizeShortLabel(label);
  return SHORT_LABEL_INDEX.get(normalized) ?? 99;
}

function sortShortGroupQuestions(questions) {
  return [...questions].sort((a, b) => {
    const indexA = getShortLabelIndex(a.label);
    const indexB = getShortLabelIndex(b.label);
    if (indexA !== indexB) return indexA - indexB;
    return String(a.prompt || "").localeCompare(String(b.prompt || ""), "da");
  });
}

function buildShortQuestionGroups(questions) {
  const groups = new Map();
  questions.forEach((question) => {
    const key = getShortGroupKey(question);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(question);
  });
  groups.forEach((list, key) => {
    groups.set(key, sortShortGroupQuestions(list));
  });
  return groups;
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

function isReviewCorrect(entry) {
  if (entry.skipped) return false;
  if (entry.type === "mcq") return entry.isCorrect;
  return entry.awardedPoints >= entry.maxPoints;
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

function buildFigureAuditIndex(entries) {
  const index = new Map();
  if (!Array.isArray(entries)) return index;
  entries.forEach((entry) => {
    const key = String(entry.key || "").trim();
    const image = String(entry.image || "").trim();
    const description = String(entry.description || "").trim();
    if (!key || !image || !description) return;
    const list = index.get(key) || [];
    list.push({ image, description });
    index.set(key, list);
  });
  return index;
}

function getFigureAuditKey(question) {
  if (!question || question.type !== "short") return "";
  const year = Number(question.year);
  const opgave = Number(question.opgave ?? question.number);
  if (!Number.isFinite(year) || !Number.isFinite(opgave)) return "";
  const label = normalizeShortLabel(question.label);
  const labelKey = label ? label : "None";
  return `${year}-${opgave}${labelKey}`;
}

function getFigureAuditCaption(question, imagePath) {
  if (!question || !imagePath || !state.figureAuditIndex) return "";
  const key = getFigureAuditKey(question);
  if (!key) return "";
  const entries = state.figureAuditIndex.get(key);
  if (!entries || !entries.length) return "";
  const match = entries.find((entry) => entry.image === imagePath);
  return match ? match.description : "";
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
      const caption = getFigureAuditCaption(question, path) || getFigureCaptionForImage(path);
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

function getShortContextQuestions(question) {
  const key = getShortGroupKey(question);
  if (!key || !state.shortQuestionGroups) return [];
  const group = state.shortQuestionGroups.get(key);
  if (!group || group.length < 2) return [];
  const currentIndex = group.findIndex((entry) => entry.key === question.key);
  if (currentIndex <= 0) return [];
  return group.slice(0, currentIndex);
}

function hasContextOverlap(question, contextQuestions) {
  const currentText = String(question?.text || question?.prompt || "");
  const currentTokens = extractContentTokens(currentText);
  if (!currentTokens.size) return false;
  const contextTokens = new Set();
  contextQuestions.forEach((entry) => {
    extractContentTokens(entry.text || entry.prompt || "").forEach((token) => {
      contextTokens.add(token);
    });
  });
  if (!contextTokens.size) return false;
  let overlapCount = 0;
  let longOverlap = false;
  currentTokens.forEach((token) => {
    if (!contextTokens.has(token)) return;
    overlapCount += 1;
    if (token.length >= 6) {
      longOverlap = true;
    }
  });
  if (longOverlap) return true;
  return overlapCount >= 2;
}

function shouldShowQuestionContext(question, contextQuestions) {
  if (!question || question.type !== "short") return false;
  if (!contextQuestions || !contextQuestions.length) return false;
  const prompt = String(question.text || question.prompt || "");
  if (!prompt) return false;
  if (CONTEXT_STRONG_CUE.test(prompt)) return true;
  const noun = extractCountCueNoun(prompt);
  if (noun) {
    const prevText = contextQuestions
      .map((entry) => String(entry.text || entry.prompt || ""))
      .join(" ")
      .toLowerCase();
    if (prevText.includes(noun)) return true;
  }
  return hasContextOverlap(question, contextQuestions);
}

function formatShortContextLine(question) {
  const label = normalizeShortLabel(question.label);
  const labelPrefix = label ? `${label.toUpperCase()}. ` : "";
  return `${labelPrefix}${question.text || question.prompt || ""}`.trim();
}

function formatShortContextTitle(question, contextQuestions) {
  if (!question || !contextQuestions.length) return "";
  const labels = contextQuestions
    .map((entry) => normalizeShortLabel(entry.label))
    .filter(Boolean)
    .map((entry) => entry.toUpperCase());
  const range = labels.length > 1 ? `${labels[0]}–${labels[labels.length - 1]}` : labels[0];
  return `Opg. ${question.opgave} · tidligere delspørgsmål (${range})`;
}

function buildShortPrompt(question) {
  if (!question) return "";
  const parts = [];
  if (question.opgaveIntro) parts.push(question.opgaveIntro);
  if (question.text) parts.push(question.text);
  return parts.join("\n");
}

function getSketchDescription(question) {
  if (!question) return "";
  const analysis = state.sketchAnalysis.get(question.key);
  if (!analysis) return "";
  return String(analysis.description || "").trim();
}

function buildShortAnswerForGrading(question, options = {}) {
  if (!question) return { answer: "", hasText: false, hasSketch: false };
  const textAnswer = elements.shortAnswerInput?.value.trim() || "";
  const sketchDescription =
    options.sketchDescription !== undefined
      ? String(options.sketchDescription || "").trim()
      : getSketchDescription(question);
  const parts = [];
  if (textAnswer) parts.push(textAnswer);
  if (sketchDescription) {
    parts.push(`Skitsebeskrivelse: ${sketchDescription}`);
  }
  return {
    answer: parts.join("\n"),
    hasText: Boolean(textAnswer),
    hasSketch: Boolean(sketchDescription),
  };
}

async function resolveShortModelAnswer(question, { useSketch = false } = {}) {
  if (!question) return "";
  let modelAnswer = useSketch ? buildSketchModelAnswer(question) : getEffectiveModelAnswer(question);
  if (getQuestionImagePaths(question).length && !getCombinedFigureCaption(question)) {
    const generated = await fetchFigureCaptionForQuestion(question, { silent: true });
    if (generated) {
      modelAnswer = useSketch ? buildSketchModelAnswer(question) : getEffectiveModelAnswer(question);
    }
  }
  return modelAnswer;
}

function applyShortAnswerGradeResult(question, data, { fallbackFeedback } = {}) {
  if (!question) return;
  const suggested = clamp(Number(data.score) || 0, 0, question.maxPoints || 0);
  syncShortScoreInputs(suggested, { scored: true });
  const feedback = String(data.feedback || "").trim();
  elements.shortAnswerAiFeedback.textContent =
    feedback || fallbackFeedback || "Auto-vurdering klar. Justér point efter behov.";
  setShortcutTempStatus("grade", "Vurderet", 2000);
  state.shortAnswerAI.set(question.key, {
    score: suggested,
    feedback: feedback || "",
    missing: data.missing || [],
    matched: data.matched || [],
  });
  updateShortReviewStatus(question);
  setShortReviewOpen(true);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[-+]/g, " ")
    .replace(/[^a-z0-9æøå ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchText(value) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => {
    if (!token) return false;
    if (BOOK_STOPWORDS.has(token)) return false;
    if (token.length > 2) return true;
    if (BOOK_SHORT_TOKENS.has(token)) return true;
    return /\d/.test(token);
  });
}

function normalizeSimilarityText(value) {
  return normalizeSearchText(value);
}

function getCorrectOptionText(question) {
  if (!question || !Array.isArray(question.options)) return "";
  const correctLabel = String(question.correctLabel || "").toUpperCase();
  if (correctLabel) {
    const match = question.options.find(
      (option) => String(option.label || "").toUpperCase() === correctLabel
    );
    if (match?.text) return String(match.text);
  }
  const fallback = question.options.find((option) => option.isCorrect);
  return String(fallback?.text || "");
}

function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  if (a.length > b.length) {
    [a, b] = [b, a];
  }
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) {
    prev[j] = j;
  }
  for (let i = 1; i <= a.length; i += 1) {
    let prevDiag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const insert = prev[j - 1] + 1;
      const del = prev[j] + 1;
      const sub = prevDiag + cost;
      prev[j] = Math.min(insert, del, sub);
      prevDiag = temp;
    }
  }
  return prev[b.length];
}

function getSimilarityRatio(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  if (a === b) return 1;
  const distance = levenshteinDistance(a, b);
  const denom = Math.max(a.length, b.length) || 1;
  return 1 - distance / denom;
}

function buildMcqDuplicateGroups(questions) {
  if (!Array.isArray(questions) || !questions.length) return;
  const normalized = questions.map((question) => ({
    question: normalizeSimilarityText(question.text),
    answer: normalizeSimilarityText(getCorrectOptionText(question)),
  }));
  const parents = Array.from({ length: questions.length }, (_, index) => index);
  const sizes = new Array(questions.length).fill(1);

  const find = (index) => {
    let root = index;
    while (parents[root] !== root) {
      root = parents[root];
    }
    let node = index;
    while (parents[node] !== node) {
      const next = parents[node];
      parents[node] = root;
      node = next;
    }
    return root;
  };

  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    if (sizes[rootA] < sizes[rootB]) {
      parents[rootA] = rootB;
      sizes[rootB] += sizes[rootA];
      return;
    }
    parents[rootB] = rootA;
    sizes[rootA] += sizes[rootB];
  };

  for (let i = 0; i < questions.length; i += 1) {
    const current = normalized[i];
    if (!current.question || !current.answer) continue;
    for (let j = i + 1; j < questions.length; j += 1) {
      const candidate = normalized[j];
      if (!candidate.question || !candidate.answer) continue;
      const questionLenRatio =
        Math.min(current.question.length, candidate.question.length) /
        Math.max(current.question.length, candidate.question.length, 1);
      if (questionLenRatio < DUPLICATE_QUESTION_SIMILARITY - 0.15) continue;
      const questionSimilarity = getSimilarityRatio(current.question, candidate.question);
      if (questionSimilarity < DUPLICATE_QUESTION_SIMILARITY) continue;
      const answerSimilarity = getSimilarityRatio(current.answer, candidate.answer);
      if (answerSimilarity < DUPLICATE_ANSWER_SIMILARITY) continue;
      union(i, j);
    }
  }

  const groupSizes = new Map();
  for (let i = 0; i < questions.length; i += 1) {
    const root = find(i);
    groupSizes.set(root, (groupSizes.get(root) || 0) + 1);
  }

  const groupIds = new Map();
  let groupIndex = 1;
  for (let i = 0; i < questions.length; i += 1) {
    const root = find(i);
    if ((groupSizes.get(root) || 0) <= 1) continue;
    if (!groupIds.has(root)) {
      groupIds.set(root, `mcq-dup-${groupIndex}`);
      groupIndex += 1;
    }
    questions[i].duplicateGroup = groupIds.get(root);
  }
}

function buildBookCaptionIndex(library) {
  if (!library || typeof library !== "object") return [];
  return Object.entries(library).map(([path, entry]) => {
    const rawSummary =
      typeof entry === "string" ? entry : String(entry?.summary || "").trim();
    const keywordList = Array.isArray(entry?.keywords) ? entry.keywords : [];
    const keywordText = keywordList.join(" ");
    const focus = typeof entry?.focus === "string" ? entry.focus : "";
    const imageType = typeof entry?.image_type === "string" ? entry.image_type : "";
    const summaryTokens = new Set(tokenizeSearchText(rawSummary));
    const keywordTokens = new Set(tokenizeSearchText(keywordText));
    const focusTokens = new Set(tokenizeSearchText(focus));
    const combinedTokens = new Set([
      ...summaryTokens,
      ...keywordTokens,
      ...focusTokens,
    ]);
    return {
      path,
      summary: rawSummary,
      keywords: keywordList,
      focus,
      imageType,
      summaryTokens,
      keywordTokens,
      focusTokens,
      tokens: combinedTokens,
    };
  });
}

function addWeightedTokens(weightMap, text, weight) {
  if (!text) return;
  tokenizeSearchText(text).forEach((token) => {
    const current = weightMap.get(token) || 0;
    if (weight > current) {
      weightMap.set(token, weight);
    }
  });
}

function limitTokenWeights(weightMap, maxTokens = 40) {
  if (weightMap.size <= maxTokens) return weightMap;
  const sorted = [...weightMap.entries()].sort((a, b) => b[1] - a[1]);
  return new Map(sorted.slice(0, maxTokens));
}

function buildBookQueryWeights(entry) {
  const question = entry.question || {};
  const weights = new Map();
  addWeightedTokens(weights, question.text, 1.2);
  addWeightedTokens(weights, question.prompt, 1.1);
  addWeightedTokens(weights, question.opgaveIntro, 1.1);
  addWeightedTokens(weights, question.category, 1.4);
  if (question.rawCategory && question.rawCategory !== question.category) {
    addWeightedTokens(weights, question.rawCategory, 1.1);
  }

  const modelAnswer = getEffectiveModelAnswer(question);
  if (modelAnswer) {
    addWeightedTokens(weights, modelAnswer, 2.2);
  }

  const figureCaption = getCombinedFigureCaption(question);
  if (figureCaption) {
    addWeightedTokens(weights, figureCaption, 2.0);
  }

  if (entry.aiExplanation) {
    addWeightedTokens(weights, entry.aiExplanation, 1.3);
  }
  if (entry.aiExplanationExpanded) {
    addWeightedTokens(weights, entry.aiExplanationExpanded, 1.1);
  }
  if (entry.aiHint) {
    addWeightedTokens(weights, entry.aiHint, 1.2);
  }

  if (entry.type === "mcq") {
    const mapping = getOptionMapping(question);
    const optionText = (mapping.options || []).map((option) => option.text).join(" ");
    addWeightedTokens(weights, optionText, 0.6);
    const correctOption = (mapping.options || []).find(
      (option) => option.label === mapping.correctLabel
    );
    if (correctOption?.text) {
      addWeightedTokens(weights, correctOption.text, 1.6);
    }
  } else if (
    entry.type === "short" &&
    entry.response &&
    entry.awardedPoints >= entry.maxPoints
  ) {
    addWeightedTokens(weights, entry.response, 0.8);
  }

  return limitTokenWeights(weights, 40);
}

function scoreBookCaptionMatch(queryWeights, entry) {
  let keywordHits = 0;
  let focusHits = 0;
  let summaryHits = 0;
  let totalWeight = 0;
  let score = 0;
  queryWeights.forEach((weight, token) => {
    totalWeight += weight;
    if (entry.keywordTokens.has(token)) {
      keywordHits += 1;
      score += weight * 2.4;
    } else if (entry.focusTokens.has(token)) {
      focusHits += 1;
      score += weight * 2.1;
    } else if (entry.summaryTokens.has(token)) {
      summaryHits += 1;
      score += weight * 1.2;
    }
  });
  const hits = keywordHits + focusHits + summaryHits;
  const signalHits = keywordHits + focusHits;
  const maxScore = totalWeight * 2.4;
  const ratio = maxScore ? score / maxScore : 0;
  return { score, hits, signalHits, ratio };
}

function findBestBookIllustration(entry) {
  if (!state.bookCaptionIndex.length) return null;
  const queryWeights = buildBookQueryWeights(entry);
  if (!queryWeights.size) return null;
  let best = null;
  let bestScore = 0;
  let bestMeta = null;
  let secondScore = 0;
  state.bookCaptionIndex.forEach((caption) => {
    const meta = scoreBookCaptionMatch(queryWeights, caption);
    if (meta.score > bestScore) {
      secondScore = bestScore;
      bestScore = meta.score;
      bestMeta = meta;
      best = caption;
    } else if (meta.score > secondScore) {
      secondScore = meta.score;
    }
  });
  if (!best || !bestMeta) return null;
  const tokenCount = queryWeights.size;
  const minHits = tokenCount <= 8 ? 3 : tokenCount <= 16 ? 4 : 5;
  const minSignalHits = tokenCount <= 10 ? 2 : 3;
  const minRatio = tokenCount <= 8 ? 0.45 : tokenCount <= 16 ? 0.5 : 0.55;
  const minGap = secondScore > 0 ? bestScore / secondScore : 2.0;
  if (bestMeta.hits < minHits) return null;
  if (bestMeta.signalHits < minSignalHits) return null;
  if (bestMeta.ratio < minRatio) return null;
  if (minGap < 1.4) return null;
  return {
    path: best.path,
    summary: best.summary,
    focus: best.focus,
    imageType: best.imageType,
    keywords: best.keywords,
  };
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

function setFigureVisibility(visible, { announce = true } = {}) {
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
  setShortcutActive("figure", visible);
  if (announce) {
    setShortcutTempStatus("figure", visible ? "Figur vises" : "Figur skjult", 2000);
  }
}

function updateQuestionFigure(question) {
  if (!elements.questionFigure || !elements.questionFigureMedia) return;
  const images = getQuestionImagePaths(question);
  if (!images.length) {
    elements.questionFigure.classList.add("hidden");
    elements.questionFigureMedia.innerHTML = "";
    if (elements.questionFigureCaption) {
      elements.questionFigureCaption.textContent = "";
    }
    return;
  }

  elements.questionFigureMedia.innerHTML = "";
  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Figur ${index + 1} til ${question.category}`;
    elements.questionFigureMedia.appendChild(img);
  });

  if (elements.questionFigureCaption) {
    elements.questionFigureCaption.textContent = images.length > 1 ? "Flere figurer" : "Figur";
  }

  setFigureVisibility(false, { announce: false });
}

function getShortcutItem(action) {
  if (!elements.shortcutInline) return null;
  return elements.shortcutInline.querySelector(`.shortcut-item[data-action="${action}"]`);
}

function updateShortcutStatusText(item) {
  if (!item) return;
  const statusEl = item.querySelector(".shortcut-status");
  if (!statusEl) return;
  const tempStatus = item.dataset.tempStatus || "";
  const status = item.dataset.status || "";
  const text = tempStatus || status;
  statusEl.textContent = text;
  item.classList.toggle("has-status", Boolean(text));
}

function setShortcutStatus(action, text) {
  const item = getShortcutItem(action);
  if (!item) return;
  if (text) {
    item.dataset.status = text;
  } else {
    delete item.dataset.status;
  }
  updateShortcutStatusText(item);
}

function setShortcutTempStatus(action, text, duration = SHORTCUT_STATUS_DURATION) {
  const item = getShortcutItem(action);
  if (!item) return;
  if (text) {
    item.dataset.tempStatus = text;
  } else {
    delete item.dataset.tempStatus;
  }
  updateShortcutStatusText(item);
  if (!duration) return;
  if (shortcutStatusTimers.has(action)) {
    clearTimeout(shortcutStatusTimers.get(action));
  }
  const timer = setTimeout(() => {
    shortcutStatusTimers.delete(action);
    if (item) {
      delete item.dataset.tempStatus;
      updateShortcutStatusText(item);
    }
  }, duration);
  shortcutStatusTimers.set(action, timer);
}

function setShortcutActive(action, active) {
  const item = getShortcutItem(action);
  if (!item) return;
  item.classList.toggle("is-active", Boolean(active));
  if (item.dataset.toggle === "true") {
    item.setAttribute("aria-pressed", String(Boolean(active)));
  }
}

function setShortcutAvailable(action, available) {
  const item = getShortcutItem(action);
  if (!item) return;
  item.classList.toggle("is-available", Boolean(available));
}

function setShortcutDisabled(action, disabled) {
  const item = getShortcutItem(action);
  if (!item) return;
  const isDisabled = Boolean(disabled);
  item.classList.toggle("is-disabled", isDisabled);
  if (item.tagName === "BUTTON") {
    item.disabled = isDisabled;
  }
  item.setAttribute("aria-disabled", String(isDisabled));
}

function setShortcutBusy(action, busy) {
  const item = getShortcutItem(action);
  if (!item) return;
  item.classList.toggle("is-busy", Boolean(busy));
}

function flashShortcut(action) {
  const item = getShortcutItem(action);
  if (!item) return;
  item.classList.remove("is-flash");
  requestAnimationFrame(() => {
    item.classList.add("is-flash");
    setTimeout(() => item.classList.remove("is-flash"), 600);
  });
}

function updateShortcutFigureIndicator(question) {
  if (!getShortcutItem("figure") && !elements.shortcutFigure) return;
  const hasFigure = getQuestionImagePaths(question).length > 0;
  const showIndicator = Boolean(question && hasFigure);
  setShortcutAvailable("figure", showIndicator);
  setShortcutDisabled("figure", !showIndicator);
  if (!showIndicator) {
    setShortcutActive("figure", false);
    setShortcutStatus("figure", "");
  }
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
    modelTitle = figureCaption ? "Facit (figurbeskrivelse)" : "Facit (figur)";
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
    elements.shortModelTag.textContent = "Figurbeskrivelse";
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
        setShortFigureStatus("Figurbeskrivelse klar.", false);
      } else if (useFigureCaption) {
        if (elements.shortFigureText) {
          elements.shortFigureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Facit henviser til figuren. Generér en beskrivelse."
            : "Hjælp offline. Start scripts/dev_server.py.",
          !state.aiStatus.available
        );
      } else {
        if (elements.shortFigureText) {
          elements.shortFigureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Generér en figurbeskrivelse hvis du vil."
            : "Hjælp offline. Start scripts/dev_server.py.",
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
  if (!question || question.type !== "short") {
    elements.sketchPanel.classList.add("hidden");
    return;
  }
  elements.sketchPanel.classList.remove("hidden");
  if (elements.sketchPanelTitle) {
    elements.sketchPanelTitle.textContent = requiresSketch(question)
      ? "Skitse-analyse (auto)"
      : "Skitse (valgfri)";
  }
  if (elements.sketchStatus && !state.aiStatus.available) {
    elements.sketchStatus.textContent = state.aiStatus.message || "Hjælp offline";
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
  cancelMicRecording();
  setShortAnswerPending(false);
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
  setShortReviewOpen(false);
  if (elements.shortReviewStatus) {
    elements.shortReviewStatus.textContent = "Klar til vurdering";
  }
  if (elements.sketchPanel) {
    elements.sketchPanel.classList.add("hidden");
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
  setShortRetryVisible(false);
  setSketchRetryVisible(false);
  if (elements.sketchPreview) {
    elements.sketchPreview.src = "";
    elements.sketchPreview.classList.add("hidden");
  }
}

function setShortReviewOpen(open) {
  if (!elements.shortReviewDrawer) return;
  elements.shortReviewDrawer.dataset.open = open ? "true" : "false";
}

function updateShortReviewStatus(question) {
  if (!elements.shortReviewStatus || !question) return;
  const aiState = state.shortAnswerAI.get(question.key);
  const draft = getShortDraft(question.key);
  const hasText = Boolean(draft.text?.trim());
  let status = "Klar til vurdering";
  if (hasText && !draft.scored) {
    status = "Svar gemt · mangler vurdering";
  } else if (aiState?.feedback) {
    status = "Auto-vurdering klar";
  }
  if (draft.scored && typeof draft.points === "number" && question.maxPoints) {
    status = `Senest: ${draft.points.toFixed(1)} / ${Number(question.maxPoints).toFixed(1)}`;
  }
  elements.shortReviewStatus.textContent = status;
}

function setShortRetryVisible(visible) {
  if (!elements.shortAnswerAiRetryBtn) return;
  elements.shortAnswerAiRetryBtn.classList.toggle("hidden", !visible);
}

function setSketchRetryVisible(visible) {
  if (!elements.sketchRetryBtn) return;
  elements.sketchRetryBtn.classList.toggle("hidden", !visible);
}

function isShortAnswerScored(question) {
  if (!question) return false;
  const draft = getShortDraft(question.key);
  return Boolean(draft.scored);
}

function getShortAnswerState(question) {
  if (!question) return { draft: null, hasText: false, hasSketch: false, scored: false };
  const draft = getShortDraft(question.key);
  const hasSketch = Boolean(getSketchDescription(question));
  return {
    draft,
    hasText: Boolean(draft.text?.trim()),
    hasSketch,
    scored: Boolean(draft.scored),
  };
}

function setShortAnswerPending(isPending) {
  state.shortAnswerPending = Boolean(isPending);
  const question = state.activeQuestions[state.currentIndex];
  if (elements.skipBtn) {
    elements.skipBtn.disabled = state.shortAnswerPending;
    setShortcutDisabled("skip", elements.skipBtn.disabled);
  }
  if (elements.shortAnswerAiRetryBtn) {
    elements.shortAnswerAiRetryBtn.disabled = state.shortAnswerPending;
  }
  const isShort = question?.type === "short";
  setShortcutBusy("grade", state.shortAnswerPending);
  setShortcutDisabled("grade", !isShort);
  if (state.shortAnswerPending) {
    setShortcutStatus("grade", "Vurderer …");
  } else {
    setShortcutStatus("grade", "");
  }
  updateShortAnswerActions(question);
}

function updateShortAnswerActions(question) {
  if (!question || question.type !== "short" || !elements.nextBtn) return;
  if (state.locked) {
    elements.nextBtn.textContent = "Næste";
    elements.nextBtn.disabled = false;
    setShortcutDisabled("next", elements.nextBtn.disabled);
    updateMicControls(question);
    return;
  }
  if (state.shortAnswerPending) {
    elements.nextBtn.textContent = "Vurderer …";
    elements.nextBtn.disabled = true;
    setShortcutDisabled("next", elements.nextBtn.disabled);
    updateMicControls(question);
    return;
  }
  const scored = isShortAnswerScored(question);
  elements.nextBtn.textContent = scored ? "Næste" : "Vurdér";
  elements.nextBtn.disabled = false;
  setShortcutDisabled("next", elements.nextBtn.disabled);
  updateMicControls(question);
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
  elements.nextBtn.textContent = "Næste";
  elements.nextBtn.disabled = true;
  setShortcutDisabled("next", true);
  if (elements.skipBtn) {
    setShortcutDisabled("skip", elements.skipBtn.disabled);
  }
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
  updateMicControls(question);
}

function renderShortQuestion(question) {
  elements.optionsContainer.classList.add("hidden");
  elements.shortAnswerContainer.classList.remove("hidden");
  elements.skipBtn.textContent = "Spring over (0 point)";
  elements.nextBtn.disabled = false;
  setShortcutDisabled("next", elements.nextBtn.disabled);
  if (elements.skipBtn) {
    setShortcutDisabled("skip", elements.skipBtn.disabled);
  }
  const promptText = String(question.text || question.prompt || "").trim();
  if (question.opgaveIntro) {
    elements.questionText.textContent = question.opgaveIntro;
    if (elements.questionSubtitle) {
      elements.questionSubtitle.textContent = promptText;
      const label = normalizeShortLabel(question.label);
      if (label) {
        elements.questionSubtitle.dataset.label = label.toUpperCase();
      } else {
        elements.questionSubtitle.removeAttribute("data-label");
      }
      elements.questionSubtitle.classList.toggle("hidden", !promptText);
    }
    elements.questionText.classList.toggle("has-subtitle", Boolean(promptText));
  } else {
    elements.questionText.textContent = promptText;
    if (elements.questionSubtitle) {
      elements.questionSubtitle.textContent = "";
      elements.questionSubtitle.classList.add("hidden");
      elements.questionSubtitle.removeAttribute("data-label");
    }
  }

  const cached = getShortDraft(question.key);
  elements.shortAnswerInput.value = cached.text || "";
  const maxPoints = question.maxPoints || 0;
  const rangeStep = 0.5;
  elements.shortAnswerScoreRange.min = "0";
  elements.shortAnswerScoreRange.max = String(maxPoints);
  elements.shortAnswerScoreRange.step = String(rangeStep);
  elements.shortAnswerScoreInput.min = "0";
  elements.shortAnswerScoreInput.max = String(maxPoints);
  elements.shortAnswerScoreInput.step = String(rangeStep);
  elements.shortAnswerMaxPoints.textContent = maxPoints.toFixed(1);
  const savedPoints = cached.points ?? 0;
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
      ? "Hjælp klar"
      : state.aiStatus.message || "Hjælp offline";
    elements.shortAnswerAiStatus.textContent = label;
    elements.shortAnswerAiStatus.classList.toggle("warn", !state.aiStatus.available);
  }

  if (elements.shortSketchHint) {
    if (requiresSketch(question)) {
      elements.shortSketchHint.textContent =
        "Upload en skitse - analysen starter automatisk og bruges i auto-bedømmelsen.";
      elements.shortSketchHint.classList.remove("hidden");
    } else {
      elements.shortSketchHint.textContent = "";
      elements.shortSketchHint.classList.add("hidden");
    }
  }

  elements.shortAnswerModel.classList.add("hidden");
  updateShortAnswerModel(question);
  updateSketchPanel(question);
  updateShortReviewStatus(question);
  const shouldOpenReview = Boolean(
    aiState?.feedback || (cached.text || "").trim() || cached.scored
  );
  setShortReviewOpen(shouldOpenReview);

  updateShortAnswerActions(question);
}

function updateQuestionContext(question) {
  if (!elements.questionContext || !elements.questionContextTitle || !elements.questionContextList) {
    return;
  }
  const contextQuestions =
    question && question.type === "short" ? getShortContextQuestions(question) : [];
  if (!shouldShowQuestionContext(question, contextQuestions)) {
    elements.questionContextTitle.textContent = "";
    elements.questionContextList.innerHTML = "";
    elements.questionContext.classList.add("hidden");
    return;
  }
  elements.questionContextTitle.textContent = formatShortContextTitle(question, contextQuestions);
  elements.questionContextList.innerHTML = "";
  contextQuestions.forEach((entry) => {
    const line = formatShortContextLine(entry);
    if (!line) return;
    const listItem = document.createElement("li");
    const label = normalizeShortLabel(entry.label);
    if (label) {
      const badge = document.createElement("span");
      badge.textContent = `${label.toUpperCase()}.`;
      listItem.appendChild(badge);
      listItem.appendChild(document.createTextNode(" "));
    }
    listItem.appendChild(document.createTextNode(entry.text || entry.prompt || ""));
    elements.questionContextList.appendChild(listItem);
  });
  elements.questionContext.classList.remove("hidden");
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
    const showIntro = currentQuestion.type !== "short" && currentQuestion.opgaveIntro;
    elements.questionIntro.textContent = showIntro ? currentQuestion.opgaveIntro : "";
    elements.questionIntro.classList.toggle("hidden", !showIntro);
  }
  if (elements.questionSubtitle) {
    elements.questionSubtitle.textContent = "";
    elements.questionSubtitle.classList.add("hidden");
    elements.questionSubtitle.removeAttribute("data-label");
  }
  if (elements.questionText) {
    elements.questionText.classList.remove("has-subtitle");
  }
  updateQuestionContext(currentQuestion);
  updateQuestionFigure(currentQuestion);
  updateShortcutFigureIndicator(currentQuestion);
  setShortcutDisabled("grade", currentQuestion.type !== "short");
  updateQuestionHintUI(currentQuestion);
  queueFigureCaptionsForQuestions(currentQuestion);

  if (currentQuestion.type === "short") {
    renderShortQuestion(currentQuestion);
  } else {
    renderMcqQuestion(currentQuestion);
  }

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
      setShortFigureStatus(state.aiStatus.message || "Hjælp offline", true);
    }
    return "";
  }

  const promise = (async () => {
    try {
      const res = await apiFetch("/api/vision", {
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
      setShortFigureStatus(state.aiStatus.message || "Hjælp offline", true);
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
      gotAny ? "Figurbeskrivelse klar." : "Kunne ikke aflæse figuren.",
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

function canRecordAudio() {
  return Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
}

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
  for (const mimeType of AUDIO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return "";
}

function updateVoiceIndicator() {
  const isRecording = state.mic.isRecording;
  const isTranscribing = state.mic.isTranscribing;
  if (elements.shortAnswerInputWrap) {
    elements.shortAnswerInputWrap.classList.toggle("is-recording", isRecording);
    elements.shortAnswerInputWrap.classList.toggle("is-transcribing", isTranscribing);
  }
  if (!elements.transcribeIndicator) return;
  const shouldShow = isRecording || isTranscribing;
  elements.transcribeIndicator.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) return;
  elements.transcribeIndicator.dataset.state = isRecording ? "recording" : "transcribing";
  if (elements.transcribeText) {
    elements.transcribeText.textContent = isRecording ? "Optager …" : "Transkriberer …";
  }
}

function setMicRecording(isRecording) {
  state.mic.isRecording = Boolean(isRecording);
  if (elements.micBtn) {
    elements.micBtn.classList.toggle("is-recording", state.mic.isRecording);
    elements.micBtn.setAttribute("aria-pressed", String(state.mic.isRecording));
    const label = state.mic.isRecording ? "Stop optagelse (M)" : "Optag svar (M)";
    elements.micBtn.setAttribute("aria-label", label);
    elements.micBtn.title = label;
  }
  setShortcutActive("mic", state.mic.isRecording);
  updateVoiceIndicator();
}

function setTranscribing(isTranscribing) {
  state.mic.isTranscribing = Boolean(isTranscribing);
  setShortcutBusy("mic", state.mic.isTranscribing);
  updateVoiceIndicator();
}

function stopMicStream() {
  if (!state.mic.stream) return;
  state.mic.stream.getTracks().forEach((track) => track.stop());
  state.mic.stream = null;
}

function clearMicRecorder() {
  stopMicStream();
  state.mic.recorder = null;
  state.mic.chunks = [];
  state.mic.mimeType = "";
  state.mic.discardOnStop = false;
}

function updateMicControls(question) {
  if (!elements.micBtn) return;
  const isShort = question?.type === "short";
  elements.micBtn.classList.toggle("hidden", !isShort);
  if (!isShort) {
    elements.micBtn.disabled = true;
    setShortcutDisabled("mic", true);
    setShortcutStatus("mic", "");
    updateVoiceIndicator();
    return;
  }
  const supported = canRecordAudio();
  const aiReady = state.aiStatus.available;
  const isRecording = state.mic.isRecording;
  const isTranscribing = state.mic.isTranscribing;
  const shouldDisable =
    !supported ||
    (!aiReady && !isRecording) ||
    ((state.shortAnswerPending || state.locked || isTranscribing) && !isRecording);
  elements.micBtn.disabled = shouldDisable;
  setShortcutDisabled("mic", shouldDisable);
  let status = "";
  if (!supported) {
    status = "Ikke understøttet";
  } else if (!aiReady && !isRecording) {
    status = "Offline";
  } else if (isTranscribing) {
    status = "Transkriberer …";
  } else if (isRecording) {
    status = "Optager";
  }
  setShortcutStatus("mic", status);
  updateVoiceIndicator();
}

function stopMicRecording({ discard = false } = {}) {
  if (!state.mic.recorder || !state.mic.isRecording) return;
  state.mic.discardOnStop = Boolean(discard);
  try {
    state.mic.recorder.stop();
  } catch (error) {
    clearMicRecorder();
    setMicRecording(false);
  }
}

function cancelMicRecording() {
  if (state.mic.abortController) {
    state.mic.abortController.abort();
    state.mic.abortController = null;
  }
  state.mic.requestId += 1;
  setTranscribing(false);
  if (state.mic.isRecording) {
    stopMicRecording({ discard: true });
  } else {
    clearMicRecorder();
    setMicRecording(false);
  }
  updateMicControls(state.activeQuestions[state.currentIndex]);
}

function appendTranscription(text) {
  if (!elements.shortAnswerInput) return;
  const current = elements.shortAnswerInput.value.trim();
  const combined = current ? `${current}\n${text}` : text;
  elements.shortAnswerInput.value = combined;
  elements.shortAnswerInput.dispatchEvent(new Event("input", { bubbles: true }));
  elements.shortAnswerInput.focus();
  elements.shortAnswerInput.selectionStart = combined.length;
  elements.shortAnswerInput.selectionEnd = combined.length;
}

async function transcribeAudio(blob) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  if (!blob || !blob.size) {
    setFeedback("Ingen lyd optaget.", "error");
    return;
  }
  const requestId = state.mic.requestId + 1;
  state.mic.requestId = requestId;
  setTranscribing(true);
  updateMicControls(question);
  const controller = new AbortController();
  state.mic.abortController = controller;
  try {
    const audioData = await readFileAsDataUrl(blob);
    const res = await apiFetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioData, language: TRANSCRIBE_LANGUAGE }),
      signal: controller.signal,
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
    if (state.mic.requestId !== requestId) return;
    const text = String(data.text || "").trim();
    if (!text) {
      setFeedback("Kunne ikke høre noget i optagelsen.", "error");
      return;
    }
    appendTranscription(text);
  } catch (error) {
    if (error.name === "AbortError") return;
    setFeedback(
      `Kunne ikke transkribere lyd. ${error.message || "Tjek server og API-nøgle."}`,
      "error"
    );
  } finally {
    if (state.mic.requestId === requestId) {
      setTranscribing(false);
      updateMicControls(state.activeQuestions[state.currentIndex]);
    }
    if (state.mic.abortController === controller) {
      state.mic.abortController = null;
    }
  }
}

async function startMicRecording() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  if (state.mic.isRecording || state.mic.isTranscribing) return;
  if (!canRecordAudio()) {
    setFeedback("Mikrofon understøttes ikke i denne browser.", "error");
    return;
  }
  if (!state.aiStatus.available) {
    setFeedback(state.aiStatus.message || "Hjælp offline.", "error");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getPreferredAudioMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    state.mic.recorder = recorder;
    state.mic.stream = stream;
    state.mic.chunks = [];
    state.mic.mimeType = recorder.mimeType || mimeType || "";
    state.mic.discardOnStop = false;
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size) {
        state.mic.chunks.push(event.data);
      }
    });
    recorder.addEventListener("stop", () => {
      const chunks = state.mic.chunks.slice();
      const mime = state.mic.mimeType || "audio/webm";
      const discard = state.mic.discardOnStop;
      clearMicRecorder();
      setMicRecording(false);
      updateMicControls(state.activeQuestions[state.currentIndex]);
      if (discard) return;
      const blob = new Blob(chunks, { type: mime });
      void transcribeAudio(blob);
    });
    recorder.start();
    setMicRecording(true);
    updateMicControls(question);
  } catch (error) {
    setFeedback("Kunne ikke starte mikrofonen. Tjek tilladelserne.", "error");
    clearMicRecorder();
    setMicRecording(false);
  }
}

function toggleMicRecording() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") {
    setShortcutTempStatus("mic", "Kun kortsvar", 2000);
    return;
  }
  if (state.mic.isTranscribing) {
    setShortcutTempStatus("mic", "Transkriberer …", 1500);
    return;
  }
  if (state.mic.isRecording) {
    stopMicRecording();
    return;
  }
  void startMicRecording();
}

async function handleSketchUpload(file, { autoAnalyze = true } = {}) {
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
    setSketchRetryVisible(false);
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
    if (autoAnalyze) {
      void analyzeSketch();
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
  setSketchRetryVisible(false);
  if (!state.aiStatus.available) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = state.aiStatus.message || "Hjælp offline";
    }
    setSketchRetryVisible(true);
    return;
  }
  const upload = state.sketchUploads.get(question.key);
  if (!upload) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent = "Vælg en skitse først.";
    }
    return;
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
    const res = await apiFetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "sketch",
        imageData: upload.dataUrl,
        question: buildShortPrompt(question),
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
      elements.sketchStatus.textContent = "Skitse analyseret.";
    }
    setSketchRetryVisible(false);
    await gradeShortAnswer({ auto: true });
  } catch (error) {
    if (elements.sketchStatus) {
      elements.sketchStatus.textContent =
        `Kunne ikke analysere skitsen. ${error.message || "Tjek serveren."}`;
    }
    setSketchRetryVisible(true);
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
  setShortcutDisabled("next", false);
  setShortcutDisabled("skip", true);
  updateTopBar();
  maybeAutoAdvance();
}

function skipQuestion() {
  if (state.locked) return;
  stopTts();
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  if (question.type === "short") {
    if (state.mic.isRecording) {
      setFeedback("Stop optagelsen før du springer over.", "error");
      return;
    }
    if (state.mic.isTranscribing) {
      setFeedback("Transkriberer stadig – vent et øjeblik.", "error");
      return;
    }
  }
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
    setShortcutDisabled("next", false);
    setShortcutDisabled("skip", true);
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
  setShortcutDisabled("next", false);
  setShortcutDisabled("skip", true);
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

function getMcqCorrectOptionText(question) {
  if (!question || question.type !== "mcq") return "";
  const mapping = getOptionMapping(question);
  const correctOption = (mapping.options || []).find(
    (option) => option.label === mapping.correctLabel
  );
  return correctOption?.text || "";
}

function canGenerateHint(question) {
  if (!question) return false;
  if (question.type === "mcq") {
    return Boolean(getMcqCorrectOptionText(question));
  }
  const hasAnswer = Boolean(String(question.answer || "").trim());
  const hasFigure = getQuestionImagePaths(question).length > 0;
  return hasAnswer || hasFigure;
}

function getHintEntry(question) {
  if (!question) return null;
  return state.questionHints.get(question.key) || null;
}

function setHintEntry(question, entry) {
  if (!question) return;
  state.questionHints.set(question.key, entry);
}

function updateQuestionHintUI(question = state.activeQuestions[state.currentIndex]) {
  if (!elements.questionHint || !elements.questionHintText || !elements.questionHintStatus) {
    return;
  }
  if (!question) {
    elements.questionHint.classList.add("hidden");
    elements.questionHintText.classList.add("hidden");
    elements.questionHintText.textContent = "";
    elements.questionHintStatus.textContent = "";
    setShortcutActive("hint", false);
    setShortcutBusy("hint", false);
    setShortcutStatus("hint", "");
    setShortcutDisabled("hint", true);
    return;
  }
  const hintEntry = getHintEntry(question);
  const hasHint = Boolean(hintEntry?.text);
  const isVisible = Boolean(hintEntry?.visible);
  const isLoading = Boolean(hintEntry?.loading);
  const canHint = canGenerateHint(question);
  const available = state.aiStatus.available;

  if (!isVisible) {
    elements.questionHint.classList.add("hidden");
    elements.questionHintText.classList.add("hidden");
    elements.questionHintText.textContent = "";
    elements.questionHintStatus.textContent = "";
    setShortcutActive("hint", false);
    setShortcutBusy("hint", false);
    setShortcutStatus("hint", "");
    setShortcutDisabled("hint", false);
    return;
  }

  elements.questionHint.classList.remove("hidden");

  if (!available) {
    elements.questionHintStatus.textContent = state.aiStatus.message || "Hjælp offline";
  } else if (!canHint) {
    elements.questionHintStatus.textContent = "Ingen facit til hint.";
  } else if (isLoading) {
    elements.questionHintStatus.textContent = "Henter hint …";
  } else if (hasHint) {
    elements.questionHintStatus.textContent = "Hint klar";
  } else {
    elements.questionHintStatus.textContent = "Klar til hint";
  }

  setShortcutActive("hint", isVisible);
  setShortcutBusy("hint", isLoading);
  const hintStatus = isLoading
    ? "Henter …"
    : hasHint
    ? "Hint klar"
    : !available
    ? "Offline"
    : "Åben";
  setShortcutStatus("hint", hintStatus);
  setShortcutDisabled("hint", false);

  if (hasHint) {
    elements.questionHintText.textContent = hintEntry.text;
    elements.questionHintText.classList.remove("hidden");
  } else {
    elements.questionHintText.textContent = "";
    elements.questionHintText.classList.add("hidden");
  }
}

async function buildHintPayload(question) {
  if (!question) return null;
  if (question.type === "mcq") {
    const mapping = getOptionMapping(question);
    const optionsText = (mapping.options || [])
      .map((option) => `${option.label}. ${option.text}`)
      .join(" | ");
    const correctText = getMcqCorrectOptionText(question);
    return {
      question: `${question.text}\nMuligheder: ${optionsText}`,
      modelAnswer: correctText,
      userAnswer: "",
      maxPoints: 0,
      awardedPoints: 0,
      language: "da",
      ignoreSketch: false,
    };
  }
  const { answer, hasSketch } = buildShortAnswerForGrading(question);
  const modelAnswer = await resolveShortModelAnswer(question, {
    useSketch: requiresSketch(question),
  });
  return {
    question: buildShortPrompt(question),
    modelAnswer,
    userAnswer: answer,
    maxPoints: question.maxPoints || 0,
    awardedPoints: 0,
    language: "da",
    ignoreSketch: requiresSketch(question) && !hasSketch,
  };
}

async function toggleQuestionHint() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  const hintEntry = getHintEntry(question) || { text: "", visible: false, loading: false };
  if (hintEntry.visible) {
    if (hintEntry.loading) return;
    hintEntry.visible = false;
    hintEntry.loading = false;
    setHintEntry(question, hintEntry);
    updateQuestionHintUI(question);
    return;
  }

  const canHint = canGenerateHint(question);
  if (!state.aiStatus.available || !canHint) {
    hintEntry.visible = true;
    hintEntry.loading = false;
    setHintEntry(question, hintEntry);
    updateQuestionHintUI(question);
    return;
  }

  if (hintEntry.text) {
    hintEntry.visible = true;
    setHintEntry(question, hintEntry);
    updateQuestionHintUI(question);
    return;
  }

  hintEntry.loading = true;
  hintEntry.visible = true;
  setHintEntry(question, hintEntry);
  updateQuestionHintUI(question);

  const payload = await buildHintPayload(question);
  if (!payload || !payload.modelAnswer) {
    hintEntry.loading = false;
    hintEntry.visible = true;
    hintEntry.text = "Ingen facit til hint.";
    setHintEntry(question, hintEntry);
    updateQuestionHintUI(question);
    return;
  }

  try {
    const res = await apiFetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    const hint = String(data.hint || "").trim();
    hintEntry.text = hint || "Kunne ikke lave et hint.";
  } catch (error) {
    hintEntry.text = `Kunne ikke hente hint. ${error.message || "Tjek server og API-nøgle."}`;
  } finally {
    hintEntry.loading = false;
    hintEntry.visible = true;
    setHintEntry(question, hintEntry);
    updateQuestionHintUI(question);
  }
}

function setAiStatus(status) {
  state.aiStatus = {
    available: status.available,
    model: status.model || null,
    message: status.message || "",
  };

  if (elements.aiStatusPill) {
    const label = status.available
      ? "Assistent klar"
      : status.message || "Hjælp offline";
    elements.aiStatusPill.textContent = label;
    elements.aiStatusPill.classList.toggle("warn", !status.available);
  }
  if (elements.shortAnswerAiStatus) {
    const label = status.available
      ? "Hjælp klar"
      : status.message || "Hjælp offline";
    elements.shortAnswerAiStatus.textContent = label;
    elements.shortAnswerAiStatus.classList.toggle("warn", !status.available);
  }

  const current = state.activeQuestions[state.currentIndex];
  if (current && current.type === "short") {
    updateShortAnswerModel(current);
    updateSketchPanel(current);
    updateShortAnswerActions(current);
  }
  if (status.available && state.settings.autoFigureCaptions) {
    queueFigureCaptionsForQuestions(state.activeQuestions);
  }
  updateQuestionHintUI(current);
  updateMicControls(current);
}

function getTtsBaseLabel() {
  if (!state.ttsStatus.available) {
    return state.ttsStatus.message || "Oplæsning offline";
  }
  return "Oplæsning klar";
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

  setShortcutActive("tts", enabled);
  setShortcutBusy("tts", isLoading);
  if (!enabled) {
    setShortcutStatus("tts", "");
  } else if (!state.ttsStatus.available) {
    setShortcutStatus("tts", "Offline");
  } else if (isLoading) {
    setShortcutStatus("tts", "Genererer …");
  } else if (isPlaying) {
    setShortcutStatus("tts", "Afspiller");
  } else {
    setShortcutStatus("tts", "");
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

  const promise = apiFetch("/api/tts", {
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
        ? "Browseren blokerer auto-oplæsning. Klik \"Lyd\" eller tryk L for at starte."
        : "Browseren blokerer lyd. Klik \"Lyd\" eller tryk L igen.",
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
    const res = await apiFetch("/api/tts", {
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
          ? "Browseren blokerer auto-oplæsning. Klik \"Lyd\" eller tryk L for at starte."
          : "Browseren blokerer lyd. Klik \"Lyd\" eller tryk L igen.",
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
  scheduleUserStateSync();
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

function getShortDraft(questionKey) {
  return state.shortAnswerDrafts.get(questionKey) || { text: "", points: 0, scored: false };
}

function saveShortDraft(questionKey, data) {
  const current = getShortDraft(questionKey);
  state.shortAnswerDrafts.set(questionKey, { ...current, ...data });
}

function syncShortScoreInputs(value, options = {}) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const maxPoints = question.maxPoints || 0;
  const numeric = Number(clamp(Number(value) || 0, 0, maxPoints).toFixed(1));
  const scored = options.scored ?? true;
  elements.shortAnswerScoreRange.value = String(numeric);
  elements.shortAnswerScoreInput.value = String(numeric);
  saveShortDraft(question.key, {
    text: elements.shortAnswerInput.value,
    points: numeric,
    scored,
  });
  updateShortReviewStatus(question);
  updateShortAnswerActions(question);
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
  updateShortReviewStatus(question);
  updateShortAnswerActions(question);
}

function toggleFigure() {
  setFigureVisibility(!state.figureVisible);
}

async function gradeShortAnswer(options = {}) {
  const { auto = false } = options;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  setShortRetryVisible(false);
  if (!state.aiStatus.available) {
    elements.shortAnswerAiFeedback.textContent =
      state.aiStatus.message || "Auto-bedømmelse er ikke sat op endnu.";
    setShortcutTempStatus("grade", "Hjælp offline", 2000);
    setShortRetryVisible(true);
    return;
  }
  const { answer: combinedAnswer, hasSketch } = buildShortAnswerForGrading(question);
  if (!combinedAnswer) {
    const upload = state.sketchUploads.get(question.key);
    elements.shortAnswerAiFeedback.textContent = upload
      ? "Skitseanalyse mangler. Vent på analysen, eller skriv et svar."
      : "Skriv et svar eller upload en skitse først.";
    setShortcutTempStatus("grade", "Mangler svar", 2000);
    return;
  }

  setShortAnswerPending(true);
  const feedbackPrefix = hasSketch ? "Vurderer skitse + tekst …" : "Vurderer dit svar …";
  elements.shortAnswerAiFeedback.textContent = auto
    ? hasSketch
      ? "Auto-bedømmer skitse + tekst …"
      : "Auto-bedømmer dit svar …"
    : feedbackPrefix;

  const modelAnswer = await resolveShortModelAnswer(question, { useSketch: hasSketch });

  try {
    const res = await apiFetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: buildShortPrompt(question),
        modelAnswer,
        userAnswer: combinedAnswer,
        maxPoints: question.maxPoints || 0,
        sources: question.sources || [],
        language: "da",
        ignoreSketch: requiresSketch(question) && !hasSketch,
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
    const fallbackFeedback = hasSketch
      ? "Skitse vurderet. Justér point efter behov."
      : "Auto-vurdering klar. Justér point efter behov.";
    applyShortAnswerGradeResult(question, data, { fallbackFeedback });
    setShortRetryVisible(false);
  } catch (error) {
    elements.shortAnswerAiFeedback.textContent =
      `Kunne ikke hente auto-bedømmelse. ${error.message || "Tjek serveren og din API-nøgle."}`;
    setShortRetryVisible(true);
  } finally {
    setShortAnswerPending(false);
  }
}

function handleNextClick() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question) return;
  if (question.type === "short") {
    if (state.mic.isRecording) {
      setFeedback("Stop optagelsen før du går videre.", "error");
      return;
    }
    if (state.mic.isTranscribing) {
      setFeedback("Transkriberer stadig – vent et øjeblik.", "error");
      return;
    }
  }
  if (question.type === "short" && !state.locked) {
    if (state.shortAnswerPending) return;
    const { hasText, hasSketch, scored } = getShortAnswerState(question);
    const hasAnswer = hasText || hasSketch;
    if (!scored) {
      setShortReviewOpen(true);
      updateShortReviewStatus(question);
      updateShortAnswerActions(question);
      if (!hasAnswer) {
        setFeedback("Skriv et svar, upload en skitse eller brug Spring over i Mere.", "error");
        return;
      }
      if (state.aiStatus.available) {
        triggerShortAutoGrade();
      } else if (elements.shortAnswerAiFeedback) {
        elements.shortAnswerAiFeedback.textContent =
          "Giv point manuelt i vurderingen, eller spring over.";
      }
      return;
    }
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

function buildExplainPayload(entry, options = {}) {
  const expand = Boolean(options.expand);
  const previousExplanation = String(options.previousExplanation || "").trim();
  if (entry.type === "mcq") {
    const mapping = getOptionMapping(entry.question);
    return {
      type: "mcq",
      question: entry.question.text,
      options: mapping.options || [],
      correctLabel: mapping.correctLabel || entry.question.correctLabel,
      userLabel: entry.selected || "",
      skipped: entry.skipped,
      language: "da",
      expand: expand && Boolean(previousExplanation),
      previousExplanation,
    };
  }
  return {
    type: "short",
    question: entry.question.text,
    modelAnswer: getEffectiveModelAnswer(entry.question),
    userAnswer: entry.response || "",
    skipped: entry.skipped,
    maxPoints: entry.maxPoints,
    awardedPoints: entry.awardedPoints,
    language: "da",
    ignoreSketch: requiresSketch(entry.question),
    expand: expand && Boolean(previousExplanation),
    previousExplanation,
  };
}

function getExplainText(entry) {
  const base = String(entry.aiExplanation || "").trim();
  const expanded = String(entry.aiExplanationExpanded || "").trim();
  if (expanded) {
    if (base) return `${base}\n\nUddybning: ${expanded}`;
    return expanded;
  }
  return base;
}

function getHintText(entry) {
  const base = String(entry.aiHint || "").trim();
  const expanded = String(entry.aiHintExpanded || "").trim();
  if (expanded) {
    if (base) return `${base}\n\nUddybning: ${expanded}`;
    return expanded;
  }
  return base;
}

function updateExpandButton(entry, button) {
  if (!button) return;
  const hasBase = Boolean(entry.aiExplanation);
  const hasExpanded = Boolean(entry.aiExplanationExpanded);
  const hasAny = hasBase || hasExpanded;
  const isLoading = Boolean(entry.explainLoading || entry.explainExpanding);
  button.classList.toggle("hidden", !hasAny);
  button.textContent = hasExpanded ? "Forklaring udvidet" : "Udvid forklaring";
  if (!hasAny) {
    button.disabled = true;
    button.title = "";
    return;
  }
  if (hasExpanded) {
    button.disabled = true;
    button.title = "Forklaring er allerede udvidet.";
    return;
  }
  if (!state.aiStatus.available) {
    button.disabled = true;
    button.title = state.aiStatus.message || "Hjælp offline. Tjek server og API-nøgle.";
    return;
  }
  button.disabled = isLoading;
  button.title = "";
}

function updateExpandHintButton(entry, button) {
  if (!button) return;
  const hasBase = Boolean(entry.aiHint);
  const hasExpanded = Boolean(entry.aiHintExpanded);
  const hasAny = hasBase || hasExpanded;
  const isLoading = Boolean(entry.hintLoading || entry.hintExpanding);
  button.classList.toggle("hidden", !hasAny);
  button.textContent = hasExpanded ? "Hint udvidet" : "Udvid hint";
  if (!hasAny) {
    button.disabled = true;
    button.title = "";
    return;
  }
  if (hasExpanded) {
    button.disabled = true;
    button.title = "Hint er allerede udvidet.";
    return;
  }
  if (!state.aiStatus.available) {
    button.disabled = true;
    button.title = state.aiStatus.message || "Hjælp offline. Tjek server og API-nøgle.";
    return;
  }
  button.disabled = isLoading;
  button.title = "";
}

function toggleExplanationDisplay(entry, textEl, button, expandButton) {
  if (!entry.aiExplanation) return false;
  const isHidden = textEl.classList.contains("hidden");
  if (isHidden) {
    textEl.textContent = getExplainText(entry);
    textEl.classList.remove("hidden");
    button.textContent = "Skjul forklaring";
  } else {
    textEl.classList.add("hidden");
    button.textContent = "Få forklaring";
  }
  updateExpandButton(entry, expandButton);
  return true;
}

async function handleExplainClick(entry, textEl, button, expandButton) {
  if (toggleExplanationDisplay(entry, textEl, button, expandButton)) return;
  if (!state.aiStatus.available) {
    textEl.textContent = state.aiStatus.message || "Hjælp offline. Tjek server og API-nøgle.";
    textEl.classList.remove("hidden");
    updateExpandButton(entry, expandButton);
    return;
  }

  entry.explainLoading = true;
  button.disabled = true;
  button.textContent = "Henter forklaring …";
  textEl.textContent = "Henter forklaring …";
  textEl.classList.add("loading");
  textEl.classList.remove("hidden");
  updateExpandButton(entry, expandButton);

  try {
    const res = await apiFetch("/api/explain", {
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
    entry.aiExplanation = explanation || "Kunne ikke lave en forklaring.";
    textEl.textContent = getExplainText(entry);
    button.textContent = "Skjul forklaring";
    updateReviewIllustration(entry, { force: true });
  } catch (error) {
    textEl.textContent = `Kunne ikke hente forklaring. ${error.message || "Tjek server og API-nøgle."}`;
    button.textContent = "Prøv igen";
  } finally {
    entry.explainLoading = false;
    textEl.classList.remove("loading");
    button.disabled = !state.aiStatus.available && !entry.aiExplanation;
    updateExpandButton(entry, expandButton);
  }
}

async function handleExpandExplainClick(entry, textEl, button, explainButton) {
  if (!entry.aiExplanation) {
    updateExpandButton(entry, button);
    return;
  }
  if (entry.aiExplanationExpanded) {
    textEl.textContent = getExplainText(entry);
    textEl.classList.remove("hidden");
    if (explainButton) {
      explainButton.textContent = "Skjul forklaring";
    }
    updateExpandButton(entry, button);
    return;
  }
  if (!state.aiStatus.available) {
    textEl.textContent = state.aiStatus.message || "Hjælp offline. Tjek server og API-nøgle.";
    textEl.classList.remove("hidden");
    updateExpandButton(entry, button);
    return;
  }

  entry.explainExpanding = true;
  button.disabled = true;
  button.textContent = "Udvider …";
  if (explainButton) {
    explainButton.disabled = true;
  }
  textEl.textContent = "Udvider forklaring …";
  textEl.classList.add("loading");
  textEl.classList.remove("hidden");

  let success = false;
  try {
    const res = await apiFetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        buildExplainPayload(entry, {
          expand: true,
          previousExplanation: entry.aiExplanation || "",
        })
      ),
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
    entry.aiExplanationExpanded = explanation || "Kunne ikke udvide forklaringen.";
    textEl.textContent = getExplainText(entry);
    if (explainButton) {
      explainButton.textContent = "Skjul forklaring";
    }
    updateReviewIllustration(entry, { force: true });
    success = true;
  } catch (error) {
    textEl.textContent = `Kunne ikke udvide forklaringen. ${error.message || "Tjek server og API-nøgle."}`;
    button.textContent = "Prøv igen";
  } finally {
    entry.explainExpanding = false;
    textEl.classList.remove("loading");
    if (explainButton) {
      explainButton.disabled = !state.aiStatus.available && !entry.aiExplanation;
    }
    if (success) {
      updateExpandButton(entry, button);
    } else {
      button.disabled = !state.aiStatus.available;
      button.title = state.aiStatus.message || "";
    }
  }
}

function toggleHintDisplay(entry, textEl, button, expandButton) {
  if (!entry.aiHint && !entry.aiHintExpanded) return false;
  const isHidden = textEl.classList.contains("hidden");
  if (isHidden) {
    textEl.textContent = getHintText(entry);
    textEl.classList.remove("hidden");
    button.textContent = "Skjul hint";
  } else {
    textEl.classList.add("hidden");
    button.textContent = "Vis hint";
  }
  updateExpandHintButton(entry, expandButton);
  return true;
}

async function handleExpandHintClick(entry, textEl, button, hintButton) {
  if (!entry.aiHint) {
    updateExpandHintButton(entry, button);
    return;
  }
  if (entry.aiHintExpanded) {
    textEl.textContent = getHintText(entry);
    textEl.classList.remove("hidden");
    if (hintButton) {
      hintButton.textContent = "Skjul hint";
    }
    updateExpandHintButton(entry, button);
    return;
  }
  if (!state.aiStatus.available) {
    textEl.textContent = state.aiStatus.message || "Hjælp offline. Tjek server og API-nøgle.";
    textEl.classList.remove("hidden");
    updateExpandHintButton(entry, button);
    return;
  }

  entry.hintExpanding = true;
  button.disabled = true;
  button.textContent = "Udvider …";
  if (hintButton) {
    hintButton.disabled = true;
  }
  textEl.textContent = "Udvider hint …";
  textEl.classList.add("loading");
  textEl.classList.remove("hidden");

  let success = false;
  try {
    const modelAnswer = getEffectiveModelAnswer(entry.question);
    if (!modelAnswer) {
      throw new Error("Ingen facit til hint.");
    }
    const res = await apiFetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: entry.question.text,
        modelAnswer,
        userAnswer: entry.response || "",
        maxPoints: entry.maxPoints || 0,
        awardedPoints: entry.awardedPoints || 0,
        language: "da",
        ignoreSketch: requiresSketch(entry.question),
        expand: true,
        previousHint: entry.aiHint || "",
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
    const hint = String(data.hint || "").trim();
    entry.aiHintExpanded = hint || "Kunne ikke udvide hintet.";
    textEl.textContent = getHintText(entry);
    if (hintButton) {
      hintButton.textContent = "Skjul hint";
    }
    success = true;
  } catch (error) {
    textEl.textContent = `Kunne ikke udvide hintet. ${error.message || "Tjek server og API-nøgle."}`;
    button.textContent = "Prøv igen";
  } finally {
    entry.hintExpanding = false;
    textEl.classList.remove("loading");
    if (hintButton) {
      hintButton.disabled = !state.aiStatus.available;
    }
    if (success) {
      updateExpandHintButton(entry, button);
    } else {
      button.disabled = !state.aiStatus.available;
      button.title = state.aiStatus.message || "";
    }
  }
}

async function fetchReviewHint(entry, textEl, button, expandButton, { auto = false } = {}) {
  if (!state.aiStatus.available || entry.hintLoading) return;
  entry.hintLoading = true;
  textEl.textContent = auto ? "Henter hint …" : "Henter hint …";
  textEl.classList.add("loading");
  textEl.classList.remove("hidden");
  button.textContent = "Henter …";
  button.disabled = true;
  updateExpandHintButton(entry, expandButton);

  const modelAnswer = getEffectiveModelAnswer(entry.question);
  if (!modelAnswer) {
    entry.hintLoading = false;
    textEl.textContent = "Ingen facit til hint.";
    textEl.classList.remove("loading");
    button.textContent = "Vis hint";
    button.disabled = true;
    updateExpandHintButton(entry, expandButton);
    return;
  }

  try {
    const res = await apiFetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: entry.question.text,
        modelAnswer,
        userAnswer: entry.response || "",
        maxPoints: entry.maxPoints || 0,
        awardedPoints: entry.awardedPoints || 0,
        language: "da",
        ignoreSketch: requiresSketch(entry.question),
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
    const hint = String(data.hint || "").trim();
    entry.aiHint = hint || "Kunne ikke lave et hint.";
    textEl.textContent = getHintText(entry);
    textEl.classList.remove("loading");
    button.textContent = "Skjul hint";
    updateExpandHintButton(entry, expandButton);
  } catch (error) {
    textEl.textContent = `Kunne ikke hente hint. ${error.message || "Tjek server og API-nøgle."}`;
    textEl.classList.remove("loading");
    button.textContent = "Prøv igen";
  } finally {
    entry.hintLoading = false;
    button.disabled = !state.aiStatus.available;
    updateExpandHintButton(entry, expandButton);
  }
}

function enqueueReviewHint(entry, textEl, button, expandButton) {
  state.reviewHintQueue.push({ entry, textEl, button, expandButton });
}

function updateReviewQueueStatus(message) {
  if (!elements.reviewQueueStatus) return;
  elements.reviewQueueStatus.textContent = message;
}

async function processReviewHintQueue() {
  if (state.reviewHintProcessing || !state.reviewHintQueue.length) return;
  state.reviewHintProcessing = true;
  updateReviewQueueStatus("Henter hints …");
  while (state.reviewHintQueue.length) {
    const { entry, textEl, button, expandButton } = state.reviewHintQueue.shift();
    if (!entry.aiHint) {
      await fetchReviewHint(entry, textEl, button, expandButton, { auto: true });
    }
  }
  state.reviewHintProcessing = false;
  updateReviewQueueStatus("Hints klar");
}

function buildReviewQueue(results) {
  if (!elements.reviewQueue || !elements.reviewQueueList) return;
  elements.reviewQueueList.innerHTML = "";
  state.reviewHintQueue = [];
  state.reviewHintProcessing = false;

  const queueEntries = results.filter(
    (entry) =>
      entry.type === "short" && (entry.skipped || entry.awardedPoints < entry.maxPoints)
  );

  if (!queueEntries.length) {
    elements.reviewQueue.classList.add("hidden");
    updateReviewQueueStatus("Ingen kortsvar at gentage.");
    return;
  }

  elements.reviewQueue.classList.remove("hidden");
  updateReviewQueueStatus(
    state.aiStatus.available ? "Henter hints …" : "Hjælp offline"
  );

  queueEntries.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className = "queue-card";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${index + 1}. ${entry.question.text}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    const labelTag = entry.question.label ? entry.question.label.toUpperCase() : "";
    const numberTag = `Opg. ${entry.question.opgave}${labelTag}`;
    meta.textContent = `${entry.question.category} • ${entry.question.yearLabel} • ${numberTag}`;

    const sketchUpload = getSketchUpload(entry);

    const answerLine = document.createElement("div");
    answerLine.className = "answer-line";
    if (entry.skipped) {
      answerLine.textContent = "Dit svar: Sprunget over";
      answerLine.classList.add("muted");
    } else if (entry.response) {
      answerLine.textContent = `Dit svar: ${entry.response}`;
    } else if (sketchUpload) {
      answerLine.textContent = "Dit svar: (skitse uploadet)";
      answerLine.classList.add("muted");
    } else {
      answerLine.textContent = "Dit svar: (tomt)";
      answerLine.classList.add("muted");
    }

    const scoreLine = document.createElement("div");
    scoreLine.className = "answer-line";
    scoreLine.textContent = `Point: ${entry.awardedPoints.toFixed(1)} / ${entry.maxPoints.toFixed(1)}`;

    const actions = document.createElement("div");
    actions.className = "queue-actions";
    const hintBtn = document.createElement("button");
    hintBtn.type = "button";
    hintBtn.className = "btn ghost small";
    hintBtn.textContent = "Vis hint";
    const expandHintBtn = document.createElement("button");
    expandHintBtn.type = "button";
    expandHintBtn.className = "btn ghost small";
    updateExpandHintButton(entry, expandHintBtn);
    const modelAnswer = getEffectiveModelAnswer(entry.question);
    const canHint = Boolean(modelAnswer);
    hintBtn.disabled = !state.aiStatus.available || !canHint;
    if (!state.aiStatus.available) {
      hintBtn.title = state.aiStatus.message || "Hjælp offline. Start scripts/dev_server.py.";
    } else if (!canHint) {
      hintBtn.title = "Ingen facit til hint.";
    }
    const hintText = document.createElement("div");
    hintText.className = "queue-hint hidden";

    hintBtn.addEventListener("click", () => {
      if (toggleHintDisplay(entry, hintText, hintBtn, expandHintBtn)) return;
      void fetchReviewHint(entry, hintText, hintBtn, expandHintBtn);
    });
    expandHintBtn.addEventListener("click", () => {
      handleExpandHintClick(entry, hintText, expandHintBtn, hintBtn);
    });

    actions.appendChild(hintBtn);
    actions.appendChild(expandHintBtn);

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(answerLine);
    card.appendChild(scoreLine);
    const figureWrap = buildReviewFigure(entry);
    if (figureWrap) {
      card.appendChild(figureWrap);
    }
    const sketchWrap = buildReviewSketch(entry);
    if (sketchWrap) {
      card.appendChild(sketchWrap);
    }
    card.appendChild(actions);
    card.appendChild(hintText);
    elements.reviewQueueList.appendChild(card);

    if (state.aiStatus.available && canHint) {
      hintText.classList.remove("hidden");
      hintText.classList.add("loading");
      hintText.textContent = "Henter hint …";
      enqueueReviewHint(entry, hintText, hintBtn, expandHintBtn);
    } else {
      hintText.classList.remove("hidden");
      hintText.textContent = canHint ? "Hjælp offline. Tjek serveren." : "Ingen facit til hint.";
    }
  });

  if (state.aiStatus.available) {
    void processReviewHintQueue();
  }
}

function entryMatchesReviewFilter(entry) {
  if (entry.skipped) return state.reviewFilters.skipped;
  if (isReviewCorrect(entry)) return state.reviewFilters.correct;
  return state.reviewFilters.wrong;
}

function updateReviewFilterButtons() {
  if (elements.reviewFilterCorrect) {
    elements.reviewFilterCorrect.setAttribute(
      "aria-pressed",
      String(state.reviewFilters.correct)
    );
  }
  if (elements.reviewFilterWrong) {
    elements.reviewFilterWrong.setAttribute(
      "aria-pressed",
      String(state.reviewFilters.wrong)
    );
  }
  if (elements.reviewFilterSkipped) {
    elements.reviewFilterSkipped.setAttribute(
      "aria-pressed",
      String(state.reviewFilters.skipped)
    );
  }
}

function toggleReviewFilter(key) {
  const next = { ...state.reviewFilters, [key]: !state.reviewFilters[key] };
  if (!next.correct && !next.wrong && !next.skipped) return;
  state.reviewFilters = next;
  updateReviewFilterButtons();
  buildReviewList(state.results);
}

function shouldShowReviewExplanation(entry) {
  if (entry.skipped) return true;
  if (entry.type === "mcq") {
    return !entry.isCorrect || state.reviewFilters.correct;
  }
  if (entry.awardedPoints >= entry.maxPoints) {
    return state.reviewFilters.correct;
  }
  return true;
}

function shouldShowReviewIllustration(entry) {
  if (entry?.question?.images?.length) return false;
  if (entry.skipped) return true;
  if (entry.type === "mcq") {
    return !entry.isCorrect || state.reviewFilters.correct;
  }
  if (entry.awardedPoints >= entry.maxPoints) {
    return state.reviewFilters.correct;
  }
  return true;
}

function getSketchUpload(entry) {
  if (!entry?.question?.key) return null;
  return state.sketchUploads.get(entry.question.key) || null;
}

function updateReviewIllustration(entry, { force = false } = {}) {
  const nodes = entry.bookIllustrationNodes;
  if (!nodes) return false;
  if (!state.bookCaptionIndex.length) {
    nodes.status.textContent = "Ingen billedbibliotek indlæst.";
    nodes.button.disabled = true;
    return false;
  }
  if (!entry.bookIllustration || force) {
    entry.bookIllustration = findBestBookIllustration(entry);
  }
  if (!entry.bookIllustration) {
    nodes.status.textContent = "Ingen illustration fundet endnu.";
    nodes.button.textContent = "Find illustration";
    nodes.button.disabled = false;
    nodes.body.classList.add("hidden");
    return false;
  }
  const { path, summary, focus, imageType, keywords } = entry.bookIllustration;
  nodes.img.src = path;
  nodes.img.alt = summary || focus || "Illustration";
  nodes.caption.textContent = summary || focus || "Illustration";
  nodes.meta.textContent = [imageType, focus].filter(Boolean).join(" · ");
  const tagText = Array.isArray(keywords) ? keywords.slice(0, 6).join(" · ") : "";
  if (tagText) {
    nodes.tags.textContent = tagText;
    nodes.tags.classList.remove("hidden");
  } else {
    nodes.tags.textContent = "";
    nodes.tags.classList.add("hidden");
  }
  nodes.status.textContent = "Match fundet";
  nodes.button.textContent = nodes.body.classList.contains("hidden")
    ? "Vis illustration"
    : "Skjul illustration";
  nodes.button.disabled = false;
  return true;
}

function buildReviewFigure(entry) {
  const images = getQuestionImagePaths(entry.question);
  if (!images.length) return null;

  const wrap = document.createElement("div");
  wrap.className = "review-figure";

  const head = document.createElement("div");
  head.className = "review-figure-head";

  const title = document.createElement("span");
  title.textContent = images.length > 1 ? "Figurer" : "Figur";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost small";
  button.textContent = images.length > 1 ? "Vis figurer" : "Vis figur";

  const body = document.createElement("div");
  body.className = "review-figure-body hidden";

  const grid = document.createElement("div");
  grid.className = "review-figure-grid";

  images.forEach((src, index) => {
    const figure = document.createElement("figure");
    figure.className = "review-figure-item";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = src;
    img.alt = `Figur ${index + 1} til ${entry.question.category}`;
    img.title = "Klik for at forstørre";

    const captionText = getFigureCaptionForImage(src);
    img.addEventListener("click", () => {
      const titleText = images.length > 1 ? `Figur ${index + 1}` : "Figur";
      openFigureModal({
        src,
        alt: img.alt,
        caption: captionText,
        title: titleText,
      });
    });

    figure.appendChild(img);

    if (captionText) {
      const caption = document.createElement("div");
      caption.className = "review-figure-caption";
      caption.textContent = captionText;
      figure.appendChild(caption);
    }

    const note = document.createElement("div");
    note.className = "review-figure-note";
    note.textContent = "Klik for at forstørre";
    figure.appendChild(note);

    grid.appendChild(figure);
  });

  body.appendChild(grid);
  head.appendChild(title);
  head.appendChild(button);
  wrap.appendChild(head);
  wrap.appendChild(body);

  button.addEventListener("click", () => {
    const isHidden = body.classList.contains("hidden");
    body.classList.toggle("hidden", !isHidden);
    button.textContent = isHidden
      ? images.length > 1
        ? "Skjul figurer"
        : "Skjul figur"
      : images.length > 1
      ? "Vis figurer"
      : "Vis figur";
  });

  return wrap;
}

function buildReviewSketch(entry) {
  const upload = getSketchUpload(entry);
  if (!upload?.dataUrl) return null;

  const wrap = document.createElement("div");
  wrap.className = "review-figure review-sketch";

  const head = document.createElement("div");
  head.className = "review-figure-head";

  const title = document.createElement("span");
  title.textContent = "Din skitse";

  const body = document.createElement("div");
  body.className = "review-figure-body";

  const grid = document.createElement("div");
  grid.className = "review-figure-grid";

  const figure = document.createElement("figure");
  figure.className = "review-figure-item";

  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = upload.dataUrl;
  img.alt = `Skitse til ${entry.question.category}`;
  img.title = "Klik for at forstørre";

  img.addEventListener("click", () => {
    openFigureModal({
      src: upload.dataUrl,
      alt: img.alt,
      caption: upload.label || "",
      title: "Din skitse",
    });
  });

  figure.appendChild(img);

  if (upload.label) {
    const caption = document.createElement("div");
    caption.className = "review-figure-caption";
    caption.textContent = upload.label;
    figure.appendChild(caption);
  }

  const note = document.createElement("div");
  note.className = "review-figure-note";
  note.textContent = "Klik for at forstørre";
  figure.appendChild(note);

  grid.appendChild(figure);
  body.appendChild(grid);
  head.appendChild(title);
  wrap.appendChild(head);
  wrap.appendChild(body);

  return wrap;
}

function buildReviewIllustration(entry) {
  const wrap = document.createElement("div");
  wrap.className = "review-illustration";

  const head = document.createElement("div");
  head.className = "review-illustration-head";

  const headLeft = document.createElement("div");
  headLeft.className = "review-illustration-head-left";

  const title = document.createElement("span");
  title.className = "review-illustration-title";
  title.textContent = "Illustration";

  const status = document.createElement("span");
  status.className = "review-illustration-status";
  status.textContent = state.bookCaptionIndex.length
    ? "Matcher mod bogbilleder"
    : "Billedbibliotek mangler";

  headLeft.appendChild(title);
  headLeft.appendChild(status);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn ghost small";
  button.textContent = "Find illustration";

  const body = document.createElement("div");
  body.className = "review-illustration-body hidden";

  const img = document.createElement("img");
  img.loading = "lazy";

  const caption = document.createElement("div");
  caption.className = "review-illustration-caption";

  const meta = document.createElement("div");
  meta.className = "review-illustration-meta";

  const tags = document.createElement("div");
  tags.className = "review-illustration-tags hidden";

  body.appendChild(img);
  body.appendChild(caption);
  body.appendChild(meta);
  body.appendChild(tags);

  head.appendChild(headLeft);
  head.appendChild(button);

  wrap.appendChild(head);
  wrap.appendChild(body);

  entry.bookIllustrationNodes = {
    wrap,
    body,
    img,
    caption,
    meta,
    tags,
    button,
    status,
  };

  updateReviewIllustration(entry);

  button.addEventListener("click", () => {
    if (!entry.bookIllustration) {
      const found = updateReviewIllustration(entry, { force: true });
      if (!found) return;
    }
    const isHidden = body.classList.contains("hidden");
    if (isHidden) {
      body.classList.remove("hidden");
      button.textContent = "Skjul illustration";
    } else {
      body.classList.add("hidden");
      button.textContent = "Vis illustration";
    }
  });

  return wrap;
}

function buildReviewList(results) {
  elements.reviewList.innerHTML = "";
  updateReviewFilterButtons();
  const filtered = results.filter((entry) => entryMatchesReviewFilter(entry));
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "review-empty";
    empty.textContent = "Ingen svar matcher filteret.";
    elements.reviewList.appendChild(empty);
    return;
  }
  let displayIndex = 0;
  results.forEach((entry) => {
    if (!entryMatchesReviewFilter(entry)) return;
    displayIndex += 1;
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

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${displayIndex}. ${entry.question.text}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    const labelTag = entry.question.label ? entry.question.label.toUpperCase() : "";
    const numberTag = isShort ? `Opg. ${entry.question.opgave}${labelTag}` : `#${entry.question.number}`;
    const typeLabel = isShort ? "Kortsvar" : "MCQ";
    meta.textContent = `${entry.question.category} • ${entry.question.yearLabel} • ${numberTag} • ${typeLabel}`;

    const lines = [];
    const sketchUpload = getSketchUpload(entry);

    if (isShort) {
      const responseLine = document.createElement("div");
      responseLine.className = "answer-line";
      if (entry.skipped) {
        responseLine.textContent = "Dit svar: Sprunget over";
        responseLine.classList.add("muted");
      } else if (entry.response) {
        responseLine.textContent = `Dit svar: ${entry.response}`;
      } else if (sketchUpload) {
        responseLine.textContent = "Dit svar: (skitse uploadet)";
        responseLine.classList.add("muted");
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

      const modelAnswer = getEffectiveModelAnswer(entry.question);
      if (modelAnswer) {
        const modelLine = document.createElement("div");
        modelLine.className = "answer-line";
        modelLine.textContent = `Facit: ${modelAnswer}`;
        lines.push(modelLine);
      }

      if (entry.ai?.feedback) {
        const aiLine = document.createElement("div");
        aiLine.className = "answer-line muted";
        aiLine.textContent = `Vurdering: ${entry.ai.feedback}`;
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

    const figureWrap = buildReviewFigure(entry);
    if (figureWrap) {
      card.appendChild(figureWrap);
    }
    const sketchWrap = buildReviewSketch(entry);
    if (sketchWrap) {
      card.appendChild(sketchWrap);
    }

    if (shouldShowReviewExplanation(entry)) {
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
        explainBtn.title = state.aiStatus.message || "Hjælp offline. Start scripts/dev_server.py.";
      }

      const expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.className = "btn ghost small";
      updateExpandButton(entry, expandBtn);

      const explainStatus = document.createElement("span");
      explainStatus.className = "review-explain-status";
      explainStatus.textContent = state.aiStatus.available ? "Forklaring" : "Hjælp offline";

      const explainText = document.createElement("div");
      explainText.className = "review-explain-text";
      if (entry.aiExplanation || entry.aiExplanationExpanded) {
        explainText.textContent = getExplainText(entry);
      } else {
        explainText.classList.add("hidden");
      }

      explainBtn.addEventListener("click", () => {
        handleExplainClick(entry, explainText, explainBtn, expandBtn);
      });
      expandBtn.addEventListener("click", () => {
        handleExpandExplainClick(entry, explainText, expandBtn, explainBtn);
      });

      explainActions.appendChild(explainBtn);
      explainActions.appendChild(expandBtn);
      explainActions.appendChild(explainStatus);
      explainWrap.appendChild(explainActions);
      explainWrap.appendChild(explainText);
      card.appendChild(explainWrap);
    }

    if (state.bookCaptionIndex.length && shouldShowReviewIllustration(entry)) {
      entry.bookIllustration = findBestBookIllustration(entry);
      if (entry.bookIllustration) {
        card.appendChild(buildReviewIllustration(entry));
      }
    } else {
      entry.bookIllustration = null;
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
  if (elements.playAgainBtn) {
    elements.playAgainBtn.textContent = state.lastMistakeKeys.size ? "Gentag fejl" : "Spil igen";
  }
  if (elements.restartRoundBtn) {
    elements.restartRoundBtn.classList.toggle("hidden", !state.lastMistakeKeys.size);
  }

  state.activeQuestions.forEach((question) => state.seenKeys.add(question.key));
  localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
  scheduleUserStateSync();

  buildReviewQueue(state.results);
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

function pickFromPoolCore(pool, count) {
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

function pickFromPool(pool, count) {
  if (count <= 0) return [];
  const preferUnseen = Boolean(
    state.sessionSettings.preferUnseen && !state.sessionSettings.avoidRepeats
  );
  if (!preferUnseen) return pickFromPoolCore(pool, count);
  const unseen = pool.filter((q) => !state.seenKeys.has(q.key));
  const seenPool = pool.filter((q) => state.seenKeys.has(q.key));
  if (!unseen.length || !seenPool.length) return pickFromPoolCore(pool, count);
  const desiredUnseen = Math.max(1, Math.round(count * PREFER_UNSEEN_SHARE));
  let unseenTarget = Math.min(unseen.length, desiredUnseen);
  let seenTarget = Math.min(seenPool.length, count - unseenTarget);
  const remaining = count - unseenTarget - seenTarget;
  if (remaining > 0) {
    const extraUnseen = Math.min(unseen.length - unseenTarget, remaining);
    unseenTarget += extraUnseen;
    const leftover = remaining - extraUnseen;
    if (leftover > 0) {
      seenTarget += Math.min(seenPool.length - seenTarget, leftover);
    }
  }
  const pickedUnseen = pickFromPoolCore(unseen, unseenTarget);
  const pickedSeen = pickFromPoolCore(seenPool, seenTarget);
  const combined = pickedUnseen.concat(pickedSeen);
  return state.sessionSettings.shuffleQuestions ? shuffle(combined) : sortQuestions(combined);
}

function getMcqGroupKey(question) {
  if (!question || question.type !== "mcq") return null;
  return question.duplicateGroup || question.key;
}

function getUniqueMcqGroupCount(pool) {
  const groups = new Set();
  pool.forEach((question) => {
    if (question.type !== "mcq") return;
    const key = getMcqGroupKey(question);
    if (key) groups.add(key);
  });
  return groups.size;
}

function filterUniqueMcqGroups(questions, usedGroups) {
  const filtered = [];
  questions.forEach((question) => {
    if (!question || question.type !== "mcq") return;
    const key = getMcqGroupKey(question);
    if (!key || usedGroups.has(key)) return;
    usedGroups.add(key);
    filtered.push(question);
  });
  return filtered;
}

function pickMcqFromPool(pool, count) {
  if (count <= 0) return [];
  const target = Math.min(count, getUniqueMcqGroupCount(pool));
  if (target <= 0) return [];
  const usedGroups = new Set();
  let selected = filterUniqueMcqGroups(pickFromPool(pool, target), usedGroups);
  let remaining = pool.filter((question) => !usedGroups.has(getMcqGroupKey(question)));
  let guard = 0;
  while (selected.length < target && remaining.length && guard < 6) {
    const needed = target - selected.length;
    const fill = filterUniqueMcqGroups(pickFromPool(remaining, needed), usedGroups);
    if (!fill.length) break;
    selected = selected.concat(fill);
    remaining = remaining.filter((question) => !usedGroups.has(getMcqGroupKey(question)));
    guard += 1;
  }
  return selected;
}

function fillSelectionAvoidingMcqDuplicates(pool, selected, desiredTotal) {
  if (selected.length >= desiredTotal) return selected;
  const usedGroups = new Set();
  selected.forEach((question) => {
    if (question.type !== "mcq") return;
    const key = getMcqGroupKey(question);
    if (key) usedGroups.add(key);
  });
  let remaining = pool.filter((question) => !selected.includes(question));
  remaining = remaining.filter((question) => {
    if (question.type !== "mcq") return true;
    const key = getMcqGroupKey(question);
    if (!key) return true;
    return !usedGroups.has(key);
  });

  let output = [...selected];
  let guard = 0;
  while (output.length < desiredTotal && remaining.length && guard < 6) {
    const needed = desiredTotal - output.length;
    const fill = pickFromPool(remaining, needed);
    const filteredFill = [];
    fill.forEach((question) => {
      if (question.type === "mcq") {
        const key = getMcqGroupKey(question);
        if (!key || usedGroups.has(key)) return;
        usedGroups.add(key);
      }
      filteredFill.push(question);
    });
    if (!filteredFill.length) break;
    output = output.concat(filteredFill);
    remaining = remaining.filter((question) => {
      if (output.includes(question)) return false;
      if (question.type !== "mcq") return true;
      return !usedGroups.has(getMcqGroupKey(question));
    });
    guard += 1;
  }
  return output;
}

function buildQuestionSet(pool) {
  const baseCount = Math.min(state.sessionSettings.questionCount, pool.length);
  if (baseCount <= 0) return [];

  const includeMcq = state.sessionSettings.includeMcq;
  const includeShort = state.sessionSettings.includeShort;

  if (includeMcq && includeShort) {
    const mcqPool = pool.filter((q) => q.type === "mcq");
    const shortPool = pool.filter((q) => q.type === "short");
    if (!mcqPool.length && shortPool.length) {
      return pickFromPool(shortPool, baseCount);
    }
    if (!shortPool.length && mcqPool.length) {
      const uniqueMcqCount = getUniqueMcqGroupCount(mcqPool);
      const mcqTarget = Math.min(baseCount, uniqueMcqCount);
      return pickMcqFromPool(mcqPool, mcqTarget);
    }
    const uniqueMcqCount = getUniqueMcqGroupCount(mcqPool);
    let mcqTarget = Math.min(state.sessionSettings.questionCount, uniqueMcqCount);
    let shortTarget = getShortTargetFromRatio(
      mcqTarget,
      shortPool.length,
      state.sessionSettings
    );

    let selectedShort = pickFromPool(shortPool, shortTarget);
    let selectedMcq = pickMcqFromPool(mcqPool, mcqTarget);

    let selected = [...selectedShort, ...selectedMcq];
    const desiredTotal = mcqTarget + shortTarget;
    if (selected.length < desiredTotal) {
      selected = fillSelectionAvoidingMcqDuplicates(pool, selected, desiredTotal);
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
    const mcqPool = pool.filter((q) => q.type === "mcq");
    const uniqueMcqCount = getUniqueMcqGroupCount(mcqPool);
    const mcqTarget = Math.min(baseCount, uniqueMcqCount);
    return pickMcqFromPool(mcqPool, mcqTarget);
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

function resolvePool(options = {}) {
  const { forceMistakes = false, ignoreFocusMistakes = false } = options;
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
  if (
    (forceMistakes || (state.settings.focusMistakes && !ignoreFocusMistakes)) &&
    state.lastMistakeKeys.size
  ) {
    const mistakePool = basePool.filter((question) => state.lastMistakeKeys.has(question.key));
    if (mistakePool.length) {
      pool = mistakePool;
      focusMistakesActive = true;
    }
  }

  if (state.settings.avoidRepeats && !focusMistakesActive) {
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
  let mcqTarget = 0;
  let shortTarget = 0;
  if (state.settings.includeMcq && state.settings.includeShort) {
    mcqTarget = Math.min(state.settings.questionCount, mcqPoolCount);
    if (!mcqTarget && shortPoolCount) {
      shortTarget = Math.min(state.settings.questionCount, shortPoolCount);
    } else if (!shortPoolCount && mcqPoolCount) {
      shortTarget = 0;
    } else {
      shortTarget = getShortTargetFromRatio(mcqTarget, shortPoolCount, state.settings);
    }
    roundSize = mcqTarget + shortTarget;
  }
  const poolMcq = mcqPoolCount;
  const poolShort = shortPoolCount;

  elements.poolCount.textContent = pool.length;
  elements.poolCountChip.textContent = `${pool.length} i puljen · ${poolMcq} MCQ · ${poolShort} kortsvar`;
  const isInfinite = state.settings.infiniteMode;
  let roundLabel = String(roundSize);
  if (state.settings.includeMcq && state.settings.includeShort && roundSize > 0) {
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
  if (state.settings.preferUnseen) mixParts.push("Nye først");
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
  if (state.settings.preferUnseen && !state.settings.avoidRepeats) {
    repeatParts.push("Nye først");
  }
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
  setShortcutActive("focus", state.sessionSettings.focusMode);
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

function startGame(options = {}) {
  if (!requireAuthGuard("Log ind for at starte en runde.", { allowDemo: true })) return;
  const { pool, focusMistakesActive } = resolvePool(options);
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
  state.shortAnswerDrafts = new Map();
  state.shortAnswerAI = new Map();
  state.shortAnswerPending = false;
  state.reviewHintQueue = [];
  state.reviewHintProcessing = false;
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

function handlePlayAgainClick() {
  if (state.lastMistakeKeys.size) {
    startGame({ forceMistakes: true });
    return;
  }
  startGame();
}

function handleRestartRoundClick() {
  startGame({ ignoreFocusMistakes: true });
}

function showRules() {
  elements.modal.classList.remove("hidden");
}

function hideRules() {
  elements.modal.classList.add("hidden");
}

function openFigureModal({ src, alt, caption, title } = {}) {
  if (!elements.figureModal || !elements.figureModalImg) return;
  elements.figureModalImg.src = src || "";
  elements.figureModalImg.alt = alt || "Figur";
  if (elements.figureModalTitle) {
    elements.figureModalTitle.textContent = title || "Figur";
  }
  if (elements.figureModalCaption) {
    const text = String(caption || "").trim();
    elements.figureModalCaption.textContent = text;
    elements.figureModalCaption.classList.toggle("hidden", !text);
  }
  elements.figureModal.classList.remove("hidden");
}

function closeFigureModal() {
  if (!elements.figureModal || elements.figureModal.classList.contains("hidden")) return;
  elements.figureModal.classList.add("hidden");
  if (elements.figureModalImg) {
    elements.figureModalImg.src = "";
    elements.figureModalImg.alt = "";
  }
  if (elements.figureModalCaption) {
    elements.figureModalCaption.textContent = "";
  }
}

function goToMenu() {
  clearAutoAdvance();
  stopTts();
  clearTtsPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
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
  if (!state.isApplyingPreset) {
    clearPresetSelection();
  }
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
  if (!state.isApplyingPreset) {
    clearPresetSelection();
  }
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
  try {
    if (!state.backendAvailable) {
      const offlineMessage =
        state.configError || "Backend offline. Tjek /api/config og Vercel env.";
      setAiStatus({
        available: false,
        model: null,
        message: offlineMessage,
      });
      setTtsStatus({
        available: false,
        model: null,
        message: offlineMessage,
      });
      return;
    }
    if (!state.session?.user) {
      const message = state.demoMode
        ? "Demo mode – log ind for AI."
        : "Log ind for at bruge AI.";
      setAiStatus({
        available: false,
        model: null,
        message,
      });
      setTtsStatus({
        available: false,
        model: null,
        message,
      });
      return;
    }

    const res = await apiFetch("/api/health");
    if (!res.ok) {
      let aiMessage = "Hjælp offline. Tjek serveren.";
      let ttsMessage = "Oplæsning offline. Tjek serveren.";
      if (res.status === 401) {
        aiMessage = "Log ind for at bruge AI.";
        ttsMessage = "Log ind for oplæsning.";
      } else if (res.status === 402) {
        aiMessage = "Kræver adgang eller egen API-nøgle.";
        ttsMessage = "Kræver adgang eller egen API-nøgle.";
      } else if (res.status === 503) {
        aiMessage = "Mangler OpenAI nøgle på serveren.";
        ttsMessage = "Mangler OpenAI nøgle på serveren.";
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
      message: "Hjælp offline. Tjek server og netværk.",
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
  if (!state.isApplyingPreset) {
    clearPresetSelection();
  }
  updateSummary();
}

function setTtsEnabled(enabled) {
  const next = Boolean(enabled);
  state.settings.ttsEnabled = next;
  saveSettings();
  if (elements.toggleTts) {
    elements.toggleTts.checked = next;
  }
  setShortcutActive("tts", next);
  setShortcutTempStatus("tts", next ? "Lyd slået til" : "Lyd slået fra");
  applyTtsVisibility();
  if (next) {
    maybeAutoReadQuestion();
    scheduleTtsPrefetch();
  }
}

function toggleTtsEnabled() {
  setTtsEnabled(!state.settings.ttsEnabled);
}

function toggleFocusMode() {
  state.sessionSettings.focusMode = !state.sessionSettings.focusMode;
  applySessionDisplaySettings();
  setShortcutTempStatus("focus", state.sessionSettings.focusMode ? "Fokus til" : "Fokus fra");
}

function triggerShortAutoGrade() {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") {
    setShortcutTempStatus("grade", "Kun kortsvar", 2000);
    return;
  }
  setShortRetryVisible(false);
  setShortReviewOpen(true);
  updateShortReviewStatus(question);
  if (state.shortAnswerPending) {
    setShortcutTempStatus("grade", "Vurderer …", 1500);
    return;
  }
  const upload = state.sketchUploads.get(question.key);
  const analysis = state.sketchAnalysis.get(question.key);
  if (upload && !analysis) {
    void analyzeSketch();
    return;
  }
  void gradeShortAnswer({ auto: true });
}

function performShortcutAction(action) {
  const question = state.activeQuestions[state.currentIndex];
  let acted = false;
  if (action === "next") {
    if (!elements.nextBtn?.disabled) {
      handleNextClick();
      acted = true;
    } else {
      setShortcutTempStatus("next", "Mangler svar", 1500);
    }
  } else if (action === "skip") {
    if (!elements.skipBtn?.disabled) {
      skipQuestion();
      acted = true;
    } else {
      setShortcutTempStatus("skip", "Ikke nu", 1500);
    }
  } else if (action === "grade") {
    triggerShortAutoGrade();
    acted = true;
  } else if (action === "mic") {
    toggleMicRecording();
    acted = true;
  } else if (action === "figure") {
    if (question?.images?.length) {
      toggleFigure();
      acted = true;
    } else {
      setShortcutTempStatus("figure", "Ingen figur", 1500);
    }
  } else if (action === "hint") {
    void toggleQuestionHint();
    acted = true;
  } else if (action === "tts") {
    toggleTtsEnabled();
    acted = true;
  } else if (action === "focus") {
    toggleFocusMode();
    acted = true;
  }
  if (acted) {
    flashShortcut(action);
  }
}

function handleKeyDown(event) {
  if (!screens.quiz.classList.contains("active")) return;
  if (elements.modal && !elements.modal.classList.contains("hidden")) return;
  const key = event.key.toLowerCase();
  const tag = document.activeElement?.tagName;
  const isTyping = tag === "INPUT" || tag === "TEXTAREA";
  if (isTyping && !(key === "m" && state.mic.isRecording)) return;
  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (key === "a" || key === "b" || key === "c" || key === "d") {
    if (currentQuestion?.type === "mcq") {
      handleMcqAnswer(key.toUpperCase());
    }
    return;
  }
  const actionMap = {
    n: "next",
    k: "skip",
    v: "grade",
    m: "mic",
    g: "figure",
    h: "hint",
    l: "tts",
    f: "focus",
  };
  const action = actionMap[key];
  if (!action) return;
  event.preventDefault();
  performShortcutAction(action);
}

function attachEvents() {
  if (elements.landingStartBtn) {
    elements.landingStartBtn.addEventListener("click", () => {
      if (!requireAuthGuard("Log ind for at fortsætte.", { allowDemo: true })) return;
      showScreen("menu");
    });
  }
  if (elements.landingQuickBtn) {
    elements.landingQuickBtn.addEventListener("click", startGame);
  }
  if (elements.authGoogleBtn) {
    elements.authGoogleBtn.addEventListener("click", () =>
      signInWithProvider(AUTH_PROVIDERS.google)
    );
  }
  if (elements.authAppleBtn) {
    elements.authAppleBtn.addEventListener("click", () =>
      signInWithProvider(AUTH_PROVIDERS.apple)
    );
  }
  if (elements.authEmailBtn) {
    elements.authEmailBtn.addEventListener("click", signInWithEmail);
  }
  if (elements.authEmailInput) {
    elements.authEmailInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        signInWithEmail();
      }
    });
  }
  if (elements.authDemoBtn) {
    elements.authDemoBtn.addEventListener("click", enableDemoMode);
  }
  if (elements.accountBtn) {
    elements.accountBtn.addEventListener("click", () => {
      if (!requireAuthGuard()) return;
      showScreen("account");
    });
  }
  if (elements.accountBackBtn) {
    elements.accountBackBtn.addEventListener("click", () =>
      showScreen(state.lastAppScreen || "menu")
    );
  }
  if (elements.profileSaveBtn) {
    elements.profileSaveBtn.addEventListener("click", handleProfileSave);
  }
  if (elements.upgradeBtn) {
    elements.upgradeBtn.addEventListener("click", handleCheckout);
  }
  if (elements.portalBtn) {
    elements.portalBtn.addEventListener("click", handlePortal);
  }
  if (elements.ownKeyToggle) {
    elements.ownKeyToggle.addEventListener("change", (event) =>
      setOwnKeyEnabled(event.target.checked)
    );
  }
  if (elements.ownKeySaveBtn) {
    elements.ownKeySaveBtn.addEventListener("click", saveOwnKey);
  }
  if (elements.ownKeyClearBtn) {
    elements.ownKeyClearBtn.addEventListener("click", clearOwnKey);
  }
  if (elements.consentSaveBtn) {
    elements.consentSaveBtn.addEventListener("click", handleConsentSave);
  }
  if (elements.exportDataBtn) {
    elements.exportDataBtn.addEventListener("click", handleExportData);
  }
  if (elements.deleteAccountBtn) {
    elements.deleteAccountBtn.addEventListener("click", handleDeleteAccount);
  }
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", handleLogout);
  }
  elements.startButtons.forEach((btn) => btn.addEventListener("click", startGame));
  if (elements.shortcutInline) {
    elements.shortcutInline.addEventListener("click", (event) => {
      const item = event.target.closest(".shortcut-item");
      if (!item || item.classList.contains("is-static")) return;
      if (item.disabled || item.getAttribute("aria-disabled") === "true") return;
      const action = item.dataset.action;
      if (!action) return;
      performShortcutAction(action);
    });
  }
  if (elements.presetGrid) {
    elements.presetGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".preset-card");
      if (!card) return;
      const preset = card.dataset.preset;
      if (!preset) return;
      applyPreset(preset);
    });
  }
  elements.skipBtn.addEventListener("click", skipQuestion);
  elements.nextBtn.addEventListener("click", handleNextClick);
  if (elements.micBtn) {
    elements.micBtn.addEventListener("click", toggleMicRecording);
  }
  elements.rulesButton.addEventListener("click", showRules);
  elements.closeModal.addEventListener("click", hideRules);
  elements.modalClose.addEventListener("click", hideRules);
  elements.backToMenu.addEventListener("click", goToMenu);
  elements.returnMenuBtn.addEventListener("click", goToMenu);
  elements.playAgainBtn.addEventListener("click", handlePlayAgainClick);
  if (elements.restartRoundBtn) {
    elements.restartRoundBtn.addEventListener("click", handleRestartRoundClick);
  }
  if (elements.reviewFilterCorrect) {
    elements.reviewFilterCorrect.addEventListener("click", () =>
      toggleReviewFilter("correct")
    );
  }
  if (elements.reviewFilterWrong) {
    elements.reviewFilterWrong.addEventListener("click", () => toggleReviewFilter("wrong"));
  }
  if (elements.reviewFilterSkipped) {
    elements.reviewFilterSkipped.addEventListener("click", () =>
      toggleReviewFilter("skipped")
    );
  }
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

  elements.toggleFocus.addEventListener("click", toggleFocusMode);

  elements.toggleMeta.addEventListener("click", () => {
    state.sessionSettings.showMeta = !state.sessionSettings.showMeta;
    applySessionDisplaySettings();
  });

  if (elements.shortAnswerInput) {
    elements.shortAnswerInput.addEventListener("input", () => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      const currentDraft = getShortDraft(question.key);
      const nextText = elements.shortAnswerInput.value;
      const scored = currentDraft.scored && currentDraft.text === nextText;
      saveShortDraft(question.key, {
        text: nextText,
        points: Number(elements.shortAnswerScoreInput.value) || 0,
        scored,
      });
      updateShortReviewStatus(question);
      updateShortAnswerActions(question);
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

  if (elements.shortAnswerAiRetryBtn) {
    elements.shortAnswerAiRetryBtn.addEventListener("click", async () => {
      setShortRetryVisible(false);
      await checkAiAvailability();
      triggerShortAutoGrade();
    });
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

  if (elements.sketchUpload) {
    elements.sketchUpload.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      handleSketchUpload(file, { autoAnalyze: true });
    });
  }

  if (elements.sketchDropzone) {
    const dropzone = elements.sketchDropzone;
    const highlight = () => dropzone.classList.add("is-dragover");
    const unhighlight = () => dropzone.classList.remove("is-dragover");
    ["dragenter", "dragover"].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        highlight();
      });
    });
    ["dragleave", "dragend"].forEach((eventName) => {
      dropzone.addEventListener(eventName, () => {
        unhighlight();
      });
    });
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      unhighlight();
      const file = event.dataTransfer?.files && event.dataTransfer.files[0];
      handleSketchUpload(file, { autoAnalyze: true });
    });
  }

  if (elements.sketchRetryBtn) {
    elements.sketchRetryBtn.addEventListener("click", async () => {
      setSketchRetryVisible(false);
      await checkAiAvailability();
      await analyzeSketch();
    });
  }

  elements.modal.addEventListener("click", (evt) => {
    if (evt.target === elements.modal) {
      hideRules();
    }
  });

  if (elements.figureModal) {
    elements.figureModal.addEventListener("click", (evt) => {
      if (evt.target === elements.figureModal) {
        closeFigureModal();
      }
    });
  }
  if (elements.figureModalClose) {
    elements.figureModalClose.addEventListener("click", closeFigureModal);
  }

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
  if (elements.togglePreferUnseen) {
    elements.togglePreferUnseen.addEventListener("change", (event) => {
      handleSettingToggle("preferUnseen", event.target.checked);
    });
  }
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
      setTtsEnabled(event.target.checked);
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFigureModal();
    }
  });
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
  if (elements.togglePreferUnseen) {
    elements.togglePreferUnseen.checked = state.settings.preferUnseen;
  }
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
  updatePresetButtons();
}

async function loadQuestions() {
  const fetchOptions = { cache: "no-store" };
  const [mcqRes, shortRes, captionsRes, bookRes, auditRes] = await Promise.all([
    fetch("data/questions.json", fetchOptions),
    fetch("data/kortsvar.json", fetchOptions),
    fetch("data/figure_captions.json", fetchOptions),
    fetch("data/book_captions.json", fetchOptions),
    fetch("data/figure_audit.json", fetchOptions),
  ]);
  const mcqData = await mcqRes.json();
  const shortData = shortRes.ok ? await shortRes.json() : [];
  const captionData = captionsRes.ok ? await captionsRes.json() : {};
  const bookData = bookRes.ok ? await bookRes.json() : {};
  const auditData = auditRes.ok ? await auditRes.json() : [];
  state.figureCaptionLibrary =
    captionData && typeof captionData === "object" ? captionData : {};
  state.figureAuditIndex = buildFigureAuditIndex(auditData);
  state.bookCaptionLibrary =
    bookData && typeof bookData === "object" ? bookData : {};
  state.bookCaptionIndex = buildBookCaptionIndex(state.bookCaptionLibrary);

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
  buildMcqDuplicateGroups(mcqQuestions);

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

  state.shortQuestionGroups = buildShortQuestionGroups(shortQuestions);
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
  scheduleUserStateSync();
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
  const defaultYears = state.available.years;
  const categoryOrder = new Map(CATEGORY_ORDER.map((label, index) => [label, index]));
  state.available.categories = [...state.counts.categories.keys()].sort((a, b) => {
    const aIndex = categoryOrder.get(a);
    const bIndex = categoryOrder.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 999) - (bIndex ?? 999);
    }
    return a.localeCompare(b, "da");
  });
  state.filters.years = new Set(defaultYears);
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
  setAiStatus(state.aiStatus);
  setTtsStatus(state.ttsStatus);
  try {
    await loadRuntimeConfig();
    initSupabaseClient();
    await refreshSession();
    subscribeToAuthChanges();
    if (state.session?.user) {
      await refreshProfile();
    }
  } catch (error) {
    state.backendAvailable = false;
    state.configError = error.message || "Kunne ikke indlæse login. Tjek serveren.";
    state.authReady = true;
    setAuthStatus(state.configError, true);
  }
  updateAuthUI();
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
