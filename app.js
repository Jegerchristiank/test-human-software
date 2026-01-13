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
  demoTrialLastRun: "hbs_demo_trial_last_run",
  demoQuizResult: "hbs_demo_quiz_result",
};

const CURRENT_STUDIO = "human";
const STUDIO_PARAM = "studio";
const STUDIO_PATHS = {
  human: "index.html",
  sygdomslaere: "sygdomslaere.html",
};
const AUTH_ROUTES = {
  signIn: "sign-in.html",
  signUp: "sign-up.html",
};

const DEFAULT_SETTINGS = {
  questionCount: 24,
  shuffleQuestions: true,
  shuffleOptions: true,
  balancedMix: true,
  adaptiveMix: false,
  priorityMix: false,
  lastStudio: CURRENT_STUDIO,
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
  adminMode: false,
};
const COURSE_DEFAULT_SETTINGS = {
  human: {},
  sygdomslaere: {
    questionCount: 12,
    includeMcq: false,
    includeShort: true,
    ratioMcq: 1,
    ratioShort: 1,
    shuffleOptions: false,
    autoFigureCaptions: false,
  },
};

const AUTH_PROVIDERS = {
  google: "google",
  apple: "apple",
};

const SHORT_TOTAL_POINTS = 72;
const SHORT_FAIL_RATIO = 0.5;
const SHORT_FAIL_PERCENT = SHORT_FAIL_RATIO * 100;
const HISTORY_LIMIT = 12;
const TARGET_GRADE_PERCENT = 92;
const DUPLICATE_QUESTION_SIMILARITY = 0.95;
const DUPLICATE_ANSWER_SIMILARITY = 0.95;
const PREFER_UNSEEN_SHARE = 0.7;
const SHORTCUT_STATUS_DURATION = 3000;
const USER_STATE_SYNC_DELAY = 1800;
const DEMO_DAILY_WINDOW = 24 * 60 * 60 * 1000;
const DEMO_TOTAL_QUESTIONS = 6;
const DEMO_SHORT_MATCH_THRESHOLD = 0.5;
const SHORT_LABEL_ORDER = "abcdefghijklmnopqrstuvwxyz".split("");
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

const DEFAULT_COURSE = "human";
const COURSE_LABELS = {
  human: "Human biologi",
  sygdomslaere: "Sygdomslære",
};
const COURSE_ORDER = [DEFAULT_COURSE, "sygdomslaere"];
const COURSE_YEAR_LABELS = {
  sygdomslaere: "Pensum",
};
const COURSE_ALIASES = {
  "human biologi": DEFAULT_COURSE,
  humanbiologi: DEFAULT_COURSE,
  sygdomslære: "sygdomslaere",
  sygdomslaere: "sygdomslaere",
  sygdom: "sygdomslaere",
};
const STUDIO_POLICY = typeof window !== "undefined" ? window.studioPolicy : null;
const COURSE_UI = {
  human: {
    title: "Human Biologi Studio",
    subtitle: "Sundhed & Informatik",
    description:
      "Byg en runde, der passer til din repetition. Vælg årgang og emner, justér blanding og sæt tempoet selv.",
    filterTitle: "Filtrer spørgsmål",
    filterDescription:
      "Vælg årgang og emner, så runden rammer det du læser op på.",
    yearLabel: "Årgang / sæt",
    yearTooltip: "Vælg hvilke eksamensår og sæt der skal indgå i puljen.",
    categoryLabel: "Emner",
    categoryTooltip: "Vælg præcis hvilke emner der skal trækkes spørgsmål fra.",
    categoryPlaceholder: "Søg emne",
    summaryYearLabel: "År",
    summaryCategoryLabel: "Emner",
    switchLabel: "Skift til Sygdomslære",
  },
  sygdomslaere: {
    title: "Sygdomslære Studio",
    subtitle: "Sundhed & Informatik",
    description:
      "Byg en runde med sygdomme og sektioner. Vælg prioritet og fokusområder, og tilpas længde og tempo.",
    filterTitle: "Filtrer sygdomme",
    filterDescription:
      "Vælg prioritet og sygdomsgrupper, så runden matcher det du læser op på.",
    yearLabel: "Prioritet",
    yearTooltip: "Vælg hvilke prioriteringer der skal indgå i puljen.",
    categoryLabel: "Sygdomsgrupper",
    categoryTooltip: "Vælg hvilke sygdomsgrupper der skal trækkes kort fra.",
    categoryPlaceholder: "Søg sygdomsgruppe",
    summaryYearLabel: "Prioritet",
    summaryCategoryLabel: "Sygdomsgrupper",
    switchLabel: "Skift til Human Biologi",
  },
};

const SCORING_POLICY_IDS = {
  human: "humanbiologi:v1",
  sygdomslaere: "sygdomslaere:v1",
};

const SCORING_POLICY_LABELS = {
  human: "HumanbiologiPolicy",
  sygdomslaere: "SygdomslaerePolicy",
};

const SCORING_POLICIES = {
  human: {
    id: SCORING_POLICY_IDS.human,
    label: SCORING_POLICY_LABELS.human,
    allowTypes: ["mcq", "short"],
    usesRubric: false,
    requiresAi: true,
    usesGrade: true,
    weight: { mcq: 0.5, short: 0.5 },
  },
  sygdomslaere: {
    id: SCORING_POLICY_IDS.sygdomslaere,
    label: SCORING_POLICY_LABELS.sygdomslaere,
    allowTypes: ["short"],
    usesRubric: true,
    requiresAi: false,
    usesGrade: false,
    weight: { mcq: 0, short: 1 },
  },
};

function resolveStudioPolicy(course) {
  if (STUDIO_POLICY && typeof STUDIO_POLICY.getStudioPolicy === "function") {
    return STUDIO_POLICY.getStudioPolicy(course);
  }
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const isDisease = courseId === "sygdomslaere";
  const policyMeta = SCORING_POLICIES[courseId] || SCORING_POLICIES[DEFAULT_COURSE];
  return {
    studioType: isDisease ? "sygdomslaere" : DEFAULT_COURSE,
    taskType: isDisease ? "case_structured" : "mixed",
    domains: isDisease ? getDiseaseDomainOrder() : [],
    hints: isDisease
      ? { mode: "structured", defaultLevel: 3 }
      : { mode: "ai" },
    progression: isDisease ? { source: "session_history" } : null,
    scoringPolicy: {
      id: policyMeta.id,
      label: policyMeta.label,
      allowTypes: policyMeta.allowTypes,
      usesRubric: policyMeta.usesRubric,
      requiresAi: policyMeta.requiresAi,
      usesGrade: policyMeta.usesGrade,
      mcq: { correct: 3, wrong: -1, skip: 0 },
      weights: policyMeta.weight,
      shortFailRatio: SHORT_FAIL_RATIO,
    },
    capabilities: {
      allowMcq: !isDisease,
      allowShort: true,
      allowSketch: !isDisease,
      allowShuffleOptions: !isDisease,
      allowAutoFigureCaptions: !isDisease,
      hintMode: isDisease ? "structured" : "ai",
    },
  };
}

function getScoringPolicyForCourse(course) {
  return resolveStudioPolicy(course).scoringPolicy;
}

function getStudioCapabilitiesForCourse(course) {
  return resolveStudioPolicy(course).capabilities;
}

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

const DISEASE_CATEGORY_ORDER = [
  "Bevægelsesapparatet sygdomme",
  "Neurologiske sygdomme",
  "Psykiske sygdomme",
  "Endokrine sygdomme",
  "Hjerte-kar-sygdomme",
  "Blodsygdomme",
  "Allergiske sygdomme",
  "Lungesygdomme",
  "Mave-tarm-sygdomme",
  "Nyre og urinvejssygdomme",
  "Gynækologiske sygdomme og obstetrik",
  "Infektionssygdomme",
  "Kræftsygdomme",
];

const DISEASE_SECTION_ORDER = [
  "Definition",
  "Forekomst",
  "Patogenese",
  "Ætiologi",
  "Symptomer og fund",
  "Diagnostik",
  "Følgetilstande",
  "Behandling",
  "Forebyggelse",
  "Prognose",
];

const PRIORITY_ORDER = ["high", "medium", "low"];
const PRIORITY_LABELS = {
  high: "Høj prioritet",
  medium: "Mellem prioritet",
  low: "Lav prioritet",
  excluded: "Ikke pensum",
};
const PRIORITY_FILTER_LABELS = {
  high: "Høj",
  medium: "Mellem",
  low: "Lav",
  excluded: "Ikke pensum",
};
const PRIORITY_WEIGHTS = {
  high: 1.35,
  medium: 1.0,
  low: 0.8,
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

const CATEGORY_SORT_ORDER = new Map(
  [...CATEGORY_ORDER, ...DISEASE_CATEGORY_ORDER].map((label, index) => [label, index])
);

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

  "bevægelsesapparatet sygdomme": "Bevægelsesapparatet sygdomme",
  "bevaegelsesapparatet sygdomme": "Bevægelsesapparatet sygdomme",
  "neurologiske sygdomme": "Neurologiske sygdomme",
  "psykiske sygdomme": "Psykiske sygdomme",
  "endokrine sygdomme": "Endokrine sygdomme",
  "hjertekarsygdomme": "Hjerte-kar-sygdomme",
  "hjerte-kar-sygdomme": "Hjerte-kar-sygdomme",
  "blodsygdomme": "Blodsygdomme",
  "allergiske sygdomme": "Allergiske sygdomme",
  "lungesygdomme": "Lungesygdomme",
  "mave-tarm-tarmsygdomme": "Mave-tarm-sygdomme",
  "mave-tarm-sygdomme": "Mave-tarm-sygdomme",
  "nyere og urinvejssygdomme": "Nyre og urinvejssygdomme",
  "nyre og urinvejssygdomme": "Nyre og urinvejssygdomme",
  "gynækologiske sygdomme og obstetrik": "Gynækologiske sygdomme og obstetrik",
  "infektionssygdom": "Infektionssygdomme",
  "infektionssygdomme": "Infektionssygdomme",
  "kræftsygdomme": "Kræftsygdomme",
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
const SKETCH_CANVAS_WIDTH = 1400;
const SKETCH_CANVAS_HEIGHT = 900;
const SKETCH_EXPORT_QUALITY = 0.85;
const SKETCH_DEFAULT_COLOR = "#111827";
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
    priorityMix: false,
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
    priorityMix: false,
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
    priorityMix: false,
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
    priorityMix: false,
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
const DISEASE_PRESET_CONFIGS = {
  exam: {
    questionCount: 12,
    includeMcq: false,
    includeShort: true,
    ratioMcq: 1,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: true,
    adaptiveMix: false,
    priorityMix: false,
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
    questionCount: 16,
    includeMcq: false,
    includeShort: true,
    ratioMcq: 1,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: true,
    adaptiveMix: true,
    priorityMix: false,
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
    questionCount: 10,
    includeMcq: false,
    includeShort: true,
    ratioMcq: 1,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: false,
    adaptiveMix: true,
    priorityMix: false,
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
    questionCount: 8,
    includeMcq: false,
    includeShort: true,
    ratioMcq: 1,
    ratioShort: 1,
    shuffleQuestions: true,
    balancedMix: false,
    adaptiveMix: false,
    priorityMix: false,
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
const PRESET_CONFIGS_BY_COURSE = {
  human: PRESET_CONFIGS,
  sygdomslaere: DISEASE_PRESET_CONFIGS,
};
const PRESET_UI_BY_COURSE = {
  human: {
    exam: {
      title: "Eksamen",
      text: "Balanceret blanding med realistisk tempo.",
      meta: "24 MCQ + 6 kortsvar · Standard",
    },
    review: {
      title: "Repetition",
      text: "Bred dækning med færre gentagelser.",
      meta: "30 MCQ + 10 kortsvar · Bredt",
    },
    weak: {
      title: "Svage områder",
      text: "Fokus på fejl og smart prioritet.",
      meta: "20 MCQ + 5 kortsvar · Fokus",
    },
    tempo: {
      title: "Tempo",
      text: "Hurtig rytme med auto-videre.",
      meta: "18 MCQ + 4 kortsvar · Tid",
    },
  },
  sygdomslaere: {
    exam: {
      title: "Eksamen",
      text: "Sikker dækning af kernesygdomme.",
      meta: "12 sygdomme · Standard",
    },
    review: {
      title: "Repetition",
      text: "Flere sygdomme med bredere spredning.",
      meta: "16 sygdomme · Bredt",
    },
    weak: {
      title: "Svage områder",
      text: "Fokusér på de sygdomme du har haft svært ved.",
      meta: "10 sygdomme · Fokus",
    },
    tempo: {
      title: "Tempo",
      text: "Kortere runder med høj rytme.",
      meta: "8 sygdomme · Tid",
    },
  },
};

const initialBestScores = loadBestScores();

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
  sessionActive: false,
  sessionPaused: false,
  sessionPausedAt: null,
  sessionCourse: null,
  sessionNeedsRender: false,
  activeSessionLoaded: false,
  activeSessionDirty: false,
  studioResolved: false,
  cancelRoundConfirmArmed: false,
  cancelRoundConfirmTimer: null,
  startTime: null,
  locked: false,
  results: [],
  bestScores: initialBestScores,
  bestScore: Number(initialBestScores[DEFAULT_COURSE] || 0),
  settings: loadSettings(),
  config: null,
  supabase: null,
  session: null,
  user: null,
  profile: null,
  subscription: null,
  backendAvailable: true,
  configError: "",
  authProviders: {
    google: null,
    apple: null,
  },
  authSettingsStatus: "",
  demoMode: false,
  demoQuiz: {
    status: "idle",
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
  },
  pendingEmailConfirmation: false,
  consentReturnTo: null,
  authReady: false,
  isLoading: true,
  loadingFallbackTimer: null,
  loadingStartedAt: null,
  loadingFallbackShown: false,
  questionsLoading: null,
  userStateSyncTimer: null,
  userStateSyncInFlight: false,
  userStateSyncQueued: false,
  userStateLoadPromise: null,
  userStateApplying: false,
  profileRetryTimer: null,
  profileRetryCount: 0,
  useOwnKey: false,
  userOpenAiKey: "",
  stripeClient: null,
  stripeElements: null,
  stripePaymentElement: null,
  stripePaymentRequest: null,
  stripePaymentRequestButton: null,
  checkoutClientSecret: null,
  checkoutSubscriptionId: null,
  checkoutPrice: null,
  checkoutPlanType: "subscription",
  checkoutLoading: false,
  billing: {
    data: null,
    isLoading: false,
    isUpdating: false,
    setupClientSecret: null,
  },
  admin: {
    allowed: false,
    importEnabled: false,
    checkedUserId: null,
    metrics: null,
    loading: false,
    importing: false,
  },
  billingElements: null,
  billingPaymentElement: null,
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
  ttsPartPrefetch: {
    entries: new Map(),
    timer: null,
  },
  ttsPartAnnounce: new Map(),
  lastShortQuestionKey: null,
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
  shortGroupsByKey: new Map(),
  shortPartNodes: new Map(),
  activeShortPartKey: null,
  shortPartSelectionActive: false,
  shortGroupCompletion: new Set(),
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
  sketchEditor: {
    active: false,
    part: null,
    tool: "draw",
    color: SKETCH_DEFAULT_COLOR,
    brushSize: 6,
    textSize: 20,
    isDrawing: false,
    lastPoint: null,
    activeTextBox: null,
    textDrag: null,
    hasInk: false,
    dirty: false,
    cleared: false,
    ctx: null,
  },
  sketchUploads: new Map(),
  sketchAnalysis: new Map(),
  questionHints: new Map(),
  performance: loadPerformance(),
  filters: {
    courses: new Set(),
    years: new Set(),
    categories: new Set(),
    sections: new Set(),
    priorities: new Set(),
  },
  available: {
    courses: [],
    years: [],
    categories: [],
    sections: [],
    priorities: [],
  },
  counts: {
    courses: new Map(),
    years: new Map(),
    categories: new Map(),
    sections: new Map(),
    priorities: new Map(),
    types: new Map(),
  },
  countsByType: {
    mcq: 0,
    short: 0,
  },
  seenKeys: new Set(loadStoredArray(STORAGE_KEYS.seen)),
  seenMcqGroups: new Set(),
  lastMistakeKeys: new Set(loadStoredArray(STORAGE_KEYS.mistakes)),
  history: loadStoredArray(STORAGE_KEYS.history),
  autoAdvanceTimer: null,
  questionStartedAt: null,
  sessionSettings: { ...DEFAULT_SETTINGS },
  sessionProfile: null,
  courseProfiles: new Map(),
  infiniteState: null,
  activeCourse: DEFAULT_COURSE,
  courseSettings: new Map(),
  courseFilters: new Map(),
  courseStats: new Map(),
  search: {
    category: "",
  },
  lastAppScreen: "menu",
  shouldRecordHistory: true,
};

const screens = {
  loading: document.getElementById("loading-screen"),
  auth: document.getElementById("auth-screen"),
  consent: document.getElementById("consent-screen"),
  landing: document.getElementById("landing-screen"),
  menu: document.getElementById("menu-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  account: document.getElementById("account-screen"),
  billing: document.getElementById("billing-screen"),
  checkout: document.getElementById("checkout-screen"),
};

const accessPolicy =
  typeof window !== "undefined" && window.accessPolicy ? window.accessPolicy : null;

const shortcutStatusTimers = new Map();

const elements = {
  startButtons: [document.getElementById("start-btn")].filter(Boolean),
  appRoot: document.querySelector(".app"),
  brandBackLinks: Array.from(document.querySelectorAll("[data-brand-back]")),
  landingStartBtn: document.getElementById("landing-start-btn"),
  landingQuickBtn: document.getElementById("landing-quick-btn"),
  demoStartBtn: document.getElementById("demo-start-btn"),
  demoStatus: document.getElementById("demo-status"),
  demoLimit: document.getElementById("demo-limit"),
  demoCardTitle: document.getElementById("demo-card-title"),
  demoLoading: document.getElementById("demo-loading"),
  demoEmpty: document.getElementById("demo-empty"),
  demoQuestion: document.getElementById("demo-question"),
  demoQuestionType: document.getElementById("demo-question-type"),
  demoQuestionCategory: document.getElementById("demo-question-category"),
  demoQuestionYear: document.getElementById("demo-question-year"),
  demoStep: document.getElementById("demo-step"),
  demoQuestionText: document.getElementById("demo-question-text"),
  demoOptions: document.getElementById("demo-options"),
  demoShort: document.getElementById("demo-short"),
  demoShortStatus: document.getElementById("demo-short-status"),
  demoShortList: document.getElementById("demo-short-list"),
  demoShortCheckBtn: document.getElementById("demo-short-check"),
  demoShortGuidance: document.getElementById("demo-short-guidance"),
  demoFeedback: document.getElementById("demo-feedback"),
  demoNextBtn: document.getElementById("demo-next-btn"),
  demoExitBtn: document.getElementById("demo-exit-btn"),
  demoProgress: document.getElementById("demo-progress"),
  demoScore: document.getElementById("demo-score"),
  demoResult: document.getElementById("demo-result"),
  demoResultScore: document.getElementById("demo-result-score"),
  demoCloseBtn: document.getElementById("demo-close-btn"),
  loadingStatus: document.getElementById("loading-status"),
  loadingDetail: document.getElementById("loading-detail"),
  loadingProgress: document.getElementById("loading-progress"),
  loadingProgressFill: document.getElementById("loading-progress-fill"),
  loadingProgressValue: document.getElementById("loading-progress-value"),
  loadingActions: document.getElementById("loading-actions"),
  loadingHomeBtn: document.getElementById("loading-home-btn"),
  loadingRetryBtn: document.getElementById("loading-retry-btn"),
  authGoogleBtn: document.getElementById("auth-google-btn"),
  authAppleBtn: document.getElementById("auth-apple-btn"),
  authEmailInput: document.getElementById("auth-email-input"),
  authPasswordInput: document.getElementById("auth-password-input"),
  authEmailBtn: document.getElementById("auth-email-btn"),
  authLoginBtn: document.getElementById("auth-login-btn"),
  authSignupBtn: document.getElementById("auth-signup-btn"),
  authDemoBtn: document.getElementById("auth-demo-btn"),
  authStatus: document.getElementById("auth-status"),
  authForm: document.getElementById("auth-form"),
  authAlt: document.getElementById("auth-alt"),
  authResend: document.getElementById("auth-resend"),
  authResendBtn: document.getElementById("auth-resend-btn"),
  authDivider: document.getElementById("auth-divider"),
  authOauthGroup: document.getElementById("auth-oauth"),
  authNote: document.getElementById("auth-note"),
  accountBtn: document.getElementById("account-btn"),
  accountBackBtn: document.getElementById("account-back-btn"),
  billingBackBtn: document.getElementById("billing-back-btn"),
  checkoutBackBtn: document.getElementById("checkout-back-btn"),
  checkoutCancelBtn: document.getElementById("checkout-cancel-btn"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutSubmitBtn: document.getElementById("checkout-submit-btn"),
  checkoutHostedBtn: document.getElementById("checkout-hosted-btn"),
  checkoutStatus: document.getElementById("checkout-status"),
  checkoutElement: document.getElementById("checkout-element"),
  checkoutExpress: document.getElementById("checkout-express"),
  checkoutWallets: document.getElementById("checkout-wallets"),
  checkoutPlanSwitch: document.getElementById("checkout-plan-switch"),
  checkoutPlanSubscriptionBtn: document.getElementById("checkout-plan-subscription"),
  checkoutPlanLifetimeBtn: document.getElementById("checkout-plan-lifetime"),
  checkoutPlanDisclaimer: document.getElementById("checkout-plan-disclaimer"),
  checkoutPlanName: document.getElementById("checkout-plan-name"),
  checkoutPlanNote: document.getElementById("checkout-plan-note"),
  checkoutPrice: document.getElementById("checkout-price"),
  checkoutInterval: document.getElementById("checkout-interval"),
  checkoutTotal: document.getElementById("checkout-total"),
  checkoutTrust: document.getElementById("checkout-trust"),
  accountStatus: document.getElementById("account-status"),
  billingStatus: document.getElementById("billing-status"),
  billingPlan: document.getElementById("billing-plan"),
  billingPlanMeta: document.getElementById("billing-plan-meta"),
  billingStatusBadge: document.getElementById("billing-status-badge"),
  billingStatusMeta: document.getElementById("billing-status-meta"),
  billingNextLabel: document.getElementById("billing-next-label"),
  billingNextAmount: document.getElementById("billing-next-amount"),
  billingNextDate: document.getElementById("billing-next-date"),
  billingPaymentLabel: document.getElementById("billing-payment-label"),
  billingPaymentMeta: document.getElementById("billing-payment-meta"),
  billingHeroHint: document.getElementById("billing-hero-hint"),
  billingUpdateMethodBtn: document.getElementById("billing-update-method-btn"),
  billingToggleCancelBtn: document.getElementById("billing-toggle-cancel-btn"),
  billingUpgradeBtn: document.getElementById("billing-upgrade-btn"),
  billingPortalBtn: document.getElementById("billing-portal-btn"),
  billingRefreshBtn: document.getElementById("billing-refresh-btn"),
  billingMethodTitle: document.getElementById("billing-method-title"),
  billingMethodMeta: document.getElementById("billing-method-meta"),
  billingChangeMethodBtn: document.getElementById("billing-change-method-btn"),
  billingUpdatePanel: document.getElementById("billing-update-panel"),
  billingUpdateForm: document.getElementById("billing-update-form"),
  billingPaymentElement: document.getElementById("billing-payment-element"),
  billingUpdateSubmitBtn: document.getElementById("billing-update-submit-btn"),
  billingUpdateCancelBtn: document.getElementById("billing-update-cancel-btn"),
  billingUpdateCloseBtn: document.getElementById("billing-update-close-btn"),
  billingUpdateStatus: document.getElementById("billing-update-status"),
  billingPlanName: document.getElementById("billing-plan-name"),
  billingPlanNote: document.getElementById("billing-plan-note"),
  billingPlanPrice: document.getElementById("billing-plan-price"),
  billingPlanCycle: document.getElementById("billing-plan-cycle"),
  billingTimeline: document.getElementById("billing-timeline"),
  billingInvoiceList: document.getElementById("billing-invoice-list"),
  billingMethodTags: document.getElementById("billing-method-tags"),
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
  consentGateTerms: document.getElementById("consent-terms-gate"),
  consentGatePrivacy: document.getElementById("consent-privacy-gate"),
  consentGateAcceptBtn: document.getElementById("consent-accept-btn"),
  consentBackBtn: document.getElementById("consent-back-btn"),
  consentStatus: document.getElementById("consent-status"),
  consentEmail: document.getElementById("consent-email"),
  exportDataBtn: document.getElementById("export-data-btn"),
  deleteAccountBtn: document.getElementById("delete-account-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  diagBackend: document.getElementById("diag-backend"),
  diagBackendMeta: document.getElementById("diag-backend-meta"),
  diagAuth: document.getElementById("diag-auth"),
  diagAuthMeta: document.getElementById("diag-auth-meta"),
  diagStripe: document.getElementById("diag-stripe"),
  diagStripeMeta: document.getElementById("diag-stripe-meta"),
  diagAi: document.getElementById("diag-ai"),
  diagAiMeta: document.getElementById("diag-ai-meta"),
  diagRefreshBtn: document.getElementById("diag-refresh-btn"),
  adminPanel: document.getElementById("admin-panel"),
  adminModeToggle: document.getElementById("admin-mode-toggle"),
  adminBody: document.getElementById("admin-body"),
  adminStatus: document.getElementById("admin-status"),
  adminRefreshBtn: document.getElementById("admin-refresh-btn"),
  adminUsersTotal: document.getElementById("admin-users-total"),
  adminUsersMeta: document.getElementById("admin-users-meta"),
  adminActiveUsers: document.getElementById("admin-active-users"),
  adminActiveMeta: document.getElementById("admin-active-meta"),
  adminPlanPaid: document.getElementById("admin-plan-paid"),
  adminPlanMeta: document.getElementById("admin-plan-meta"),
  adminSubscriptionsActive: document.getElementById("admin-subscriptions-active"),
  adminSubscriptionsMeta: document.getElementById("admin-subscriptions-meta"),
  adminUsage7d: document.getElementById("admin-usage-7d"),
  adminUsageMeta: document.getElementById("admin-usage-meta"),
  adminEvals7d: document.getElementById("admin-evals-7d"),
  adminEvalsMeta: document.getElementById("admin-evals-meta"),
  adminAudit7d: document.getElementById("admin-audit-7d"),
  adminAuditMeta: document.getElementById("admin-audit-meta"),
  adminDataMcq: document.getElementById("admin-data-mcq"),
  adminDataMeta: document.getElementById("admin-data-meta"),
  adminStripeAvailable: document.getElementById("admin-stripe-available"),
  adminStripeMeta: document.getElementById("admin-stripe-meta"),
  adminRawdataUpdated: document.getElementById("admin-rawdata-updated"),
  adminRawdataMeta: document.getElementById("admin-rawdata-meta"),
  adminImportsUpdated: document.getElementById("admin-imports-updated"),
  adminImportsMeta: document.getElementById("admin-imports-meta"),
  adminImportType: document.getElementById("admin-import-type"),
  adminImportMode: document.getElementById("admin-import-mode"),
  adminImportContent: document.getElementById("admin-import-content"),
  adminImportBtn: document.getElementById("admin-import-btn"),
  adminImportStatus: document.getElementById("admin-import-status"),
  debugPanel: document.getElementById("debug-panel"),
  debugStudioType: document.getElementById("debug-studio-type"),
  debugPolicy: document.getElementById("debug-policy"),
  rulesButton: document.getElementById("rules-btn"),
  closeModal: document.getElementById("close-modal"),
  modalClose: document.getElementById("modal-close-btn"),
  modal: document.getElementById("rules-modal"),
  sketchModal: document.getElementById("sketch-modal"),
  sketchModalClose: document.getElementById("sketch-modal-close"),
  sketchModalDismiss: document.getElementById("sketch-modal-dismiss"),
  sketchModalAnalyze: document.getElementById("sketch-modal-analyze"),
  sketchModalTitle: document.getElementById("sketch-modal-title"),
  sketchModalHint: document.getElementById("sketch-modal-hint"),
  sketchCanvasWrap: document.getElementById("sketch-canvas-wrap"),
  sketchCanvas: document.getElementById("sketch-canvas"),
  sketchTextLayer: document.getElementById("sketch-text-layer"),
  sketchToolDraw: document.getElementById("sketch-tool-draw"),
  sketchToolErase: document.getElementById("sketch-tool-erase"),
  sketchToolText: document.getElementById("sketch-tool-text"),
  sketchBrushSize: document.getElementById("sketch-brush-size"),
  sketchBrushValue: document.getElementById("sketch-brush-value"),
  sketchTextSize: document.getElementById("sketch-text-size"),
  sketchTextValue: document.getElementById("sketch-text-value"),
  sketchClearBtn: document.getElementById("sketch-clear-btn"),
  sketchDeleteTextBtn: document.getElementById("sketch-delete-text"),
  sketchColorButtons: Array.from(document.querySelectorAll(".sketch-color-btn")),
  figureModal: document.getElementById("figure-modal"),
  figureModalClose: document.getElementById("figure-modal-close"),
  figureModalTitle: document.getElementById("figure-modal-title"),
  figureModalImg: document.getElementById("figure-modal-img"),
  figureModalCaption: document.getElementById("figure-modal-caption"),
  themeToggle: document.getElementById("theme-toggle"),
  questionCountRange: document.getElementById("question-count"),
  questionCountLabel: document.getElementById("question-count-label"),
  questionCountInfo: document.getElementById("question-count-info"),
  questionCountHint: document.getElementById("question-count-hint"),
  questionCountChip: document.getElementById("question-count-chip"),
  poolCountChip: document.getElementById("pool-count-chip"),
  menuTitle: document.getElementById("menu-title"),
  menuSubtitle: document.getElementById("menu-subtitle"),
  menuDescription: document.getElementById("menu-description"),
  menuLogo: document.getElementById("menu-logo"),
  quizLogo: document.getElementById("quiz-logo"),
  resultLogo: document.getElementById("result-logo"),
  filterPanelTitle: document.getElementById("filter-panel-title"),
  filterPanelDescription: document.getElementById("filter-panel-description"),
  yearFilterLabel: document.getElementById("year-filter-label"),
  yearFilterInfo: document.getElementById("year-filter-info"),
  categoryFilterLabel: document.getElementById("category-filter-label"),
  categoryFilterInfo: document.getElementById("category-filter-info"),
  poolCount: document.getElementById("pool-count"),
  roundCount: document.getElementById("round-count"),
  mixSummary: document.getElementById("mix-summary"),
  courseSummary: document.getElementById("course-summary"),
  yearSummary: document.getElementById("year-summary"),
  yearSummaryLabel: document.getElementById("year-summary-label"),
  categorySummary: document.getElementById("category-summary"),
  categorySummaryLabel: document.getElementById("category-summary-label"),
  repeatSummary: document.getElementById("repeat-summary"),
  selectionHint: document.getElementById("selection-hint"),
  pausedSessionPanel: document.getElementById("paused-session-panel"),
  pausedProgress: document.getElementById("paused-progress"),
  pausedAnswered: document.getElementById("paused-answered"),
  pausedScore: document.getElementById("paused-score"),
  resumeRoundBtn: document.getElementById("resume-round-btn"),
  finishRoundBtn: document.getElementById("finish-round-btn"),
  cancelRoundBtn: document.getElementById("cancel-round-btn"),
  pausedRoundNote: document.getElementById("paused-round-note"),
  aiStatusPill: document.getElementById("ai-status-pill"),
  studioHumanBtn: document.getElementById("studio-human-btn"),
  studioSygdomBtn: document.getElementById("studio-sygdom-btn"),
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
  heroProgressBar: document.getElementById("hero-progress-bar"),
  heroProgressFill: document.getElementById("hero-progress-fill"),
  heroStreak: document.getElementById("hero-streak"),
  heroStreakMeta: document.getElementById("hero-streak-meta"),
  courseChips: document.getElementById("course-chips"),
  yearChips: document.getElementById("year-chips"),
  categoryChips: document.getElementById("category-chips"),
  categorySearch: document.getElementById("category-search"),
  priorityChips: document.getElementById("priority-chips"),
  sectionChips: document.getElementById("section-chips"),
  diseaseFilterDrawer: document.getElementById("disease-filter-drawer"),
  selectAllCourses: document.getElementById("select-all-courses"),
  clearCourses: document.getElementById("clear-courses"),
  selectAllYears: document.getElementById("select-all-years"),
  clearYears: document.getElementById("clear-years"),
  selectAllCategories: document.getElementById("select-all-categories"),
  clearCategories: document.getElementById("clear-categories"),
  toggleShuffleQuestions: document.getElementById("toggle-shuffle-questions"),
  toggleShuffleOptions: document.getElementById("toggle-shuffle-options"),
  toggleBalanced: document.getElementById("toggle-balanced"),
  toggleAdaptiveMix: document.getElementById("toggle-adaptive-mix"),
  togglePriorityMix: document.getElementById("toggle-priority-mix"),
  toggleAutoAdvance: document.getElementById("toggle-auto-advance"),
  toggleInfiniteMode: document.getElementById("toggle-infinite-mode"),
  toggleAvoidRepeats: document.getElementById("toggle-avoid-repeats"),
  togglePreferUnseen: document.getElementById("toggle-prefer-unseen"),
  toggleFocusMistakes: document.getElementById("toggle-focus-mistakes"),
  toggleIncludeMcq: document.getElementById("toggle-include-mcq"),
  toggleIncludeShort: document.getElementById("toggle-include-short"),
  typeToggleGrid: document.getElementById("type-toggle-grid"),
  toggleTts: document.getElementById("toggle-tts"),
  toggleAutoFigure: document.getElementById("toggle-auto-figure"),
  autoFigureRow: document.getElementById("auto-figure-row"),
  mcqSettingsDrawer: document.getElementById("mcq-settings-drawer"),
  ratioControlRow: document.getElementById("ratio-control-row"),
  ratioMcqInput: document.getElementById("ratio-mcq"),
  ratioShortInput: document.getElementById("ratio-short"),
  autoAdvanceRow: document.getElementById("auto-advance-row"),
  autoAdvanceDelay: document.getElementById("auto-advance-delay"),
  autoAdvanceLabel: document.getElementById("auto-advance-label"),
  backToMenu: document.getElementById("back-to-menu"),
  switchStudioBtn: document.getElementById("switch-studio-btn"),
  endRoundBtn: document.getElementById("end-round-btn"),
  sessionPill: document.getElementById("session-pill"),
  progressText: document.getElementById("progress-text"),
  tempoText: document.getElementById("tempo-text"),
  quizProgressBar: document.getElementById("quiz-progress-bar"),
  progressFill: document.getElementById("progress-fill"),
  scoreValue: document.getElementById("score-value"),
  mcqScoreValue: document.getElementById("mcq-score-value"),
  mcqScoreRow: document.getElementById("mcq-score-row"),
  shortScoreValue: document.getElementById("short-score-value"),
  shortScoreLabel: document.getElementById("short-score-label"),
  bestScoreValue: document.getElementById("best-score-value"),
  questionCourse: document.getElementById("question-course"),
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
  shortPartList: document.getElementById("short-part-list"),
  shortGroupLabel: document.getElementById("short-group-label"),
  shortGroupStatus: document.getElementById("short-group-status"),
  shortAnswerInputWrap: document.getElementById("short-answer-input-wrap"),
  shortAnswerInput: document.getElementById("short-answer-text"),
  transcribeIndicator: document.getElementById("transcribe-indicator"),
  transcribeText: document.getElementById("transcribe-text"),
  shortAnswerScoreRange: document.getElementById("short-score-range"),
  shortAnswerMaxPoints: document.getElementById("short-max-points"),
  shortAnswerAiFeedback: document.getElementById("short-ai-feedback"),
  shortAnswerAiRetryBtn: document.getElementById("short-ai-retry-btn"),
  shortAnswerAiStatus: document.getElementById("ai-status-inline"),
  shortAnswerShowAnswer: document.getElementById("short-show-answer-btn"),
  shortAnswerShowAnswerInline: document.getElementById("short-show-answer-inline-btn"),
  shortGradeBtn: document.getElementById("short-grade-btn"),
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
  shortAverageSummary: document.getElementById("short-average-summary"),
  shortAverageCircle: document.getElementById("short-average-circle"),
  shortAverageValue: document.getElementById("short-average-value"),
  shortAverageMax: document.getElementById("short-average-max"),
  shortAverageCaption: document.getElementById("short-average-caption"),
  shortReviewDrawer: document.getElementById("short-review-drawer"),
  feedbackArea: document.getElementById("feedback-area"),
  skipBtn: document.getElementById("skip-btn"),
  nextBtn: document.getElementById("next-btn"),
  micBtn: document.getElementById("mic-btn"),
  toggleFocus: document.getElementById("toggle-focus"),
  toggleMeta: document.getElementById("toggle-meta"),
  questionMeta: document.getElementById("question-meta"),
  finalScore: document.getElementById("final-score"),
  finalGradePill: document.getElementById("final-grade-pill"),
  finalGrade: document.getElementById("final-grade"),
  finalPercent: document.getElementById("final-percent"),
  resultMcqCard: document.getElementById("result-mcq-card"),
  resultShortCard: document.getElementById("result-short-card"),
  resultShortLabel: document.getElementById("result-short-label"),
  resultRubricCard: document.getElementById("result-rubric-card"),
  resultRubricLabel: document.getElementById("result-rubric-label"),
  resultRubricValue: document.getElementById("result-rubric-value"),
  resultRubricPercent: document.getElementById("result-rubric-percent"),
  resultGradeCard: document.getElementById("result-grade-card"),
  resultMcqPoints: document.getElementById("result-mcq-points"),
  resultMcqPercent: document.getElementById("result-mcq-percent"),
  resultShortPoints: document.getElementById("result-short-points"),
  resultShortPercent: document.getElementById("result-short-percent"),
  resultGrade: document.getElementById("result-grade"),
  finalMessage: document.getElementById("final-message"),
  statCorrect: document.getElementById("stat-correct"),
  statCorrectLabel: document.querySelector('[data-testid="stat-correct-label"]'),
  statWrong: document.getElementById("stat-wrong"),
  statWrongLabel: document.querySelector('[data-testid="stat-wrong-label"]'),
  statSkipped: document.getElementById("stat-skipped"),
  statSkippedLabel: document.querySelector('[data-testid="stat-skipped-label"]'),
  statShortLabel: document.getElementById("stat-short-label"),
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

const MODAL_FOCUS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const modalState = {
  active: null,
  lastFocused: null,
};

function isModalVisible(modal) {
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function isAnyModalOpen() {
  return (
    isModalVisible(elements.modal) ||
    isModalVisible(elements.sketchModal) ||
    isModalVisible(elements.figureModal)
  );
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(MODAL_FOCUS_SELECTOR)).filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.hasAttribute("disabled")) return false;
    return el.getClientRects().length > 0;
  });
}

function trapModalFocus(event) {
  if (event.key !== "Tab") return;
  const modal = modalState.active;
  if (!modal) return;
  const focusable = getFocusableElements(modal);
  if (!focusable.length) {
    event.preventDefault();
    modal.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setModalOpen(modal, { initialFocus } = {}) {
  if (!modal) return;
  modalState.active = modal;
  modalState.lastFocused = document.activeElement;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  if (elements.appRoot) {
    elements.appRoot.setAttribute("aria-hidden", "true");
  }
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", trapModalFocus, true);
  const focusTarget =
    initialFocus && typeof initialFocus.focus === "function" ? initialFocus : null;
  const focusable = getFocusableElements(modal);
  const next = focusTarget || focusable[0] || modal;
  requestAnimationFrame(() => {
    next.focus();
  });
}

function setModalClosed(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (elements.appRoot) {
    elements.appRoot.removeAttribute("aria-hidden");
  }
  document.removeEventListener("keydown", trapModalFocus, true);
  const lastFocused = modalState.lastFocused;
  modalState.active = null;
  modalState.lastFocused = null;
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus();
  }
}

function closeActiveModal() {
  if (isModalVisible(elements.figureModal)) {
    closeFigureModal();
    return true;
  }
  if (isModalVisible(elements.sketchModal)) {
    void closeSketchModal();
    return true;
  }
  if (isModalVisible(elements.modal)) {
    hideRules();
    return true;
  }
  return false;
}

function hydrateInfoTooltips() {
  const items = document.querySelectorAll(".info[data-tooltip]");
  items.forEach((item) => {
    const tooltip = item.getAttribute("data-tooltip");
    if (!tooltip) return;
    const current = item.getAttribute("aria-label") || "";
    if (!current || current.toLowerCase().startsWith("info om")) {
      item.setAttribute("aria-label", tooltip);
    }
  });
}

function normalizeBestScoreValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric < 0 || numeric > 100) return 0;
  return numeric;
}

function loadBestScores() {
  const stored = localStorage.getItem(STORAGE_KEYS.bestScore);
  const fallback = {};
  COURSE_ORDER.forEach((course) => {
    fallback[course] = 0;
  });
  if (!stored) return fallback;
  let parsed = null;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    parsed = null;
  }
  if (!parsed || typeof parsed !== "object") {
    const numeric = normalizeBestScoreValue(stored);
    return {
      ...fallback,
      [DEFAULT_COURSE]: numeric,
    };
  }
  const output = { ...fallback };
  Object.entries(parsed).forEach(([key, value]) => {
    if (!COURSE_LABELS[key]) return;
    output[key] = normalizeBestScoreValue(value);
  });
  return output;
}

function saveBestScores({ sync = true } = {}) {
  localStorage.setItem(STORAGE_KEYS.bestScore, JSON.stringify(state.bestScores));
  if (sync) scheduleUserStateSync();
}

function getBestScoreForCourse(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  return normalizeBestScoreValue(state.bestScores?.[courseId]);
}

function setBestScoreForCourse(course, value, { sync = true } = {}) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const nextValue = normalizeBestScoreValue(value);
  state.bestScores = { ...state.bestScores, [courseId]: nextValue };
  saveBestScores({ sync });
  if (getActiveCourse() === courseId) {
    state.bestScore = nextValue;
    if (elements.bestScoreValue) {
      elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
    }
  }
}

function syncActiveBestScore(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  state.bestScore = getBestScoreForCourse(courseId);
  if (elements.bestScoreValue) {
    elements.bestScoreValue.textContent = `${state.bestScore.toFixed(1)}%`;
  }
}

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  if (!saved) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(saved);
    const next = { ...DEFAULT_SETTINGS, ...parsed, priorityMix: false, assistantCollapsed: false };
    if (!isKnownCourse(next.lastStudio)) {
      next.lastStudio = CURRENT_STUDIO;
    }
    return next;
  } catch (error) {
    console.warn("Kunne ikke indlæse settings", error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  scheduleUserStateSync();
}

function getStudioParamValue() {
  const params = new URLSearchParams(window.location.search);
  return params.get(STUDIO_PARAM);
}

function clearStudioParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete(STUDIO_PARAM);
  window.history.replaceState({}, "", url.toString());
}

function normalizeRedirectPath(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return "";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (error) {
    return "";
  }
}

function buildAuthUrl(mode = "sign-in", redirectPath) {
  const target = mode === "sign-up" ? AUTH_ROUTES.signUp : AUTH_ROUTES.signIn;
  const url = new URL(target, window.location.href);
  const redirectValue = normalizeRedirectPath(redirectPath);
  if (redirectValue) {
    url.searchParams.set("redirect", redirectValue);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function redirectToAuth({ mode = "sign-in", redirectPath } = {}) {
  const fallbackPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const target = buildAuthUrl(mode, redirectPath || fallbackPath);
  window.location.replace(target);
}

function setLastStudio(studio, { sync = true } = {}) {
  if (!studio) return;
  if (state.settings.lastStudio !== studio) {
    state.settings.lastStudio = studio;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }
  if (sync) scheduleUserStateSync();
}

function isKnownCourse(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  return Boolean(COURSE_LABELS[courseId]);
}

function isDiseaseCourse(course) {
  return normalizeCourse(course || DEFAULT_COURSE) === "sygdomslaere";
}

function getActiveCourse() {
  const current = state.activeCourse || DEFAULT_COURSE;
  return normalizeCourse(current || DEFAULT_COURSE);
}

function getSessionCourse() {
  if (!state.sessionActive) return null;
  if (typeof state.sessionCourse === "string" && state.sessionCourse.trim()) {
    return normalizeCourse(state.sessionCourse);
  }
  const inferred = state.activeQuestions.find((question) => question?.course)?.course;
  if (inferred) return normalizeCourse(inferred);
  return normalizeCourse(state.activeCourse || DEFAULT_COURSE);
}

function canSwitchCourse(course) {
  const sessionCourse = getSessionCourse();
  if (!sessionCourse) return true;
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  return sessionCourse === courseId;
}

function getCourseUi(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  return COURSE_UI[courseId] || COURSE_UI[DEFAULT_COURSE];
}

function getScoringPolicy(course) {
  return getScoringPolicyForCourse(course);
}

function getActiveScoringPolicy() {
  return getScoringPolicy(getActiveCourse());
}

function getScoringPolicyForQuestion(question) {
  const courseId = normalizeCourse(question?.course || DEFAULT_COURSE);
  return getScoringPolicy(courseId);
}

function filterQuestionsForPolicy(questions, policy) {
  if (!Array.isArray(questions) || !policy) return questions || [];
  const allowed = new Set(policy.allowTypes || []);
  if (!allowed.size) return questions;
  return questions.filter((question) => question && allowed.has(question.type));
}

function stashCourseState(course) {
  if (!course) return;
  state.courseSettings.set(course, { ...state.settings });
  state.courseFilters.set(course, {
    years: [...state.filters.years],
    categories: [...state.filters.categories],
  });
}

function applyCourseSettings(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const saved = state.courseSettings.get(courseId);
  const defaults = COURSE_DEFAULT_SETTINGS[courseId] || {};
  const capabilities = getStudioCapabilitiesForCourse(courseId);
  Object.assign(state.settings, saved || defaults);
  if (!capabilities.allowMcq) {
    state.settings.includeMcq = false;
  }
  if (!capabilities.allowShort) {
    state.settings.includeShort = false;
  } else if (!capabilities.allowMcq) {
    state.settings.includeShort = true;
  }
  if (!capabilities.allowShuffleOptions) {
    state.settings.shuffleOptions = false;
  }
  if (!capabilities.allowAutoFigureCaptions) {
    state.settings.autoFigureCaptions = false;
  }
  saveSettings();
  syncSettingsToUI();
}

function applyCourseFilters(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const saved = state.courseFilters.get(courseId);
  if (saved) {
    const nextYears = saved.years.filter((value) => state.available.years.includes(value));
    const nextCategories = saved.categories.filter((value) =>
      state.available.categories.includes(value)
    );
    state.filters.years = new Set(nextYears.length ? nextYears : state.available.years);
    state.filters.categories = new Set(
      nextCategories.length ? nextCategories : state.available.categories
    );
  } else {
    state.filters.years = new Set(state.available.years);
    state.filters.categories = new Set(state.available.categories);
    if (isDiseaseCourse(courseId)) {
      const filtered = state.available.years.filter((value) => value !== "excluded");
      if (filtered.length) {
        state.filters.years = new Set(filtered);
      }
    }
  }
  updateChips();
  updateSummary();
}

function updateCourseTabs(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  if (elements.studioHumanBtn) {
    const isActive = courseId === DEFAULT_COURSE;
    elements.studioHumanBtn.classList.toggle("active", isActive);
    elements.studioHumanBtn.toggleAttribute("aria-current", isActive);
  }
  if (elements.studioSygdomBtn) {
    const isActive = courseId === "sygdomslaere";
    elements.studioSygdomBtn.classList.toggle("active", isActive);
    elements.studioSygdomBtn.toggleAttribute("aria-current", isActive);
  }
}

function updateCourseSwitchLock() {
  const sessionCourse = getSessionCourse();
  const isLocked = Boolean(sessionCourse);
  const lockMessage = "Afslut eller annuller runden for at skifte studio.";

  if (elements.switchStudioBtn) {
    elements.switchStudioBtn.classList.toggle("hidden", isLocked);
    elements.switchStudioBtn.disabled = isLocked;
    if (isLocked) {
      elements.switchStudioBtn.setAttribute("aria-hidden", "true");
      elements.switchStudioBtn.title = lockMessage;
    } else {
      elements.switchStudioBtn.removeAttribute("aria-hidden");
      elements.switchStudioBtn.removeAttribute("title");
    }
  }

  if (elements.studioHumanBtn) {
    const disabled = isLocked && sessionCourse !== DEFAULT_COURSE;
    elements.studioHumanBtn.disabled = disabled;
    elements.studioHumanBtn.toggleAttribute("aria-disabled", disabled);
    if (disabled) {
      elements.studioHumanBtn.title = lockMessage;
    } else {
      elements.studioHumanBtn.removeAttribute("title");
    }
  }

  if (elements.studioSygdomBtn) {
    const disabled = isLocked && sessionCourse !== "sygdomslaere";
    elements.studioSygdomBtn.disabled = disabled;
    elements.studioSygdomBtn.toggleAttribute("aria-disabled", disabled);
    if (disabled) {
      elements.studioSygdomBtn.title = lockMessage;
    } else {
      elements.studioSygdomBtn.removeAttribute("title");
    }
  }
}

function updateCourseStatsPill(course) {
  if (!elements.questionCountChip) return;
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const stats = state.courseStats.get(courseId) || { mcq: 0, short: 0, parts: 0 };
  if (isDiseaseCourse(courseId)) {
    elements.questionCountChip.textContent = `${stats.short} sygdomme · ${stats.parts} sektioner`;
    return;
  }
  elements.questionCountChip.textContent = `${stats.mcq} MCQ · ${stats.short} kortsvar`;
}

function updateCourseVisibility(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const capabilities = getStudioCapabilitiesForCourse(courseId);
  const scoringPolicy = getScoringPolicyForCourse(courseId);
  const isDisease = isDiseaseCourse(courseId);
  const allowMix = capabilities.allowMcq && capabilities.allowShort;
  document.body.dataset.course = courseId;
  if (elements.typeToggleGrid) {
    elements.typeToggleGrid.classList.toggle("hidden", !allowMix);
  }
  if (elements.toggleIncludeMcq) {
    elements.toggleIncludeMcq.disabled = !capabilities.allowMcq;
  }
  if (elements.toggleIncludeShort) {
    elements.toggleIncludeShort.disabled = !capabilities.allowShort;
  }
  if (elements.toggleShuffleOptions) {
    elements.toggleShuffleOptions.disabled = !capabilities.allowShuffleOptions;
  }
  if (elements.ratioControlRow) {
    elements.ratioControlRow.classList.toggle("hidden", !allowMix);
  }
  if (elements.mcqSettingsDrawer) {
    elements.mcqSettingsDrawer.classList.toggle("hidden", !capabilities.allowMcq);
  }
  if (elements.autoFigureRow) {
    elements.autoFigureRow.classList.toggle("hidden", !capabilities.allowAutoFigureCaptions);
  }
  if (elements.toggleAutoFigure) {
    elements.toggleAutoFigure.disabled = !capabilities.allowAutoFigureCaptions;
  }
  if (elements.mcqScoreRow) {
    elements.mcqScoreRow.classList.toggle("hidden", !capabilities.allowMcq);
  }
  if (elements.resultMcqCard) {
    elements.resultMcqCard.classList.toggle("hidden", !capabilities.allowMcq);
  }
  if (elements.resultRubricCard) {
    elements.resultRubricCard.classList.toggle("hidden", !scoringPolicy.usesRubric);
  }
  if (elements.finalGradePill) {
    elements.finalGradePill.classList.toggle("hidden", !scoringPolicy.usesGrade);
  }
  if (elements.resultGradeCard) {
    elements.resultGradeCard.classList.toggle("hidden", !scoringPolicy.usesGrade);
  }
  if (elements.shortGroupLabel) {
    elements.shortGroupLabel.textContent = isDisease ? "Sektioner" : "Delspørgsmål";
  }
  if (elements.shortScoreLabel) {
    elements.shortScoreLabel.textContent = scoringPolicy.usesRubric ? "Rubric" : "Kortsvar";
  }
  if (elements.resultShortLabel) {
    elements.resultShortLabel.textContent = scoringPolicy.usesRubric ? "Rubric point" : "Kortsvar point";
  }
  if (elements.statShortLabel) {
    elements.statShortLabel.textContent = scoringPolicy.usesRubric ? "Rubric point" : "Kortsvar point";
  }
  if (elements.statCorrectLabel) {
    elements.statCorrectLabel.textContent = scoringPolicy.usesRubric ? "Opfyldte kriterier" : "Korrekte";
  }
  if (elements.statWrongLabel) {
    elements.statWrongLabel.textContent = scoringPolicy.usesRubric ? "Manglende kriterier" : "Forkerte";
  }
  if (elements.statSkippedLabel) {
    elements.statSkippedLabel.textContent = isDisease ? "Ubesvarede sygdomme" : "Sprunget over";
  }
}

function updateCourseUI(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const ui = getCourseUi(courseId);
  if (elements.menuTitle) elements.menuTitle.textContent = ui.title;
  if (elements.menuSubtitle) elements.menuSubtitle.textContent = ui.subtitle;
  if (elements.menuDescription) elements.menuDescription.textContent = ui.description;
  if (elements.menuLogo) {
    elements.menuLogo.alt = `${ui.title} logo`;
  }
  if (elements.quizLogo) {
    elements.quizLogo.alt = `${ui.title} logo`;
  }
  if (elements.resultLogo) {
    elements.resultLogo.alt = `${ui.title} logo`;
  }
  if (elements.filterPanelTitle) elements.filterPanelTitle.textContent = ui.filterTitle;
  if (elements.filterPanelDescription) {
    elements.filterPanelDescription.textContent = ui.filterDescription;
  }
  if (elements.yearFilterLabel) elements.yearFilterLabel.textContent = ui.yearLabel;
  if (elements.yearFilterInfo) {
    elements.yearFilterInfo.dataset.tooltip = ui.yearTooltip;
    elements.yearFilterInfo.setAttribute(
      "aria-label",
      `Info om ${ui.yearLabel.toLowerCase()}`
    );
  }
  if (elements.categoryFilterLabel) elements.categoryFilterLabel.textContent = ui.categoryLabel;
  if (elements.categoryFilterInfo) {
    elements.categoryFilterInfo.dataset.tooltip = ui.categoryTooltip;
    elements.categoryFilterInfo.setAttribute(
      "aria-label",
      `Info om ${ui.categoryLabel.toLowerCase()}`
    );
  }
  if (elements.categorySearch) {
    elements.categorySearch.placeholder = ui.categoryPlaceholder;
  }
  if (elements.yearSummaryLabel) elements.yearSummaryLabel.textContent = ui.summaryYearLabel;
  if (elements.categorySummaryLabel) {
    elements.categorySummaryLabel.textContent = ui.summaryCategoryLabel;
  }
  if (elements.switchStudioBtn) {
    elements.switchStudioBtn.textContent = ui.switchLabel;
  }
  updatePresetCards(courseId);
  updateCourseTabs(courseId);
  updateCourseVisibility(courseId);
  updateCourseStatsPill(courseId);
  updateCourseSwitchLock();
  updateDebugPanel();
}

function setActiveCourse(course) {
  const courseId = isKnownCourse(course) ? normalizeCourse(course) : DEFAULT_COURSE;
  if (!canSwitchCourse(courseId)) {
    updateCourseSwitchLock();
    return;
  }
  const previous = getActiveCourse();
  if (previous === courseId && state.filters.courses.has(courseId)) {
    updateCourseUI(courseId);
    syncActiveBestScore(courseId);
    renderHistory();
    return;
  }
  if (!state.allQuestions.length) {
    state.activeCourse = courseId;
    state.filters.courses = new Set([courseId]);
    updateCourseUI(courseId);
    syncActiveBestScore(courseId);
    renderHistory();
    setLastStudio(courseId, { sync: false });
    return;
  }
  if (state.allQuestions.length) {
    stashCourseState(previous);
  }
  state.activeCourse = courseId;
  state.filters.courses = new Set([courseId]);
  refreshAvailableFilters();
  applyCourseSettings(courseId);
  applyCourseFilters(courseId);
  updateCourseUI(courseId);
  setLastStudio(courseId);
  clearPresetSelection();
  syncActiveBestScore(courseId);
  renderHistory();
}

function maybeResolveStudioPreference() {
  if (state.studioResolved) return;
  if (!state.session?.user) return;
  const param = getStudioParamValue();
  const normalizedParam = isKnownCourse(param) ? normalizeCourse(param) : null;
  const lastStudio = isKnownCourse(state.settings.lastStudio)
    ? normalizeCourse(state.settings.lastStudio)
    : DEFAULT_COURSE;
  const target = normalizedParam || lastStudio || DEFAULT_COURSE;
  clearStudioParam();
  state.studioResolved = true;
  setActiveCourse(target);
}

async function navigateToStudio(studio) {
  if (!studio) return;
  setActiveCourse(studio);
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

function getSessionElapsedMs() {
  if (!state.startTime) return 0;
  const end = state.sessionPaused && state.sessionPausedAt ? state.sessionPausedAt : Date.now();
  return Math.max(0, end - state.startTime);
}

function getActiveQuestionKeys() {
  return state.activeQuestions.map((question) => question?.key).filter(Boolean);
}

function getActivePartKeys() {
  const keys = new Set();
  state.activeQuestions.forEach((question) => {
    if (!question || question.type !== "short") return;
    getShortParts(question).forEach((part) => {
      if (part?.key) {
        keys.add(part.key);
      }
    });
  });
  return keys;
}

function buildActiveSessionPayload() {
  if (!state.sessionActive || !state.activeQuestions.length) return null;
  const activeQuestionKeys = getActiveQuestionKeys();
  if (!activeQuestionKeys.length) return null;
  const questionKeySet = new Set(activeQuestionKeys);
  const partKeySet = getActivePartKeys();

  const results = state.results
    .map((entry) => {
      if (!entry || !entry.type || !entry.question?.key) return null;
      if (entry.type === "mcq") {
        return {
          type: "mcq",
          questionKey: entry.question.key,
          selected: entry.selected ?? null,
          isCorrect: Boolean(entry.isCorrect),
          skipped: Boolean(entry.skipped),
          delta: Number(entry.delta) || 0,
        };
      }
      if (entry.type === "short") {
        const groupKey = entry.groupKey || getShortResultGroupKey(entry) || "";
        return {
          type: "short",
          questionKey: entry.question.key,
          groupKey,
          response: entry.response || "",
          awardedPoints: Number(entry.awardedPoints) || 0,
          maxPoints: Number(entry.maxPoints) || 0,
          skipped: Boolean(entry.skipped),
          ai: entry.ai || null,
        };
      }
      return null;
    })
    .filter(Boolean);

  const optionOrder = [];
  state.optionOrder.forEach((value, key) => {
    if (!questionKeySet.has(key)) return;
    optionOrder.push({
      key,
      options: Array.isArray(value?.options) ? value.options : [],
      correctLabel: value?.correctLabel || "",
    });
  });

  const shortDrafts = [];
  state.shortAnswerDrafts.forEach((value, key) => {
    if (!partKeySet.has(key)) return;
    shortDrafts.push({
      key,
      text: value?.text || "",
      points: Number(value?.points) || 0,
      scored: Boolean(value?.scored),
    });
  });

  const shortAnswerAI = [];
  state.shortAnswerAI.forEach((value, key) => {
    if (!partKeySet.has(key)) return;
    shortAnswerAI.push({
      key,
      score: Number(value?.score) || 0,
      feedback: value?.feedback || "",
      missing: Array.isArray(value?.missing) ? value.missing : [],
      matched: Array.isArray(value?.matched) ? value.matched : [],
      rubric: value?.rubric || null,
    });
  });

  const infiniteState = state.infiniteState
    ? {
        poolKeys: state.infiniteState.pool.map((question) => question?.key).filter(Boolean),
        remainingKeys: state.infiniteState.remaining
          .map((question) => question?.key)
          .filter(Boolean),
        usedKeys: [...(state.infiniteState.usedKeys || new Set())],
        cycle: Number(state.infiniteState.cycle) || 0,
      }
    : null;
  const sessionCourse = getSessionCourse() || getActiveCourse();
  const sessionPolicy = getScoringPolicyForCourse(sessionCourse);

  return {
    version: 1,
    studio: sessionCourse,
    policyId: sessionPolicy.id,
    paused: Boolean(state.sessionPaused),
    elapsedMs: getSessionElapsedMs(),
    currentIndex: state.currentIndex,
    activeQuestionKeys,
    results,
    score: Number(state.score) || 0,
    scoreBreakdown: {
      mcq: Number(state.scoreBreakdown.mcq) || 0,
      short: Number(state.scoreBreakdown.short) || 0,
    },
    sessionSettings: state.sessionSettings,
    optionOrder,
    shortDrafts,
    shortAnswerAI,
    activeShortPartKey: state.activeShortPartKey || null,
    infiniteState,
  };
}

function buildUserStatePayload() {
  if (!state.session?.user) return null;
  const activeSession = buildActiveSessionPayload();
  const includeActiveSession = state.sessionActive || state.activeSessionDirty;
  return {
    settings: state.settings,
    ...(includeActiveSession ? { active_session: activeSession } : {}),
    history: getAllHistoryEntries(),
    seen: [...state.seenKeys],
    mistakes: [...state.lastMistakeKeys],
    performance: state.performance,
    figure_captions: state.figureCaptions,
    best_score: getBestScoreForCourse(DEFAULT_COURSE),
    best_scores: state.bestScores,
    theme: localStorage.getItem(STORAGE_KEYS.theme) || "light",
    show_meta: state.settings.showMeta,
  };
}

async function syncActiveSessionSnapshot(payload) {
  if (!state.backendAvailable || !state.session?.user) return;
  const snapshot = payload === undefined ? buildActiveSessionPayload() : payload;
  const res = await apiFetch("/api/user-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active_session: snapshot }),
  });
  if (!res.ok) {
    console.warn("Kunne ikke synkronisere aktiv runde");
  }
}

function scheduleUserStateSync() {
  touchUserStateUpdatedAt();
  if (state.userStateApplying) return;
  if (!state.backendAvailable || !state.session?.user) return;
  if (state.userStateSyncTimer) return;
  state.userStateSyncTimer = setTimeout(() => {
    state.userStateSyncTimer = null;
    syncUserStateNow();
  }, USER_STATE_SYNC_DELAY);
}

function flushUserStateSync() {
  touchUserStateUpdatedAt();
  if (state.userStateSyncTimer) {
    clearTimeout(state.userStateSyncTimer);
    state.userStateSyncTimer = null;
  }
  if (state.userStateSyncInFlight) {
    state.userStateSyncQueued = true;
    return;
  }
  void syncUserStateNow();
}

async function syncUserStateNow() {
  if (state.userStateApplying) return;
  if (!state.backendAvailable || !state.session?.user) return;
  if (state.userStateSyncInFlight) {
    state.userStateSyncQueued = true;
    return;
  }
  const payload = buildUserStatePayload();
  if (!payload) return;
  state.userStateSyncInFlight = true;
  const res = await apiFetch("/api/user-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.warn("Kunne ikke synkronisere brugerdata");
  } else {
    state.activeSessionDirty = false;
  }
  state.userStateSyncInFlight = false;
  if (state.userStateSyncQueued) {
    state.userStateSyncQueued = false;
    void syncUserStateNow();
  }
}

function buildQuestionLookup() {
  const lookup = new Map();
  state.allQuestions.forEach((question) => {
    if (question?.key) {
      lookup.set(question.key, question);
    }
  });
  if (state.shortQuestionGroups) {
    state.shortQuestionGroups.forEach((parts) => {
      parts.forEach((part) => {
        if (part?.key) {
          lookup.set(part.key, part);
        }
      });
    });
  }
  return lookup;
}

function restoreOptionOrder(entries, questionKeySet) {
  const map = new Map();
  if (!Array.isArray(entries)) return map;
  entries.forEach((entry) => {
    if (!entry?.key || !questionKeySet.has(entry.key)) return;
    map.set(entry.key, {
      options: Array.isArray(entry.options) ? entry.options : [],
      correctLabel: entry.correctLabel || "",
    });
  });
  return map;
}

function restoreShortDrafts(entries, partKeySet) {
  const map = new Map();
  if (!Array.isArray(entries)) return map;
  entries.forEach((entry) => {
    if (!entry?.key || !partKeySet.has(entry.key)) return;
    map.set(entry.key, {
      text: entry.text || "",
      points: Number(entry.points) || 0,
      scored: Boolean(entry.scored),
    });
  });
  return map;
}

function restoreShortAnswerAI(entries, partKeySet) {
  const map = new Map();
  if (!Array.isArray(entries)) return map;
  entries.forEach((entry) => {
    if (!entry?.key || !partKeySet.has(entry.key)) return;
    map.set(entry.key, {
      score: Number(entry.score) || 0,
      feedback: entry.feedback || "",
      missing: Array.isArray(entry.missing) ? entry.missing : [],
      matched: Array.isArray(entry.matched) ? entry.matched : [],
      rubric: entry.rubric && typeof entry.rubric === "object"
        ? {
            matched: Number(entry.rubric.matched) || 0,
            total: Number(entry.rubric.total) || 0,
            percent: Number(entry.rubric.percent) || 0,
          }
        : null,
    });
  });
  return map;
}

function restoreResults(entries, lookup) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry?.type || !entry.questionKey) return null;
      const question = lookup.get(entry.questionKey);
      if (!question) return null;
      if (entry.type === "mcq") {
        return {
          question,
          type: "mcq",
          selected: entry.selected ?? null,
          isCorrect: Boolean(entry.isCorrect),
          skipped: Boolean(entry.skipped),
          delta: Number(entry.delta) || 0,
        };
      }
      if (entry.type === "short") {
        const groupKey = entry.groupKey || (question.groupKey ? `short-group-${question.groupKey}` : "");
        return {
          question,
          groupKey,
          type: "short",
          response: entry.response || "",
          awardedPoints: Number(entry.awardedPoints) || 0,
          maxPoints: Number(entry.maxPoints) || question.maxPoints || 0,
          skipped: Boolean(entry.skipped),
          ai: entry.ai || null,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function getCompletedQuestionKeySet(results) {
  const completed = new Set();
  results.forEach((entry) => {
    if (entry?.type === "mcq" && entry.question?.key) {
      completed.add(entry.question.key);
      return;
    }
    if (entry?.type === "short") {
      const groupKey =
        entry.groupKey ||
        (entry.question?.groupKey ? `short-group-${entry.question.groupKey}` : "");
      if (groupKey) {
        completed.add(groupKey);
      }
    }
  });
  return completed;
}

function buildScoreBreakdownFromResults(results) {
  let mcq = 0;
  const shortGroups = new Map();
  results.forEach((entry) => {
    if (!entry) return;
    if (entry.type === "mcq") {
      mcq += Number(entry.delta) || 0;
      return;
    }
    if (entry.type === "short") {
      const groupKey =
        entry.groupKey ||
        (entry.question?.groupKey ? `short-group-${entry.question.groupKey}` : "");
      if (!groupKey) return;
      const bucket = shortGroups.get(groupKey) || { total: 0, count: 0 };
      bucket.total += Number(entry.awardedPoints) || 0;
      bucket.count += 1;
      shortGroups.set(groupKey, bucket);
    }
  });
  let short = 0;
  shortGroups.forEach((bucket) => {
    if (!bucket.count) return;
    short += Number((bucket.total / bucket.count).toFixed(1));
  });
  return { mcq, short };
}

function restoreInfiniteState(payload, lookup) {
  if (!payload || typeof payload !== "object") return null;
  const poolKeys = Array.isArray(payload.poolKeys) ? payload.poolKeys : [];
  const remainingKeys = Array.isArray(payload.remainingKeys) ? payload.remainingKeys : [];
  const usedKeys = Array.isArray(payload.usedKeys) ? payload.usedKeys : [];
  const pool = poolKeys.map((key) => lookup.get(key)).filter(Boolean);
  const remaining = remainingKeys.map((key) => lookup.get(key)).filter(Boolean);
  return {
    pool,
    remaining,
    usedKeys: new Set(usedKeys.filter(Boolean)),
    cycle: Number(payload.cycle) || 0,
  };
}

function normalizeActiveSessionPayload(payload) {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }
  return payload;
}

async function restoreActiveSession(payload) {
  if (!payload || typeof payload !== "object") return;
  if (state.sessionActive) return;

  const payloadStudio = isKnownCourse(payload.studio)
    ? normalizeCourse(payload.studio)
    : null;
  if (payloadStudio && payloadStudio !== getActiveCourse()) {
    setActiveCourse(payloadStudio);
  }
  state.sessionCourse = payloadStudio || getActiveCourse();

  await ensureQuestionsLoaded();

  const activeQuestionKeys = Array.isArray(payload.activeQuestionKeys)
    ? payload.activeQuestionKeys
    : [];
  if (!activeQuestionKeys.length) return;

  const lookup = buildQuestionLookup();
  const activeQuestions = activeQuestionKeys
    .map((key) => lookup.get(key))
    .filter(Boolean);
  if (!activeQuestions.length) return;

  const questionKeySet = new Set(activeQuestionKeys);
  const partKeySet = new Set();
  activeQuestions.forEach((question) => {
    if (!question || question.type !== "short") return;
    getShortParts(question).forEach((part) => {
      if (part?.key) {
        partKeySet.add(part.key);
      }
    });
  });

  const results = restoreResults(payload.results, lookup);

  state.sessionActive = true;
  state.sessionPaused = true;
  state.sessionPausedAt = Date.now();
  state.sessionNeedsRender = true;
  state.activeSessionLoaded = true;
  state.activeSessionDirty = false;
  state.sessionSettings = {
    ...DEFAULT_SETTINGS,
    ...(payload.sessionSettings && typeof payload.sessionSettings === "object"
      ? payload.sessionSettings
      : {}),
  };
  state.activeQuestions = activeQuestions;
  state.results = results;
  state.score = Number(payload.score) || 0;
  if (payload.scoreBreakdown && typeof payload.scoreBreakdown === "object") {
    state.scoreBreakdown = {
      mcq: Number(payload.scoreBreakdown.mcq) || 0,
      short: Number(payload.scoreBreakdown.short) || 0,
    };
  } else {
    state.scoreBreakdown = buildScoreBreakdownFromResults(results);
  }
  state.optionOrder = restoreOptionOrder(payload.optionOrder, questionKeySet);
  state.shortAnswerDrafts = restoreShortDrafts(payload.shortDrafts, partKeySet);
  state.shortAnswerAI = restoreShortAnswerAI(payload.shortAnswerAI, partKeySet);
  state.infiniteState = restoreInfiniteState(payload.infiniteState, lookup);
  state.shortAnswerPending = false;
  state.sketchUploads = new Map();
  state.sketchAnalysis = new Map();
  state.locked = false;
  state.questionStartedAt = null;
  state.activeShortPartKey = partKeySet.has(payload.activeShortPartKey)
    ? payload.activeShortPartKey
    : null;
  state.shortPartSelectionActive = Boolean(state.activeShortPartKey);
  const elapsedMs = Number(payload.elapsedMs) || 0;
  state.startTime = elapsedMs ? Date.now() - elapsedMs : Date.now();

  const completed = getCompletedQuestionKeySet(results);
  const resumeIndex = activeQuestions.findIndex(
    (question) => question?.key && !completed.has(question.key)
  );
  const fallbackIndex = clampInt(payload.currentIndex, 0, activeQuestions.length - 1, 0);
  state.currentIndex = resumeIndex >= 0 ? resumeIndex : fallbackIndex;

  updateSessionScoreMeta(state.activeQuestions);
  updateSessionPill();
  applySessionDisplaySettings();
  updateTopBar();
  updatePausedSessionUI();
  updateSummary();
  state.lastAppScreen = "menu";
}

function applyUserState(remote) {
  if (!remote) return;
  state.userStateApplying = true;
  const activeSession = normalizeActiveSessionPayload(remote.active_session);
  if (remote.settings && typeof remote.settings === "object") {
    const nextSettings = { ...DEFAULT_SETTINGS, ...remote.settings, assistantCollapsed: false };
    if (typeof remote.show_meta === "boolean") {
      nextSettings.showMeta = remote.show_meta;
    }
    state.settings = nextSettings;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  } else if (typeof remote.show_meta === "boolean") {
    const fallbackSettings = {
      ...DEFAULT_SETTINGS,
      assistantCollapsed: false,
      showMeta: remote.show_meta,
    };
    state.settings = fallbackSettings;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }
  if (Array.isArray(remote.history)) {
    saveHistoryEntries(remote.history);
  }
  if (Array.isArray(remote.seen)) {
    state.seenKeys = new Set(remote.seen);
    localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
    refreshSeenGroups();
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
  if (remote.best_scores && typeof remote.best_scores === "object") {
    Object.entries(remote.best_scores).forEach(([key, value]) => {
      if (!COURSE_LABELS[key]) return;
      const current = normalizeBestScoreValue(state.bestScores?.[key]);
      const incoming = normalizeBestScoreValue(value);
      state.bestScores[key] = Math.max(current, incoming);
    });
    saveBestScores({ sync: false });
  } else if (typeof remote.best_score === "number") {
    const current = normalizeBestScoreValue(state.bestScores?.[DEFAULT_COURSE]);
    const incoming = normalizeBestScoreValue(remote.best_score);
    state.bestScores[DEFAULT_COURSE] = Math.max(current, incoming);
    saveBestScores({ sync: false });
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
  maybeResolveStudioPreference();
  syncActiveBestScore(getActiveCourse());
  if (!state.sessionActive && activeSession) {
    void restoreActiveSession(activeSession);
  } else {
    updatePausedSessionUI();
  }
}

async function loadUserStateFromSupabase() {
  if (!state.session?.user) return null;
  if (state.userStateLoadPromise) return state.userStateLoadPromise;

  state.userStateLoadPromise = (async () => {
    let res;
    try {
      res = await guardedStep(
        apiFetch("/api/user-state", { method: "GET" }),
        USER_STATE_TIMEOUT_MS,
        "Brugerdata indlæsning tog for lang tid"
      );
    } catch (error) {
      res = null;
    }
    if (!res) {
      maybeResolveStudioPreference();
      state.activeSessionLoaded = true;
      return null;
    }
    if (!res.ok) {
      console.warn("Kunne ikke hente brugerdata");
      maybeResolveStudioPreference();
      state.activeSessionLoaded = true;
      return null;
    }
    const { userState } = await res.json().catch(() => ({ userState: null }));
    const data = userState || null;
    if (!data) {
      scheduleUserStateSync();
      maybeResolveStudioPreference();
      state.activeSessionLoaded = true;
      return null;
    }
    const activeSession = normalizeActiveSessionPayload(data.active_session);
    const localUpdatedAt = getLocalUserStateUpdatedAt();
    const remoteUpdatedAt = data.updated_at ? Date.parse(data.updated_at) : null;
    const shouldApplyRemote =
      !localUpdatedAt || (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt);
    if (shouldApplyRemote) {
      applyUserState({ ...data, active_session: activeSession });
    } else {
      if (!state.sessionActive && activeSession) {
        await restoreActiveSession(activeSession);
      } else {
        updatePausedSessionUI();
      }
      scheduleUserStateSync();
    }
    maybeResolveStudioPreference();
    state.activeSessionLoaded = true;
    return data;
  })();

  try {
    return await state.userStateLoadPromise;
  } finally {
    state.userStateLoadPromise = null;
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

function getPresetConfig(presetId) {
  const courseId = getActiveCourse();
  const presets = PRESET_CONFIGS_BY_COURSE[courseId] || PRESET_CONFIGS;
  return presets[presetId];
}

function updatePresetCards(course) {
  if (!elements.presetGrid) return;
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  const copy = PRESET_UI_BY_COURSE[courseId] || PRESET_UI_BY_COURSE[DEFAULT_COURSE];
  const cards = elements.presetGrid.querySelectorAll(".preset-card");
  cards.forEach((card) => {
    const presetId = card.dataset.preset;
    if (!presetId || !copy[presetId]) return;
    const { title, text, meta } = copy[presetId];
    const titleEl = card.querySelector(".preset-title");
    const textEl = card.querySelector(".preset-text");
    const metaEl = card.querySelector(".preset-meta");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    if (metaEl) metaEl.textContent = meta;
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
  const preset = getPresetConfig(presetId);
  if (!preset) return;
  state.isApplyingPreset = true;
  const settingsPatch = preset.settings || preset;
  applySettingsPatch(settingsPatch);
  if (preset.filters?.courses) {
    setSelection("courses", preset.filters.courses);
  }
  state.lastPreset = presetId;
  state.isApplyingPreset = false;
  updatePresetButtons();
}

const AUTH_REQUIRED_SCREENS = new Set([
  "landing",
  "menu",
  "quiz",
  "result",
  "account",
  "billing",
  "checkout",
  "consent",
]);
const AUTH_REDIRECT_ROUTE = "sign-in.html";

function getAuthReturnPath() {
  const url = new URL(window.location.href);
  return `${url.pathname}${url.search}${url.hash}`;
}

function redirectToAuth() {
  const returnTo = getAuthReturnPath();
  const target = new URL(AUTH_REDIRECT_ROUTE, window.location.origin);
  if (returnTo) {
    target.searchParams.set("redirect", returnTo);
  }
  window.location.replace(target.toString());
}

function showScreen(target) {
  if (AUTH_REQUIRED_SCREENS.has(target) && !state.session?.user) {
    redirectToAuth();
    return;
  }
  if (
    target !== "loading" &&
    target !== "auth" &&
    needsConsent()
  ) {
    const path = window.location.pathname || "";
    const onConsentPage =
      path.endsWith("/consent.html") || path.endsWith("consent.html");
    if (!onConsentPage) {
      window.location.replace("consent.html");
      return;
    }
    if (!state.consentReturnTo) {
      state.consentReturnTo = target;
    }
    target = "consent";
  }

  Object.entries(screens).forEach(([key, el]) => {
    if (key === target) {
      el.classList.add("active");
      el.classList.remove("hidden");
    } else {
      el.classList.remove("active");
      el.classList.add("hidden");
    }
  });

  document.body.classList.toggle("mode-auth", target === "auth" || target === "consent");
  document.body.classList.toggle("mode-landing", target === "landing");
  document.body.classList.toggle(
    "mode-menu",
    target === "menu" || target === "account" || target === "billing" || target === "checkout"
  );
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

function handleBrandBack() {
  if (screens.result?.classList.contains("active")) {
    goToMenu();
    return;
  }
  if (state.sessionActive) {
    pauseSession();
    return;
  }
  if (state.session?.user) {
    showScreen("menu");
    return;
  }
  showScreen("auth");
}

function handleBrandBackClick(event) {
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  handleBrandBack();
}

const LOADING_FALLBACK_DELAY = 7000;
const LOGIN_TIMEOUT_MS = 5000;
const CONFIG_TIMEOUT_MS = 8000;
const PROFILE_TIMEOUT_MS = 8000;
const PROFILE_FETCH_TIMEOUT_MS = 5000;
const PROFILE_RETRY_DELAY_MS = 1200;
const PROFILE_RETRY_MAX = 2;
const USER_STATE_TIMEOUT_MS = 3500;
const QUESTIONS_TIMEOUT_MS = 12000;
const HEALTH_TIMEOUT_MS = 7000;
const LOADING_DEFAULT_STATUS = "Indlæser …";
const LOADING_DEFAULT_DETAIL = "Gør klar til din session";

function withTimeout(promise, timeoutMs, message) {
  let timeoutId = null;
  let timedOut = false;
  let remaining = Math.max(0, Number(timeoutMs) || 0);
  let startAt = null;
  let rejectTimeout = null;

  const onTimeout = () => {
    timedOut = true;
    const error = new Error(message || "Timeout");
    error.code = "TIMEOUT";
    if (rejectTimeout) {
      rejectTimeout(error);
    }
  };

  const stopTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (startAt) {
      const elapsed = Date.now() - startAt;
      remaining = Math.max(0, remaining - elapsed);
      startAt = null;
    }
  };

  const startTimer = () => {
    if (remaining <= 0) {
      onTimeout();
      return;
    }
    startAt = Date.now();
    timeoutId = setTimeout(onTimeout, remaining);
  };

  const handleVisibility = () => {
    if (document.visibilityState === "hidden") {
      stopTimer();
      return;
    }
    if (!timeoutId) {
      startTimer();
    }
  };

  const timeout = new Promise((_, reject) => {
    rejectTimeout = reject;
    if (document.visibilityState === "hidden") {
      stopTimer();
    } else {
      startTimer();
    }
  });
  const wrapped = Promise.resolve(promise).catch((error) => {
    if (timedOut) {
      console.warn("Indlæsning fejlede efter timeout", error);
      return null;
    }
    throw error;
  });
  document.addEventListener("visibilitychange", handleVisibility);
  return Promise.race([wrapped, timeout]).finally(() => {
    document.removeEventListener("visibilitychange", handleVisibility);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

async function guardedStep(promise, timeoutMs, label) {
  try {
    return await withTimeout(promise, timeoutMs, label);
  } catch (error) {
    console.warn(label || "Indlæsning tog for lang tid", error);
    return null;
  }
}

function setLoadingMessage(status = LOADING_DEFAULT_STATUS, detail = LOADING_DEFAULT_DETAIL) {
  if (elements.loadingStatus) {
    elements.loadingStatus.textContent = status;
  }
  if (elements.loadingDetail) {
    elements.loadingDetail.textContent = detail;
    setElementVisible(elements.loadingDetail, Boolean(detail));
  }
}

function setLoadingProgress(value) {
  if (!elements.loadingProgressFill || !elements.loadingProgressValue) return;
  const normalized = Math.min(100, Math.max(0, Number(value) || 0));
  elements.loadingProgressFill.style.width = `${normalized}%`;
  elements.loadingProgressValue.textContent = `${Math.round(normalized)}%`;
  if (elements.loadingProgress) {
    elements.loadingProgress.setAttribute("aria-valuenow", String(Math.round(normalized)));
  }
}

function showLoadingActions(isVisible) {
  if (!elements.loadingActions) return;
  setElementVisible(elements.loadingActions, Boolean(isVisible));
}

function clearLoadingFallbackTimer() {
  if (state.loadingFallbackTimer) {
    clearTimeout(state.loadingFallbackTimer);
    state.loadingFallbackTimer = null;
  }
}

function resetLoadingFallback() {
  clearLoadingFallbackTimer();
  state.loadingFallbackShown = false;
  showLoadingActions(false);
}

function showLoadingFallback() {
  setLoadingMessage(
    "Det tager længere tid end normalt …",
    "Du kan gå til forsiden eller prøve igen."
  );
  setLoadingProgress(92);
  showLoadingActions(true);
  state.loadingFallbackShown = true;
}

function scheduleLoadingFallback() {
  if (!state.loadingStartedAt || state.loadingFallbackShown) return;
  clearLoadingFallbackTimer();
  const elapsed = Date.now() - state.loadingStartedAt;
  const remaining = LOADING_FALLBACK_DELAY - elapsed;
  if (remaining <= 0) {
    showLoadingFallback();
    return;
  }
  state.loadingFallbackTimer = setTimeout(showLoadingFallback, remaining);
}

function setLoadingState(isLoading) {
  state.isLoading = Boolean(isLoading);
  if (state.isLoading) {
    state.loadingStartedAt = Date.now();
    resetLoadingFallback();
    showScreen("loading");
    setLoadingMessage();
    setLoadingProgress(6);
    scheduleLoadingFallback();
    return;
  }
  state.loadingStartedAt = null;
  resetLoadingFallback();
  try {
    updateAuthUI();
  } catch (error) {
    console.error("Kunne ikke opdatere UI efter loading", error);
    showScreen("auth");
    setAuthStatus("Noget gik galt under indlæsning. Prøv at genindlæse siden.", true);
  }
}

function setAuthStatus(message, isWarn = false) {
  if (!elements.authStatus) return;
  elements.authStatus.textContent = message || "";
  elements.authStatus.classList.toggle("warn", isWarn);
}

function setAuthResendVisible(isVisible) {
  if (!elements.authResend) return;
  setElementVisible(elements.authResend, Boolean(isVisible));
}

function setAccountStatus(message, isWarn = false) {
  if (!elements.accountStatus) return;
  const text = String(message || "").trim();
  elements.accountStatus.textContent = text;
  elements.accountStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.accountStatus, Boolean(text));
}

function setBillingStatus(message, isWarn = false) {
  if (!elements.billingStatus) return;
  const text = String(message || "").trim();
  elements.billingStatus.textContent = text;
  elements.billingStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.billingStatus, Boolean(text));
}

function setBillingUpdateStatus(message, isWarn = false) {
  if (!elements.billingUpdateStatus) return;
  const text = String(message || "").trim();
  elements.billingUpdateStatus.textContent = text;
  elements.billingUpdateStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.billingUpdateStatus, Boolean(text));
}

function setAdminStatus(message, isWarn = false) {
  if (!elements.adminStatus) return;
  const text = String(message || "").trim();
  elements.adminStatus.textContent = text;
  elements.adminStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.adminStatus, Boolean(text));
}

function setAdminImportStatus(message, isWarn = false) {
  if (!elements.adminImportStatus) return;
  const text = String(message || "").trim();
  elements.adminImportStatus.textContent = text;
  elements.adminImportStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.adminImportStatus, Boolean(text));
}

function formatAdminCount(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("da-DK").format(value);
}

function formatAdminDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const date = parsed.toLocaleDateString("da-DK", { day: "2-digit", month: "short" });
  const time = parsed.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

function formatAdminMeta(parts) {
  const clean = parts.map((part) => String(part || "").trim()).filter(Boolean);
  return clean.length ? clean.join(" · ") : "—";
}

function formatCurrencyMap(values) {
  if (!values || typeof values !== "object") return "—";
  const entries = Object.entries(values);
  if (!entries.length) return "—";
  return (
    entries
      .map(([currency, amount]) => formatCurrency(amount, currency))
      .filter((entry) => entry && entry !== "—")
      .join(" · ") || "—"
  );
}

function resolveLatestUpdate(info) {
  const timestamps = Object.values(info || {})
    .map((entry) => Date.parse(entry?.updatedAt || ""))
    .filter((value) => Number.isFinite(value));
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function renderAdminMetrics(metrics) {
  const profiles = metrics?.supabase?.profiles || {};
  const subscriptions = metrics?.supabase?.subscriptions || {};
  const userState = metrics?.supabase?.user_state || {};
  const usage = metrics?.supabase?.usage_events || {};
  const evals = metrics?.supabase?.evaluation_logs || {};
  const audits = metrics?.supabase?.audit_events || {};
  const data = metrics?.data || {};
  const rawdata = metrics?.rawdata || {};
  const imports = metrics?.imports || {};
  const stripe = metrics?.stripe || null;

  if (elements.adminUsersTotal) {
    elements.adminUsersTotal.textContent = formatAdminCount(profiles.total);
  }
  if (elements.adminUsersMeta) {
    const new7d = formatAdminCount(profiles.new7d);
    const new30d = formatAdminCount(profiles.new30d);
    elements.adminUsersMeta.textContent = formatAdminMeta([
      new7d !== "—" ? `+${new7d} sidste 7 dage` : null,
      new30d !== "—" ? `+${new30d} sidste 30 dage` : null,
    ]);
  }

  if (elements.adminActiveUsers) {
    elements.adminActiveUsers.textContent = formatAdminCount(userState.active7d);
  }
  if (elements.adminActiveMeta) {
    const total = formatAdminCount(userState.total);
    elements.adminActiveMeta.textContent = formatAdminMeta([
      total !== "—" ? `Synk total ${total}` : null,
    ]);
  }

  if (elements.adminPlanPaid) {
    elements.adminPlanPaid.textContent = formatAdminCount(profiles.plans?.paid);
  }
  if (elements.adminPlanMeta) {
    elements.adminPlanMeta.textContent = formatAdminMeta([
      `Free ${formatAdminCount(profiles.plans?.free)}`,
      `Trial ${formatAdminCount(profiles.plans?.trial)}`,
      `Lifetime ${formatAdminCount(profiles.plans?.lifetime)}`,
    ]);
  }

  if (elements.adminSubscriptionsActive) {
    elements.adminSubscriptionsActive.textContent = formatAdminCount(subscriptions.active);
  }
  if (elements.adminSubscriptionsMeta) {
    elements.adminSubscriptionsMeta.textContent = formatAdminMeta([
      `Total ${formatAdminCount(subscriptions.total)}`,
      `Restance ${formatAdminCount(subscriptions.past_due)}`,
      `Opsagt ${formatAdminCount(subscriptions.canceled)}`,
    ]);
  }

  if (elements.adminUsage7d) {
    elements.adminUsage7d.textContent = formatAdminCount(usage.last7d);
  }
  if (elements.adminUsageMeta) {
    elements.adminUsageMeta.textContent = formatAdminMeta([
      `Total ${formatAdminCount(usage.total)}`,
    ]);
  }

  if (elements.adminEvals7d) {
    elements.adminEvals7d.textContent = formatAdminCount(evals.last7d);
  }
  if (elements.adminEvalsMeta) {
    elements.adminEvalsMeta.textContent = formatAdminMeta([
      `Total ${formatAdminCount(evals.total)}`,
    ]);
  }

  if (elements.adminAudit7d) {
    elements.adminAudit7d.textContent = formatAdminCount(audits.last7d);
  }
  if (elements.adminAuditMeta) {
    elements.adminAuditMeta.textContent = formatAdminMeta([
      `Total ${formatAdminCount(audits.total)}`,
    ]);
  }

  if (elements.adminDataMcq) {
    elements.adminDataMcq.textContent = formatAdminCount(data.mcq);
  }
  if (elements.adminDataMeta) {
    elements.adminDataMeta.textContent = formatAdminMeta([
      `Kortsvar ${formatAdminCount(data.kortsvar)}`,
      `Sygdomslære ${formatAdminCount(data.sygdomslaere)}`,
    ]);
  }

  if (elements.adminStripeAvailable) {
    if (!stripe || stripe.configured === false) {
      elements.adminStripeAvailable.textContent = "Ikke sat op";
    } else if (!stripe.balance) {
      elements.adminStripeAvailable.textContent = "Utilgængelig";
    } else {
      elements.adminStripeAvailable.textContent = formatCurrencyMap(stripe.balance.available);
    }
  }
  if (elements.adminStripeMeta) {
    if (stripe?.balance) {
      elements.adminStripeMeta.textContent = formatAdminMeta([
        `Afventer ${formatCurrencyMap(stripe.balance.pending)}`,
      ]);
    } else {
      elements.adminStripeMeta.textContent = "—";
    }
  }

  if (elements.adminRawdataUpdated) {
    elements.adminRawdataUpdated.textContent = formatAdminDate(resolveLatestUpdate(rawdata));
  }
  if (elements.adminRawdataMeta) {
    elements.adminRawdataMeta.textContent = formatAdminMeta([
      `MCQ ${formatAdminDate(rawdata.mcq?.updatedAt)}`,
      `Kortsvar ${formatAdminDate(rawdata.kortsvar?.updatedAt)}`,
      `Sygdomslære ${formatAdminDate(rawdata.sygdomslaere?.updatedAt)}`,
    ]);
  }

  if (elements.adminImportsUpdated) {
    elements.adminImportsUpdated.textContent = formatAdminDate(resolveLatestUpdate(imports));
  }
  if (elements.adminImportsMeta) {
    elements.adminImportsMeta.textContent = formatAdminMeta([
      `MCQ ${formatAdminDate(imports.mcq?.updatedAt)}`,
      `Kortsvar ${formatAdminDate(imports.kortsvar?.updatedAt)}`,
      `Sygdomslære ${formatAdminDate(imports.sygdomslaere?.updatedAt)}`,
    ]);
  }
}

function updateAdminUI() {
  const allowed = Boolean(state.admin.allowed && state.session?.user);
  if (!allowed && state.settings.adminMode) {
    state.settings.adminMode = false;
    saveSettings();
  }

  setElementVisible(elements.adminPanel, allowed);
  if (elements.adminModeToggle) {
    elements.adminModeToggle.checked = Boolean(allowed && state.settings.adminMode);
    elements.adminModeToggle.disabled = !allowed;
  }
  const showBody = allowed && state.settings.adminMode;
  setElementVisible(elements.adminBody, showBody);

  if (elements.adminRefreshBtn) {
    elements.adminRefreshBtn.disabled = !showBody || state.admin.loading;
  }

  const importEnabled = Boolean(state.admin.importEnabled);
  if (elements.adminImportBtn) {
    elements.adminImportBtn.disabled = !showBody || !importEnabled || state.admin.importing;
  }
  if (elements.adminImportContent) {
    elements.adminImportContent.disabled = !showBody || !importEnabled || state.admin.importing;
  }
  if (elements.adminImportType) {
    elements.adminImportType.disabled = !showBody || !importEnabled || state.admin.importing;
  }
  if (elements.adminImportMode) {
    elements.adminImportMode.disabled = !showBody || !importEnabled || state.admin.importing;
  }

  renderAdminMetrics(showBody ? state.admin.metrics : null);
  if (!showBody) {
    setAdminStatus(allowed ? "Slå admin-tilstand til for at se data." : "");
  }
}

function resetAdminState() {
  state.admin.allowed = false;
  state.admin.importEnabled = false;
  state.admin.checkedUserId = null;
  state.admin.metrics = null;
  state.admin.loading = false;
  state.admin.importing = false;
  if (state.settings.adminMode) {
    state.settings.adminMode = false;
    saveSettings();
  }
  setAdminStatus("");
  setAdminImportStatus("");
  updateAdminUI();
}

async function checkAdminStatus({ force = false } = {}) {
  if (!state.session?.user) {
    resetAdminState();
    return;
  }
  const userId = state.session.user.id;
  if (!force && state.admin.checkedUserId === userId) return;
  state.admin.checkedUserId = userId;
  try {
    const res = await apiFetch("/api/admin/status", {
      method: "GET",
      timeoutMs: 8000,
    });
    if (res.ok) {
      const data = await res.json();
      state.admin.allowed = Boolean(data.admin);
      state.admin.importEnabled = Boolean(data.importEnabled);
    } else {
      state.admin.allowed = false;
      state.admin.importEnabled = false;
    }
  } catch (error) {
    state.admin.allowed = false;
    state.admin.importEnabled = false;
  }
  updateAdminUI();
}

async function refreshAdminMetrics({ silent = false } = {}) {
  if (!state.session?.user) return;
  state.admin.loading = true;
  if (!silent) {
    setAdminStatus("Henter admin data …");
  }
  updateAdminUI();
  try {
    const res = await apiFetch("/api/admin/metrics", {
      method: "GET",
      timeoutMs: 20000,
    });
    if (res.ok) {
      const data = await res.json();
      state.admin.allowed = true;
      state.admin.metrics = data;
      state.admin.importEnabled = Boolean(data?.admin?.importEnabled);
      if (!silent) {
        setAdminStatus("Admin data er opdateret.");
      }
    } else if (res.status === 401 || res.status === 403) {
      state.admin.allowed = false;
      state.admin.importEnabled = false;
      state.admin.metrics = null;
      setAdminStatus("Admin adgang mangler.", true);
    } else {
      setAdminStatus("Kunne ikke hente admin data.", true);
    }
  } catch (error) {
    setAdminStatus("Kunne ikke hente admin data.", true);
  } finally {
    state.admin.loading = false;
    updateAdminUI();
  }
}

function setAdminMode(enabled) {
  if (!state.admin.allowed) {
    state.settings.adminMode = false;
    saveSettings();
    updateAdminUI();
    return;
  }
  state.settings.adminMode = Boolean(enabled);
  saveSettings();
  updateAdminUI();
  if (state.settings.adminMode) {
    void refreshAdminMetrics({ silent: true });
  }
}

async function handleAdminImport() {
  if (!state.admin.allowed) {
    setAdminImportStatus("Admin adgang mangler.", true);
    return;
  }
  if (!state.admin.importEnabled) {
    setAdminImportStatus("Admin import er deaktiveret i miljøet.", true);
    return;
  }
  const content = elements.adminImportContent ? elements.adminImportContent.value : "";
  if (!content || !content.trim()) {
    setAdminImportStatus("Indsæt rådata først.", true);
    return;
  }
  const type = elements.adminImportType ? elements.adminImportType.value : "mcq";
  const mode = elements.adminImportMode ? elements.adminImportMode.value : "append";

  state.admin.importing = true;
  setAdminImportStatus("Importer …");
  updateAdminUI();

  try {
    const res = await apiFetch("/api/admin/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, mode, content }),
      timeoutMs: 60000,
    });
    if (!res.ok) {
      const data = await safeReadJson(res);
      const message = data?.error || "Importen fejlede.";
      setAdminImportStatus(message, true);
      return;
    }
    setAdminImportStatus("Import gennemført. Genindlæs siden for at bruge nye data.");
    void refreshAdminMetrics({ silent: true });
  } catch (error) {
    setAdminImportStatus("Importen fejlede.", true);
  } finally {
    state.admin.importing = false;
    updateAdminUI();
  }
}

function setConsentStatus(message, isWarn = false) {
  if (!elements.consentStatus) return;
  const text = String(message || "").trim();
  elements.consentStatus.textContent = text;
  elements.consentStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.consentStatus, Boolean(text));
}

function needsConsent() {
  if (!state.session?.user) return false;
  const termsAccepted = Boolean(state.profile?.terms_accepted_at);
  const privacyAccepted = Boolean(state.profile?.privacy_accepted_at);
  return !termsAccepted || !privacyAccepted;
}

function setElementVisible(element, isVisible) {
  if (!element) return;
  element.classList.toggle("hidden", !isVisible);
}

function resolveProviderFlag(source, provider) {
  if (!source) return null;
  if (Array.isArray(source)) {
    return source.includes(provider) ? true : null;
  }
  if (typeof source !== "object") return null;
  if (!(provider in source)) return null;
  const value = source[provider];
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object") {
    if ("enabled" in value) return Boolean(value.enabled);
    if ("client_id" in value) return Boolean(value.client_id);
    if ("app_id" in value) return Boolean(value.app_id);
    if ("key_id" in value) return Boolean(value.key_id);
  }
  return Boolean(value);
}

function getAuthProviderFlag(settings, provider) {
  if (!settings || typeof settings !== "object") return null;
  const sources = [
    settings.external,
    settings.external?.providers,
    settings.providers,
    settings.oauth,
    settings.auth_providers,
  ];
  for (const source of sources) {
    const flag = resolveProviderFlag(source, provider);
    if (flag !== null) return flag;
  }
  return null;
}

function applyAuthProviderVisibility() {
  const canAuth = Boolean(state.supabase);
  setElementVisible(elements.authForm, canAuth);
  setElementVisible(elements.authAlt, canAuth);
  setElementVisible(elements.authDivider, canAuth);
  setElementVisible(elements.authOauthGroup, canAuth);
  setElementVisible(elements.authGoogleBtn, canAuth);
  setElementVisible(elements.authAppleBtn, canAuth);
}

function formatProviderStatus(label, flag) {
  if (flag === true) return `${label}: aktiv`;
  if (flag === false) return `${label}: ikke aktiv`;
  return `${label}: ukendt`;
}

function isDevEnvironment() {
  if (window.location.protocol === "file:") return true;
  const hostname = window.location.hostname || "";
  if (!hostname) return true;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

function formatPolicySummary(policy) {
  if (!policy) return "—";
  const summary = {
    scoring: policy.scoringPolicy,
    capabilities: policy.capabilities,
  };
  return JSON.stringify(summary, null, 2);
}

function updateDebugPanel() {
  if (!elements.debugPanel) return;
  const isDev = isDevEnvironment();
  setElementVisible(elements.debugPanel, isDev);
  if (!isDev) return;
  const policy = resolveStudioPolicy(getActiveCourse());
  if (elements.debugStudioType) {
    elements.debugStudioType.textContent = policy?.studioType || "—";
  }
  if (elements.debugPolicy) {
    elements.debugPolicy.textContent = formatPolicySummary(policy);
  }
}

function updateDiagnosticsUI() {
  const backendOk = Boolean(state.backendAvailable);
  if (elements.diagBackend) {
    elements.diagBackend.textContent = backendOk ? "Online" : "Offline";
  }
  if (elements.diagBackendMeta) {
    elements.diagBackendMeta.textContent = backendOk
      ? "Serveren svarer"
      : state.configError || "Serveren svarer ikke";
  }

  const authReady = Boolean(state.supabase);
  if (elements.diagAuth) {
    elements.diagAuth.textContent = authReady ? "Klar" : "Mangler";
  }
  if (elements.diagAuthMeta) {
    elements.diagAuthMeta.textContent = authReady
      ? "Supabase auth er klar"
      : state.configError || "Login er ikke klar";
  }

  const stripeReady = Boolean(state.config?.stripeConfigured);
  if (elements.diagStripe) {
    elements.diagStripe.textContent = stripeReady ? "Klar" : "Mangler";
  }
  if (elements.diagStripeMeta) {
    if (stripeReady) {
      elements.diagStripeMeta.textContent = "Betaling er sat op";
    } else if (state.config?.stripePublishableKey) {
      elements.diagStripeMeta.textContent = "Betaling mangler backend-opsætning";
    } else {
      elements.diagStripeMeta.textContent = "Betaling er ikke sat op endnu";
    }
  }

  const aiReady = Boolean(state.aiStatus?.available);
  if (elements.diagAi) {
    elements.diagAi.textContent = aiReady ? "Klar" : "Begrænset";
  }
  if (elements.diagAiMeta) {
    const fallback = state.session?.user ? "Tjek din adgang" : "Kræver login";
    elements.diagAiMeta.textContent = state.aiStatus?.message || fallback;
  }
  setCheckoutPlanType(state.checkoutPlanType);
  updateDebugPanel();
}

function setAuthControlsEnabled(enabled) {
  const allowSupabaseControls = enabled;
  const controls = [
    elements.authEmailInput,
    elements.authPasswordInput,
    elements.authEmailBtn,
    elements.authLoginBtn,
    elements.authSignupBtn,
    elements.authGoogleBtn,
    elements.authAppleBtn,
  ];
  controls.forEach((control) => {
    if (control) {
      control.disabled = !allowSupabaseControls;
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

function setBillingControlsEnabled(enabled) {
  const controls = [
    elements.billingUpdateMethodBtn,
    elements.billingToggleCancelBtn,
    elements.billingUpgradeBtn,
    elements.billingPortalBtn,
    elements.billingRefreshBtn,
    elements.billingChangeMethodBtn,
    elements.billingUpdateSubmitBtn,
    elements.billingUpdateCancelBtn,
    elements.billingUpdateCloseBtn,
  ];
  controls.forEach((control) => {
    if (control) {
      control.disabled = !enabled;
    }
  });
}

function normalizePlanValue(plan) {
  return typeof plan === "string" ? plan.trim().toLowerCase() : "free";
}

function formatPlanLabel(plan) {
  const normalized = normalizePlanValue(plan);
  if (normalized === "paid") return "Pro";
  if (normalized === "trial") return "Trial";
  if (normalized === "lifetime") return "Pro (livstid)";
  return "Gratis";
}

function formatSubscriptionStatus(subscription, plan) {
  const normalizedPlan = normalizePlanValue(plan);
  if (normalizedPlan === "lifetime") return "Livstidsadgang aktiv.";
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
  if (subscription.cancel_at_period_end) {
    return periodEnd ? `Opsagt · udløber ${periodEnd}` : "Opsagt";
  }
  return periodEnd ? `${label} · fornyes ${periodEnd}` : label;
}

function formatBillingStatusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  const labelMap = {
    trialing: "Prøveperiode",
    active: "Aktiv",
    past_due: "Betaling afventer",
    unpaid: "Ubetalt",
    canceled: "Opsagt",
    incomplete: "Afventer",
    incomplete_expired: "Udløbet",
    paused: "Pauset",
  };
  return labelMap[normalized] || "Status ukendt";
}

function resolveBillingTone(status, cancelAtPeriodEnd) {
  const normalized = String(status || "").toLowerCase();
  if (!normalized) return "neutral";
  if (["past_due", "unpaid", "incomplete"].includes(normalized)) return "warning";
  if (["canceled", "incomplete_expired"].includes(normalized)) return "danger";
  if (cancelAtPeriodEnd) return "warning";
  return "";
}

function formatBillingDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("da-DK");
}

function formatInvoiceStatus(status) {
  const normalized = String(status || "").toLowerCase();
  const labelMap = {
    draft: "Kladde",
    open: "Åben",
    paid: "Betalt",
    uncollectible: "Uinddrivelig",
    void: "Annulleret",
  };
  return labelMap[normalized] || "Ukendt";
}

function formatPaymentMethodSummary(paymentMethod) {
  if (!paymentMethod) {
    return {
      title: "Ingen metode",
      meta: "Tilføj en metode for at holde Pro aktivt.",
    };
  }
  if (paymentMethod.type === "card") {
    const brandMap = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    };
    const walletMap = {
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      samsung_pay: "Samsung Pay",
    };
    const brand = brandMap[paymentMethod.brand] || "Kort";
    const last4 = paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : "";
    const title = [brand, last4].filter(Boolean).join(" ").trim() || "Kort";
    const expMonth = paymentMethod.exp_month
      ? String(paymentMethod.exp_month).padStart(2, "0")
      : null;
    const expYear = paymentMethod.exp_year ? String(paymentMethod.exp_year) : null;
    const metaParts = [];
    if (paymentMethod.wallet) {
      metaParts.push(`Wallet: ${walletMap[paymentMethod.wallet] || paymentMethod.wallet}`);
    }
    if (expMonth && expYear) {
      metaParts.push(`Udløber ${expMonth}/${expYear}`);
    }
    return {
      title,
      meta: metaParts.join(" · ") || "Standard betalingsmetode",
    };
  }
  const typeLabel = paymentMethod.type ? paymentMethod.type.replace(/_/g, " ") : "Betalingsmetode";
  return {
    title: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
    meta: "Standard betalingsmetode",
  };
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

function updateConsentGateActions() {
  if (!elements.consentGateAcceptBtn) return;
  const canEdit = Boolean(state.session?.user && state.backendAvailable);
  const acceptTerms = Boolean(elements.consentGateTerms?.checked);
  const acceptPrivacy = Boolean(elements.consentGatePrivacy?.checked);
  elements.consentGateAcceptBtn.disabled = !canEdit || !(acceptTerms && acceptPrivacy);
}

function scheduleConsentFallbackCheck() {
  if (!screens.consent || !screens.consent.classList.contains("active")) return;
  const grid = screens.consent.querySelector(".consent-grid");
  if (!grid) return;
  const panels = grid.querySelectorAll(".consent-panel");
  requestAnimationFrame(() => {
    const height = grid.getBoundingClientRect().height;
    const needsFallback = height < 20 || panels.length === 0;
    screens.consent.classList.toggle("consent-fallback", needsFallback);
  });
}

function syncConsentInputs() {
  const canEdit = Boolean(state.session?.user && state.backendAvailable);
  const termsAccepted = Boolean(state.profile?.terms_accepted_at);
  const privacyAccepted = Boolean(state.profile?.privacy_accepted_at);

  if (elements.consentTerms) {
    elements.consentTerms.checked = termsAccepted;
    elements.consentTerms.disabled = !canEdit || termsAccepted;
  }
  if (elements.consentPrivacy) {
    elements.consentPrivacy.checked = privacyAccepted;
    elements.consentPrivacy.disabled = !canEdit || privacyAccepted;
  }
  if (elements.consentGateTerms) {
    elements.consentGateTerms.checked = termsAccepted;
    elements.consentGateTerms.disabled = !canEdit || termsAccepted;
  }
  if (elements.consentGatePrivacy) {
    elements.consentGatePrivacy.checked = privacyAccepted;
    elements.consentGatePrivacy.disabled = !canEdit || privacyAccepted;
  }

  updateConsentGateActions();
  scheduleConsentFallbackCheck();
}

function updateConsentGateUI() {
  if (elements.consentEmail) {
    elements.consentEmail.textContent = state.session?.user?.email || "—";
  }
  syncConsentInputs();
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
    elements.subscriptionStatus.textContent = formatSubscriptionStatus(
      state.subscription,
      state.profile?.plan
    );
  }
  if (elements.ownKeyToggle) {
    elements.ownKeyToggle.checked = state.useOwnKey;
  }
  if (elements.ownKeyInput) {
    elements.ownKeyInput.value = state.userOpenAiKey || "";
  }
  updateConsentGateUI();
  if (state.billing.data) {
    updateBillingUI();
  }
  updateAdminUI();
}

function renderBillingMethodTags(methodTypes) {
  if (!elements.billingMethodTags) return;
  const tags = [];
  const labelMap = {
    card: "Kort",
    klarna: "Klarna",
    paypal: "PayPal",
    sepa_debit: "SEPA Debit",
    us_bank_account: "Bankoverførsel",
    acss_debit: "ACSS Debit",
    au_becs_debit: "AU BECS",
    bacs_debit: "BACS",
    bancontact: "Bancontact",
    ideal: "iDEAL",
    sofort: "SOFORT",
    eps: "EPS",
    giropay: "Giropay",
    p24: "Przelewy24",
    link: "Link",
    cashapp: "Cash App",
    customer_balance: "Bankoverførsel",
    mobilepay: "MobilePay",
  };
  let methodList = [];
  if (Array.isArray(methodTypes)) {
    methodList = methodTypes;
  } else if (methodTypes && typeof methodTypes === "object") {
    methodList = [
      ...(Array.isArray(methodTypes.subscription) ? methodTypes.subscription : []),
      ...(Array.isArray(methodTypes.lifetime) ? methodTypes.lifetime : []),
    ];
  }
  const normalized = methodList.length
    ? methodList.map((method) => String(method || "").toLowerCase())
    : ["card"];
  normalized.forEach((method) => {
    if (!method) return;
    tags.push(labelMap[method] || method.replace(/_/g, " "));
    if (method === "card") {
      tags.push("Apple Pay");
      tags.push("Google Pay");
    }
  });
  const uniqueTags = [...new Set(tags)];
  elements.billingMethodTags.textContent = "";
  uniqueTags.forEach((label) => {
    const tag = document.createElement("span");
    tag.className = "billing-tag";
    tag.textContent = label;
    elements.billingMethodTags.appendChild(tag);
  });
}

function renderBillingInvoices(invoices) {
  if (!elements.billingInvoiceList) return;
  elements.billingInvoiceList.textContent = "";
  const list = Array.isArray(invoices) ? invoices : [];
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Ingen fakturaer endnu.";
    elements.billingInvoiceList.appendChild(empty);
    return;
  }

  list.forEach((invoice) => {
    const amountCandidate = typeof invoice.amount_paid === "number" && invoice.amount_paid > 0
      ? invoice.amount_paid
      : typeof invoice.amount_due === "number"
        ? invoice.amount_due
        : invoice.amount_remaining;
    const amount = typeof amountCandidate === "number"
      ? formatCurrency(amountCandidate, invoice.currency)
      : "—";
    const date = formatBillingDate(invoice.created || invoice.period_end);
    const status = formatInvoiceStatus(invoice.status);

    const item = document.createElement("div");
    item.className = "billing-invoice-item";

    const info = document.createElement("div");
    const title = document.createElement("div");
    const numberLabel = invoice.number ? `#${invoice.number}` : "";
    const titleParts = ["Faktura"];
    if (numberLabel) {
      titleParts.push(numberLabel);
    }
    if (amount !== "—") {
      titleParts.push("·", amount);
    }
    title.className = "billing-invoice-title";
    title.textContent = titleParts.join(" ");
    const meta = document.createElement("div");
    meta.className = "billing-invoice-meta";
    meta.textContent = `${date} · ${status}`;
    info.appendChild(title);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "billing-invoice-actions";
    if (invoice.hosted_invoice_url) {
      const view = document.createElement("a");
      view.className = "btn ghost small";
      view.href = invoice.hosted_invoice_url;
      view.target = "_blank";
      view.rel = "noopener noreferrer";
      view.textContent = "Se";
      actions.appendChild(view);
    }
    if (invoice.invoice_pdf) {
      const pdf = document.createElement("a");
      pdf.className = "btn ghost small";
      pdf.href = invoice.invoice_pdf;
      pdf.target = "_blank";
      pdf.rel = "noopener noreferrer";
      pdf.textContent = "PDF";
      actions.appendChild(pdf);
    }

    item.appendChild(info);
    item.appendChild(actions);
    elements.billingInvoiceList.appendChild(item);
  });
}

function renderBillingTimeline(subscription, upcomingInvoice, plan) {
  if (!elements.billingTimeline) return;
  elements.billingTimeline.textContent = "";
  const normalizedPlan = normalizePlanValue(plan);
  if (!subscription && normalizedPlan === "lifetime") {
    const item = document.createElement("div");
    item.className = "history-empty";
    item.textContent = "Livstidsadgang er aktiv.";
    elements.billingTimeline.appendChild(item);
    return;
  }
  const items = [];
  if (subscription?.current_period_start) {
    items.push({
      label: "Periode start",
      value: formatBillingDate(subscription.current_period_start),
    });
  }
  const nextPaymentDate =
    upcomingInvoice?.next_payment_attempt ||
    upcomingInvoice?.period_end ||
    subscription?.current_period_end ||
    null;
  if (nextPaymentDate) {
    items.push({
      label: "Næste betaling",
      value: formatBillingDate(nextPaymentDate),
    });
  }
  if (subscription?.current_period_end) {
    items.push({
      label: subscription.cancel_at_period_end ? "Adgang udløber" : "Periode slut",
      value: formatBillingDate(subscription.current_period_end),
    });
  }

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Ingen aktiv periode endnu.";
    elements.billingTimeline.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "billing-timeline-item";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    row.appendChild(label);
    row.appendChild(value);
    elements.billingTimeline.appendChild(row);
  });
}

function updateBillingUI() {
  const data = state.billing.data || {};
  const subscription = data.subscription || null;
  const price = data.price || null;
  const lifetimePrice = data.lifetimePrice || null;
  const upcoming = data.upcomingInvoice || null;
  const paymentMethod = data.paymentMethod || null;
  const normalizedPlan = normalizePlanValue(state.profile?.plan);
  const isLifetime = normalizedPlan === "lifetime";
  const planPrice = isLifetime ? lifetimePrice : price;
  const planLabel = isLifetime
    ? (planPrice?.product?.name || formatPlanLabel(state.profile?.plan))
    : planPrice?.product?.name || formatPlanLabel(state.profile?.plan);
  let planNote =
    planPrice?.product?.description ||
    (subscription ? "Fuld adgang til alle Pro-funktioner." : "Aktivér Pro for at komme i gang.");
  if (isLifetime) {
    planNote = "Engangsbetaling giver livstidsadgang til Pro.";
  }
  const priceAmount = resolveUnitAmount(planPrice);
  const planInterval = planPrice?.recurring ? formatIntervalLabel(planPrice.recurring) : "Engangsbetaling";
  const normalizedStatus = String(subscription?.status || "").toLowerCase();
  const isCanceled = Boolean(subscription?.cancel_at_period_end) ||
    ["canceled", "incomplete_expired"].includes(normalizedStatus);
  const statusLabel = isLifetime
    ? "Livstidsadgang"
    : subscription
      ? subscription.cancel_at_period_end
        ? "Opsagt"
        : formatBillingStatusLabel(subscription.status)
      : "Ingen aktiv betaling";
  const tone = isLifetime
    ? ""
    : resolveBillingTone(subscription?.status, subscription?.cancel_at_period_end);
  const summary = formatPaymentMethodSummary(paymentMethod);
  const nextCurrency = upcoming?.currency || planPrice?.currency;
  let nextLabel = isLifetime ? "Betaling" : "Næste betaling";
  let nextAmount = isLifetime ? priceAmount : null;
  let nextDateText = isLifetime ? "Engangsbetaling gennemført." : "—";
  if (!isLifetime) {
    if (isCanceled) {
      nextLabel = "Adgang udløber";
      const endDate = subscription?.current_period_end || upcoming?.period_end || null;
      nextDateText = endDate ? `Udløber ${formatBillingDate(endDate)}` : "Ingen kommende betalinger.";
    } else if (subscription) {
      nextAmount = typeof upcoming?.amount_due === "number" ? upcoming.amount_due : priceAmount;
      const nextDate =
        upcoming?.next_payment_attempt ||
        upcoming?.period_end ||
        subscription?.current_period_end ||
        null;
      nextDateText = nextDate ? `Forfalder ${formatBillingDate(nextDate)}` : "—";
    }
  }

  if (elements.billingPlan) {
    elements.billingPlan.textContent = planLabel;
  }
  if (elements.billingPlanMeta) {
    let meta = "Ingen aktiv plan";
    if (isLifetime) {
      meta = "Livstidsadgang";
    } else if (planPrice?.recurring) {
      meta = planInterval;
    } else if (subscription) {
      meta = "Aktiv plan";
    }
    elements.billingPlanMeta.textContent = meta;
  }
  if (elements.billingPlanName) {
    elements.billingPlanName.textContent = planLabel;
  }
  if (elements.billingPlanNote) {
    elements.billingPlanNote.textContent = planNote;
  }
  if (elements.billingPlanPrice) {
    elements.billingPlanPrice.textContent = priceAmount !== null
      ? formatCurrency(priceAmount, planPrice?.currency)
      : "—";
  }
  if (elements.billingPlanCycle) {
    let cycle = "—";
    if (isLifetime) {
      cycle = "Engangsbetaling";
    } else if (planPrice?.recurring) {
      cycle = planInterval;
    } else if (planPrice) {
      cycle = "Engangsbetaling";
    } else if (subscription) {
      cycle = "Abonnementsperiode";
    }
    elements.billingPlanCycle.textContent = cycle;
  }
  if (elements.billingStatusBadge) {
    elements.billingStatusBadge.textContent = statusLabel;
    if (tone) {
      elements.billingStatusBadge.dataset.tone = tone;
    } else {
      delete elements.billingStatusBadge.dataset.tone;
    }
  }
  if (elements.billingStatusMeta) {
    let meta = "Ingen aktiv betaling endnu.";
    if (isLifetime) {
      meta = "Livstidsadgang uden fornyelser.";
    } else if (subscription?.cancel_at_period_end) {
      meta = `Opsagt pr. ${formatBillingDate(subscription.current_period_end)}`;
    } else if (subscription?.current_period_end) {
      meta = `Fornyes ${formatBillingDate(subscription.current_period_end)}`;
    } else if (subscription) {
      meta = "Status opdateres løbende.";
    }
    elements.billingStatusMeta.textContent = meta;
  }
  if (elements.billingNextAmount) {
    elements.billingNextAmount.textContent = nextAmount !== null
      ? formatCurrency(nextAmount, nextCurrency)
      : "—";
  }
  if (elements.billingNextLabel) {
    elements.billingNextLabel.textContent = nextLabel;
  }
  if (elements.billingNextDate) {
    elements.billingNextDate.textContent = nextDateText;
  }
  if (elements.billingPaymentLabel) {
    elements.billingPaymentLabel.textContent = summary.title;
  }
  if (elements.billingPaymentMeta) {
    elements.billingPaymentMeta.textContent = summary.meta;
  }
  if (elements.billingMethodTitle) {
    elements.billingMethodTitle.textContent = summary.title;
  }
  if (elements.billingMethodMeta) {
    elements.billingMethodMeta.textContent = summary.meta;
  }

  if (elements.billingHeroHint) {
    let hint = "Aktivér Pro via abonnement eller engangsbetaling.";
    if (isLifetime) {
      hint = "Du har livstidsadgang. Ingen abonnement eller fornyelser.";
    } else if (!subscription) {
      hint = "Aktivér Pro via abonnement eller engangsbetaling.";
    } else if (subscription.cancel_at_period_end) {
      hint = `Opsagt. Adgangen udløber ${formatBillingDate(subscription.current_period_end)}.`;
    } else if (["past_due", "unpaid"].includes(String(subscription.status || "").toLowerCase())) {
      hint = "Betalingen afventer. Opdatér betalingsmetode for at undgå afbrydelse.";
    }
    elements.billingHeroHint.textContent = hint;
  }

  const hasSubscription = Boolean(subscription);
  const stripePublishable = Boolean(state.config?.stripePublishableKey);
  const stripeCheckoutReady = Boolean(state.config?.stripeConfigured && state.config?.stripePublishableKey);
  if (elements.billingUpdateMethodBtn) {
    setElementVisible(elements.billingUpdateMethodBtn, hasSubscription);
    elements.billingUpdateMethodBtn.disabled = !stripePublishable || !hasSubscription;
  }
  if (elements.billingChangeMethodBtn) {
    setElementVisible(elements.billingChangeMethodBtn, hasSubscription);
    elements.billingChangeMethodBtn.disabled = !stripePublishable || !hasSubscription;
  }
  if (elements.billingToggleCancelBtn) {
    setElementVisible(elements.billingToggleCancelBtn, hasSubscription);
    elements.billingToggleCancelBtn.disabled = !hasSubscription;
    elements.billingToggleCancelBtn.textContent = subscription?.cancel_at_period_end
      ? "Genoptag abonnement"
      : "Opsig abonnement";
  }
  if (elements.billingUpgradeBtn) {
    const showUpgrade = !hasSubscription && !isLifetime;
    setElementVisible(elements.billingUpgradeBtn, showUpgrade);
    elements.billingUpgradeBtn.disabled = !stripeCheckoutReady || !showUpgrade;
  }
  if (!hasSubscription) {
    setBillingUpdatePanelVisible(false);
  }

  renderBillingTimeline(subscription, upcoming, state.profile?.plan);
  renderBillingInvoices(data.invoices);
  renderBillingMethodTags(data.paymentMethodTypes);
}

function updateAuthUI() {
  if (state.isLoading) return;
  if (!state.authReady) {
    showScreen("auth");
    setAuthControlsEnabled(false);
    setAccountControlsEnabled(false);
    setAuthStatus(state.configError || "Login er ikke klar endnu.", true);
    setAuthResendVisible(state.pendingEmailConfirmation);
    updateUserChip();
    updateAccountUI();
    applyAuthProviderVisibility();
    updateDiagnosticsUI();
    return;
  }

  const canAuth = Boolean(state.supabase);
  const hasUser = Boolean(state.session?.user);
  if (document.body) {
    document.body.dataset.authenticated = hasUser ? "true" : "false";
    if (!hasUser) {
      document.body.dataset.course = DEFAULT_COURSE;
    }
  }
  if (hasUser) {
    state.demoMode = false;
    state.pendingEmailConfirmation = false;
  } else {
    state.consentReturnTo = null;
  }

  setAuthControlsEnabled(canAuth);
  setAccountControlsEnabled(hasUser && state.backendAvailable);

  const requiresConsent = hasUser && needsConsent();
  if (!requiresConsent) {
    setConsentStatus("");
  }

  if (requiresConsent) {
    if (!state.consentReturnTo) {
      state.consentReturnTo = state.lastAppScreen || "menu";
    }
    showScreen("consent");
  } else if (!hasUser) {
    showScreen("auth");
    if (!canAuth) {
      const message =
        state.configError || "Login er ikke klar endnu.";
      setAuthStatus(message, true);
    } else {
      setAuthStatus("Log ind eller opret konto for at fortsætte.");
    }
    setAuthResendVisible(state.pendingEmailConfirmation);
  } else if (
    screens.auth?.classList.contains("active") ||
    screens.loading?.classList.contains("active") ||
    screens.consent?.classList.contains("active")
  ) {
    const nextScreen = state.consentReturnTo || state.lastAppScreen || "menu";
    state.consentReturnTo = null;
    showScreen(nextScreen);
  }
  updateUserChip();
  updateAccountUI();
  applyAuthProviderVisibility();
  updateDiagnosticsUI();
  updateDemoAvailability();
}

function requireAuthGuard(message = "Log ind for at fortsætte", options = {}) {
  if (state.session?.user) {
    if (!options.ignoreConsent && needsConsent()) {
      showScreen("consent");
      setConsentStatus("Accepter vilkår og privatlivspolitik for at fortsætte.", true);
      return false;
    }
    return true;
  }
  setAuthStatus(message, true);
  redirectToAuth();
  return false;
}

function enableDemoMode() {
  const section = document.getElementById("demo-section");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function getDemoLastRun() {
  const stored = Number(localStorage.getItem(STORAGE_KEYS.demoTrialLastRun) || 0);
  return Number.isFinite(stored) && stored > 0 ? stored : null;
}

function getDemoRemainingMs() {
  const lastRun = getDemoLastRun();
  if (!lastRun) return 0;
  return lastRun + DEMO_DAILY_WINDOW - Date.now();
}

function formatDemoWait(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "nu";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.ceil((ms % 3600000) / 60000);
  if (hours >= 23) return "i morgen";
  if (hours >= 1) return `${hours} t ${minutes} min`;
  return `${minutes} min`;
}

function loadDemoResult() {
  const stored = localStorage.getItem(STORAGE_KEYS.demoQuizResult);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveDemoResult(result) {
  if (!result || typeof result !== "object") return;
  localStorage.setItem(STORAGE_KEYS.demoQuizResult, JSON.stringify(result));
}

function buildDemoResult() {
  const questions = Array.isArray(state.demoQuiz.questions) ? state.demoQuiz.questions : [];
  if (!questions.length) return null;
  const answers = Array.isArray(state.demoQuiz.answers) ? state.demoQuiz.answers : [];
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const mcqCorrectPoints = Number(scoringPolicy.mcq?.correct ?? 3);
  const mcqWrongPoints = Number(scoringPolicy.mcq?.wrong ?? -1);
  const mcqQuestions = questions.filter((item) => item?.type === "mcq");
  const shortQuestion = questions.find((item) => item?.type === "short");
  if (!mcqQuestions.length || !shortQuestion) return null;

  const mcqAnswers = answers.filter((answer) => answer?.type === "mcq");
  const mcqCorrect = mcqAnswers.filter((answer) => answer.correct).length;
  const mcqWrong = Math.max(0, mcqQuestions.length - mcqCorrect);
  const mcqCount = mcqQuestions.length;
  const mcqPoints = mcqCorrect * mcqCorrectPoints + mcqWrong * mcqWrongPoints;
  const mcqMax = mcqCount * mcqCorrectPoints;
  const mcqMin = mcqCount * mcqWrongPoints;
  let mcqPercent = 0;
  if (mcqCount > 0 && mcqMax !== mcqMin) {
    mcqPercent = ((mcqPoints - mcqMin) / (mcqMax - mcqMin)) * 100;
  }
  mcqPercent = clamp(mcqPercent, 0, 100);

  const shortParts = Array.isArray(shortQuestion.parts) ? shortQuestion.parts : [];
  const shortAnswer = answers.find((answer) => answer?.type === "short");
  let shortRatio = 0;
  if (shortAnswer) {
    if (Number.isFinite(shortAnswer.ratio)) {
      shortRatio = shortAnswer.ratio;
    } else if (Array.isArray(shortAnswer.parts) && shortAnswer.parts.length) {
      shortRatio =
        shortAnswer.parts.reduce((sum, part) => sum + (Number(part.matchRatio) || 0), 0) /
        shortAnswer.parts.length;
    } else if (shortAnswer.correct) {
      shortRatio = 1;
    }
  }
  shortRatio = clamp(shortRatio, 0, 1);
  const shortMax = Math.max(shortParts.length, 1);
  const shortPoints = Number((shortRatio * shortMax).toFixed(1));
  const shortPercent = shortMax > 0 ? clamp((shortPoints / shortMax) * 100, 0, 100) : 0;

  let overallPercent = 0;
  if (mcqCount > 0 && shortMax > 0) {
    const weights = normalizeScoreWeights(scoringPolicy.weights);
    overallPercent = weights.mcq * mcqPercent + weights.short * shortPercent;
  } else if (mcqCount > 0) {
    overallPercent = mcqPercent;
  } else if (shortMax > 0) {
    overallPercent = shortPercent;
  }

  return {
    completedAt: new Date().toISOString(),
    mcqCount,
    mcqCorrect,
    mcqWrong,
    mcqPoints,
    mcqMax,
    mcqMin,
    mcqPercent,
    shortCount: 1,
    shortMax,
    shortPoints,
    shortPercent,
    overallPercent,
    grade: getGradeForPercent(overallPercent),
    totalQuestions: questions.length,
    imported: false,
  };
}

function applyBestScore(value) {
  if (!Number.isFinite(value)) return;
  const courseId = getActiveCourse();
  if (value <= getBestScoreForCourse(courseId)) return;
  setBestScoreForCourse(courseId, value);
}

function canRunDemoQuiz() {
  const lastRun = getDemoLastRun();
  if (!lastRun) return true;
  return Date.now() - lastRun >= DEMO_DAILY_WINDOW;
}

function setDemoStatus(message, isWarn = false) {
  if (!elements.demoStatus) return;
  elements.demoStatus.textContent = message || "";
  elements.demoStatus.classList.toggle("warn", isWarn);
}

function updateDemoCardTitle() {
  if (!elements.demoCardTitle) return;
  if (state.demoQuiz.status === "active") {
    elements.demoCardTitle.textContent = "Mini-runde i gang";
  } else if (state.demoQuiz.status === "complete") {
    elements.demoCardTitle.textContent = "Prøvespil afsluttet";
  } else {
    elements.demoCardTitle.textContent = "Træk dagens mini-runde";
  }
}

function updateDemoAvailability() {
  if (!elements.demoStartBtn) return;
  if (state.demoQuiz.status === "active" || state.demoQuiz.status === "loading") return;

  if (!state.backendAvailable) {
    elements.demoStartBtn.disabled = true;
    elements.demoStartBtn.textContent = "Prøvespil er offline";
    setDemoStatus(state.configError || "Prøvespil er ikke tilgængeligt lige nu.", true);
    if (elements.demoLimit) {
      elements.demoLimit.textContent = "Prøvespil er offline";
    }
    updateDemoCardTitle();
    return;
  }

  const canStart = canRunDemoQuiz();
  elements.demoStartBtn.disabled = !canStart;
  elements.demoStartBtn.textContent = canStart ? "Start prøvespil" : "Prøvespil brugt i dag";
  if (canStart) {
    setDemoStatus("Klar til at starte.");
    if (elements.demoLimit) {
      elements.demoLimit.textContent = "Én gang pr. dag";
    }
  } else {
    const remaining = getDemoRemainingMs();
    const waitText = formatDemoWait(remaining);
    setDemoStatus(`Dagens prøvespil er brugt. Prøv igen om ${waitText}.`, true);
    if (elements.demoLimit) {
      elements.demoLimit.textContent = `Tilgængelig igen om ${waitText}`;
    }
  }
  updateDemoCardTitle();
}

function updateDemoProgress() {
  const total = state.demoQuiz.questions.length || DEMO_TOTAL_QUESTIONS;
  const current =
    state.demoQuiz.status === "active"
      ? Math.min(state.demoQuiz.currentIndex + 1, total)
      : 0;
  if (elements.demoProgress) {
    elements.demoProgress.textContent = `${current}/${total}`;
  }
  if (elements.demoScore) {
    elements.demoScore.textContent = `${state.demoQuiz.score}/${total}`;
  }
  if (elements.demoStep) {
    elements.demoStep.textContent = `Spørgsmål ${current || 1}/${total}`;
  }
}

function setDemoView(view) {
  if (elements.demoLoading) {
    setElementVisible(elements.demoLoading, view === "loading");
  }
  if (elements.demoEmpty) {
    setElementVisible(elements.demoEmpty, view === "idle");
  }
  if (elements.demoQuestion) {
    setElementVisible(elements.demoQuestion, view === "active");
  }
  if (elements.demoResult) {
    setElementVisible(elements.demoResult, view === "result");
  }
  updateDemoCardTitle();
}

function setDemoFeedback({ title, lines = [], tone } = {}) {
  if (!elements.demoFeedback) return;
  elements.demoFeedback.innerHTML = "";
  if (!title && (!lines || lines.length === 0)) {
    setElementVisible(elements.demoFeedback, false);
    elements.demoFeedback.classList.remove("good", "bad");
    return;
  }
  if (title) {
    const titleEl = document.createElement("div");
    titleEl.className = "demo-feedback-title";
    titleEl.textContent = title;
    elements.demoFeedback.appendChild(titleEl);
  }
  (lines || []).forEach((line) => {
    if (!line) return;
    const lineEl = document.createElement("div");
    lineEl.textContent = line;
    elements.demoFeedback.appendChild(lineEl);
  });
  elements.demoFeedback.classList.toggle("good", tone === "good");
  elements.demoFeedback.classList.toggle("bad", tone === "bad");
  setElementVisible(elements.demoFeedback, true);
}

function resetDemoQuizState() {
  state.demoQuiz = {
    status: "idle",
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
  };
  if (elements.demoOptions) {
    elements.demoOptions.innerHTML = "";
  }
  if (elements.demoShortList) {
    elements.demoShortList.innerHTML = "";
  }
  if (elements.demoShortStatus) {
    elements.demoShortStatus.textContent = "";
  }
  if (elements.demoShortCheckBtn) {
    elements.demoShortCheckBtn.disabled = false;
  }
  if (elements.demoNextBtn) {
    elements.demoNextBtn.disabled = true;
    elements.demoNextBtn.textContent = "Næste";
  }
  setDemoFeedback();
  updateDemoProgress();
  setDemoView("idle");
}

function buildDemoKeywords(answer) {
  const tokens = String(answer || "")
    .split(/[\s,.;:()]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3);
  return [...new Set(tokens)].slice(0, 4);
}

function buildDemoMeta(source) {
  const meta = source?.meta && typeof source.meta === "object" ? source.meta : {};
  const category = String(source?.category || meta.category || "").trim();
  const yearDisplay = String(source?.yearDisplay || meta.yearDisplay || source?.year || meta.year || "").trim();
  const number = Number(source?.number ?? meta.number);
  return {
    category,
    yearDisplay,
    number: Number.isFinite(number) ? number : null,
  };
}

function buildDemoQuestions(payload) {
  const output = [];
  const mcqItems = Array.isArray(payload?.mcq) ? payload.mcq : [];
  mcqItems.slice(0, 5).forEach((item) => {
    const question = String(item?.question || "").trim();
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => String(option || "").trim()).filter(Boolean)
      : [];
    const correctIndex = Number(item?.correctIndex);
    if (!question || options.length < 4 || !Number.isFinite(correctIndex)) return;
    const meta = buildDemoMeta(item);
    output.push({
      type: "mcq",
      question,
      options: options.slice(0, 4),
      correctIndex: Math.min(3, Math.max(0, correctIndex)),
      explanation: String(item?.explanation || "").trim(),
      meta,
    });
  });

  const short = payload?.short;
  if (short) {
    const meta = buildDemoMeta(short);
    const intro = String(short.intro || short.question || meta.category || "").trim();
    let parts = [];
    if (Array.isArray(short.parts)) {
      parts = short.parts
        .map((part) => {
          const question = String(part?.question || "").trim();
          const answer = String(part?.answer || "").trim();
          if (!question || !answer) return null;
          const fallbackKeywords = buildDemoKeywords(answer);
          return {
            label: String(part?.label || "").trim(),
            question,
            answer,
            explanation: String(part?.explanation || "").trim(),
            keywords: Array.isArray(part?.keywords)
              ? part.keywords.map((word) => String(word || "").trim()).filter(Boolean)
              : fallbackKeywords,
          };
        })
        .filter(Boolean);
    } else if (String(short.question || "").trim()) {
      parts = [
        {
          label: String(short.label || "").trim(),
          question: String(short.question || "").trim(),
          answer: String(short.answer || "").trim(),
          explanation: String(short.explanation || "").trim(),
          keywords: Array.isArray(short.keywords)
            ? short.keywords.map((word) => String(word || "").trim()).filter(Boolean)
            : buildDemoKeywords(short.answer),
        },
      ].filter((part) => part.question && part.answer);
    }
    if (parts.length) {
      output.push({
        type: "short",
        intro,
        parts,
        meta,
      });
    }
  }
  return output;
}

function renderDemoQuestion() {
  const question = state.demoQuiz.questions[state.demoQuiz.currentIndex];
  if (!question) return;
  const meta = question.meta || {};

  if (elements.demoQuestionText) {
    elements.demoQuestionText.textContent =
      question.type === "short"
        ? question.intro || "Kortsvar"
        : question.question;
  }
  if (elements.demoQuestionType) {
    elements.demoQuestionType.textContent = question.type === "short" ? "Kortsvar" : "MCQ";
  }
  if (elements.demoQuestionCategory) {
    const category = String(meta.category || question.category || "").trim();
    elements.demoQuestionCategory.textContent = category;
    setElementVisible(elements.demoQuestionCategory, Boolean(category));
  }
  if (elements.demoQuestionYear) {
    const yearDisplay = String(meta.yearDisplay || question.yearDisplay || question.year || "").trim();
    elements.demoQuestionYear.textContent = yearDisplay;
    setElementVisible(elements.demoQuestionYear, Boolean(yearDisplay));
  }
  if (elements.demoShort) {
    setElementVisible(elements.demoShort, question.type === "short");
  }
  if (elements.demoOptions) {
    elements.demoOptions.innerHTML = "";
    setElementVisible(elements.demoOptions, question.type === "mcq");
  }
  if (elements.demoShortList) {
    elements.demoShortList.innerHTML = "";
  }
  if (elements.demoNextBtn) {
    const isLast = state.demoQuiz.currentIndex >= state.demoQuiz.questions.length - 1;
    elements.demoNextBtn.textContent = isLast ? "Se resultat" : "Næste";
    elements.demoNextBtn.disabled = true;
  }

  if (question.type === "mcq" && elements.demoOptions) {
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-btn";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = String.fromCharCode(65 + index);
      button.appendChild(label);
      button.appendChild(document.createTextNode(option));
      button.addEventListener("click", () => handleDemoOptionSelect(index));
      elements.demoOptions.appendChild(button);
    });
  }

  if (question.type === "short") {
    if (elements.demoShortList) {
      const parts = Array.isArray(question.parts) ? question.parts : [];
      if (elements.demoShortStatus) {
        elements.demoShortStatus.textContent = parts.length
          ? `${parts.length} delspørgsmål`
          : "";
      }
      parts.forEach((part, index) => {
        const card = document.createElement("div");
        card.className = "short-part";

        const head = document.createElement("div");
        head.className = "short-part-head";

        const label = document.createElement("span");
        label.className = "short-part-label";
        const labelText = String(part.label || "").trim() || String.fromCharCode(65 + index);
        label.textContent = labelText.toUpperCase();

        const title = document.createElement("span");
        title.className = "short-part-title";
        title.textContent = part.question;

        head.appendChild(label);
        head.appendChild(title);

        const inputWrap = document.createElement("div");
        inputWrap.className = "short-answer-input";

        const textarea = document.createElement("textarea");
        textarea.rows = 3;
        textarea.placeholder = `Skriv kort svar til delspørgsmål ${label.textContent}`;
        textarea.setAttribute("aria-label", `Svar til delspørgsmål ${label.textContent}`);

        card.appendChild(head);
        inputWrap.appendChild(textarea);
        card.appendChild(inputWrap);
        elements.demoShortList.appendChild(card);
      });
    }
    if (elements.demoShortCheckBtn) {
      elements.demoShortCheckBtn.disabled = false;
    }
    if (elements.demoShortGuidance) {
      elements.demoShortGuidance.textContent = "Fokusér på de vigtigste begreber i hvert delspørgsmål.";
    }
  } else if (elements.demoShortStatus) {
    elements.demoShortStatus.textContent = "";
  }

  setDemoFeedback();
  updateDemoProgress();
}

function handleDemoOptionSelect(selectedIndex) {
  const question = state.demoQuiz.questions[state.demoQuiz.currentIndex];
  if (!question || question.type !== "mcq") return;
  if (state.demoQuiz.answers[state.demoQuiz.currentIndex]) return;

  const isCorrect = selectedIndex === question.correctIndex;
  state.demoQuiz.answers[state.demoQuiz.currentIndex] = {
    type: "mcq",
    selectedIndex,
    correct: isCorrect,
  };
  if (isCorrect) {
    state.demoQuiz.score += 1;
  }
  const optionButtons = elements.demoOptions
    ? elements.demoOptions.querySelectorAll(".option-btn")
    : [];
  optionButtons.forEach((button, index) => {
    button.disabled = true;
    button.classList.add("locked");
    if (index === question.correctIndex) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  const explanation = question.explanation
    ? question.explanation
    : `Rigtigt svar: ${question.options[question.correctIndex]}`;
  setDemoFeedback({
    title: isCorrect ? "Korrekt" : "Forkert",
    lines: [explanation],
    tone: isCorrect ? "good" : "bad",
  });
  if (elements.demoNextBtn) {
    elements.demoNextBtn.disabled = false;
  }
  updateDemoProgress();
}

function handleDemoShortCheck() {
  const question = state.demoQuiz.questions[state.demoQuiz.currentIndex];
  if (!question || question.type !== "short") return;
  if (state.demoQuiz.answers[state.demoQuiz.currentIndex]) return;
  const parts = Array.isArray(question.parts) ? question.parts : [];
  const inputs = elements.demoShortList
    ? [...elements.demoShortList.querySelectorAll("textarea")]
    : [];
  if (!parts.length || !inputs.length) return;
  const responses = inputs.map((input) => input.value.trim());
  if (responses.some((text) => !text)) {
    setDemoFeedback({ title: "Skriv svar til alle delspørgsmål først.", tone: "bad" });
    return;
  }

  const evaluated = parts.map((part, index) => {
    const response = responses[index] || "";
    const normalized = response.toLowerCase();
    const keywords = part.keywords || [];
    const matched = keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
    const matchRatio = keywords.length ? matched.length / keywords.length : 1;
    return {
      label: part.label,
      response,
      matched,
      matchRatio,
      keywords,
      answer: part.answer,
      explanation: part.explanation,
    };
  });
  const averageRatio = evaluated.reduce((sum, part) => sum + part.matchRatio, 0) / evaluated.length;
  const isCorrect = averageRatio >= DEMO_SHORT_MATCH_THRESHOLD;

  state.demoQuiz.answers[state.demoQuiz.currentIndex] = {
    type: "short",
    parts: evaluated,
    correct: isCorrect,
    ratio: averageRatio,
  };
  if (isCorrect) {
    state.demoQuiz.score += 1;
  }

  inputs.forEach((input) => {
    input.disabled = true;
  });
  if (elements.demoShortCheckBtn) {
    elements.demoShortCheckBtn.disabled = true;
  }

  const lines = [];
  evaluated.forEach((part, index) => {
    const label = String(part.label || "").trim()
      ? String(part.label).toUpperCase()
      : String.fromCharCode(65 + index);
    if (part.answer) {
      lines.push(`${label}: Modelbesvarelse: ${part.answer}`);
    }
    if (part.keywords.length) {
      lines.push(`${label}: Nøgleord: ${part.keywords.join(", ")}`);
    }
    if (part.explanation) {
      lines.push(`${label}: ${part.explanation}`);
    }
  });

  setDemoFeedback({
    title: isCorrect ? "Godt svar" : "Kan forbedres",
    lines,
    tone: isCorrect ? "good" : "bad",
  });
  if (elements.demoNextBtn) {
    elements.demoNextBtn.disabled = false;
  }
  updateDemoProgress();
}

function completeDemoQuiz() {
  state.demoQuiz.status = "complete";
  const total = state.demoQuiz.questions.length || DEMO_TOTAL_QUESTIONS;
  if (elements.demoResultScore) {
    elements.demoResultScore.textContent = `Score ${state.demoQuiz.score}/${total}`;
  }
  const demoResult = buildDemoResult();
  if (demoResult) {
    saveDemoResult(demoResult);
  }
  setDemoStatus("Prøvespil gennemført. Kom tilbage i morgen for en ny runde.");
  setDemoView("result");
  updateDemoAvailability();
}

function handleDemoNext() {
  if (!state.demoQuiz.answers[state.demoQuiz.currentIndex]) {
    setDemoFeedback({ title: "Vælg et svar først.", tone: "bad" });
    return;
  }
  if (state.demoQuiz.currentIndex >= state.demoQuiz.questions.length - 1) {
    completeDemoQuiz();
    return;
  }
  state.demoQuiz.currentIndex += 1;
  renderDemoQuestion();
}

function closeDemoQuiz() {
  resetDemoQuizState();
  updateDemoAvailability();
}

async function startDemoQuiz() {
  if (!elements.demoStartBtn) return;
  if (!state.backendAvailable) {
    setDemoStatus(state.configError || "Prøvespil er ikke tilgængeligt lige nu.", true);
    updateDemoAvailability();
    return;
  }
  if (!canRunDemoQuiz()) {
    updateDemoAvailability();
    return;
  }

  state.demoQuiz.status = "loading";
  setDemoStatus("Trækker dagens prøvespil …");
  setDemoView("loading");
  elements.demoStartBtn.disabled = true;

  try {
    const res = await fetch("/api/demo-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.status === 429) {
      localStorage.setItem(STORAGE_KEYS.demoTrialLastRun, String(Date.now()));
      state.demoQuiz.status = "idle";
      updateDemoAvailability();
      setDemoView("idle");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorCode = String(data?.error || "").toLowerCase();
      let message = "Prøvespil kunne ikke startes.";
      if (errorCode === "rate_limited") {
        message = "Dagens prøvespil er allerede brugt.";
      } else if (errorCode === "data_missing") {
        message = "Prøvespillet kunne ikke bygges endnu.";
      }
      throw new Error(message);
    }
    const data = await res.json();
    const questions = buildDemoQuestions(data);
    if (questions.length < DEMO_TOTAL_QUESTIONS) {
      throw new Error("Prøvespillet kunne ikke bygges endnu.");
    }

    localStorage.setItem(STORAGE_KEYS.demoTrialLastRun, String(Date.now()));
    state.demoQuiz = {
      status: "active",
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
    };
    setDemoStatus("Mini-runden er klar.");
    setDemoView("active");
    renderDemoQuestion();
  } catch (error) {
    setDemoStatus(error.message || "Prøvespil kunne ikke startes.", true);
    state.demoQuiz.status = "idle";
    setDemoView("idle");
  } finally {
    updateDemoAvailability();
  }
}

function isSameOrigin(url) {
  if (!url) return false;
  const rawUrl = typeof url === "string" ? url : url.url || url.href;
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

async function getSessionToken() {
  return state.session?.access_token || null;
}

function buildTraceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `trace-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

async function safeReadJson(res) {
  if (!res) return null;
  try {
    return await res.json();
  } catch (error) {
    return null;
  }
}

async function apiFetch(url, options = {}) {
  const { timeoutMs, ai, traceId, ...rest } = options;
  const headers = { ...(rest.headers || {}) };
  const authToken = await getSessionToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  if (ai === true && isSameOrigin(url)) {
    headers["x-trace-id"] = traceId || buildTraceId();
  }
  if (
    state.useOwnKey &&
    state.userOpenAiKey &&
    ai === true &&
    isSameOrigin(url)
  ) {
    headers["x-user-openai-key"] = state.userOpenAiKey;
  }
  const fetchOptions = { ...rest, headers };
  let timeoutId = null;
  if (timeoutMs && typeof AbortController !== "undefined") {
    const controller = new AbortController();
    if (fetchOptions.signal) {
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function") {
        fetchOptions.signal = AbortSignal.any([fetchOptions.signal, controller.signal]);
      } else {
        if (fetchOptions.signal.aborted) {
          controller.abort();
        } else {
          fetchOptions.signal.addEventListener("abort", () => controller.abort(), { once: true });
        }
        fetchOptions.signal = controller.signal;
      }
    } else {
      fetchOptions.signal = controller.signal;
    }
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  try {
    return await fetch(url, fetchOptions);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function applySession(session) {
  state.session = session || null;
  state.user = session?.user || null;
}

async function loadRuntimeConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) {
    let detail = "Serveren svarer ikke lige nu.";
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

async function loadAuthSettings() {
  state.authSettingsStatus = "";
  return null;
}

async function hydrateAuthProviders() {
  await loadAuthSettings();
  applyAuthProviderVisibility();
  updateDiagnosticsUI();
}

function initSupabaseClient() {
  if (state.supabase) return;
  const supabaseLib = window.supabase;
  if (!supabaseLib?.createClient || !state.config?.supabaseUrl || !state.config?.supabaseAnonKey) {
    state.supabase = null;
    state.configError = state.configError || "Supabase klienten er ikke klar.";
    return;
  }
  state.supabase = supabaseLib.createClient(
    state.config.supabaseUrl,
    state.config.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

async function refreshSession({ updateUi = true } = {}) {
  if (!state.supabase) {
    applySession(null);
    state.authReady = true;
    if (updateUi) {
      updateAuthUI();
    }
    return;
  }
  try {
    const { data, error } = await state.supabase.auth.getSession();
    if (error) {
      applySession(null);
    } else {
      applySession(data?.session || null);
      if (state.session?.user) {
        state.demoMode = false;
      }
    }
  } catch (error) {
    applySession(null);
  }
  state.authReady = true;
  if (updateUi) {
    updateAuthUI();
  }
}

function subscribeToAuthChanges() {
  if (!state.supabase) return;
  state.supabase.auth.onAuthStateChange(async (_event, session) => {
    const hadUser = Boolean(state.session?.user);
    applySession(session || null);
    state.authReady = true;
    const hasUser = Boolean(state.session?.user);
    if (hadUser !== hasUser) {
      state.studioResolved = false;
    }
    if (hasUser) {
      state.demoMode = false;
      state.pendingEmailConfirmation = false;
      setAuthResendVisible(false);
    } else {
      resetProfileRetry();
      state.profile = null;
      state.subscription = null;
      resetAdminState();
    }

    const shouldShowLoader = hasUser && !state.isLoading && !hadUser;
    if (shouldShowLoader) {
      setLoadingState(true);
      setLoadingMessage("Logger ind …", "Henter profil og adgang");
      setLoadingProgress(45);
    }

    try {
      if (hasUser) {
        setLoadingMessage("Henter profil …", "Synkroniserer konto");
        setLoadingProgress(60);
        await guardedStep(refreshProfile(), PROFILE_TIMEOUT_MS, "Profil indlæsning tog for lang tid");
        if (!state.allQuestions.length) {
          setLoadingMessage("Indlæser spørgsmål …", "Bygger spørgsmålspulje");
          setLoadingProgress(75);
          await guardedStep(
            ensureQuestionsLoaded(),
            QUESTIONS_TIMEOUT_MS,
            "Spørgsmål indlæsning tog for lang tid"
          );
        }
      }
      setLoadingMessage("Tjekker hjælpefunktioner …", "Assistent og oplæsning");
      setLoadingProgress(85);
      await guardedStep(checkAiAvailability(), HEALTH_TIMEOUT_MS, "AI tjek tog for lang tid");
    } finally {
      if (shouldShowLoader) {
        setLoadingState(false);
      } else {
        updateAuthUI();
      }
    }
  });
}

function resetProfileRetry() {
  if (state.profileRetryTimer) {
    clearTimeout(state.profileRetryTimer);
    state.profileRetryTimer = null;
  }
  state.profileRetryCount = 0;
}

function scheduleProfileRetry() {
  if (!state.session?.user) return;
  if (state.profileRetryTimer) return;
  if (state.profileRetryCount >= PROFILE_RETRY_MAX) return;
  state.profileRetryCount += 1;
  state.profileRetryTimer = setTimeout(() => {
    state.profileRetryTimer = null;
    void refreshProfile();
  }, PROFILE_RETRY_DELAY_MS);
}

async function refreshProfile() {
  if (!state.session?.user) return;
  try {
    const res = await apiFetch("/api/me", {
      method: "GET",
      timeoutMs: PROFILE_FETCH_TIMEOUT_MS,
    });
    if (!res.ok) {
      scheduleProfileRetry();
      return;
    }
    const data = await res.json();
    state.profile = data.profile || null;
    state.subscription = data.subscription || null;
    if (!state.userOpenAiKey) {
      state.useOwnKey = Boolean(state.profile?.own_key_enabled);
    }
    updateAccountUI();
    updateUserChip();
    void checkAdminStatus();
    resetProfileRetry();
  } catch (error) {
    // Ignore profile fetch errors for now.
    scheduleProfileRetry();
  } finally {
    if (state.session?.user) {
      void loadUserStateFromSupabase();
    }
  }
}

async function signInWithProvider(provider) {
  setAuthStatus("Brug login-boksen ovenfor.");
}

function getAuthEmailValue() {
  const email = elements.authEmailInput ? elements.authEmailInput.value.trim() : "";
  if (!email) {
    setAuthStatus("Skriv din email først.", true);
    return "";
  }
  return email;
}

function getAuthPasswordValue() {
  const password = elements.authPasswordInput ? elements.authPasswordInput.value : "";
  if (!password) {
    setAuthStatus("Skriv din adgangskode først.", true);
    return "";
  }
  return password;
}

async function signInWithPassword() {
  setAuthStatus("Brug login-boksen ovenfor.");
}

async function signUpWithPassword() {
  setAuthStatus("Brug login-boksen ovenfor.");
}

async function signInWithEmail() {
  setAuthStatus("Brug login-boksen ovenfor.");
}

async function resendConfirmationEmail() {
  setAuthStatus("Brug login-boksen ovenfor.");
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
  if (!requireAuthGuard("Log ind for at fortsætte", { ignoreConsent: true })) return;
  const gateActive = screens.consent?.classList.contains("active");
  const termsEl = gateActive ? elements.consentGateTerms : elements.consentTerms;
  const privacyEl = gateActive ? elements.consentGatePrivacy : elements.consentPrivacy;
  const acceptTerms = Boolean(termsEl?.checked);
  const acceptPrivacy = Boolean(privacyEl?.checked);
  const setStatus = gateActive ? setConsentStatus : setAccountStatus;

  if (!acceptTerms && !acceptPrivacy) {
    const message = gateActive
      ? "Du skal acceptere vilkår og privatlivspolitik for at fortsætte."
      : "Vælg mindst ét samtykke.";
    setStatus(message, true);
    return;
  }
  if (gateActive && !(acceptTerms && acceptPrivacy)) {
    setStatus("Du skal acceptere vilkår og privatlivspolitik for at fortsætte.", true);
    return;
  }

  const res = await apiFetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acceptTerms, acceptPrivacy }),
  });
  if (res.ok) {
    const data = await res.json();
    state.profile = data.profile || state.profile;
    updateAccountUI();
    updateUserChip();
    if (gateActive) {
      setConsentStatus("Tak! Du er klar.", false);
      updateAuthUI();
    } else {
      setAccountStatus("Samtykke gemt.");
    }
  } else {
    setStatus("Kunne ikke gemme samtykke.", true);
  }
}

function setCheckoutStatus(message, isWarn = false) {
  if (!elements.checkoutStatus) return;
  const text = String(message || "").trim();
  elements.checkoutStatus.textContent = text;
  elements.checkoutStatus.classList.toggle("warn", Boolean(text) && isWarn);
  setElementVisible(elements.checkoutStatus, Boolean(text));
}

function setCheckoutControlsEnabled(enabled) {
  const canSubmit = Boolean(enabled && state.checkoutClientSecret && state.stripeElements);
  const canSwitchPlans = Boolean(enabled);
  const hasSubscription = Boolean(state.config?.stripeHasSubscriptionPrice || !state.config);
  const hasLifetime = Boolean(state.config?.stripeHasLifetimePrice || !state.config);
  if (elements.checkoutSubmitBtn) {
    elements.checkoutSubmitBtn.disabled = !canSubmit;
  }
  if (elements.checkoutHostedBtn) {
    elements.checkoutHostedBtn.disabled = !enabled;
  }
  if (elements.checkoutCancelBtn) {
    elements.checkoutCancelBtn.disabled = !enabled;
  }
  if (elements.checkoutBackBtn) {
    elements.checkoutBackBtn.disabled = !enabled;
  }
  if (elements.checkoutPlanSubscriptionBtn) {
    elements.checkoutPlanSubscriptionBtn.disabled = !canSwitchPlans || !hasSubscription;
  }
  if (elements.checkoutPlanLifetimeBtn) {
    elements.checkoutPlanLifetimeBtn.disabled = !canSwitchPlans || !hasLifetime;
  }
}

function getStripeClient() {
  if (state.stripeClient) return state.stripeClient;
  if (!window.Stripe || !state.config?.stripePublishableKey) return null;
  state.stripeClient = window.Stripe(state.config.stripePublishableKey);
  return state.stripeClient;
}

function unmountCheckoutElement() {
  if (state.stripePaymentElement) {
    state.stripePaymentElement.unmount();
  }
  state.stripePaymentElement = null;
  state.stripeElements = null;
}

function clearCheckoutElement() {
  unmountCheckoutElement();
  clearExpressCheckout();
  state.checkoutClientSecret = null;
  state.checkoutSubscriptionId = null;
  state.checkoutPrice = null;
  if (elements.checkoutPrice) {
    elements.checkoutPrice.textContent = "—";
  }
  if (elements.checkoutInterval) {
    elements.checkoutInterval.textContent = "Pr. måned";
  }
  if (elements.checkoutTotal) {
    elements.checkoutTotal.textContent = "—";
  }
  if (elements.checkoutPlanName) {
    elements.checkoutPlanName.textContent = "Pro";
  }
  if (elements.checkoutPlanNote) {
    elements.checkoutPlanNote.textContent = "";
    setElementVisible(elements.checkoutPlanNote, false);
  }
  if (elements.checkoutPlanDisclaimer) {
    elements.checkoutPlanDisclaimer.textContent = "";
    setElementVisible(elements.checkoutPlanDisclaimer, false);
  }
  if (elements.checkoutTrust) {
    elements.checkoutTrust.textContent = "Betal med kort, Apple Pay eller Google Pay (hvis tilgængeligt).";
  }
}

function unmountBillingPaymentElement() {
  if (state.billingPaymentElement) {
    state.billingPaymentElement.unmount();
  }
  state.billingPaymentElement = null;
  state.billingElements = null;
}

function clearBillingPaymentElement() {
  unmountBillingPaymentElement();
  state.billing.setupClientSecret = null;
  if (elements.billingPaymentElement) {
    elements.billingPaymentElement.textContent = "";
  }
}

function setBillingUpdatePanelVisible(isVisible) {
  if (!elements.billingUpdatePanel) return;
  setElementVisible(elements.billingUpdatePanel, Boolean(isVisible));
  if (!isVisible) {
    setBillingUpdateStatus("");
    clearBillingPaymentElement();
  }
}

function formatCurrency(amount, currency) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  const code = String(currency || "DKK").toUpperCase();
  try {
    return new Intl.NumberFormat("da-DK", { style: "currency", currency: code }).format(
      amount / 100
    );
  } catch (error) {
    return `${(amount / 100).toFixed(2)} ${code}`;
  }
}

function resolveUnitAmount(price) {
  if (!price) return null;
  if (typeof price.unit_amount === "number" && Number.isFinite(price.unit_amount)) {
    return price.unit_amount;
  }
  if (typeof price.unit_amount_decimal === "string") {
    const parsed = Number(price.unit_amount_decimal);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return null;
}

function formatIntervalLabel(recurring) {
  if (!recurring) return "Engangsbetaling";
  const interval = recurring.interval || "month";
  const count = recurring.interval_count || 1;
  const unitMap = {
    day: { single: "dag", plural: "dage" },
    week: { single: "uge", plural: "uger" },
    month: { single: "måned", plural: "måneder" },
    year: { single: "år", plural: "år" },
  };
  const unit = unitMap[interval] || { single: "periode", plural: "perioder" };
  if (count === 1) {
    return `Pr. ${unit.single}`;
  }
  return `Hver ${count} ${unit.plural}`;
}

const LIFETIME_PLAN_DISCLAIMER =
  "Vigtigt: Ved livstidsadgang kan vi blive nødt til at lukke for Pro, hvis driftsudgifterne på et tidspunkt " +
  "overstiger et niveau, der bliver en økonomisk byrde for virksomheden.";

function normalizeCheckoutPlanType(value) {
  return value === "lifetime" ? "lifetime" : "subscription";
}

function resolveCheckoutPlanType(value) {
  const normalized = normalizeCheckoutPlanType(value);
  const hasSubscription = Boolean(state.config?.stripeHasSubscriptionPrice);
  const hasLifetime = Boolean(state.config?.stripeHasLifetimePrice);
  if (normalized === "subscription" && !hasSubscription && hasLifetime) return "lifetime";
  if (normalized === "lifetime" && !hasLifetime && hasSubscription) return "subscription";
  return normalized;
}

function applyCheckoutPlanButtons(planType) {
  const normalized = normalizeCheckoutPlanType(planType);
  const hasSubscription = Boolean(state.config?.stripeHasSubscriptionPrice || !state.config);
  const hasLifetime = Boolean(state.config?.stripeHasLifetimePrice || !state.config);
  if (elements.checkoutPlanSubscriptionBtn) {
    elements.checkoutPlanSubscriptionBtn.disabled = !hasSubscription;
    elements.checkoutPlanSubscriptionBtn.classList.toggle("primary", normalized === "subscription");
    elements.checkoutPlanSubscriptionBtn.classList.toggle("ghost", normalized !== "subscription");
  }
  if (elements.checkoutPlanLifetimeBtn) {
    elements.checkoutPlanLifetimeBtn.disabled = !hasLifetime;
    elements.checkoutPlanLifetimeBtn.classList.toggle("primary", normalized === "lifetime");
    elements.checkoutPlanLifetimeBtn.classList.toggle("ghost", normalized !== "lifetime");
  }
}

function updateCheckoutSummary(price, planType) {
  if (!price) return;
  const normalizedPlanType = normalizeCheckoutPlanType(planType);
  const unitAmount = resolveUnitAmount(price);
  const amount = formatCurrency(unitAmount, price.currency);
  const interval = formatIntervalLabel(price.recurring);
  const baseName = price.product?.name || "Pro";
  const productNote = String(price.product?.description || "").trim();
  const planName = normalizedPlanType === "lifetime"
    ? `${baseName} (livstid)`
    : `${baseName} (abonnement)`;
  const planNote = productNote || (
    normalizedPlanType === "lifetime"
      ? "Engangsbetaling med livstidsadgang."
      : "Fornyes månedligt. Du kan opsige når som helst."
  );
  if (elements.checkoutPlanName) {
    elements.checkoutPlanName.textContent = planName;
  }
  if (elements.checkoutPlanNote) {
    elements.checkoutPlanNote.textContent = planNote;
    setElementVisible(elements.checkoutPlanNote, Boolean(planNote));
  }
  if (elements.checkoutPrice) {
    elements.checkoutPrice.textContent = amount;
  }
  if (elements.checkoutInterval) {
    elements.checkoutInterval.textContent = interval;
  }
  if (elements.checkoutTotal) {
    elements.checkoutTotal.textContent = amount;
  }
  if (elements.checkoutPlanDisclaimer) {
    const showDisclaimer = normalizedPlanType === "lifetime";
    elements.checkoutPlanDisclaimer.textContent = showDisclaimer ? LIFETIME_PLAN_DISCLAIMER : "";
    setElementVisible(elements.checkoutPlanDisclaimer, showDisclaimer);
  }
  if (elements.checkoutTrust) {
    elements.checkoutTrust.textContent = normalizedPlanType === "lifetime"
      ? "Betal med kort, Apple Pay, Google Pay eller MobilePay (hvis tilgængeligt)."
      : "Betal med kort, Apple Pay eller Google Pay (hvis tilgængeligt).";
  }
}

async function beginCheckout(planType) {
  const resolvedPlanType = resolveCheckoutPlanType(planType);
  state.checkoutPlanType = resolvedPlanType;
  applyCheckoutPlanButtons(resolvedPlanType);
  setCheckoutStatus("Klargør betaling …");
  setCheckoutControlsEnabled(false);
  clearCheckoutElement();
  state.checkoutLoading = true;
  try {
    const data = await createSubscriptionIntent(resolvedPlanType);
    state.checkoutClientSecret = data.clientSecret;
    state.checkoutSubscriptionId = data.subscriptionId || null;
    state.checkoutPrice = data.price || null;
    updateCheckoutSummary(data.price, resolvedPlanType);
    await setupExpressCheckout(data.price, resolvedPlanType);
    await mountCheckoutElement(data.clientSecret);
    setCheckoutStatus("");
  } catch (error) {
    setCheckoutStatus(error.message || "Kunne ikke starte betalingen.", true);
  } finally {
    state.checkoutLoading = false;
    setCheckoutControlsEnabled(true);
  }
}

function setCheckoutPlanType(planType, { refresh = false } = {}) {
  const resolved = resolveCheckoutPlanType(planType);
  if (state.checkoutPlanType === resolved && !refresh) {
    applyCheckoutPlanButtons(resolved);
    return;
  }
  state.checkoutPlanType = resolved;
  applyCheckoutPlanButtons(resolved);
  if (refresh && screens.checkout?.classList.contains("active")) {
    clearCheckoutElement();
    void beginCheckout(resolved);
    return;
  }
  if (state.checkoutPrice) {
    updateCheckoutSummary(state.checkoutPrice, resolved);
  }
}

function explainPlanTypeIssue() {
  const hasSubscription = Boolean(state.config?.stripeHasSubscriptionPrice);
  const hasLifetime = Boolean(state.config?.stripeHasLifetimePrice);
  if (hasSubscription && !hasLifetime) {
    return "Engangsbetalingen er ikke sat op endnu.";
  }
  if (!hasSubscription && hasLifetime) {
    return "Abonnementet er ikke sat op endnu.";
  }
  return "Betaling er ikke sat op endnu.";
}

function buildStripeAppearance() {
  const styles = getComputedStyle(document.body);
  const getVar = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    theme: "stripe",
    variables: {
      colorPrimary: getVar("--accent", "#0a84ff"),
      colorBackground: getVar("--panel-strong", "#ffffff"),
      colorText: getVar("--ink", "#1d1d1f"),
      colorDanger: getVar("--accent-warm", "#ff453a"),
      fontFamily: "Manrope, Helvetica Neue, sans-serif",
      borderRadius: "14px",
    },
  };
}

function resolveCheckoutCountry() {
  const locale = String(navigator.language || "").trim();
  const match = locale.match(/-([a-z]{2})/i);
  return match ? match[1].toUpperCase() : "DK";
}

function clearExpressCheckout() {
  if (state.stripePaymentRequestButton) {
    state.stripePaymentRequestButton.unmount();
  }
  state.stripePaymentRequestButton = null;
  state.stripePaymentRequest = null;
  if (elements.checkoutWallets) {
    elements.checkoutWallets.textContent = "";
  }
  setElementVisible(elements.checkoutExpress, false);
}

async function createSubscriptionIntent(planType) {
  const res = await apiFetch("/api/stripe/create-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planType: resolveCheckoutPlanType(planType) }),
  });
  if (!res.ok) {
    let message = "Kunne ikke starte betalingen.";
    try {
      const data = await res.json();
      const errorCode = String(data?.error || "").toLowerCase();
      const stripeCode = String(data?.code || "").toLowerCase();
      const stripeMessage = String(data?.message || "").trim();
      if (errorCode === "payment_not_configured") {
        message = "Betaling er ikke sat op endnu.";
      } else if (errorCode === "subscription_active") {
        message = "Du har allerede Pro.";
      } else if (errorCode === "invalid_plan_type") {
        message = explainPlanTypeIssue();
      } else if (errorCode === "price_recurring") {
        message = "Prisen er sat som abonnement. Brug engangsprisen i Stripe.";
      } else if (errorCode === "price_not_recurring") {
        message = "Prisen er ikke sat som abonnement. Brug abonnementsprisen i Stripe.";
      } else if (errorCode === "price_amount_missing") {
        message = "Prisen mangler et beløb i Stripe.";
      } else if (errorCode === "unauthenticated") {
        message = "Log ind for at fortsætte.";
      } else if (errorCode === "rate_limited") {
        message = "For mange forsøg. Vent et øjeblik og prøv igen.";
      } else if (errorCode === "stripe_error") {
        if (stripeCode === "resource_missing") {
          message = "Pris-id findes ikke i Stripe (tjek test/live).";
        } else if (stripeCode === "payment_method_unactivated") {
          message = "Den valgte betalingsmetode er ikke aktiveret i Stripe endnu.";
        } else if (stripeMessage) {
          message = stripeMessage;
        } else {
          message = "Stripe kunne ikke starte betalingen.";
        }
      } else if (errorCode === "could not create payment intent") {
        message = "Stripe kunne ikke starte betalingen.";
      } else if (errorCode === "could not create subscription") {
        message = "Stripe kunne ikke starte abonnementet.";
      }
    } catch (error) {
      // Ignore JSON parse errors.
    }
    throw new Error(message);
  }
  return res.json();
}

async function createBillingSetupIntent() {
  const res = await apiFetch("/api/stripe/create-setup-intent", { method: "POST" });
  if (!res.ok) {
    let message = "Kunne ikke starte betalingsmetoden.";
    try {
      const data = await res.json();
      const errorCode = String(data?.error || "").toLowerCase();
      if (errorCode === "payment_not_configured") {
        message = "Betaling er ikke sat op endnu.";
      } else if (errorCode === "unauthenticated") {
        message = "Log ind for at fortsætte.";
      } else if (errorCode === "rate_limited") {
        message = "For mange forsøg. Vent et øjeblik og prøv igen.";
      } else if (errorCode) {
        message = "Stripe kunne ikke starte betalingsmetoden.";
      }
    } catch (error) {
      // Ignore JSON parse errors.
    }
    throw new Error(message);
  }
  return res.json();
}

async function openHostedCheckout() {
  if (!requireAuthGuard()) return;
  if (!state.config?.stripeConfigured) {
    setCheckoutStatus("Betaling er ikke sat op endnu.", true);
    return;
  }
  setCheckoutStatus("Åbner Stripe Checkout …");
  setCheckoutControlsEnabled(false);
  try {
    const res = await apiFetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType: resolveCheckoutPlanType(state.checkoutPlanType) }),
    });
    if (!res.ok) {
      let message = "Kunne ikke åbne Stripe Checkout.";
      try {
        const data = await res.json();
        const errorCode = String(data?.error || "").toLowerCase();
        if (errorCode === "payment_not_configured") {
          message = "Betaling er ikke sat op endnu.";
        } else if (errorCode === "subscription_active") {
          message = "Du har allerede Pro.";
        } else if (errorCode === "invalid_plan_type") {
          message = explainPlanTypeIssue();
        } else if (errorCode === "price_recurring") {
          message = "Prisen er sat som abonnement. Brug engangsprisen i Stripe.";
        } else if (errorCode === "price_not_recurring") {
          message = "Prisen er ikke sat som abonnement. Brug abonnementsprisen i Stripe.";
        } else if (errorCode === "price_amount_missing") {
          message = "Prisen mangler et beløb i Stripe.";
        } else if (errorCode === "unauthenticated") {
          message = "Log ind for at fortsætte.";
        } else if (errorCode === "rate_limited") {
          message = "For mange forsøg. Vent et øjeblik og prøv igen.";
        }
      } catch (error) {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }
    const data = await res.json();
    const url = String(data?.url || "").trim();
    if (!url) {
      throw new Error("Stripe Checkout link mangler.");
    }
    window.location.href = url;
  } catch (error) {
    setCheckoutStatus(error.message || "Kunne ikke åbne Stripe Checkout.", true);
    setCheckoutControlsEnabled(true);
  }
}

async function openStripePortal() {
  if (!requireAuthGuard()) return;
  setBillingStatus("Åbner Stripe portal …");
  setBillingControlsEnabled(false);
  try {
    const res = await apiFetch("/api/stripe/create-portal-session", { method: "POST" });
    if (!res.ok) {
      let message = "Kunne ikke åbne Stripe portal.";
      try {
        const data = await res.json();
        const errorCode = String(data?.error || "").toLowerCase();
        if (errorCode === "payment_not_configured") {
          message = "Betaling er ikke sat op endnu.";
        } else if (errorCode === "unauthenticated") {
          message = "Log ind for at fortsætte.";
        } else if (errorCode === "rate_limited") {
          message = "For mange forsøg. Vent et øjeblik og prøv igen.";
        }
      } catch (error) {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }
    const data = await res.json();
    const url = String(data?.url || "").trim();
    if (!url) {
      throw new Error("Stripe portal link mangler.");
    }
    window.location.href = url;
  } catch (error) {
    setBillingStatus(error.message || "Kunne ikke åbne Stripe portal.", true);
    setBillingControlsEnabled(true);
  }
}

async function completeCheckoutSuccess() {
  setCheckoutStatus("Betalingen er gennemført. Opdaterer adgang …");
  await refreshAccessStatus();
  await refreshProfile();
  setCheckoutStatus("Tak! Din Pro-adgang er klar.");
  setAccountStatus("Tak! Din Pro-adgang er klar.");
  setTimeout(() => {
    closeCheckout();
  }, 800);
}

async function setupExpressCheckout(price, planType) {
  clearExpressCheckout();
  if (!elements.checkoutExpress || !elements.checkoutWallets) return;
  const stripe = getStripeClient();
  if (!stripe) return;
  const unitAmount = resolveUnitAmount(price);
  if (!unitAmount) return;
  const currency = String(price.currency || "dkk").toLowerCase();
  const normalizedPlanType = normalizeCheckoutPlanType(planType);
  const baseLabel = price.product?.name || "Pro";
  const label = normalizedPlanType === "lifetime"
    ? `${baseLabel} (livstid)`
    : `${baseLabel} (abonnement)`;
  try {
    const paymentRequest = stripe.paymentRequest({
      country: resolveCheckoutCountry(),
      currency,
      total: {
        label,
        amount: Math.round(unitAmount),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    let canPay = null;
    try {
      canPay = await paymentRequest.canMakePayment();
    } catch (error) {
      canPay = null;
    }
    if (!canPay) return;

    paymentRequest.on("paymentmethod", async (event) => {
      if (!state.checkoutClientSecret) {
        event.complete("fail");
        setCheckoutStatus("Betaling er ikke klar endnu.", true);
        return;
      }
      setCheckoutStatus("Bekræfter betaling …");
      setCheckoutControlsEnabled(false);
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        state.checkoutClientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false }
      );
      if (confirmError) {
        event.complete("fail");
        setCheckoutStatus(confirmError.message || "Betalingen kunne ikke gennemføres.", true);
        setCheckoutControlsEnabled(true);
        return;
      }
      event.complete("success");
      if (paymentIntent && paymentIntent.status === "requires_action") {
        const { error: actionError } = await stripe.confirmCardPayment(
          state.checkoutClientSecret
        );
        if (actionError) {
          setCheckoutStatus(actionError.message || "Betalingen kunne ikke gennemføres.", true);
          setCheckoutControlsEnabled(true);
          return;
        }
      }
      await completeCheckoutSuccess();
    });

    const walletElements = stripe.elements({ appearance: buildStripeAppearance() });
    const paymentRequestButton = walletElements.create("paymentRequestButton", {
      paymentRequest,
      style: {
        paymentRequestButton: {
          type: normalizedPlanType === "lifetime" ? "buy" : "subscribe",
          theme: "dark",
          height: "48px",
        },
      },
    });
    paymentRequestButton.mount(elements.checkoutWallets);
    state.stripePaymentRequest = paymentRequest;
    state.stripePaymentRequestButton = paymentRequestButton;
    setElementVisible(elements.checkoutExpress, true);
  } catch (error) {
    clearExpressCheckout();
  }
}

async function mountCheckoutElement(clientSecret) {
  if (!elements.checkoutElement) {
    throw new Error("Checkout er ikke klar.");
  }
  unmountCheckoutElement();
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe er ikke tilgængeligt.");
  }
  state.stripeElements = stripe.elements({
    clientSecret,
    appearance: buildStripeAppearance(),
  });
  state.stripePaymentElement = state.stripeElements.create("payment", {
    layout: "tabs",
    wallets: {
      applePay: "auto",
      googlePay: "auto",
    },
  });
  state.stripePaymentElement.mount(elements.checkoutElement);
}

async function mountBillingPaymentElement(clientSecret) {
  if (!elements.billingPaymentElement) {
    throw new Error("Betalingsfeltet er ikke klar.");
  }
  unmountBillingPaymentElement();
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe er ikke tilgængeligt.");
  }
  state.billingElements = stripe.elements({
    clientSecret,
    appearance: buildStripeAppearance(),
  });
  state.billingPaymentElement = state.billingElements.create("payment", {
    layout: "tabs",
    wallets: {
      applePay: "auto",
      googlePay: "auto",
    },
  });
  state.billingPaymentElement.mount(elements.billingPaymentElement);
}

async function openCheckout() {
  if (!requireAuthGuard()) return;
  if (hasPaidPlan()) {
    setAccountStatus("Du har allerede Pro.", true);
    return;
  }
  if (!state.config?.stripeConfigured || !state.config?.stripePublishableKey) {
    setAccountStatus("Betaling er ikke sat op endnu.", true);
    return;
  }
  if (!getStripeClient()) {
    setAccountStatus("Betaling er ikke tilgængelig lige nu.", true);
    return;
  }

  setAccountStatus("");
  showScreen("checkout");
  const planType = resolveCheckoutPlanType(state.checkoutPlanType);
  setCheckoutPlanType(planType);
  await beginCheckout(planType);
}

function closeCheckout() {
  clearCheckoutElement();
  setCheckoutStatus("");
  showScreen("account");
}

async function submitCheckout(event) {
  if (event) event.preventDefault();
  if (!state.stripeElements || !state.checkoutClientSecret) {
    setCheckoutStatus("Betaling er ikke klar endnu.", true);
    return;
  }
  const stripe = getStripeClient();
  if (!stripe) {
    setCheckoutStatus("Betaling er ikke tilgængelig lige nu.", true);
    return;
  }

  setCheckoutStatus("Bekræfter betaling …");
  setCheckoutControlsEnabled(false);
  const { error } = await stripe.confirmPayment({
    elements: state.stripeElements,
    confirmParams: {
      return_url: `${window.location.origin}/?checkout=success`,
    },
    redirect: "if_required",
  });

  if (error) {
    setCheckoutStatus(error.message || "Betalingen kunne ikke gennemføres.", true);
    setCheckoutControlsEnabled(true);
    return;
  }

  await completeCheckoutSuccess();
}

async function handleCheckout() {
  await openCheckout();
}

async function openBilling() {
  if (!requireAuthGuard()) return;
  setBillingStatus("");
  setBillingUpdatePanelVisible(false);
  showScreen("billing");
  await loadBillingOverview();
}

async function handleBilling() {
  await openBilling();
}

async function loadBillingOverview({ notify = false } = {}) {
  if (!state.session?.user) return;
  state.billing.isLoading = true;
  if (notify) {
    setBillingStatus("Opdaterer betalingsoversigt …");
  }
  setBillingControlsEnabled(false);
  try {
    const res = await apiFetch("/api/stripe/billing-overview", { method: "GET" });
    if (!res.ok) {
      let message = "Kunne ikke hente betalingsoversigt.";
      try {
        const data = await res.json();
        const errorCode = String(data?.error || "").toLowerCase();
        if (errorCode === "payment_not_configured") {
          message = "Betaling er ikke sat op endnu.";
        } else if (errorCode === "unauthenticated") {
          message = "Log ind for at fortsætte.";
        } else if (errorCode === "rate_limited") {
          message = "For mange forsøg. Vent et øjeblik og prøv igen.";
        }
      } catch (error) {
        // Ignore JSON parse errors.
      }
      setBillingStatus(message, true);
      return;
    }
    const data = await res.json();
    state.billing.data = data || null;
    if (data?.subscription) {
      state.subscription = {
        ...(state.subscription || {}),
        ...data.subscription,
      };
    }
    updateAccountUI();
    if (notify) {
      setBillingStatus("Betalingsoversigten er opdateret.");
    }
  } catch (error) {
    setBillingStatus("Kunne ikke hente betalingsoversigt.", true);
  } finally {
    state.billing.isLoading = false;
    setBillingControlsEnabled(true);
  }
}

async function openBillingUpdatePanel() {
  if (!requireAuthGuard()) return;
  if (!state.billing.data?.subscription) {
    setBillingStatus("Ingen aktiv betaling at opdatere.", true);
    return;
  }
  if (!state.config?.stripePublishableKey) {
    setBillingStatus("Betaling er ikke sat op endnu.", true);
    return;
  }
  setBillingUpdatePanelVisible(true);
  setBillingUpdateStatus("Klargør betalingsmetode …");
  setBillingControlsEnabled(false);
  clearBillingPaymentElement();
  try {
    const data = await createBillingSetupIntent();
    state.billing.setupClientSecret = data.clientSecret || null;
    await mountBillingPaymentElement(data.clientSecret);
    setBillingUpdateStatus("");
  } catch (error) {
    setBillingUpdateStatus(error.message || "Kunne ikke starte betalingsmetoden.", true);
  } finally {
    setBillingControlsEnabled(true);
  }
}

function closeBillingUpdatePanel() {
  setBillingUpdatePanelVisible(false);
}

async function submitBillingUpdate(event) {
  if (event) event.preventDefault();
  if (!state.billingElements || !state.billing.setupClientSecret) {
    setBillingUpdateStatus("Betalingsfeltet er ikke klar endnu.", true);
    return;
  }
  const stripe = getStripeClient();
  if (!stripe) {
    setBillingUpdateStatus("Stripe er ikke tilgængeligt lige nu.", true);
    return;
  }

  setBillingUpdateStatus("Gemmer betalingsmetode …");
  setBillingControlsEnabled(false);
  const { error, setupIntent } = await stripe.confirmSetup({
    elements: state.billingElements,
    confirmParams: {
      return_url: `${window.location.origin}/?billing=return`,
    },
    redirect: "if_required",
  });

  if (error) {
    setBillingUpdateStatus(error.message || "Kunne ikke gemme betalingsmetode.", true);
    setBillingControlsEnabled(true);
    return;
  }

  const paymentMethodId =
    setupIntent?.payment_method?.id || setupIntent?.payment_method || null;
  if (!paymentMethodId) {
    setBillingUpdateStatus("Kunne ikke gemme betalingsmetode.", true);
    setBillingControlsEnabled(true);
    return;
  }

  try {
    const res = await apiFetch("/api/stripe/set-default-payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) {
      let message = "Kunne ikke gemme betalingsmetode.";
      try {
        const data = await res.json();
        if (data?.error === "payment_not_configured") {
          message = "Betaling er ikke sat op endnu.";
        }
      } catch (error) {
        // Ignore JSON parse errors.
      }
      setBillingUpdateStatus(message, true);
      setBillingControlsEnabled(true);
      return;
    }
    setBillingUpdateStatus("Betalingsmetode opdateret.");
    await loadBillingOverview();
    await refreshProfile();
    setBillingStatus("Betalingsmetode opdateret.");
    setBillingUpdatePanelVisible(false);
  } catch (error) {
    setBillingUpdateStatus("Kunne ikke gemme betalingsmetode.", true);
  } finally {
    setBillingControlsEnabled(true);
  }
}

async function handleBillingToggleCancel() {
  if (!requireAuthGuard()) return;
  const subscription = state.billing.data?.subscription || null;
  if (!subscription) {
    setBillingStatus("Ingen aktiv betaling at opdatere.", true);
    return;
  }
  const cancelAtPeriodEnd = !subscription.cancel_at_period_end;
  const confirmed = window.confirm(
    cancelAtPeriodEnd
      ? "Vil du opsige dit abonnement ved periodens udløb?"
      : "Vil du genoptage dit abonnement med det samme?"
  );
  if (!confirmed) return;

  setBillingStatus(cancelAtPeriodEnd ? "Opsiger abonnement …" : "Genoptager abonnement …");
  setBillingControlsEnabled(false);
  try {
    const res = await apiFetch("/api/stripe/update-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
    if (!res.ok) {
      let message = "Kunne ikke opdatere abonnementet.";
      try {
        const data = await res.json();
        const errorCode = String(data?.error || "").toLowerCase();
        if (errorCode === "subscription_missing") {
          message = "Ingen aktiv betaling at opdatere.";
        } else if (errorCode === "payment_not_configured") {
          message = "Betaling er ikke sat op endnu.";
        }
      } catch (error) {
        // Ignore JSON parse errors.
      }
      setBillingStatus(message, true);
      return;
    }
    const data = await res.json();
    state.billing.data = {
      ...(state.billing.data || {}),
      subscription: data.subscription || subscription,
    };
    state.subscription = {
      ...(state.subscription || {}),
      ...(data.subscription || {}),
    };
    updateAccountUI();
    updateBillingUI();
    setBillingStatus(
      cancelAtPeriodEnd
        ? "Abonnement opsagt til periodens udløb."
        : "Abonnement genoptaget."
    );
  } catch (error) {
    setBillingStatus("Kunne ikke opdatere abonnementet.", true);
  } finally {
    setBillingControlsEnabled(true);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasPaidPlan() {
  if (accessPolicy?.hasPaidPlan) {
    return accessPolicy.hasPaidPlan({ plan: state.profile?.plan });
  }
  const plan = String(state.profile?.plan || "").toLowerCase();
  return plan === "paid" || plan === "trial" || plan === "lifetime";
}

function hasPaidAccess() {
  if (accessPolicy?.hasPaidAccess) {
    return accessPolicy.hasPaidAccess({
      plan: state.profile?.plan,
      subscriptionStatus: state.subscription?.status,
    });
  }
  if (hasPaidPlan()) return true;
  const status = String(state.subscription?.status || "").toLowerCase();
  return ["trialing", "active", "past_due", "unpaid"].includes(status);
}

function resolveRoundAccess() {
  if (accessPolicy?.resolveRoundAccess) {
    return accessPolicy.resolveRoundAccess({
      plan: state.profile?.plan,
      subscriptionStatus: state.subscription?.status,
      useOwnKey: state.useOwnKey,
      userKey: state.userOpenAiKey,
    });
  }
  const hasKey = Boolean(state.useOwnKey && String(state.userOpenAiKey || "").trim());
  if (hasPaidAccess() || hasKey) return { allowed: true, reason: null };
  return {
    allowed: false,
    reason: state.useOwnKey ? "missing_key" : "payment_required",
  };
}

function getRoundAccessMessage(reason) {
  if (reason === "missing_key") {
    return "Indtast din nøgle for at starte en runde.";
  }
  if (reason === "payment_required") {
    return "Aktivér Pro eller indtast din nøgle for at starte en runde.";
  }
  return "Adgang mangler for at starte en runde.";
}

function handleRoundAccessDenied(reason) {
  const message = getRoundAccessMessage(reason);
  setAccountStatus(message, true);
  updateSummary();
  if (
    !screens.menu?.classList.contains("active") &&
    !screens.account?.classList.contains("active")
  ) {
    showScreen("account");
  }
}

async function refreshAccessStatus({ attempts = 4, delayMs = 1600 } = {}) {
  if (!state.session?.user) return false;
  for (let i = 0; i < attempts; i += 1) {
    await guardedStep(refreshProfile(), PROFILE_TIMEOUT_MS, "Profil indlæsning tog for lang tid");
    if (hasPaidAccess()) return true;
    await sleep(delayMs);
  }
  return false;
}

async function handleReturnParams() {
  const url = new URL(window.location.href);
  const checkout = url.searchParams.get("checkout");
  const portal = url.searchParams.get("portal");
  const billing = url.searchParams.get("billing");
  if (!checkout && !portal && !billing) return;

  if (checkout === "success") {
    setAccountStatus("Tak! Vi opdaterer din adgang nu.");
  } else if (checkout === "cancel") {
    setAccountStatus("Betalingen blev afbrudt.");
  } else if (portal === "return") {
    setAccountStatus("Du er tilbage fra betalingsoversigten.");
  } else if (billing === "return") {
    setBillingStatus("Du er tilbage fra betalingsmetoden.");
  }

  url.searchParams.delete("checkout");
  url.searchParams.delete("portal");
  url.searchParams.delete("billing");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  if (state.session?.user) {
    showScreen(billing ? "billing" : "account");
  }

  if (checkout === "success") {
    const updated = await refreshAccessStatus();
    if (updated) {
      setAccountStatus("Adgang opdateret.");
    } else {
      setAccountStatus("Betalingen er gennemført. Adgangen opdateres snart.");
    }
  } else if (portal === "return") {
    await refreshProfile();
  } else if (billing === "return") {
    await loadBillingOverview({ notify: false });
    await refreshProfile();
  }
}

function clearStoredOwnKey() {
  localStorage.removeItem(STORAGE_KEYS.useOwnKey);
  localStorage.removeItem(STORAGE_KEYS.userOpenAiKey);
}

function setOwnKeyEnabled(enabled) {
  state.useOwnKey = Boolean(enabled);
  clearStoredOwnKey();
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
  clearStoredOwnKey();
  updateAccountUI();
  checkAiAvailability();
  syncOwnKeyPreference();
}

function clearOwnKey() {
  state.userOpenAiKey = "";
  state.useOwnKey = false;
  clearStoredOwnKey();
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
  if (state.supabase) {
    try {
      await state.supabase.auth.signOut();
    } catch (error) {
      // Ignore sign out errors.
    }
  }
  state.session = null;
  state.user = null;
  state.profile = null;
  state.subscription = null;
  state.billing.data = null;
  state.billing.isLoading = false;
  state.billing.isUpdating = false;
  state.billing.setupClientSecret = null;
  state.userStateLoadPromise = null;
  state.userStateSyncQueued = false;
  state.activeSessionLoaded = false;
  state.activeSessionDirty = false;
  state.sessionActive = false;
  state.sessionPaused = false;
  state.sessionPausedAt = null;
  state.sessionCourse = null;
  state.sessionNeedsRender = false;
  state.activeQuestions = [];
  state.results = [];
  state.score = 0;
  state.scoreBreakdown = { mcq: 0, short: 0 };
  state.shortAnswerDrafts = new Map();
  state.shortAnswerAI = new Map();
  state.shortGroupCompletion = new Set();
  state.optionOrder = new Map();
  state.infiniteState = null;
  clearBillingPaymentElement();
  state.demoMode = false;
  state.useOwnKey = false;
  state.userOpenAiKey = "";
  clearStoredOwnKey();
  state.consentReturnTo = null;
  setBillingStatus("");
  setBillingUpdateStatus("");
  setConsentStatus("");
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
  const course = normalizeCourse(question.course || DEFAULT_COURSE);
  const courseKey = course && course !== DEFAULT_COURSE ? `${course}-` : "";
  return `${courseKey}${question.year}-${sessionKey}-${typeKey}-${question.number}-${question.category}${labelKey}`;
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

function scoreRubricAnswer({ rubricText, userAnswer, maxPoints }) {
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
  const course = normalizeCourse(question.course || DEFAULT_COURSE);
  const courseKey = course && course !== DEFAULT_COURSE ? `${course}-` : "";
  if (question.groupId) {
    return `${courseKey}${question.groupId}`;
  }
  return `${courseKey}${question.year}-${sessionKey}-${question.opgave}`;
}

function getShortGroupForQuestion(question) {
  if (!question || question.type !== "short") return null;
  if (isShortGroup(question)) return question;
  if (!question.groupKey) return null;
  return state.shortGroupsByKey.get(`short-group-${question.groupKey}`) || null;
}

function isShortGroup(question) {
  return question?.type === "short" && Array.isArray(question.parts);
}

function getShortParts(question) {
  if (!question || question.type !== "short") return [];
  return isShortGroup(question) ? question.parts : [question];
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

function splitPoints(totalPoints, count, step = 0.5) {
  if (!Number.isFinite(totalPoints) || totalPoints <= 0 || count <= 0) return [];
  const safeStep = Number(step) || 0.5;
  const base = Math.floor((totalPoints / count) / safeStep) * safeStep;
  let remaining = totalPoints - base * count;
  return Array.from({ length: count }, () => {
    let points = base;
    if (remaining >= safeStep) {
      points += safeStep;
      remaining -= safeStep;
    }
    return Number(points.toFixed(1));
  });
}

function buildShortGroups(questions) {
  const groups = [];
  const grouped = buildShortQuestionGroups(questions);
  grouped.forEach((parts, groupKey) => {
    const primary = parts.find((part) => part.opgaveIntro || part.opgaveTitle) || parts[0];
    if (!primary) return;
    groups.push({
      type: "short",
      key: `short-group-${groupKey}`,
      groupKey,
      course: primary.course || DEFAULT_COURSE,
      taskType: primary.taskType,
      year: primary.year,
      session: primary.session,
      yearLabel: primary.yearLabel,
      yearDisplay: primary.yearDisplay,
      category: primary.category,
      rawCategory: primary.rawCategory,
      disease: primary.disease,
      diseaseId: primary.diseaseId,
      priority: primary.priority,
      opgave: primary.opgave,
      number: primary.opgave,
      opgaveTitle: primary.opgaveTitle,
      opgaveIntro: primary.opgaveIntro,
      text: primary.opgaveTitle || primary.opgaveIntro || primary.category,
      parts,
    });
  });
  return groups;
}

function normalizeCategory(category) {
  if (typeof category !== "string") return null;
  const trimmed = category.trim();
  if (!trimmed) return null;
  if (DEPRECATED_CATEGORY.test(trimmed)) return null;
  const alias = CATEGORY_ALIASES[trimmed] || CATEGORY_ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}

function normalizeCourse(course) {
  if (typeof course !== "string") return DEFAULT_COURSE;
  const trimmed = course.trim().toLowerCase();
  if (!trimmed) return DEFAULT_COURSE;
  return COURSE_ALIASES[trimmed] || trimmed;
}

function getStudioContract(course) {
  if (typeof window === "undefined") return null;
  if (window.StudioEngine?.getContract) {
    return window.StudioEngine.getContract(course);
  }
  return null;
}

function getDiseaseDomainOrder() {
  const contract = getStudioContract("sygdomslaere");
  const order = contract?.domains?.map((domain) => domain.label).filter(Boolean);
  if (order && order.length) return order;
  return DISEASE_SECTION_ORDER;
}

function normalizePriorityValue(priority) {
  const value = String(priority || "").trim().toLowerCase();
  if (!value) return "";
  if (PRIORITY_LABELS[value]) return value;
  return "";
}

function formatCourseLabel(course) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  return COURSE_LABELS[courseId] || courseId;
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

function resolveYearMeta({ year, session, course }) {
  const courseId = normalizeCourse(course || DEFAULT_COURSE);
  if (courseId !== DEFAULT_COURSE) {
    const label = COURSE_YEAR_LABELS[courseId] || COURSE_LABELS[courseId] || "Pensum";
    return { yearLabel: label, yearDisplay: label, sessionLabel: null };
  }
  const sessionLabel = formatSessionLabel(session || "");
  const sessionTitle = sessionLabel ? formatSessionTitle(sessionLabel) : "";
  const yearLabel = sessionTitle ? `${year} ${sessionTitle}` : String(year);
  const yearDisplay = sessionTitle ? `${year} · ${sessionTitle}` : String(year);
  return { yearLabel, yearDisplay, sessionLabel: sessionLabel || null };
}

function parseYearLabel(label) {
  const parts = String(label).trim().split(" ");
  const year = Number(parts[0]);
  const session = formatSessionLabel(parts.slice(1).join(" "));
  return { year, session };
}

function buildCounts(questions) {
  const courses = new Map();
  const years = new Map();
  const categories = new Map();
  const sections = new Map();
  const priorities = new Map();
  const types = new Map();
  questions.forEach((question) => {
    const course = normalizeCourse(question.course || DEFAULT_COURSE);
    courses.set(course, (courses.get(course) || 0) + 1);
    years.set(question.yearLabel, (years.get(question.yearLabel) || 0) + 1);
    categories.set(question.category, (categories.get(question.category) || 0) + 1);
    if (question.section) {
      sections.set(question.section, (sections.get(question.section) || 0) + 1);
    }
    if (question.priority) {
      priorities.set(question.priority, (priorities.get(question.priority) || 0) + 1);
    }
    types.set(question.type, (types.get(question.type) || 0) + 1);
  });
  return { courses, years, categories, sections, priorities, types };
}

function buildCourseStats(questions) {
  const stats = new Map();
  questions.forEach((question) => {
    const course = normalizeCourse(question.course || DEFAULT_COURSE);
    const entry = stats.get(course) || { mcq: 0, short: 0, parts: 0 };
    if (question.type === "mcq") {
      entry.mcq += 1;
    } else if (question.type === "short") {
      entry.short += 1;
      entry.parts += getShortParts(question).length;
    }
    stats.set(course, entry);
  });
  return stats;
}

function formatTempoValue() {
  if (!state.startTime) return null;
  const elapsed = (Date.now() - state.startTime) / 1000;
  const completed = state.currentIndex + (state.locked ? 1 : 0);
  const perQuestion = elapsed / Math.max(1, completed || 1);
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

function normalizeScoreWeights(weights) {
  const mcq = Number(weights?.mcq ?? 0);
  const short = Number(weights?.short ?? 0);
  const total = mcq + short;
  if (!Number.isFinite(total) || total <= 0) {
    return { mcq: 0.5, short: 0.5 };
  }
  return { mcq: mcq / total, short: short / total };
}

function getRubricCoverageSummary(results) {
  if (!Array.isArray(results)) return { matched: 0, total: 0, percent: 0 };
  let matched = 0;
  let total = 0;
  results.forEach((entry) => {
    if (entry?.type !== "short") return;
    const key = entry.question?.key;
    if (!key) return;
    const rubric = state.shortAnswerAI.get(key)?.rubric;
    if (!rubric || !Number.isFinite(rubric.total)) return;
    matched += Number(rubric.matched) || 0;
    total += Number(rubric.total) || 0;
  });
  const percent = total ? (matched / total) * 100 : 0;
  return { matched, total, percent };
}

function calculateScoreSummary() {
  const meta = state.sessionScoreMeta;
  const mcqMax = meta.mcqMax || 0;
  const mcqMin = meta.mcqMin || 0;
  const shortMax = meta.shortMax || 0;
  const mcqCount = meta.mcqCount || 0;
  const shortCount = meta.shortCount || 0;
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());

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
  const supportsMcq = Array.isArray(scoringPolicy.allowTypes)
    ? scoringPolicy.allowTypes.includes("mcq")
    : mcqCount > 0;
  const supportsShort = Array.isArray(scoringPolicy.allowTypes)
    ? scoringPolicy.allowTypes.includes("short")
    : shortCount > 0;
  const hasMcq = supportsMcq && mcqCount > 0;
  const hasShort = supportsShort && shortCount > 0;
  if (hasMcq && hasShort) {
    const weights = normalizeScoreWeights(scoringPolicy.weights);
    overallPercent = weights.mcq * mcqPercent + weights.short * shortPercent;
  } else if (hasMcq) {
    overallPercent = mcqPercent;
  } else if (hasShort) {
    overallPercent = shortPercent;
  }

  const grade = scoringPolicy.usesGrade ? getGradeForPercent(overallPercent) : "-";
  const rubric = scoringPolicy.usesRubric
    ? getRubricCoverageSummary(state.results)
    : { matched: 0, total: 0, percent: 0 };

  return {
    mcqPercent,
    shortPercent,
    overallPercent,
    grade,
    rubricMatched: rubric.matched,
    rubricTotal: rubric.total,
    rubricPercent: rubric.percent,
    policyId: scoringPolicy.id,
  };
}

function getShortFailThreshold(maxPoints) {
  const safeMax = Number(maxPoints) || 0;
  return safeMax > 0 ? safeMax * SHORT_FAIL_RATIO : 0;
}

function isShortFailed(entry) {
  return (
    entry.type === "short" &&
    !entry.skipped &&
    entry.awardedPoints < getShortFailThreshold(entry.maxPoints)
  );
}

function isReviewCorrect(entry) {
  if (entry.skipped) return false;
  if (entry.type === "mcq") return entry.isCorrect;
  return entry.awardedPoints >= entry.maxPoints;
}

function requiresSketch(question) {
  if (!question) return false;
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const course = normalizeCourse(question.course || DEFAULT_COURSE);
  const capabilities = getStudioCapabilitiesForCourse(course);
  if (!capabilities.allowSketch) return false;
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
  if (isShortGroup(question)) return [];
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
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  if (!getQuestionImagePaths(question).length) return false;
  return isFigureAnswer(question.answer);
}

function getEffectiveModelAnswer(question) {
  if (!question) return "";
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const answer = String(question.answer || "").trim();
  if (shouldUseFigureCaption(question)) {
    const caption = getCombinedFigureCaption(question);
    if (caption) return caption;
  }
  return answer;
}

function buildSketchModelAnswer(question) {
  if (!question) return "";
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const answer = String(question.answer || "").trim();
  const caption = getCombinedFigureCaption(question);
  if (!caption) return answer;
  if (isFigureAnswer(answer)) return caption;
  if (!answer) return caption;
  return `${answer}\n\nFigurbeskrivelse: ${caption}`;
}

function getShortContextQuestions(question) {
  if (isShortGroup(question)) return [];
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
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const parts = [];
  if (question.opgaveIntro) parts.push(question.opgaveIntro);
  if (question.text) parts.push(question.text);
  return parts.join("\n");
}

function getSketchDescription(question) {
  if (!question) return "";
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const analysis = state.sketchAnalysis.get(question.key);
  if (!analysis) return "";
  return String(analysis.description || "").trim();
}

function buildShortAnswerForGrading(question, options = {}) {
  if (!question) return { answer: "", hasText: false, hasSketch: false };
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
  const draft = getShortDraft(question.key);
  const textAnswer = String(draft.text || "").trim();
  const analysis = state.sketchAnalysis.get(question.key);
  let sketchDescription =
    options.sketchDescription !== undefined
      ? String(options.sketchDescription || "").trim()
      : getSketchDescription(question);
  let sketchLabel = "Skitsebeskrivelse";
  if (!sketchDescription && analysis) {
    const summary = formatSketchFeedback(analysis).trim();
    if (summary) {
      sketchDescription = summary;
      sketchLabel = "Skitseanalyse";
    } else if (!textAnswer) {
      sketchDescription = "Skitse uploadet.";
      sketchLabel = "Skitse";
    }
  }
  const parts = [];
  if (textAnswer) parts.push(textAnswer);
  if (sketchDescription) {
    const sketchPrefix =
      sketchLabel === "Skitseanalyse" ? `${sketchLabel}:\n` : `${sketchLabel}: `;
    parts.push(`${sketchPrefix}${sketchDescription}`);
  }
  return {
    answer: parts.join("\n"),
    hasText: Boolean(textAnswer),
    hasSketch: Boolean(sketchDescription || analysis),
  };
}

async function resolveShortModelAnswer(question, { useSketch = false } = {}) {
  if (!question) return "";
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      question = activePart;
    }
  }
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
  syncShortScoreInputs(suggested, { scored: true, part: question });
  const feedback = String(data.feedback || "").trim();
  const nodes = resolveShortReviewElements(question);
  if (nodes.aiFeedback) {
    nodes.aiFeedback.textContent =
      feedback || fallbackFeedback || "Auto-vurdering klar. Justér point efter behov.";
  }
  setShortcutTempStatus("grade", "Vurderet", 2000);
  state.shortAnswerAI.set(question.key, {
    score: suggested,
    feedback: feedback || "",
    missing: data.missing || [],
    matched: data.matched || [],
    rubric: data.rubric && typeof data.rubric === "object"
      ? {
          matched: Number(data.rubric.matched) || 0,
          total: Number(data.rubric.total) || 0,
          percent: Number(data.rubric.percent) || 0,
        }
      : null,
  });
  updateShortPartStatus(question);
  updateShortGroupStatus(state.activeQuestions[state.currentIndex]);
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
    if (elements.quizProgressBar) {
      elements.quizProgressBar.setAttribute("aria-valuenow", "100");
      elements.quizProgressBar.setAttribute("aria-valuetext", `${current} af ∞`);
    }
  } else {
    elements.progressText.textContent = `${current} / ${total}`;
    const percent = total ? (state.currentIndex / total) * 100 : 0;
    elements.progressFill.style.width = total ? `${percent}%` : "0%";
    elements.progressFill.classList.remove("infinite");
    if (elements.quizProgressBar) {
      elements.quizProgressBar.setAttribute("aria-valuenow", String(Math.round(percent)));
      elements.quizProgressBar.setAttribute("aria-valuetext", total ? `${current} af ${total}` : "0 af 0");
    }
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

function formatQuestionYearDisplay(question) {
  if (!question) return "";
  const yearDisplay = String(question.yearDisplay || "").trim();
  if (!yearDisplay) return "";
  const course = normalizeCourse(question.course || DEFAULT_COURSE);
  if (course !== DEFAULT_COURSE) {
    return yearDisplay;
  }
  return `År ${yearDisplay}`;
}

function getQuestionNumberDisplay(question) {
  if (question.type === "short") {
    const course = normalizeCourse(question.course || DEFAULT_COURSE);
    if (course !== DEFAULT_COURSE) {
      return question.opgave ? `Sygdom ${question.opgave}` : "Sygdom";
    }
    if (isShortGroup(question)) {
      return `Opg. ${question.opgave}`;
    }
    const label = question.label ? question.label.toUpperCase() : "";
    return `Opg. ${question.opgave}${label ? label : ""}`;
  }
  return `#${question.number}`;
}

function setFigureVisibility(visible, { announce = true } = {}) {
  state.figureVisible = visible;
  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (currentQuestion?.type === "short") {
    const part = getActiveShortPart(currentQuestion);
    const nodes = part ? state.shortPartNodes.get(part.key) : null;
    const hasImages = part ? getQuestionImagePaths(part).length > 0 : false;
    if (nodes?.figureWrap) {
      nodes.figureWrap.classList.toggle("hidden", !visible || !hasImages);
    }
    if (visible && part) {
      setShortPartCollapsed(part, false);
    }
    if (elements.questionFigure) {
      elements.questionFigure.classList.add("hidden");
    }
  } else if (elements.questionFigure) {
    elements.questionFigure.classList.toggle("hidden", !visible);
  }
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
    img.title = "Klik for at forstørre";
    const titleText = images.length > 1 ? `Figur ${index + 1}` : "Figur";
    attachFigureModalHandlers(img, {
      src,
      alt: img.alt,
      caption: getFigureCaptionForImage(src),
      title: titleText,
    });
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
  if (!getShortcutItem("figure")) return;
  const hasFigure = getQuestionImagePaths(question).length > 0;
  const showIndicator = Boolean(question && hasFigure);
  setShortcutAvailable("figure", showIndicator);
  setShortcutDisabled("figure", !showIndicator);
  if (!showIndicator) {
    setShortcutActive("figure", false);
    setShortcutStatus("figure", "");
  }
}

function resolveShortReviewElements(part) {
  const nodes = part ? state.shortPartNodes.get(part.key) : null;
  return {
    scoreRange: nodes?.scoreRange || elements.shortAnswerScoreRange,
    scoreHint: nodes?.scoreHint || elements.shortAnswerHint,
    scoreMax: nodes?.scoreMax || elements.shortAnswerMaxPoints,
    aiFeedback: nodes?.aiFeedback || elements.shortAnswerAiFeedback,
    aiStatus: nodes?.aiStatus || elements.shortAnswerAiStatus,
    aiRetryBtn: nodes?.aiRetryBtn || elements.shortAnswerAiRetryBtn,
    showAnswerBtn:
      nodes?.showAnswerBtn || elements.shortAnswerShowAnswer || elements.shortAnswerShowAnswerInline,
    modelWrap: nodes?.modelWrap || elements.shortAnswerModel,
    modelTitle: nodes?.modelTitle || elements.shortModelTitle,
    modelText: nodes?.modelText || elements.shortModelText,
    modelTag: nodes?.modelTag || elements.shortModelTag,
    figureAnswer: nodes?.figureAnswer || elements.shortFigureAnswer,
    figureStatus: nodes?.figureStatus || elements.shortFigureStatus,
    figureText: nodes?.figureText || elements.shortFigureText,
    figureGenerateBtn: nodes?.figureGenerateBtn || elements.shortFigureGenerateBtn,
    sources: nodes?.sources || elements.shortAnswerSources,
    hintWrap: nodes?.hintWrap || elements.questionHint,
    hintStatus: nodes?.hintStatus || elements.questionHintStatus,
    hintText: nodes?.hintText || elements.questionHintText,
    isPartScoped: Boolean(nodes),
  };
}

function setShortFigureStatus(message, isWarn = false, part = null) {
  let targetPart = part;
  if (!targetPart) {
    const current = state.activeQuestions[state.currentIndex];
    if (current && current.type === "short") {
      targetPart = isShortGroup(current) ? getActiveShortPart(current) : current;
    }
  }
  const nodes = resolveShortReviewElements(targetPart);
  if (!nodes.figureStatus) return;
  nodes.figureStatus.textContent = message;
  nodes.figureStatus.classList.toggle("warn", Boolean(isWarn));
}

function updateShortAnswerModel(question) {
  if (!question) return;
  const nodes = resolveShortReviewElements(question);
  if (!nodes.modelWrap) return;
  const group = getShortGroupForQuestion(question);
  const groupParts = group ? getShortParts(group) : [];
  const isMultiPart = groupParts.length > 1;
  const rawAnswer = String(question.answer || "").trim();
  const fallbackAnswer = rawAnswer || "Ingen facit tilgængelig.";
  const hasImages = getQuestionImagePaths(question).length > 0;
  const useFigureCaption = shouldUseFigureCaption(question);
  const figureCaption = getCombinedFigureCaption(question);

  let modelTitle = "Modelbesvarelse";
  let modelText = fallbackAnswer;
  let showTag = false;

  if (isMultiPart && !nodes.isPartScoped) {
    const blocks = groupParts.map((part, index) => {
      const label = part.label ? part.label.toUpperCase() : String(index + 1);
      const prompt = String(part.text || part.prompt || "").trim();
      const answer = getEffectiveModelAnswer(part) || "Ingen facit tilgængelig.";
      const titleLine = prompt ? `${label}. ${prompt}` : `Delspørgsmål ${label}`;
      return `${titleLine}\n${answer}`;
    });
    modelTitle = "Modelbesvarelse · delspørgsmål";
    modelText = blocks.join("\n\n");
  } else if (useFigureCaption) {
    modelTitle = figureCaption ? "Facit (figurbeskrivelse)" : "Facit (figur)";
    if (figureCaption) {
      modelText = figureCaption;
      showTag = true;
    }
  }

  if (nodes.modelTitle) {
    nodes.modelTitle.textContent = modelTitle;
  }
  if (nodes.modelText) {
    nodes.modelText.textContent = modelText;
  } else if (nodes.modelWrap) {
    const textEl = nodes.modelWrap.querySelector("p");
    if (textEl) textEl.textContent = modelText;
  }
  if (nodes.modelTag) {
    nodes.modelTag.textContent = "Figurbeskrivelse";
    nodes.modelTag.classList.toggle("hidden", !showTag);
  }

  if (nodes.figureGenerateBtn) {
    nodes.figureGenerateBtn.disabled = !state.aiStatus.available;
    nodes.figureGenerateBtn.textContent = figureCaption ? "Opdater" : "Generér";
  }

  if (nodes.figureAnswer) {
    const showFigureBlock = hasImages && (!useFigureCaption || !figureCaption);
    nodes.figureAnswer.classList.toggle("hidden", !showFigureBlock);
    if (showFigureBlock) {
      if (!useFigureCaption && figureCaption) {
        if (nodes.figureText) {
          nodes.figureText.textContent = figureCaption;
        }
        setShortFigureStatus("Figurbeskrivelse klar.", false, question);
      } else if (useFigureCaption) {
        if (nodes.figureText) {
          nodes.figureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Facit henviser til figuren. Generér en beskrivelse."
            : "Hjælp er ikke klar lige nu.",
          !state.aiStatus.available,
          question
        );
      } else {
        if (nodes.figureText) {
          nodes.figureText.textContent = "";
        }
        setShortFigureStatus(
          state.aiStatus.available
            ? "Generér en figurbeskrivelse hvis du vil."
            : "Hjælp er ikke klar lige nu.",
          !state.aiStatus.available,
          question
        );
      }
    } else {
      setShortFigureStatus("", false, question);
    }
  }

  if (nodes.sources) {
    nodes.sources.textContent = question.sources?.length
      ? `Kilder: ${question.sources.join(" ")}`
      : "";
  }
}

function getSketchNodes(part) {
  if (!part) return null;
  const nodes = state.shortPartNodes.get(part.key);
  if (!nodes?.sketchPanel) return null;
  return nodes;
}

function updateSketchPanel(part) {
  if (!part) return;
  const nodes = getSketchNodes(part);
  if (!nodes) return;
  const capabilities = getStudioCapabilitiesForCourse(part.course || DEFAULT_COURSE);
  if (!capabilities.allowSketch) {
    nodes.sketchPanel.classList.add("hidden");
    return;
  }
  nodes.sketchPanel.classList.remove("hidden");
  if (nodes.sketchPanelTitle) {
    nodes.sketchPanelTitle.textContent = requiresSketch(part)
      ? "Skitse-analyse (auto)"
      : "Skitse (valgfri)";
  }
  const analysis = state.sketchAnalysis.get(part.key);
  if (nodes.sketchFeedback) {
    nodes.sketchFeedback.textContent = analysis ? formatSketchFeedback(analysis) : "";
  }
  const upload = state.sketchUploads.get(part.key);
  if (nodes.sketchStatus) {
    let status = "";
    if (!state.aiStatus.available) {
      status = state.aiStatus.message || "Hjælp er ikke klar";
    }
    if (upload?.label) {
      status = upload.label;
    } else if (upload) {
      status = "Skitse valgt";
    }
    nodes.sketchStatus.textContent = status;
  }
  if (nodes.sketchPreview) {
    if (upload?.dataUrl) {
      nodes.sketchPreview.src = upload.dataUrl;
      nodes.sketchPreview.classList.remove("hidden");
    } else {
      nodes.sketchPreview.src = "";
      nodes.sketchPreview.classList.add("hidden");
    }
  }
}

function isSketchModalOpen() {
  return Boolean(elements.sketchModal && !elements.sketchModal.classList.contains("hidden"));
}

function setSketchModalHint(text = "") {
  if (!elements.sketchModalHint) return;
  elements.sketchModalHint.textContent = text;
}

function setSketchModalTitle(part) {
  if (!elements.sketchModalTitle || !part) return;
  const label = part.label ? part.label.toUpperCase() : "";
  const prompt = String(part.text || part.prompt || "").trim();
  let title = "Delspørgsmål";
  if (label) {
    title = `${title} ${label}`;
  }
  elements.sketchModalTitle.textContent = prompt ? `${title}: ${prompt}` : title;
}

function clearSketchTextLayer() {
  if (!elements.sketchTextLayer) return;
  elements.sketchTextLayer.innerHTML = "";
  setActiveSketchTextBox(null);
}

function resetSketchCanvas(dataUrl = "") {
  if (!elements.sketchCanvas) return;
  elements.sketchCanvas.width = SKETCH_CANVAS_WIDTH;
  elements.sketchCanvas.height = SKETCH_CANVAS_HEIGHT;
  const ctx = elements.sketchCanvas.getContext("2d");
  if (!ctx) return;
  state.sketchEditor.ctx = ctx;
  ctx.clearRect(0, 0, elements.sketchCanvas.width, elements.sketchCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, elements.sketchCanvas.width, elements.sketchCanvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  state.sketchEditor.hasInk = false;
  state.sketchEditor.cleared = false;
  if (!dataUrl) return;
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, elements.sketchCanvas.width, elements.sketchCanvas.height);
    state.sketchEditor.hasInk = true;
  };
  img.src = dataUrl;
}

function clearSketchCanvas() {
  if (!elements.sketchCanvas) return;
  const ctx = state.sketchEditor.ctx || elements.sketchCanvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, elements.sketchCanvas.width, elements.sketchCanvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, elements.sketchCanvas.width, elements.sketchCanvas.height);
  state.sketchEditor.hasInk = false;
  state.sketchEditor.dirty = true;
  state.sketchEditor.cleared = true;
  clearSketchTextLayer();
}

function getSketchCanvasMetrics() {
  if (!elements.sketchCanvas) return null;
  const rect = elements.sketchCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const scaleX = elements.sketchCanvas.width / rect.width;
  const scaleY = elements.sketchCanvas.height / rect.height;
  return { rect, scaleX, scaleY };
}

function getSketchPoint(event) {
  const metrics = getSketchCanvasMetrics();
  if (!metrics) return null;
  const { rect, scaleX, scaleY } = metrics;
  const rawX = event.clientX - rect.left;
  const rawY = event.clientY - rect.top;
  const cssX = clamp(rawX, 0, rect.width);
  const cssY = clamp(rawY, 0, rect.height);
  return {
    cssX,
    cssY,
    canvasX: cssX * scaleX,
    canvasY: cssY * scaleY,
    scale: (scaleX + scaleY) / 2,
    rect,
  };
}

function syncSketchToolbar() {
  if (elements.sketchBrushSize) {
    elements.sketchBrushSize.value = String(state.sketchEditor.brushSize);
  }
  if (elements.sketchBrushValue) {
    elements.sketchBrushValue.textContent = String(state.sketchEditor.brushSize);
  }
  if (elements.sketchTextSize) {
    elements.sketchTextSize.value = String(state.sketchEditor.textSize);
  }
  if (elements.sketchTextValue) {
    elements.sketchTextValue.textContent = String(state.sketchEditor.textSize);
  }
}

function setSketchTool(tool) {
  const nextTool = tool === "text" ? "text" : tool === "erase" ? "erase" : "draw";
  state.sketchEditor.tool = nextTool;
  if (elements.sketchToolDraw) {
    elements.sketchToolDraw.classList.toggle("active", nextTool === "draw");
  }
  if (elements.sketchToolErase) {
    elements.sketchToolErase.classList.toggle("active", nextTool === "erase");
  }
  if (elements.sketchToolText) {
    elements.sketchToolText.classList.toggle("active", nextTool === "text");
  }
  if (elements.sketchCanvas) {
    elements.sketchCanvas.style.cursor = nextTool === "text" ? "text" : "crosshair";
  }
}

function setSketchColor(color) {
  if (!color) return;
  state.sketchEditor.color = color;
  if (elements.sketchColorButtons?.length) {
    elements.sketchColorButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.color === color);
    });
  }
  if (state.sketchEditor.activeTextBox) {
    state.sketchEditor.activeTextBox.style.color = color;
    state.sketchEditor.dirty = true;
  }
}

function setSketchBrushSize(value) {
  const next = Math.max(1, Number(value) || state.sketchEditor.brushSize);
  state.sketchEditor.brushSize = next;
  if (elements.sketchBrushSize) {
    elements.sketchBrushSize.value = String(next);
  }
  if (elements.sketchBrushValue) {
    elements.sketchBrushValue.textContent = String(next);
  }
}

function setSketchTextSize(value) {
  const next = Math.max(8, Number(value) || state.sketchEditor.textSize);
  state.sketchEditor.textSize = next;
  if (elements.sketchTextSize) {
    elements.sketchTextSize.value = String(next);
  }
  if (elements.sketchTextValue) {
    elements.sketchTextValue.textContent = String(next);
  }
  if (state.sketchEditor.activeTextBox) {
    state.sketchEditor.activeTextBox.style.fontSize = `${next}px`;
    state.sketchEditor.dirty = true;
  }
}

function setActiveSketchTextBox(box) {
  if (state.sketchEditor.activeTextBox) {
    state.sketchEditor.activeTextBox.classList.remove("is-active");
  }
  state.sketchEditor.activeTextBox = box;
  if (box) {
    box.classList.add("is-active");
    const size = Number.parseFloat(getComputedStyle(box).fontSize) || state.sketchEditor.textSize;
    setSketchTextSize(size);
  }
  if (elements.sketchDeleteTextBtn) {
    elements.sketchDeleteTextBtn.disabled = !box;
  }
}

function removeActiveSketchTextBox() {
  const box = state.sketchEditor.activeTextBox;
  if (!box) return;
  box.remove();
  state.sketchEditor.textDrag = null;
  setActiveSketchTextBox(null);
  state.sketchEditor.dirty = true;
}

function handleSketchTextPointerDown(event, box) {
  if (!state.sketchEditor.active || !box) return;
  if (event.button !== 0) return;
  const isEditTool = state.sketchEditor.tool === "text";
  if (!isEditTool) {
    event.preventDefault();
    box.blur();
  }
  setActiveSketchTextBox(box);
  const left = Number.parseFloat(box.style.left) || 0;
  const top = Number.parseFloat(box.style.top) || 0;
  const rect = box.getBoundingClientRect();
  state.sketchEditor.textDrag = {
    box,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originLeft: left,
    originTop: top,
    boxWidth: rect.width,
    boxHeight: rect.height,
    moved: false,
  };
  try {
    box.setPointerCapture(event.pointerId);
  } catch (error) {
    // Ignore pointer capture errors.
  }
}

function handleSketchTextPointerMove(event) {
  const drag = state.sketchEditor.textDrag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;
  if (!drag.moved) {
    if (Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    drag.box.blur();
  }
  const wrapRect = elements.sketchCanvasWrap?.getBoundingClientRect();
  if (!wrapRect) return;
  const maxLeft = Math.max(0, wrapRect.width - drag.boxWidth);
  const maxTop = Math.max(0, wrapRect.height - drag.boxHeight);
  const nextLeft = clamp(drag.originLeft + dx, 0, maxLeft);
  const nextTop = clamp(drag.originTop + dy, 0, maxTop);
  drag.box.style.left = `${nextLeft}px`;
  drag.box.style.top = `${nextTop}px`;
  state.sketchEditor.dirty = true;
  event.preventDefault();
}

function handleSketchTextPointerUp(event) {
  const drag = state.sketchEditor.textDrag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  state.sketchEditor.textDrag = null;
  try {
    if (drag.box.hasPointerCapture(event.pointerId)) {
      drag.box.releasePointerCapture(event.pointerId);
    }
  } catch (error) {
    // Ignore pointer release errors.
  }
  if (!drag.moved) {
    setActiveSketchTextBox(drag.box);
  }
}

function createSketchTextBox(cssX, cssY) {
  if (!elements.sketchTextLayer) return;
  const metrics = getSketchCanvasMetrics();
  if (!metrics) return;
  const box = document.createElement("textarea");
  box.className = "sketch-text-box";
  box.placeholder = "Skriv her";
  box.style.left = `${Math.max(0, Math.min(cssX, metrics.rect.width - 20))}px`;
  box.style.top = `${Math.max(0, Math.min(cssY, metrics.rect.height - 20))}px`;
  box.style.fontSize = `${state.sketchEditor.textSize}px`;
  box.style.color = state.sketchEditor.color;
  box.addEventListener("input", () => {
    state.sketchEditor.dirty = true;
    if (box.scrollHeight > box.clientHeight) {
      box.style.height = `${box.scrollHeight}px`;
    }
  });
  box.addEventListener("focus", () => {
    setActiveSketchTextBox(box);
  });
  box.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      box.blur();
    }
    if ((event.key === "Delete" || event.key === "Backspace") && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      removeActiveSketchTextBox();
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") && !box.value) {
      event.preventDefault();
      box.remove();
      setActiveSketchTextBox(null);
      state.sketchEditor.dirty = true;
    }
  });
  box.addEventListener("pointerdown", (event) => {
    handleSketchTextPointerDown(event, box);
  });
  box.addEventListener("pointermove", handleSketchTextPointerMove);
  box.addEventListener("pointerup", handleSketchTextPointerUp);
  box.addEventListener("pointercancel", handleSketchTextPointerUp);
  elements.sketchTextLayer.appendChild(box);
  setActiveSketchTextBox(box);
  box.focus();
  state.sketchEditor.dirty = true;
}

function handleSketchPointerDown(event) {
  if (!state.sketchEditor.active || !elements.sketchCanvas) return;
  if (event.button !== 0) return;
  if (state.sketchEditor.tool === "text") {
    const point = getSketchPoint(event);
    if (point) {
      createSketchTextBox(point.cssX, point.cssY);
    }
    return;
  }
  const isEraser = state.sketchEditor.tool === "erase";
  const point = getSketchPoint(event);
  if (!point) return;
  const ctx = state.sketchEditor.ctx || elements.sketchCanvas.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
  ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : state.sketchEditor.color;
  ctx.lineWidth = Math.max(1, state.sketchEditor.brushSize * point.scale);
  ctx.beginPath();
  ctx.moveTo(point.canvasX, point.canvasY);
  state.sketchEditor.isDrawing = true;
  state.sketchEditor.lastPoint = { x: point.canvasX, y: point.canvasY };
  if (!isEraser) {
    state.sketchEditor.hasInk = true;
  }
  state.sketchEditor.dirty = true;
  elements.sketchCanvas.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handleSketchPointerMove(event) {
  if (!state.sketchEditor.active || !state.sketchEditor.isDrawing || !elements.sketchCanvas) return;
  const point = getSketchPoint(event);
  if (!point) return;
  const ctx = state.sketchEditor.ctx || elements.sketchCanvas.getContext("2d");
  if (!ctx) return;
  ctx.lineTo(point.canvasX, point.canvasY);
  ctx.stroke();
  state.sketchEditor.lastPoint = { x: point.canvasX, y: point.canvasY };
  event.preventDefault();
}

function handleSketchPointerUp(event) {
  if (!state.sketchEditor.active || !elements.sketchCanvas) return;
  if (!state.sketchEditor.isDrawing) return;
  state.sketchEditor.isDrawing = false;
  const ctx = state.sketchEditor.ctx || elements.sketchCanvas.getContext("2d");
  if (ctx) {
    ctx.globalCompositeOperation = "source-over";
  }
  if (elements.sketchCanvas.hasPointerCapture(event.pointerId)) {
    elements.sketchCanvas.releasePointerCapture(event.pointerId);
  }
  event.preventDefault();
}

async function exportSketchDataUrl() {
  if (!elements.sketchCanvas) return null;
  const hasText = Boolean(
    elements.sketchTextLayer &&
      Array.from(elements.sketchTextLayer.querySelectorAll(".sketch-text-box"))
        .some((box) => box.value.trim())
  );
  if (!state.sketchEditor.hasInk && !hasText) {
    return null;
  }
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = elements.sketchCanvas.width;
  exportCanvas.height = elements.sketchCanvas.height;
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(elements.sketchCanvas, 0, 0);

  const metrics = getSketchCanvasMetrics();
  if (metrics && elements.sketchTextLayer) {
    const { rect, scaleX, scaleY } = metrics;
    const scale = (scaleX + scaleY) / 2;
    const textBoxes = Array.from(elements.sketchTextLayer.querySelectorAll(".sketch-text-box"));
    textBoxes.forEach((box) => {
      const value = box.value;
      if (!value.trim()) return;
      const style = getComputedStyle(box);
      const fontSize = Number.parseFloat(style.fontSize) || state.sketchEditor.textSize;
      const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
      const paddingTop = Number.parseFloat(style.paddingTop) || 0;
      const boxRect = box.getBoundingClientRect();
      const startX = (boxRect.left - rect.left + paddingLeft) * scaleX;
      const startY = (boxRect.top - rect.top + paddingTop) * scaleY;
      const lineHeight = fontSize * 1.3;
      ctx.fillStyle = style.color || "#111827";
      ctx.textBaseline = "top";
      ctx.font = `${fontSize * scale}px ${style.fontFamily || "sans-serif"}`;
      value.split(/\n/).forEach((line, index) => {
        ctx.fillText(line, startX, startY + index * lineHeight * scale);
      });
    });
  }

  const blob = await new Promise((resolve) => {
    exportCanvas.toBlob(resolve, "image/jpeg", SKETCH_EXPORT_QUALITY);
  });
  if (!blob) return null;
  if (blob.size > SKETCH_MAX_BYTES) {
    setSketchModalHint("Skitse er for stor. Prøv at rydde lidt og gem igen.");
    return null;
  }
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
  if (!dataUrl) {
    setSketchModalHint("Kunne ikke læse skitsen. Prøv igen.");
    return null;
  }
  const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);
  return {
    dataUrl,
    label: `Tegnet skitse · ${sizeMb} MB`,
  };
}

function saveSketchDataUrl(dataUrl, label, { part = null, autoAnalyze = false } = {}) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const targetPart = part || getActiveShortPart(question);
  if (!targetPart) return;
  const capabilities = getStudioCapabilitiesForCourse(targetPart.course || DEFAULT_COURSE);
  if (!capabilities.allowSketch) return;
  if (state.activeShortPartKey !== targetPart.key) {
    setActiveShortPart(targetPart);
  }
  const nodes = getSketchNodes(targetPart);
  state.sketchUploads.set(targetPart.key, { dataUrl, label });
  state.sketchAnalysis.delete(targetPart.key);
  setSketchRetryVisible(false, targetPart);
  if (nodes?.sketchStatus) {
    nodes.sketchStatus.textContent = label || "Skitse valgt";
  }
  if (nodes?.sketchFeedback) {
    nodes.sketchFeedback.textContent = "";
  }
  if (nodes?.sketchPreview) {
    nodes.sketchPreview.src = dataUrl;
    nodes.sketchPreview.classList.remove("hidden");
  }
  if (autoAnalyze) {
    void analyzeSketch(targetPart);
  }
  updateShortGroupStatus(state.activeQuestions[state.currentIndex]);
  updateShortAnswerActions(state.activeQuestions[state.currentIndex]);
}

function removeSketchUpload(part) {
  if (!part) return;
  state.sketchUploads.delete(part.key);
  state.sketchAnalysis.delete(part.key);
  const nodes = getSketchNodes(part);
  if (nodes?.sketchStatus) {
    nodes.sketchStatus.textContent = "";
  }
  if (nodes?.sketchFeedback) {
    nodes.sketchFeedback.textContent = "";
  }
  if (nodes?.sketchPreview) {
    nodes.sketchPreview.src = "";
    nodes.sketchPreview.classList.add("hidden");
  }
  updateShortGroupStatus(state.activeQuestions[state.currentIndex]);
  updateShortAnswerActions(state.activeQuestions[state.currentIndex]);
}

function openSketchModal(part = null) {
  if (!elements.sketchModal || !elements.sketchCanvas) return;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const targetPart = part || getActiveShortPart(question);
  if (!targetPart) return;
  if (state.activeShortPartKey !== targetPart.key) {
    setActiveShortPart(targetPart);
  }
  state.sketchEditor.part = targetPart;
  state.sketchEditor.active = true;
  state.sketchEditor.isDrawing = false;
  state.sketchEditor.lastPoint = null;
  state.sketchEditor.dirty = false;
  state.sketchEditor.cleared = false;
  state.sketchEditor.textDrag = null;
  state.sketchEditor.tool = "draw";
  setActiveSketchTextBox(null);
  clearSketchTextLayer();
  const existing = state.sketchUploads.get(targetPart.key);
  resetSketchCanvas(existing?.dataUrl || "");
  setSketchModalTitle(targetPart);
  setSketchModalHint("Luk gemmer skitsen uden analyse.");
  setSketchTool(state.sketchEditor.tool);
  setSketchColor(state.sketchEditor.color || SKETCH_DEFAULT_COLOR);
  syncSketchToolbar();
  setModalOpen(elements.sketchModal, { initialFocus: elements.sketchModalClose });
}

async function closeSketchModal({ analyze = false } = {}) {
  if (!elements.sketchModal || elements.sketchModal.classList.contains("hidden")) return;
  const part = state.sketchEditor.part;
  const existing = part ? state.sketchUploads.get(part.key) : null;
  let saved = false;
  if (part && (state.sketchEditor.dirty || !existing)) {
    const exportResult = await exportSketchDataUrl();
    if (!exportResult) {
      if (analyze) return;
    } else {
      saveSketchDataUrl(exportResult.dataUrl, exportResult.label, {
        part,
        autoAnalyze: analyze,
      });
      saved = true;
    }
  }
  if (part && state.sketchEditor.cleared && !state.sketchEditor.hasInk) {
    const hasText = Boolean(
      elements.sketchTextLayer &&
        Array.from(elements.sketchTextLayer.querySelectorAll(".sketch-text-box"))
          .some((box) => box.value.trim())
    );
    if (!hasText) {
      removeSketchUpload(part);
    }
  }
  setModalClosed(elements.sketchModal);
  state.sketchEditor.active = false;
  state.sketchEditor.part = null;
  state.sketchEditor.isDrawing = false;
  state.sketchEditor.lastPoint = null;
  state.sketchEditor.textDrag = null;
  if (analyze && part && !saved && existing) {
    void analyzeSketch(part);
  }
}

function resetShortAnswerUI() {
  if (!elements.shortAnswerContainer) return;
  cancelMicRecording();
  setShortAnswerPending(false);
  if (elements.shortPartList) {
    elements.shortPartList.innerHTML = "";
  }
  if (elements.shortGroupStatus) {
    elements.shortGroupStatus.textContent = "";
  }
  state.shortPartNodes.clear();
  state.activeShortPartKey = null;
  state.shortPartSelectionActive = false;
  state.shortGroupCompletion.clear();
  elements.shortAnswerInputWrap = null;
  elements.shortAnswerInput = null;
  elements.transcribeIndicator = null;
  elements.transcribeText = null;
  if (elements.shortAnswerScoreRange) {
    elements.shortAnswerScoreRange.value = "0";
  }
  if (elements.shortAnswerMaxPoints) {
    elements.shortAnswerMaxPoints.textContent = "0";
  }
  if (elements.shortAnswerAiFeedback) {
    elements.shortAnswerAiFeedback.textContent = "";
  }
  if (elements.shortAnswerAiStatus) {
    elements.shortAnswerAiStatus.textContent = "";
    elements.shortAnswerAiStatus.classList.remove("warn");
  }
  if (elements.shortAnswerHint) {
    elements.shortAnswerHint.textContent = "";
  }
  setShortAnswerModelVisible(false);
  if (elements.shortModelTitle) {
    elements.shortModelTitle.textContent = "Modelbesvarelse";
  }
  if (elements.shortModelText) {
    elements.shortModelText.textContent = "";
  } else if (elements.shortAnswerModel) {
    const textEl = elements.shortAnswerModel.querySelector("p");
    if (textEl) textEl.textContent = "";
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
  setShortAnswerToggleLabel(true);
  if (elements.shortSketchHint) {
    elements.shortSketchHint.classList.add("hidden");
    elements.shortSketchHint.textContent = "";
  }
  if (elements.shortAverageSummary) {
    elements.shortAverageSummary.classList.add("hidden");
  }
  setShortReviewOpen(false);
  if (elements.shortReviewStatus) {
    elements.shortReviewStatus.textContent = "Klar til vurdering";
  }
  setShortRetryVisible(false);
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
  const policy = getScoringPolicyForQuestion(question);
  if (hasText && !draft.scored) {
    status = "Svar gemt · mangler vurdering";
  } else if (aiState?.feedback) {
    status = policy.usesRubric ? "Rubric vurdering klar" : "Auto-vurdering klar";
  }
  if (draft.scored && typeof draft.points === "number" && question.maxPoints) {
    status = `Senest: ${draft.points.toFixed(1)} / ${Number(question.maxPoints).toFixed(1)}`;
  }
  elements.shortReviewStatus.textContent = status;
}

function setShortRetryVisible(visible, part = null) {
  const nodes = resolveShortReviewElements(part);
  if (!nodes.aiRetryBtn) return;
  nodes.aiRetryBtn.classList.toggle("hidden", !visible);
}

function setSketchRetryVisible(visible, part = null) {
  const current = state.activeQuestions[state.currentIndex];
  const target =
    part ||
    (current && current.type === "short" ? getActiveShortPart(current) : null);
  if (!target) return;
  const nodes = getSketchNodes(target);
  if (!nodes?.sketchRetryBtn) return;
  nodes.sketchRetryBtn.classList.toggle("hidden", !visible);
}

function hasShortPartAnswer(part) {
  if (!part) return false;
  const draft = getShortDraft(part.key);
  if (draft.text?.trim()) return true;
  if (state.sketchUploads.get(part.key)) return true;
  if (getSketchDescription(part)) return true;
  return false;
}

function isShortPartScored(part) {
  if (!part) return false;
  const draft = getShortDraft(part.key);
  return hasShortPartAnswer(part) ? Boolean(draft.scored) : true;
}

function isShortAnswerScored(question) {
  if (!question) return false;
  if (isShortGroup(question)) {
    return getShortParts(question).every((part) => isShortPartScored(part));
  }
  const draft = getShortDraft(question.key);
  return hasShortPartAnswer(question) ? Boolean(draft.scored) : true;
}

function getShortAnswerState(question) {
  if (!question) return { draft: null, hasText: false, hasSketch: false, scored: false };
  if (isShortGroup(question)) {
    const parts = getShortParts(question);
    const hasText = parts.some((part) => Boolean(getShortDraft(part.key).text?.trim()));
    const hasSketch = parts.some((part) => Boolean(state.sketchUploads.get(part.key) || getSketchDescription(part)));
    const scored = parts.every((part) => isShortPartScored(part));
    return {
      draft: null,
      hasText,
      hasSketch,
      scored,
    };
  }
  const draft = getShortDraft(question.key);
  const hasSketch = Boolean(state.sketchUploads.get(question.key) || getSketchDescription(question));
  return {
    draft,
    hasText: Boolean(draft.text?.trim()),
    hasSketch,
    scored: isShortPartScored(question),
  };
}

function isShortReadyForNext(question) {
  if (!question || question.type !== "short") return false;
  const { hasText, hasSketch, scored } = getShortAnswerState(question);
  if (hasText || hasSketch) return scored;
  const parts = isShortGroup(question) ? getShortParts(question) : [question];
  return parts.some((part) => Boolean(getShortDraft(part.key).scored));
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
  state.shortPartNodes.forEach((nodes) => {
    if (nodes.aiRetryBtn) {
      nodes.aiRetryBtn.disabled = state.shortAnswerPending;
    }
  });
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
  if (!elements.nextBtn) return;
  const isShort = question?.type === "short";
  setShortActionVisibility(isShort);
  if (!isShort) return;

  const gradeLabel = "Vurdér";
  if (state.locked) {
    elements.nextBtn.textContent = "Næste";
    elements.nextBtn.disabled = false;
    if (elements.shortGradeBtn) {
      elements.shortGradeBtn.textContent = gradeLabel;
      elements.shortGradeBtn.disabled = true;
    }
    setShortcutDisabled("next", elements.nextBtn.disabled);
    updateMicControls(question);
    return;
  }
  if (state.shortAnswerPending) {
    elements.nextBtn.textContent = "Næste";
    elements.nextBtn.disabled = true;
    if (elements.shortGradeBtn) {
      elements.shortGradeBtn.textContent = "Vurderer …";
      elements.shortGradeBtn.disabled = true;
    }
    setShortcutDisabled("next", elements.nextBtn.disabled);
    updateMicControls(question);
    return;
  }
  const readyForNext = isShortReadyForNext(question);
  if (elements.shortGradeBtn) {
    elements.shortGradeBtn.textContent = gradeLabel;
    elements.shortGradeBtn.disabled = false;
  }
  elements.nextBtn.textContent = "Næste";
  elements.nextBtn.disabled = !readyForNext;
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
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = option.label;
    btn.appendChild(label);
    const optionText = option.text == null ? "" : String(option.text);
    btn.appendChild(document.createTextNode(optionText));
    btn.addEventListener("click", () => handleMcqAnswer(option.label));
    elements.optionsContainer.appendChild(btn);
  });
  updateMicControls(question);
}

function getActiveShortPart(question) {
  if (!question || question.type !== "short") return null;
  if (!isShortGroup(question)) return question;
  const parts = question.parts || [];
  if (!parts.length) return null;
  const match = parts.find((part) => part.key === state.activeShortPartKey);
  return match || parts[0];
}

function updateShortPartStatus(part) {
  if (!part) return;
  const nodes = state.shortPartNodes.get(part.key);
  if (!nodes?.status) return;
  const draft = getShortDraft(part.key);
  const maxPoints = Number(part.maxPoints) || 0;
  if (draft.scored && Number.isFinite(draft.points)) {
    nodes.status.textContent =
      `Point: ${draft.points.toFixed(1)} / ${maxPoints.toFixed(1)}`;
    return;
  }
  if ((draft.text || "").trim()) {
    nodes.status.textContent = "Svar gemt · mangler vurdering";
    return;
  }
  nodes.status.textContent = "Ikke besvaret endnu";
}

function setShortPartCollapsed(part, collapsed) {
  if (!part) return;
  const nodes = state.shortPartNodes.get(part.key);
  if (!nodes?.card) return;
  nodes.collapsed = Boolean(collapsed);
  nodes.card.classList.toggle("is-collapsed", nodes.collapsed);
  if (nodes.toggleBtn) {
    nodes.toggleBtn.textContent = nodes.collapsed ? "Vis" : "Skjul";
    nodes.toggleBtn.setAttribute("aria-expanded", String(!nodes.collapsed));
  }
  if (!nodes.collapsed) {
    updateShortPartFigure(part);
  }
}

function updateShortPartFigure(part) {
  if (!part) return;
  const nodes = state.shortPartNodes.get(part.key);
  if (!nodes?.figureWrap || !nodes.figureMedia) return;
  const images = getQuestionImagePaths(part);
  if (!images.length) {
    nodes.figureWrap.classList.add("hidden");
    nodes.figureMedia.innerHTML = "";
    if (nodes.figureCaption) {
      nodes.figureCaption.textContent = "";
    }
    return;
  }

  nodes.figureMedia.innerHTML = "";
  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Figur ${index + 1} til ${part.category}`;
    img.title = "Klik for at forstørre";
    const titleText = images.length > 1 ? `Figur ${index + 1}` : "Figur";
    attachFigureModalHandlers(img, {
      src,
      alt: img.alt,
      caption: getFigureCaptionForImage(src),
      title: titleText,
    });
    nodes.figureMedia.appendChild(img);
  });

  if (nodes.figureCaption) {
    nodes.figureCaption.textContent = images.length > 1 ? "Flere figurer" : "Figur";
  }
  nodes.figureWrap.classList.toggle("hidden", !state.figureVisible);
}

function setShortActionVisibility(isShort) {
  const visible = Boolean(isShort);
  if (elements.shortGradeBtn) {
    elements.shortGradeBtn.classList.toggle("hidden", !visible);
  }
  if (elements.shortAnswerShowAnswerInline) {
    elements.shortAnswerShowAnswerInline.classList.toggle("hidden", !visible);
  }
}

function setShortAnswerToggleLabel(isHidden, button = null) {
  const label = isHidden ? "Vis facit" : "Skjul facit";
  if (button) {
    button.textContent = label;
    return;
  }
  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.textContent = label;
  }
  if (elements.shortAnswerShowAnswerInline) {
    elements.shortAnswerShowAnswerInline.textContent = label;
  }
}

function setShortAnswerModelVisible(isVisible, part = null) {
  const nodes = resolveShortReviewElements(part);
  if (!nodes.modelWrap) return;
  nodes.modelWrap.classList.toggle("hidden", !isVisible);
  setShortAnswerToggleLabel(!isVisible, nodes.showAnswerBtn || null);
}

async function toggleShortAnswerModelVisibility(part = null) {
  const question = state.activeQuestions[state.currentIndex];
  let target = part;
  if (!target && question && question.type === "short") {
    target = isShortGroup(question) ? getActiveShortPart(question) : question;
  }
  const nodes = resolveShortReviewElements(target);
  if (!nodes.modelWrap) return;
  const shouldShow = nodes.modelWrap.classList.contains("hidden");
  setShortAnswerModelVisible(shouldShow, target);
  if (!shouldShow) return;
  setShortReviewOpen(true);
  if (target && shouldUseFigureCaption(target)) {
    if (!getCombinedFigureCaption(target)) {
      await fetchFigureCaptionForQuestion(target);
    }
  }
}

function updateShortGroupStatus(question) {
  if (!elements.shortGroupStatus || !question || question.type !== "short") return;
  const parts = getShortParts(question);
  const total = parts.length;
  const scored = parts.filter(
    (part) => hasShortPartAnswer(part) && getShortDraft(part.key).scored
  ).length;
  let activeLabel = "";
  if (state.shortPartSelectionActive) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      const label = activePart.label ? activePart.label.toUpperCase() : "";
      if (label) {
        activeLabel = ` · Aktivt: ${label}`;
      } else {
        const activeIndex = parts.findIndex((part) => part.key === activePart.key);
        if (activeIndex >= 0) {
          activeLabel = ` · Aktivt: ${String.fromCharCode(65 + activeIndex)}`;
        }
      }
    }
  }
  elements.shortGroupStatus.textContent = total ? `${scored}/${total} vurderet${activeLabel}` : "";
}

function updateShortAverageSummary(question) {
  if (!elements.shortAverageSummary || !elements.shortAverageCircle) return;
  if (!question || question.type !== "short" || !isShortGroup(question)) {
    elements.shortAverageSummary.classList.add("hidden");
    return;
  }
  const parts = getShortParts(question);
  if (parts.length <= 1) {
    elements.shortAverageSummary.classList.add("hidden");
    return;
  }
  const totals = parts.reduce(
    (acc, part) => {
      const maxPoints = Number(part.maxPoints) || 0;
      const draft = getShortDraft(part.key);
      const awarded = hasShortPartAnswer(part)
        ? clamp(Number(draft.points) || 0, 0, maxPoints)
        : 0;
      acc.awarded += awarded;
      acc.max += maxPoints;
      return acc;
    },
    { awarded: 0, max: 0 }
  );
  const avgAwarded = parts.length ? totals.awarded / parts.length : 0;
  const avgMax = parts.length ? totals.max / parts.length : 0;
  const ratio = avgMax > 0 ? avgAwarded / avgMax : 0;
  elements.shortAverageCircle.style.setProperty(
    "--short-average-progress",
    String(clamp(ratio, 0, 1))
  );
  if (elements.shortAverageValue) {
    elements.shortAverageValue.textContent = avgAwarded.toFixed(1);
  }
  if (elements.shortAverageMax) {
    elements.shortAverageMax.textContent = `/ ${avgMax.toFixed(1)}`;
  }
  if (elements.shortAverageCaption) {
    elements.shortAverageCaption.textContent = "Gennemsnit pr. delspørgsmål";
  }
}

function updateShortGroupCompletionUI(question) {
  if (!elements.shortAverageSummary) return;
  if (!question || question.type !== "short" || !isShortGroup(question)) {
    elements.shortAverageSummary.classList.add("hidden");
    return;
  }
  const parts = getShortParts(question);
  if (parts.length <= 1) {
    elements.shortAverageSummary.classList.add("hidden");
    return;
  }
  const hasAnyResponse = parts.some(
    (part) => hasShortPartAnswer(part) || getShortDraft(part.key).scored
  );
  const groupKey = question.key || "";
  if (!hasAnyResponse) {
    elements.shortAverageSummary.classList.add("hidden");
    state.shortGroupCompletion.delete(groupKey);
    return;
  }
  const allScored = parts.every(
    (part) => !hasShortPartAnswer(part) || getShortDraft(part.key).scored
  );
  if (!allScored) {
    elements.shortAverageSummary.classList.add("hidden");
    state.shortGroupCompletion.delete(groupKey);
    return;
  }
  if (!state.shortGroupCompletion.has(groupKey)) {
    state.shortGroupCompletion.add(groupKey);
    if (state.shortPartSelectionActive) {
      clearShortPartSelection();
      return;
    }
  }
  if (state.shortPartSelectionActive) {
    elements.shortAverageSummary.classList.add("hidden");
    return;
  }
  parts.forEach((part) => setShortPartCollapsed(part, true));
  updateShortAverageSummary(question);
  elements.shortAverageSummary.classList.remove("hidden");
}

function syncShortPartReview(part) {
  if (!part) return;
  const nodes = resolveShortReviewElements(part);
  const cached = getShortDraft(part.key);
  const maxPoints = part.maxPoints || 0;
  const rangeStep = 0.5;
  if (nodes.scoreRange) {
    nodes.scoreRange.min = "0";
    nodes.scoreRange.max = String(maxPoints);
    nodes.scoreRange.step = String(rangeStep);
    nodes.scoreRange.value = String(cached.points ?? 0);
  }
  if (nodes.scoreMax) {
    nodes.scoreMax.textContent = maxPoints.toFixed(1);
  }
  updateShortScoreHint(maxPoints, cached.points ?? 0, nodes.scoreHint);

  const aiState = state.shortAnswerAI.get(part.key);
  if (nodes.aiFeedback) {
    nodes.aiFeedback.textContent = aiState?.feedback || "";
  }
  if (nodes.aiStatus) {
    const policy = getScoringPolicyForQuestion(part);
    if (policy.usesRubric) {
      nodes.aiStatus.textContent = "Rubric klar";
      nodes.aiStatus.classList.remove("warn");
    } else {
      const label = state.aiStatus.available
        ? "Hjælp klar"
        : state.aiStatus.message || "Hjælp er ikke klar";
      nodes.aiStatus.textContent = label;
      nodes.aiStatus.classList.toggle("warn", !state.aiStatus.available);
    }
  }
  if (nodes.modelWrap && nodes.showAnswerBtn) {
    const isHidden = nodes.modelWrap.classList.contains("hidden");
    setShortAnswerToggleLabel(isHidden, nodes.showAnswerBtn);
  }
}

function syncActiveShortPartUI(part) {
  if (!part) return;
  const cached = getShortDraft(part.key);
  if (elements.shortAnswerInput) {
    elements.shortAnswerInput.value = cached.text || "";
  }
  syncShortPartReview(part);
  updateShortAnswerModel(part);
  updateSketchPanel(part);
  updateShortReviewStatus(part);
  setShortReviewOpen(true);
  updateShortGroupStatus(state.activeQuestions[state.currentIndex]);
  updateShortAnswerActions(state.activeQuestions[state.currentIndex]);
}

function setActiveShortPart(part, { focus = false, announce = false } = {}) {
  if (!part) return;
  const wasActive = state.activeShortPartKey === part.key;
  const current = state.activeQuestions[state.currentIndex];
  state.activeShortPartKey = part.key;
  state.shortPartSelectionActive = true;
  state.shortPartNodes.forEach((nodes, key) => {
    if (nodes.card) {
      nodes.card.classList.toggle("is-active", key === part.key);
    }
  });
  if (current && current.type === "short" && isShortGroup(current)) {
    const parts = getShortParts(current);
    parts.forEach((candidate) => {
      if (candidate.key !== part.key) {
        setShortPartCollapsed(candidate, true);
      }
    });
  }
  const nodes = state.shortPartNodes.get(part.key);
  if (nodes) {
    if (nodes.collapsed) {
      setShortPartCollapsed(part, false);
    }
    elements.shortAnswerInputWrap = nodes.inputWrap;
    elements.shortAnswerInput = nodes.textarea;
    elements.transcribeIndicator = nodes.transcribeIndicator;
    elements.transcribeText = nodes.transcribeText;
    if (focus) {
      nodes.textarea.focus();
    }
  }
  updateVoiceIndicator();
  syncActiveShortPartUI(part);
  updateQuestionHintUI(part);
  updateShortPartFigure(part);
  updateShortcutFigureIndicator(part);
  updateShortGroupCompletionUI(current);

  if (current && current.type === "short" && isShortGroup(current)) {
    prefetchShortGroupTts(current, { skipKey: part.key });
    if (announce && !wasActive && !hasShortPartBeenAnnounced(current, part)) {
      playTtsForShortPart(current, part, "manual");
    }
  }
}

function clearShortPartSelection() {
  state.shortPartSelectionActive = false;
  state.shortPartNodes.forEach((nodes) => {
    if (nodes.card) {
      nodes.card.classList.remove("is-active");
    }
  });
  const current = state.activeQuestions[state.currentIndex];
  if (current && current.type === "short") {
    updateShortGroupStatus(current);
    updateShortGroupCompletionUI(current);
  }
}

function buildSketchPanelNodes(part) {
  const capabilities = getStudioCapabilitiesForCourse(part?.course || DEFAULT_COURSE);
  if (!capabilities.allowSketch) return null;
  const sketchPanel = document.createElement("div");
  sketchPanel.className = "sketch-panel hidden";

  const sketchPanelHead = document.createElement("div");
  sketchPanelHead.className = "sketch-panel-head";
  const sketchPanelTitle = document.createElement("span");
  sketchPanelTitle.textContent = requiresSketch(part)
    ? "Skitse-analyse (auto)"
    : "Skitse (valgfri)";
  sketchPanelHead.appendChild(sketchPanelTitle);
  sketchPanel.appendChild(sketchPanelHead);

  const sketchPanelBody = document.createElement("div");
  sketchPanelBody.className = "sketch-panel-body";

  const sketchActionRow = document.createElement("div");
  sketchActionRow.className = "sketch-action-row";
  const sketchDrawBtn = document.createElement("button");
  sketchDrawBtn.type = "button";
  sketchDrawBtn.className = "btn ghost small";
  sketchDrawBtn.textContent = "Tegn skitse";
  const sketchActionNote = document.createElement("span");
  sketchActionNote.className = "sketch-action-note";
  sketchActionNote.textContent = "eller upload";
  sketchActionRow.appendChild(sketchDrawBtn);
  sketchActionRow.appendChild(sketchActionNote);
  sketchPanelBody.appendChild(sketchActionRow);

  const sketchDropzone = document.createElement("label");
  sketchDropzone.className = "sketch-upload";

  const sketchUpload = document.createElement("input");
  sketchUpload.type = "file";
  sketchUpload.accept = "image/*";

  const sketchUploadText = document.createElement("span");
  sketchUploadText.className = "sketch-upload-text";
  sketchUploadText.textContent = "Vælg billede af din skitse";

  const sketchDropHint = document.createElement("span");
  sketchDropHint.className = "sketch-drop-hint";
  sketchDropHint.textContent = "Træk & slip her";

  sketchDropzone.appendChild(sketchUpload);
  sketchDropzone.appendChild(sketchUploadText);
  sketchDropzone.appendChild(sketchDropHint);
  sketchPanelBody.appendChild(sketchDropzone);

  const sketchPreview = document.createElement("img");
  sketchPreview.className = "sketch-preview hidden";
  sketchPreview.alt = "Forhåndsvisning af skitse";
  sketchPanelBody.appendChild(sketchPreview);

  const sketchActions = document.createElement("div");
  sketchActions.className = "sketch-actions";
  const sketchStatus = document.createElement("span");
  sketchStatus.className = "sketch-status";
  const sketchRetryBtn = document.createElement("button");
  sketchRetryBtn.type = "button";
  sketchRetryBtn.className = "btn ghost small hidden";
  sketchRetryBtn.textContent = "Prøv igen";
  sketchActions.appendChild(sketchStatus);
  sketchActions.appendChild(sketchRetryBtn);
  sketchPanelBody.appendChild(sketchActions);

  const sketchFeedback = document.createElement("div");
  sketchFeedback.className = "sketch-feedback";
  sketchPanelBody.appendChild(sketchFeedback);

  sketchPanel.appendChild(sketchPanelBody);

  return {
    sketchPanel,
    sketchPanelTitle,
    sketchPanelBody,
    sketchDrawBtn,
    sketchUpload,
    sketchStatus,
    sketchRetryBtn,
    sketchFeedback,
    sketchPreview,
    sketchDropzone,
  };
}

function buildShortPartReviewNodes(part) {
  const review = document.createElement("div");
  review.className = "review-drawer short-part-review";
  review.dataset.open = "true";

  const toolbar = document.createElement("div");
  toolbar.className = "short-toolbar";

  const scoreControl = document.createElement("div");
  scoreControl.className = "score-control";

  const scoreLabel = document.createElement("div");
  scoreLabel.className = "score-label";
  scoreLabel.textContent = "Point ";

  const scoreMaxWrap = document.createElement("span");
  scoreMaxWrap.className = "score-max";
  scoreMaxWrap.textContent = "/ ";
  const scoreMaxValue = document.createElement("span");
  scoreMaxWrap.appendChild(scoreMaxValue);
  scoreLabel.appendChild(scoreMaxWrap);

  const scoreInputs = document.createElement("div");
  scoreInputs.className = "score-inputs";
  const scoreRange = document.createElement("input");
  scoreRange.type = "range";
  scoreRange.min = "0";
  scoreRange.max = String(part.maxPoints || 0);
  scoreRange.step = "0.5";
  scoreRange.value = "0";
  scoreInputs.appendChild(scoreRange);

  const scoreHint = document.createElement("div");
  scoreHint.className = "score-hint";

  scoreControl.appendChild(scoreLabel);
  scoreControl.appendChild(scoreInputs);
  scoreControl.appendChild(scoreHint);

  const shortButtons = document.createElement("div");
  shortButtons.className = "short-buttons";
  const showAnswerBtn = document.createElement("button");
  showAnswerBtn.type = "button";
  showAnswerBtn.className = "btn ghost small";
  showAnswerBtn.textContent = "Vis facit";
  shortButtons.appendChild(showAnswerBtn);

  toolbar.appendChild(scoreControl);
  toolbar.appendChild(shortButtons);

  const aiStatus = document.createElement("div");
  aiStatus.className = "ai-status";
  const aiFeedback = document.createElement("div");
  aiFeedback.className = "short-ai-feedback";
  const aiActions = document.createElement("div");
  aiActions.className = "short-ai-actions";
  const aiRetryBtn = document.createElement("button");
  aiRetryBtn.type = "button";
  aiRetryBtn.className = "btn ghost small hidden";
  aiRetryBtn.textContent = "Prøv igen";
  aiActions.appendChild(aiRetryBtn);

  const modelWrap = document.createElement("div");
  modelWrap.className = "short-model hidden";
  const modelHead = document.createElement("div");
  modelHead.className = "short-model-head";
  const modelTitle = document.createElement("h4");
  modelTitle.textContent = "Modelbesvarelse";
  const modelTag = document.createElement("span");
  modelTag.className = "short-model-tag hidden";
  modelTag.textContent = "Figurbeskrivelse";
  modelHead.appendChild(modelTitle);
  modelHead.appendChild(modelTag);
  const modelText = document.createElement("p");
  modelWrap.appendChild(modelHead);
  modelWrap.appendChild(modelText);

  const figureAnswer = document.createElement("div");
  figureAnswer.className = "short-figure hidden";
  const figureHead = document.createElement("div");
  figureHead.className = "short-figure-head";
  const figureTitle = document.createElement("h5");
  figureTitle.textContent = "Figurbeskrivelse";
  const figureGenerateBtn = document.createElement("button");
  figureGenerateBtn.type = "button";
  figureGenerateBtn.className = "btn ghost small";
  figureGenerateBtn.textContent = "Generér";
  figureHead.appendChild(figureTitle);
  figureHead.appendChild(figureGenerateBtn);
  const figureStatus = document.createElement("div");
  figureStatus.className = "short-figure-status";
  const figureText = document.createElement("p");
  figureAnswer.appendChild(figureHead);
  figureAnswer.appendChild(figureStatus);
  figureAnswer.appendChild(figureText);
  modelWrap.appendChild(figureAnswer);

  const sources = document.createElement("div");
  sources.className = "short-sources";
  modelWrap.appendChild(sources);

  review.appendChild(toolbar);
  review.appendChild(aiStatus);
  review.appendChild(aiFeedback);
  review.appendChild(aiActions);
  review.appendChild(modelWrap);

  const hintWrap = document.createElement("div");
  hintWrap.className = "question-hint short-part-hint hidden";
  const hintHead = document.createElement("div");
  hintHead.className = "question-hint-head";
  const hintTitle = document.createElement("span");
  hintTitle.textContent = "Hint";
  const hintStatus = document.createElement("span");
  hintStatus.className = "question-hint-status";
  hintHead.appendChild(hintTitle);
  hintHead.appendChild(hintStatus);
  const hintText = document.createElement("div");
  hintText.className = "question-hint-text hidden";
  hintWrap.appendChild(hintHead);
  hintWrap.appendChild(hintText);

  return {
    review,
    scoreRange,
    scoreHint,
    scoreMaxValue,
    showAnswerBtn,
    aiStatus,
    aiFeedback,
    aiRetryBtn,
    modelWrap,
    modelTitle,
    modelText,
    modelTag,
    figureAnswer,
    figureStatus,
    figureText,
    figureGenerateBtn,
    sources,
    hintWrap,
    hintStatus,
    hintText,
  };
}

function buildShortPartList(question) {
  if (!elements.shortPartList || !question || question.type !== "short") return;
  elements.shortPartList.innerHTML = "";
  state.shortPartNodes.clear();
  const parts = getShortParts(question);
  parts.forEach((part, index) => {
    const card = document.createElement("div");
    card.className = "short-part";
    card.dataset.key = part.key;

    const head = document.createElement("div");
    head.className = "short-part-head";

    const label = document.createElement("span");
    label.className = "short-part-label";
    const labelText = part.label ? part.label.toUpperCase() : String(index + 1);
    label.textContent = labelText;

    const title = document.createElement("div");
    title.className = "short-part-title";
    title.textContent = part.text || part.prompt || "";
    title.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    title.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    title.addEventListener("click", (event) => {
      event.stopPropagation();
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === "TEXTAREA") {
        activeElement.blur();
      }
      setActiveShortPart(part, { announce: true });
    });

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "short-part-toggle";
    toggleBtn.textContent = "Skjul";
    toggleBtn.setAttribute("aria-expanded", "true");

    head.appendChild(label);
    head.appendChild(title);
    head.appendChild(toggleBtn);

    const status = document.createElement("div");
    status.className = "short-part-status";

    const inputWrap = document.createElement("div");
    inputWrap.className = "short-answer-input";

    const textarea = document.createElement("textarea");
    textarea.rows = 5;
    const promptLabel = String(part.text || part.prompt || "").trim();
    const promptSuffix = promptLabel ? ` (${promptLabel})` : "";
    textarea.placeholder =
      `Skriv dit svar til delspørgsmål ${labelText}${promptSuffix}. Brug gerne punktform og nøglebegreber.`;
    textarea.setAttribute("aria-label", `Svar til delspørgsmål ${labelText}`);

    const indicator = document.createElement("div");
    indicator.className = "transcribe-indicator hidden";
    indicator.dataset.state = "transcribing";
    indicator.setAttribute("aria-live", "polite");
    const spinner = document.createElement("span");
    spinner.className = "transcribe-spinner";
    spinner.setAttribute("aria-hidden", "true");
    const indicatorText = document.createElement("span");
    indicatorText.textContent = "Transkriberer …";
    indicator.appendChild(spinner);
    indicator.appendChild(indicatorText);

    inputWrap.appendChild(textarea);
    inputWrap.appendChild(indicator);

    card.appendChild(head);
    card.appendChild(status);
    card.appendChild(inputWrap);

    const sketchNodes = buildSketchPanelNodes(part);
    const reviewNodes = buildShortPartReviewNodes(part);

    const figureWrap = document.createElement("figure");
    figureWrap.className = "short-part-figure hidden";
    const figureMedia = document.createElement("div");
    figureMedia.className = "figure-media";
    const figureCaption = document.createElement("figcaption");
    figureWrap.appendChild(figureMedia);
    figureWrap.appendChild(figureCaption);
    card.appendChild(figureWrap);
    if (sketchNodes) {
      card.appendChild(sketchNodes.sketchPanel);
    }
    card.appendChild(reviewNodes.review);
    card.appendChild(reviewNodes.hintWrap);

    elements.shortPartList.appendChild(card);

    if (sketchNodes) {
      sketchNodes.sketchDrawBtn.addEventListener("click", () => {
        openSketchModal(part);
      });
      sketchNodes.sketchUpload.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        void handleSketchUpload(file, { autoAnalyze: true, part });
      });
      const dropzone = sketchNodes.sketchDropzone;
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
        void handleSketchUpload(file, { autoAnalyze: true, part });
      });
      sketchNodes.sketchRetryBtn.addEventListener("click", async () => {
        setSketchRetryVisible(false, part);
        await checkAiAvailability();
        await analyzeSketch(part);
      });
    }
    reviewNodes.scoreRange.addEventListener("input", (event) => {
      if (state.activeShortPartKey !== part.key) {
        setActiveShortPart(part);
      }
      syncShortScoreInputs(event.target.value, { part });
    });
    reviewNodes.scoreRange.addEventListener("focus", () => {
      if (state.activeShortPartKey !== part.key) {
        setActiveShortPart(part);
      }
    });
    reviewNodes.showAnswerBtn.addEventListener("click", () => {
      setActiveShortPart(part);
      void toggleShortAnswerModelVisibility(part);
    });
    reviewNodes.aiRetryBtn.addEventListener("click", async () => {
      setActiveShortPart(part);
      setShortRetryVisible(false, part);
      await checkAiAvailability();
      triggerShortAutoGrade({ scope: "active" });
    });
    reviewNodes.figureGenerateBtn.addEventListener("click", () => {
      setActiveShortPart(part);
      fetchFigureCaptionForQuestion(part, { force: true });
    });

    textarea.addEventListener("focus", () => {
      setShortPartCollapsed(part, false);
      setActiveShortPart(part, { announce: true });
    });
    card.addEventListener("click", (event) => {
      if (event.target === textarea || event.target === toggleBtn) return;
      const nodes = state.shortPartNodes.get(part.key);
      if (nodes?.collapsed) {
        setShortPartCollapsed(part, false);
      }
      setActiveShortPart(part, { focus: true, announce: true });
    });
    toggleBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const nodes = state.shortPartNodes.get(part.key);
      const nextState = !nodes?.collapsed;
      setShortPartCollapsed(part, nextState);
      if (!nextState) {
        setActiveShortPart(part, { focus: true, announce: true });
      }
    });
    textarea.addEventListener("input", () => {
      const currentDraft = getShortDraft(part.key);
      const nextText = textarea.value;
      const scored = Boolean(currentDraft.scored && currentDraft.text === nextText);
      saveShortDraft(part.key, {
        text: nextText,
        points: currentDraft.points ?? 0,
        scored,
      });
      updateShortPartStatus(part);
      updateShortGroupStatus(question);
      if (state.activeShortPartKey === part.key) {
        updateShortReviewStatus(part);
      }
      updateShortAnswerActions(question);
      updateShortGroupCompletionUI(question);
    });

    state.shortPartNodes.set(part.key, {
      card,
      status,
      inputWrap,
      textarea,
      toggleBtn,
      transcribeIndicator: indicator,
      transcribeText: indicatorText,
      review: reviewNodes.review,
      scoreRange: reviewNodes.scoreRange,
      scoreHint: reviewNodes.scoreHint,
      scoreMax: reviewNodes.scoreMaxValue,
      showAnswerBtn: reviewNodes.showAnswerBtn,
      aiStatus: reviewNodes.aiStatus,
      aiFeedback: reviewNodes.aiFeedback,
      aiRetryBtn: reviewNodes.aiRetryBtn,
      modelWrap: reviewNodes.modelWrap,
      modelTitle: reviewNodes.modelTitle,
      modelText: reviewNodes.modelText,
      modelTag: reviewNodes.modelTag,
      figureAnswer: reviewNodes.figureAnswer,
      figureStatus: reviewNodes.figureStatus,
      figureText: reviewNodes.figureText,
      figureGenerateBtn: reviewNodes.figureGenerateBtn,
      sources: reviewNodes.sources,
      hintWrap: reviewNodes.hintWrap,
      hintStatus: reviewNodes.hintStatus,
      hintText: reviewNodes.hintText,
      figureWrap,
      figureMedia,
      figureCaption,
      sketchPanel: sketchNodes?.sketchPanel || null,
      sketchPanelTitle: sketchNodes?.sketchPanelTitle || null,
      sketchPanelBody: sketchNodes?.sketchPanelBody || null,
      sketchDrawBtn: sketchNodes?.sketchDrawBtn || null,
      sketchUpload: sketchNodes?.sketchUpload || null,
      sketchStatus: sketchNodes?.sketchStatus || null,
      sketchRetryBtn: sketchNodes?.sketchRetryBtn || null,
      sketchFeedback: sketchNodes?.sketchFeedback || null,
      sketchPreview: sketchNodes?.sketchPreview || null,
      sketchDropzone: sketchNodes?.sketchDropzone || null,
      collapsed: false,
    });
    setShortPartCollapsed(part, index > 0);
    const draft = getShortDraft(part.key);
    textarea.value = draft.text || "";
    updateShortPartStatus(part);
    syncShortPartReview(part);
    updateShortAnswerModel(part);
    updateSketchPanel(part);
  });
}

function renderShortQuestion(question) {
  elements.optionsContainer.classList.add("hidden");
  elements.shortAnswerContainer.classList.remove("hidden");
  if (elements.shortReviewDrawer) {
    elements.shortReviewDrawer.classList.add("hidden");
  }
  if (elements.shortSketchHint) {
    elements.shortSketchHint.classList.add("hidden");
  }
  if (elements.shortAverageSummary) {
    elements.shortAverageSummary.classList.add("hidden");
  }
  if (elements.questionFigure) {
    elements.questionFigure.classList.add("hidden");
  }
  if (elements.questionFigureMedia) {
    elements.questionFigureMedia.innerHTML = "";
  }
  if (elements.questionFigureCaption) {
    elements.questionFigureCaption.textContent = "";
  }
  elements.skipBtn.textContent = "Spring over (0 point)";
  elements.nextBtn.disabled = false;
  setShortcutDisabled("next", elements.nextBtn.disabled);
  if (elements.skipBtn) {
    setShortcutDisabled("skip", elements.skipBtn.disabled);
  }
  if (elements.questionText) {
    elements.questionText.textContent = question.opgaveTitle || question.category || "Kortsvar";
  }
  if (elements.questionIntro) {
    const intro = String(question.opgaveIntro || "").trim();
    elements.questionIntro.textContent = intro;
    elements.questionIntro.classList.toggle("hidden", !intro);
  }
  const parts = getShortParts(question);
  if (elements.questionSubtitle) {
    const isDiseaseCourse = normalizeCourse(question.course || DEFAULT_COURSE) !== DEFAULT_COURSE;
    const subtitle = parts.length > 1
      ? isDiseaseCourse
        ? "Besvar sektionerne herunder."
        : "Besvar alle delspørgsmålene herunder."
      : "Besvar spørgsmålet herunder.";
    elements.questionSubtitle.textContent = subtitle;
    elements.questionSubtitle.classList.remove("hidden");
    elements.questionSubtitle.removeAttribute("data-label");
  }
  if (elements.questionText) {
    elements.questionText.classList.toggle("has-subtitle", true);
  }

  buildShortPartList(question);
  updateShortGroupStatus(question);
  const activePart = parts.find((part) => part.key === state.activeShortPartKey) || parts[0];
  if (activePart) {
    setActiveShortPart(activePart);
  }
  updateShortGroupCompletionUI(question);
  updateShortAnswerActions(question);
  updateMicControls(question);
}

function updateQuestionContext(question) {
  if (!elements.questionContext || !elements.questionContextTitle || !elements.questionContextList) {
    return;
  }
  if (question && question.type === "short" && isShortGroup(question)) {
    elements.questionContextTitle.textContent = "";
    elements.questionContextList.innerHTML = "";
    elements.questionContext.classList.add("hidden");
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
  clearTtsPartPrefetch();
  state.locked = false;
  elements.skipBtn.disabled = false;
  setFeedback("");
  clearOptions();
  resetShortAnswerUI();
  state.figureVisible = false;

  const currentQuestion = state.activeQuestions[state.currentIndex];
  const nextShortKey = currentQuestion?.key || null;
  if (nextShortKey !== state.lastShortQuestionKey) {
    state.lastShortQuestionKey = nextShortKey;
    if (currentQuestion && currentQuestion.type === "short") {
      resetShortPartAnnounce(nextShortKey);
    }
  }
  if (!currentQuestion) return;

  elements.questionCategory.textContent = currentQuestion.category;
  if (elements.questionCourse) {
    elements.questionCourse.textContent = formatCourseLabel(currentQuestion.course);
    elements.questionCourse.classList.toggle("hidden", !elements.questionCourse.textContent);
  }
  elements.questionYear.textContent = formatQuestionYearDisplay(currentQuestion);
  elements.questionYear.classList.toggle("hidden", !elements.questionYear.textContent);
  elements.questionNumber.textContent = getQuestionNumberDisplay(currentQuestion);
  if (elements.questionType) {
    elements.questionType.textContent = currentQuestion.type === "short" ? "Kortsvar" : "MCQ";
  }
  if (elements.questionIntro) {
    const showIntro = Boolean(currentQuestion.opgaveIntro);
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
  setShortcutDisabled("grade", currentQuestion.type !== "short");
  queueFigureCaptionsForQuestions(currentQuestion);
  setShortActionVisibility(currentQuestion.type === "short");

  if (currentQuestion.type === "short") {
    renderShortQuestion(currentQuestion);
  } else {
    updateQuestionFigure(currentQuestion);
    updateShortcutFigureIndicator(currentQuestion);
    updateQuestionHintUI(currentQuestion);
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
    if (isShortGroup(question)) {
      getShortParts(question).forEach((part) => {
        getQuestionImagePaths(part).forEach((path) => enqueueFigureCaption(path));
      });
      return;
    }
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
      setShortFigureStatus(state.aiStatus.message || "Hjælp er ikke klar", true);
    }
    return "";
  }

  const promise = (async () => {
    try {
      const res = await apiFetch("/api/vision", {
        method: "POST",
        ai: true,
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
      if (current) {
        if (isShortGroup(current)) {
          const activePart = getActiveShortPart(current);
          if (activePart && getQuestionImagePaths(activePart).includes(imagePath)) {
            updateShortAnswerModel(activePart);
          }
        } else if (getQuestionImagePaths(current).includes(imagePath)) {
          updateShortAnswerModel(current);
        }
      }
      return description;
    } catch (error) {
      if (!silent) {
        setShortFigureStatus(
          `Kunne ikke hente figurbeskrivelse. ${error.message || "Prøv igen om lidt."}`,
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
      setShortFigureStatus(state.aiStatus.message || "Hjælp er ikke klar", true);
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
      ai: true,
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
      `Kunne ikke transkribere lyd. ${error.message || "Tjek din adgang og forbindelsen."}`,
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
    setFeedback(state.aiStatus.message || "Hjælp er ikke klar.", "error");
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

async function handleSketchUpload(file, { autoAnalyze = true, part = null } = {}) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const targetPart = part || getActiveShortPart(question);
  if (!targetPart) return;
  if (!file) return;
  if (state.activeShortPartKey !== targetPart.key) {
    setActiveShortPart(targetPart);
  }
  const nodes = getSketchNodes(targetPart);
  if (file.size > SKETCH_MAX_BYTES) {
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = "Filen er for stor. Vælg en mindre fil.";
    }
    return;
  }
  try {
    const dataUrl = await readFileAsDataUrl(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const label = `${file.name} · ${sizeMb} MB`;
    state.sketchUploads.set(targetPart.key, { dataUrl, label });
    state.sketchAnalysis.delete(targetPart.key);
    setSketchRetryVisible(false, targetPart);
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = `Valgt: ${label}`;
    }
    if (nodes?.sketchFeedback) {
      nodes.sketchFeedback.textContent = "";
    }
    if (nodes?.sketchPreview) {
      nodes.sketchPreview.src = dataUrl;
      nodes.sketchPreview.classList.remove("hidden");
    }
    if (autoAnalyze) {
      void analyzeSketch(targetPart);
    }
    updateShortGroupStatus(question);
    updateShortAnswerActions(question);
  } catch (error) {
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = error.message || "Kunne ikke læse filen.";
    }
  }
}

async function analyzeSketch(part = null) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const targetPart = part || getActiveShortPart(question);
  if (!targetPart) return;
  if (state.activeShortPartKey !== targetPart.key) {
    setActiveShortPart(targetPart);
  }
  const nodes = getSketchNodes(targetPart);
  setSketchRetryVisible(false, targetPart);
  if (!state.aiStatus.available) {
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = state.aiStatus.message || "Hjælp er ikke klar";
    }
    setSketchRetryVisible(true, targetPart);
    return;
  }
  const upload = state.sketchUploads.get(targetPart.key);
  if (!upload) {
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = "Vælg en skitse først.";
    }
    return;
  }
  if (nodes?.sketchStatus) {
    nodes.sketchStatus.textContent = "Analyserer skitse …";
  }

  let modelAnswer = buildSketchModelAnswer(targetPart);
  if (getQuestionImagePaths(targetPart).length && !getCombinedFigureCaption(targetPart)) {
    const generated = await fetchFigureCaptionForQuestion(targetPart, { silent: true });
    if (generated) {
      modelAnswer = buildSketchModelAnswer(targetPart);
    }
  }

  try {
    const res = await apiFetch("/api/vision", {
      method: "POST",
      ai: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "sketch",
        imageData: upload.dataUrl,
        question: buildShortPrompt(targetPart),
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
    state.sketchAnalysis.set(targetPart.key, result);
    if (nodes?.sketchFeedback) {
      nodes.sketchFeedback.textContent = formatSketchFeedback(result);
    }
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent = "Skitse analyseret.";
    }
    setSketchRetryVisible(false, targetPart);
  } catch (error) {
    if (nodes?.sketchStatus) {
      nodes.sketchStatus.textContent =
        `Kunne ikke analysere skitsen. ${error.message || "Prøv igen om lidt."}`;
    }
    setSketchRetryVisible(true, targetPart);
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

function formatScoreDelta(delta) {
  const numeric = Number(delta) || 0;
  return numeric > 0 ? `+${numeric}` : `${numeric}`;
}

function handleMcqAnswer(label) {
  if (state.locked) return;
  stopTts();
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "mcq") return;
  const mapping = getOptionMapping(question);
  const correctLabel = mapping?.correctLabel || "";
  const isCorrect = correctLabel === label;
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const correctDelta = Number(scoringPolicy.mcq?.correct ?? 3);
  const wrongDelta = Number(scoringPolicy.mcq?.wrong ?? -1);
  const delta = isCorrect ? correctDelta : wrongDelta;
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
    isCorrect
      ? `Korrekt! ${formatScoreDelta(correctDelta)} point`
      : `Forkert. Rigtigt svar: ${correctLabel} (${formatScoreDelta(wrongDelta)})`,
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
    const parts = getShortParts(question);
    parts.forEach((part) => {
      state.results.push({
        question: part,
        groupKey: question.key,
        type: "short",
        response: "",
        awardedPoints: 0,
        maxPoints: part.maxPoints || 0,
        skipped: true,
        ai: state.shortAnswerAI.get(part.key) || null,
      });
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

function getPriorityWeight(question) {
  if (!state.sessionSettings.priorityMix) return 1;
  const priority = question?.priority;
  return priority ? PRIORITY_WEIGHTS[priority] || 1 : 1;
}

function getQuestionWeight(question) {
  if (!question?.key) return 1;
  const stats = state.performance[question.key];
  if (!stats || !stats.seen) return 1.15 * getPriorityWeight(question);
  const avgScore = stats.totalScore / stats.seen;
  const errorBoost = 1 + (1 - avgScore) * 2;
  const avgTimeMs = stats.totalTimeMs / stats.seen;
  const timeBoost = 1 + Math.min(avgTimeMs / 45000, 0.7);
  const ageDays = stats.lastSeen ? (Date.now() - stats.lastSeen) / 86400000 : 7;
  const recencyBoost = 1 + Math.min(ageDays / 7, 0.6);
  const priorityBoost = getPriorityWeight(question);
  const weight = errorBoost * timeBoost * recencyBoost * priorityBoost;
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

function estimateShortTargetFromRatio(mcqTarget, settings) {
  if (!Number.isFinite(mcqTarget) || mcqTarget <= 0) return 0;
  const { mcqRatio, shortRatio } = getRatioValues(settings);
  const raw = Math.round((mcqTarget * shortRatio) / mcqRatio);
  return Math.max(raw, 1);
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

function getHintPolicy(question) {
  if (!question) return { mode: "ai", level: null };
  const courseId = normalizeCourse(question.course || DEFAULT_COURSE);
  const policy = resolveStudioPolicy(courseId);
  const hintMode = policy?.hints?.mode || policy?.capabilities?.hintMode || "ai";
  if (hintMode !== "structured") {
    return { mode: "ai", level: null };
  }
  const profile = getCourseProfile(courseId);
  const hintLevel = Number.isFinite(profile?.hintLevel)
    ? profile.hintLevel
    : Number(policy?.hints?.defaultLevel) || 0;
  return { mode: "structured", level: hintLevel };
}

function buildStructuredHintForQuestion(question, level) {
  if (!question) return "";
  if (!window.StudioEngine?.buildStructuredHint) return "";
  const domainLabel = String(question.domain || question.text || question.prompt || "").trim();
  const modelAnswer = String(question.answer || "").trim();
  return window.StudioEngine.buildStructuredHint({
    level,
    domainLabel,
    modelAnswer,
  });
}

function canGenerateHint(question) {
  if (!question) return false;
  const hintPolicy = getHintPolicy(question);
  if (hintPolicy.mode === "structured") {
    if (hintPolicy.level <= 0) return false;
    return Boolean(String(question.answer || "").trim());
  }
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (!activePart) return false;
    question = activePart;
  }
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
  if (question && question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      updateQuestionHintUI(activePart);
    } else if (elements.questionHint) {
      elements.questionHint.classList.add("hidden");
    }
    return;
  }
  if (!question) {
    if (elements.questionHint) {
      elements.questionHint.classList.add("hidden");
    }
    if (elements.questionHintText) {
      elements.questionHintText.classList.add("hidden");
      elements.questionHintText.textContent = "";
    }
    if (elements.questionHintStatus) {
      elements.questionHintStatus.textContent = "";
    }
    setShortcutActive("hint", false);
    setShortcutBusy("hint", false);
    setShortcutStatus("hint", "");
    setShortcutDisabled("hint", true);
    return;
  }
  const hintNodes = resolveShortReviewElements(question);
  const hintWrap = hintNodes.hintWrap;
  const hintText = hintNodes.hintText;
  const hintStatusEl = hintNodes.hintStatus;
  if (!hintWrap || !hintText || !hintStatusEl) return;
  if (elements.questionHint && hintWrap !== elements.questionHint) {
    elements.questionHint.classList.add("hidden");
  }
  const hintEntry = getHintEntry(question);
  const hasHint = Boolean(hintEntry?.text);
  const isVisible = Boolean(hintEntry?.visible);
  const isLoading = Boolean(hintEntry?.loading);
  const hintPolicy = getHintPolicy(question);
  const isStructured = hintPolicy.mode === "structured";
  const hintLevel = hintPolicy.level ?? 0;
  const canHint = canGenerateHint(question);
  const available = isStructured ? true : state.aiStatus.available;

  if (!isVisible) {
    hintWrap.classList.add("hidden");
    hintText.classList.add("hidden");
    hintText.textContent = "";
    hintStatusEl.textContent = "";
    setShortcutActive("hint", false);
    setShortcutBusy("hint", false);
    setShortcutStatus("hint", "");
    setShortcutDisabled("hint", isStructured && hintLevel <= 0);
    return;
  }

  hintWrap.classList.remove("hidden");

  if (!available) {
    hintStatusEl.textContent = state.aiStatus.message || "Hjælp er ikke klar";
  } else if (!canHint) {
    hintStatusEl.textContent = isStructured
      ? "Hints deaktiveret."
      : "Ingen facit til hint.";
  } else if (isLoading) {
    hintStatusEl.textContent = "Henter hint …";
  } else if (hasHint) {
    hintStatusEl.textContent = isStructured ? `Hint niveau ${hintLevel}` : "Hint klar";
  } else {
    hintStatusEl.textContent = isStructured ? `Hint niveau ${hintLevel} klar` : "Klar til hint";
  }

  setShortcutActive("hint", isVisible);
  setShortcutBusy("hint", isLoading);
  let hintStatus = "";
  if (isLoading) {
    hintStatus = "Henter …";
  } else if (!available) {
    hintStatus = "Offline";
  } else if (!canHint) {
    hintStatus = isStructured ? "Ingen" : "";
  } else if (hasHint) {
    hintStatus = isStructured ? `N${hintLevel}` : "Hint klar";
  } else {
    hintStatus = isStructured ? `N${hintLevel}` : "Åben";
  }
  setShortcutStatus("hint", hintStatus);
  setShortcutDisabled("hint", isStructured && hintLevel <= 0);

  if (hasHint) {
    hintText.textContent = hintEntry.text;
    hintText.classList.remove("hidden");
  } else {
    hintText.textContent = "";
    hintText.classList.add("hidden");
  }
}

async function buildHintPayload(question) {
  if (!question) return null;
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (!activePart) return null;
    question = activePart;
  }
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
  let target = question;
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (!activePart) return;
    target = activePart;
  }
  const hintEntry = getHintEntry(target) || { text: "", visible: false, loading: false };
  if (hintEntry.visible) {
    if (hintEntry.loading) return;
    hintEntry.visible = false;
    hintEntry.loading = false;
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
    return;
  }

  const hintPolicy = getHintPolicy(target);
  const canHint = canGenerateHint(target);
  if (hintPolicy.mode === "structured") {
    const hintLevel = hintPolicy.level ?? 0;
    if (hintLevel <= 0 || !canHint) {
      hintEntry.visible = true;
      hintEntry.loading = false;
      hintEntry.text = "";
      setHintEntry(target, hintEntry);
      updateQuestionHintUI(target);
      return;
    }
    if (hintEntry.text) {
      hintEntry.visible = true;
      setHintEntry(target, hintEntry);
      updateQuestionHintUI(target);
      return;
    }
    hintEntry.visible = true;
    hintEntry.loading = false;
    hintEntry.text =
      buildStructuredHintForQuestion(target, hintLevel) || "Ingen facit til hint.";
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
    return;
  }

  if (!state.aiStatus.available || !canHint) {
    hintEntry.visible = true;
    hintEntry.loading = false;
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
    return;
  }

  if (hintEntry.text) {
    hintEntry.visible = true;
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
    return;
  }

  hintEntry.loading = true;
  hintEntry.visible = true;
  setHintEntry(target, hintEntry);
  updateQuestionHintUI(target);

  const payload = await buildHintPayload(target);
  if (!payload || !payload.modelAnswer) {
    hintEntry.loading = false;
    hintEntry.visible = true;
    hintEntry.text = "Ingen facit til hint.";
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
    return;
  }

  try {
    const res = await apiFetch("/api/hint", {
      method: "POST",
      ai: true,
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
    hintEntry.text = `Kunne ikke hente hint. ${error.message || "Tjek din adgang og forbindelsen."}`;
  } finally {
    hintEntry.loading = false;
    hintEntry.visible = true;
    setHintEntry(target, hintEntry);
    updateQuestionHintUI(target);
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
      : status.message || "Hjælp er ikke klar";
    elements.aiStatusPill.textContent = label;
    elements.aiStatusPill.classList.toggle("warn", !status.available);
  }
  if (elements.shortAnswerAiStatus) {
    const label = status.available
      ? "Hjælp klar"
      : status.message || "Hjælp er ikke klar";
    elements.shortAnswerAiStatus.textContent = label;
    elements.shortAnswerAiStatus.classList.toggle("warn", !status.available);
  }
  state.shortPartNodes.forEach((nodes) => {
    if (!nodes.aiStatus) return;
    const label = status.available
      ? "Hjælp klar"
      : status.message || "Hjælp er ikke klar";
    nodes.aiStatus.textContent = label;
    nodes.aiStatus.classList.toggle("warn", !status.available);
  });

  const current = state.activeQuestions[state.currentIndex];
  if (current && current.type === "short") {
    const activePart = getActiveShortPart(current);
    if (activePart) {
      updateShortAnswerModel(activePart);
      updateSketchPanel(activePart);
    }
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
    return state.ttsStatus.message || "Oplæsning er ikke klar";
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
    clearTtsPartPrefetch();
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
    clearTtsPartPrefetch();
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

function formatShortPartLabel(question, part) {
  if (!part) return "1";
  if (part.label) return part.label.toUpperCase();
  const parts = getShortParts(question);
  const index = parts.findIndex((entry) => entry.key === part.key);
  return index >= 0 ? String(index + 1) : "1";
}

function buildShortPartTtsText(
  question,
  part,
  { includeMain = false } = {}
) {
  if (!question || !part) return "";
  const parts = [];
  if (includeMain) {
    const title = question.opgaveTitle || question.category;
    if (title) {
      parts.push(title);
    }
    if (question.opgaveIntro) {
      parts.push(`Opgaveintro: ${question.opgaveIntro}`);
    }
    if (question.text) {
      parts.push(question.text);
    }
  }
  const label = formatShortPartLabel(question, part);
  const prompt = String(part.text || part.prompt || "").trim();
  if (prompt) {
    parts.push(`Delspørgsmål ${label}: ${prompt}`);
  }
  if (part.images?.length) {
    parts.push(`Der er en figur til delspørgsmål ${label}.`);
  }
  return sanitizeTtsText(parts.join("\n"));
}

function buildTtsText(question) {
  if (!question) return "";
  const parts = [];
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question) || getShortParts(question)[0];
    if (!activePart) return "";
    return buildShortPartTtsText(question, activePart);
  }
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

function clearTtsPartPrefetch() {
  const cache = state.ttsPartPrefetch;
  if (!cache) return;
  if (cache.timer) {
    clearTimeout(cache.timer);
    cache.timer = null;
  }
  cache.entries.forEach((entry) => {
    if (entry.abortController) {
      entry.abortController.abort();
    }
  });
  cache.entries.clear();
}

function resetShortPartAnnounce(questionKey) {
  if (!questionKey) return;
  state.ttsPartAnnounce.set(questionKey, {
    mainAnnounced: false,
    parts: new Set(),
  });
}

function getShortPartAnnounceInfo(question) {
  if (!question?.key) return null;
  let info = state.ttsPartAnnounce.get(question.key);
  if (!info) {
    info = {
      mainAnnounced: false,
      parts: new Set(),
    };
    state.ttsPartAnnounce.set(question.key, info);
  }
  return info;
}

function shouldIncludeShortMain(question) {
  const info = getShortPartAnnounceInfo(question);
  return info ? !info.mainAnnounced : true;
}

function markShortPartAnnounced(question, part, includeMain = false) {
  const info = getShortPartAnnounceInfo(question);
  if (!info || !part?.key) return;
  if (includeMain) {
    info.mainAnnounced = true;
  }
  info.parts.add(part.key);
}

function hasShortPartBeenAnnounced(question, part) {
  const info = getShortPartAnnounceInfo(question);
  if (!info || !part?.key) return false;
  return info.parts.has(part.key);
}

function isShortPartPrefetchMatch(entry, text, voice, speed, includeOptions) {
  return Boolean(
    entry &&
      entry.text === text &&
      entry.voice === voice &&
      entry.speed === speed &&
      entry.includeOptions === includeOptions
  );
}

function getShortPartPrefetchEntry(partKey) {
  if (!partKey) return null;
  const cache = state.ttsPartPrefetch;
  if (!cache) return null;
  let entry = cache.entries.get(partKey);
  if (!entry) {
    entry = {
      key: partKey,
      text: "",
      voice: null,
      speed: null,
      includeOptions: null,
      blob: null,
      promise: null,
      requestId: 0,
      abortController: null,
    };
    cache.entries.set(partKey, entry);
  }
  return entry;
}

function prefetchShortPartTts(question, part) {
  if (!state.settings.ttsEnabled || !state.ttsStatus.available || document.hidden) return;
  if (!question || !part || !part.key) return;
  const text = buildShortPartTtsText(question, part, { includeMain: false });
  if (!text || text.length > TTS_MAX_CHARS) return;

  const voice = normalizeTtsVoice(state.settings.ttsVoice);
  const speed = Math.min(
    Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
    TTS_SPEED_MAX
  );
  const includeOptions = state.settings.ttsIncludeOptions;

  const entry = getShortPartPrefetchEntry(part.key);
  if (!entry) return;
  if (isShortPartPrefetchMatch(entry, text, voice, speed, includeOptions)) {
    if (entry.blob || entry.promise) return;
  } else if (entry.abortController) {
    entry.abortController.abort();
  }

  entry.requestId += 1;
  const requestId = entry.requestId;
  const controller = new AbortController();
  entry.text = text;
  entry.voice = voice;
  entry.speed = speed;
  entry.includeOptions = includeOptions;
  entry.abortController = controller;
  entry.blob = null;

  entry.promise = apiFetch("/api/tts", {
    method: "POST",
    ai: true,
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
      if (entry.requestId !== requestId) return null;
      entry.blob = blob;
      entry.abortController = null;
      entry.promise = null;
      return blob;
    })
    .catch((error) => {
      if (error.name === "AbortError") return null;
      if (entry.requestId === requestId) {
        entry.abortController = null;
        entry.promise = null;
        entry.blob = null;
        entry.text = "";
        entry.voice = null;
        entry.speed = null;
        entry.includeOptions = null;
      }
      return null;
    });
}

function prefetchShortGroupTts(question, { skipKey } = {}) {
  if (!state.settings.ttsEnabled || !state.ttsStatus.available || document.hidden) return;
  if (!question || question.type !== "short" || !isShortGroup(question)) return;
  const parts = getShortParts(question);
  parts.forEach((part) => {
    if (skipKey && part.key === skipKey) return;
    prefetchShortPartTts(question, part);
  });
}

async function getShortPartPrefetchedBlob(part, text, voice, speed, includeOptions) {
  if (!part || !part.key) return null;
  const entry = state.ttsPartPrefetch?.entries.get(part.key);
  if (!isShortPartPrefetchMatch(entry, text, voice, speed, includeOptions)) return null;
  if (entry.blob) return entry.blob;
  if (!entry.promise) return null;
  try {
    const blob = await entry.promise;
    if (!blob) return null;
    if (!isShortPartPrefetchMatch(entry, text, voice, speed, includeOptions)) return null;
    return blob;
  } catch (error) {
    return null;
  }
}

async function playTtsForShortPart(question, part, source = "manual") {
  if (!state.settings.ttsEnabled) return;
  if (!question || !part) return;
  const includeMain = shouldIncludeShortMain(question);
  const text = buildShortPartTtsText(question, part, { includeMain });
  if (!text) {
    stopTts("Ingen tekst at læse op.", true);
    return;
  }
  if (!state.ttsStatus.available) {
    stopTts(getTtsBaseLabel(), true);
    return;
  }
  if (text.length > TTS_MAX_CHARS) {
    stopTts("Teksten er for lang til oplæsning. Slå evt. svarmuligheder fra.", true);
    return;
  }

  const voice = normalizeTtsVoice(state.settings.ttsVoice);
  const speed = Math.min(
    Math.max(Number(state.settings.ttsSpeed) || 1, TTS_SPEED_MIN),
    TTS_SPEED_MAX
  );
  const includeOptions = state.settings.ttsIncludeOptions;
  markShortPartAnnounced(question, part, includeMain);
  const prefetched = await getPrefetchedBlob(question, text, voice, speed, includeOptions);
  if (prefetched) {
    consumeTtsPrefetch(question.key);
    await playTtsBlob(prefetched, { source });
    return;
  }
  const partPrefetched = await getShortPartPrefetchedBlob(part, text, voice, speed, includeOptions);
  if (partPrefetched) {
    await playTtsBlob(partPrefetched, { source });
    return;
  }
  playTtsText(text, { source });
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
  let text = "";
  if (question.type === "short" && isShortGroup(question)) {
    const activePart = getActiveShortPart(question);
    if (activePart) {
      text = buildShortPartTtsText(question, activePart, { includeMain: true });
    }
  } else {
    text = buildTtsText(question);
  }
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
    ai: true,
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
      ai: true,
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
    stopTts(`Kunne ikke hente oplæsning. ${error.message || "Prøv igen om lidt."}`, true);
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
  if (question.type === "short" && isShortGroup(question)) {
    const part = getActiveShortPart(question);
    if (part) {
      await playTtsForShortPart(question, part, source);
    }
    return;
  }
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

function parseHistoryTimestamp(entry) {
  const raw = entry?.date;
  const parsed = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const overallPercent = Number(entry.overallPercent);
  if (!Number.isFinite(overallPercent)) return null;
  const studio = normalizeCourse(entry.studio || DEFAULT_COURSE);
  return {
    ...entry,
    studio,
    policyId: entry.policyId || SCORING_POLICY_IDS[studio] || SCORING_POLICY_IDS[DEFAULT_COURSE],
    overallPercent,
  };
}

function getAllHistoryEntries() {
  const entries = Array.isArray(state.history) ? state.history : [];
  return entries.map(normalizeHistoryEntry).filter(Boolean);
}

function getHistoryEntries({ course } = {}) {
  const courseId = normalizeCourse(course || getActiveCourse());
  return getAllHistoryEntries().filter(
    (entry) => normalizeCourse(entry.studio || DEFAULT_COURSE) === courseId
  );
}

function refreshCourseProfile(courseId) {
  const normalized = normalizeCourse(courseId || getActiveCourse());
  const policy = resolveStudioPolicy(normalized);
  const fallbackDomains = Array.isArray(policy?.domains) ? policy.domains : [];
  const fallbackLevel = Number(policy?.hints?.defaultLevel) || 0;

  let profile = null;
  if (window.StudioEngine?.deriveProgressionProfile) {
    profile = window.StudioEngine.deriveProgressionProfile(
      normalized,
      getHistoryEntries({ course: normalized })
    );
  }
  if (!profile) {
    profile = {
      courseId: normalized,
      hintLevel: fallbackLevel,
      domainSetKey: "full",
      domainLabels: fallbackDomains,
      tier: "",
      average: null,
    };
  }
  state.courseProfiles.set(normalized, profile);
  return profile;
}

function getCourseProfile(courseId) {
  const normalized = normalizeCourse(courseId || getActiveCourse());
  if (state.sessionProfile?.courseId === normalized) {
    return state.sessionProfile;
  }
  if (state.courseProfiles.has(normalized)) {
    return state.courseProfiles.get(normalized);
  }
  return refreshCourseProfile(normalized);
}

function saveHistoryEntries(entries) {
  const normalized = Array.isArray(entries)
    ? entries.map(normalizeHistoryEntry).filter(Boolean)
    : [];
  const grouped = new Map();
  normalized.forEach((entry) => {
    const course = normalizeCourse(entry.studio || DEFAULT_COURSE);
    const bucket = grouped.get(course) || [];
    bucket.push(entry);
    grouped.set(course, bucket);
  });

  const trimmed = [];
  grouped.forEach((bucket) => {
    bucket.sort((a, b) => parseHistoryTimestamp(a) - parseHistoryTimestamp(b));
    trimmed.push(...bucket.slice(-HISTORY_LIMIT));
  });
  trimmed.sort((a, b) => parseHistoryTimestamp(a) - parseHistoryTimestamp(b));

  state.history = trimmed;
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

function getHistoryDisplayPercent(entry, scoringPolicy) {
  if (!entry) return 0;
  const overall = Number(entry.overallPercent);
  if (!scoringPolicy?.usesRubric) {
    return Number.isFinite(overall) ? overall : 0;
  }
  const rubricTotal = Number(entry.rubricTotal);
  const rubricPercent = Number(entry.rubricPercent);
  if (Number.isFinite(rubricTotal) && rubricTotal > 0 && Number.isFinite(rubricPercent)) {
    return rubricPercent;
  }
  return Number.isFinite(overall) ? overall : 0;
}

function formatHistoryTitle(entry, scoringPolicy) {
  if (!entry) return "—";
  const percent = formatPercent(getHistoryDisplayPercent(entry, scoringPolicy));
  if (scoringPolicy?.usesGrade) {
    return `${entry.grade || "-"} · ${percent}`;
  }
  if (scoringPolicy?.usesRubric) {
    return `Rubric · ${percent}`;
  }
  return percent;
}

function formatHistoryMcqMeta(entry, options = {}) {
  const { suffix = false } = options;
  const mcqPoints = Number(entry.mcqPoints) || 0;
  const mcqMax = Number(entry.mcqMax) || 0;
  if (!mcqMax) return "MCQ —";
  return suffix ? `${mcqPoints}/${mcqMax} MCQ` : `MCQ ${mcqPoints}/${mcqMax}`;
}

function formatHistoryShortMeta(entry, options = {}) {
  const { label = "Kortsvar", suffix = false } = options;
  const shortPoints = Number(entry.shortPoints) || 0;
  const shortMax = Number(entry.shortMax) || 0;
  if (shortMax <= 0) return `${label} —`;
  const value = `${shortPoints.toFixed(1)}/${shortMax.toFixed(1)}`;
  return suffix ? `${value} ${label}` : `${label} ${value}`;
}

function formatHistoryRubricMeta(entry) {
  const rubricMatched = Number(entry.rubricMatched) || 0;
  const rubricTotal = Number(entry.rubricTotal) || 0;
  return rubricTotal ? `Rubric ${rubricMatched}/${rubricTotal}` : "Rubric —";
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

  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const visible = entries.slice(-6).reverse();
  visible.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "history-item";
    if (index === 0) row.classList.add("latest");

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = formatHistoryTitle(entry, scoringPolicy);

    const meta = document.createElement("div");
    meta.className = "history-meta";
    if (scoringPolicy.usesRubric) {
      meta.textContent =
        `${formatHistoryDate(entry.date)} · ${formatHistoryRubricMeta(entry)} · ${formatHistoryShortMeta(entry, { label: "Point" })}`;
    } else {
      meta.textContent =
        `${formatHistoryDate(entry.date)} · ${formatHistoryMcqMeta(entry)} · ${formatHistoryShortMeta(entry)}`;
    }

    row.appendChild(title);
    row.appendChild(meta);
    container.appendChild(row);
  });
}

function renderHistory() {
  const entries = getHistoryEntries();
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const latest = entries[entries.length - 1] || null;
  const prev = entries[entries.length - 2] || null;
  const fallbackBest = !entries.length && state.bestScore > 0
    ? {
        overallPercent: state.bestScore,
        rubricPercent: scoringPolicy.usesRubric ? state.bestScore : null,
        grade: scoringPolicy.usesGrade ? getGradeForPercent(state.bestScore) : null,
      }
    : null;
  const best = getBestHistoryEntry(entries) || fallbackBest;

  if (elements.historyLatest) {
    elements.historyLatest.textContent = latest
      ? formatHistoryTitle(latest, scoringPolicy)
      : "—";
  }
  if (elements.historyLatestMeta) {
    if (latest) {
      if (scoringPolicy.usesRubric) {
        elements.historyLatestMeta.textContent =
          `${formatHistoryRubricMeta(latest)} · ${formatHistoryShortMeta(latest, { label: "Point" })}`;
      } else {
        const mcqMeta = formatHistoryMcqMeta(latest, { suffix: true });
        const shortMeta = formatHistoryShortMeta(latest, { label: "kortsvar", suffix: true });
        elements.historyLatestMeta.textContent = `${mcqMeta} · ${shortMeta}`;
      }
    } else {
      elements.historyLatestMeta.textContent = "Ingen runder endnu";
    }
  }
  if (elements.historyBest) {
    elements.historyBest.textContent = best
      ? formatHistoryTitle(best, scoringPolicy)
      : "—";
  }
  if (elements.historyBestMeta) {
    if (scoringPolicy.usesGrade) {
      elements.historyBestMeta.textContent = `Mål: 12 (${TARGET_GRADE_PERCENT}%)`;
    } else if (scoringPolicy.usesRubric) {
      elements.historyBestMeta.textContent = "Mål: 100% rubric";
    } else {
      elements.historyBestMeta.textContent = "Mål: 100%";
    }
  }

  if (elements.historyTrend) {
    if (latest && prev) {
      const currentValue = getHistoryDisplayPercent(latest, scoringPolicy);
      const prevValue = getHistoryDisplayPercent(prev, scoringPolicy);
      const delta = currentValue - prevValue;
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
    if (rankSource) {
      elements.heroRank.textContent = scoringPolicy.usesGrade
        ? `${rankSource.grade || "-"}`
        : formatPercent(getHistoryDisplayPercent(rankSource, scoringPolicy));
    } else {
      elements.heroRank.textContent = "—";
    }
  }
  if (elements.heroRankMeta) {
    if (best) {
      const percent = formatPercent(getHistoryDisplayPercent(best, scoringPolicy));
      elements.heroRankMeta.textContent = scoringPolicy.usesRubric
        ? `Personlig rekord: ${percent} rubric`
        : `Personlig rekord: ${percent}`;
    } else {
      elements.heroRankMeta.textContent = "Ingen rekord endnu";
    }
  }
  if (elements.heroTarget) {
    elements.heroTarget.textContent = scoringPolicy.usesGrade ? "12" : "100%";
  }
  if (elements.heroTargetMeta) {
    if (latest) {
      const targetPercent = scoringPolicy.usesGrade ? TARGET_GRADE_PERCENT : 100;
      const currentPercent = getHistoryDisplayPercent(latest, scoringPolicy);
      const missing = Math.max(0, targetPercent - currentPercent);
      if (scoringPolicy.usesGrade) {
        elements.heroTargetMeta.textContent = missing > 0
          ? `${missing.toFixed(1)}% fra topkarakter`
          : "Du er i målzonen!";
      } else {
        elements.heroTargetMeta.textContent = missing > 0
          ? `${missing.toFixed(1)}% til fuld dækning`
          : "Fuld rubricdækning opnået!";
      }
    } else if (scoringPolicy.usesGrade) {
      elements.heroTargetMeta.textContent = `${TARGET_GRADE_PERCENT}% for topkarakter`;
    } else {
      elements.heroTargetMeta.textContent = "100% rubricdækning som mål";
    }
  }
  if (elements.heroProgressFill) {
    const targetPercent = scoringPolicy.usesGrade ? TARGET_GRADE_PERCENT : 100;
    const currentPercent = latest ? getHistoryDisplayPercent(latest, scoringPolicy) : 0;
    const progressValue = targetPercent
      ? Math.min((currentPercent / targetPercent) * 100, 100)
      : 0;
    elements.heroProgressFill.style.width = `${progressValue.toFixed(1)}%`;
    if (elements.heroProgressBar) {
      elements.heroProgressBar.setAttribute("aria-valuenow", String(Math.round(progressValue)));
      elements.heroProgressBar.setAttribute("aria-valuetext", `${progressValue.toFixed(1)}%`);
    }
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
  const policy = resolveStudioPolicy(getActiveCourse());
  const entry = {
    date: new Date().toISOString(),
    studio: getActiveCourse(),
    policyId: state.scoreSummary.policyId || getActiveScoringPolicy().id,
    taskType: policy?.taskType || "",
    hintLevel: Number.isFinite(state.sessionProfile?.hintLevel)
      ? state.sessionProfile.hintLevel
      : null,
    overallPercent: state.scoreSummary.overallPercent,
    grade: state.scoreSummary.grade,
    mcqPercent: state.scoreSummary.mcqPercent,
    shortPercent: state.scoreSummary.shortPercent,
    rubricPercent: state.scoreSummary.rubricPercent,
    rubricMatched: state.scoreSummary.rubricMatched,
    rubricTotal: state.scoreSummary.rubricTotal,
    mcqPoints: state.scoreBreakdown.mcq,
    shortPoints: state.scoreBreakdown.short,
    mcqMax: state.sessionScoreMeta.mcqMax,
    shortMax: state.sessionScoreMeta.shortMax,
    mcqCount: state.sessionScoreMeta.mcqCount,
    shortCount: state.sessionScoreMeta.shortCount,
    totalQuestions: state.activeQuestions.length,
  };
  const entries = getAllHistoryEntries().concat(entry);
  saveHistoryEntries(entries);
  refreshCourseProfile(getActiveCourse());
  renderHistory();
}

function getShortDraft(questionKey) {
  return state.shortAnswerDrafts.get(questionKey) || { text: "", points: 0, scored: false };
}

function saveShortDraft(questionKey, data) {
  const current = getShortDraft(questionKey);
  state.shortAnswerDrafts.set(questionKey, { ...current, ...data });
}

function updateShortScoreHint(maxPoints, currentPoints, hintEl = elements.shortAnswerHint) {
  if (!hintEl) return;
  const safeMax = Number(maxPoints) || 0;
  const safeCurrent = clamp(Number(currentPoints) || 0, 0, safeMax || 0);
  const failThreshold = getShortFailThreshold(safeMax);
  const thresholdText = safeMax > 0
    ? `Under ${SHORT_FAIL_PERCENT}% (${failThreshold.toFixed(1)} point) tæller som fejlet.`
    : `Under ${SHORT_FAIL_PERCENT}% tæller som fejlet.`;
  hintEl.textContent =
    `Valgt: ${safeCurrent.toFixed(1)} / ${safeMax.toFixed(1)} point. ${thresholdText}`;
}

function syncShortScoreInputs(value, options = {}) {
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const part = options.part || getActiveShortPart(question);
  if (!part) return;
  const nodes = resolveShortReviewElements(part);
  const maxPoints = part.maxPoints || 0;
  const numeric = Number(clamp(Number(value) || 0, 0, maxPoints).toFixed(1));
  const scored = options.scored ?? true;
  if (nodes.scoreRange) {
    nodes.scoreRange.value = String(numeric);
  }
  updateShortScoreHint(maxPoints, numeric, nodes.scoreHint);
  const currentDraft = getShortDraft(part.key);
  saveShortDraft(part.key, {
    text: currentDraft.text || "",
    points: numeric,
    scored,
  });
  updateShortPartStatus(part);
  updateShortGroupStatus(question);
  updateShortReviewStatus(part);
  updateShortAnswerActions(question);
  updateShortGroupCompletionUI(question);
}

function finalizeShortAnswer() {
  if (state.locked) return;
  stopTts();
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const parts = getShortParts(question);
  if (!parts.length) return;
  let awardedTotal = 0;
  let maxTotal = 0;
  parts.forEach((part) => {
    const draft = getShortDraft(part.key);
    const response = String(draft.text || "").trim();
    const hasAnswer = hasShortPartAnswer(part) || draft.scored;
    const maxPoints = part.maxPoints || 0;
    const awardedPoints = hasAnswer ? clamp(Number(draft.points) || 0, 0, maxPoints) : 0;
    awardedTotal += awardedPoints;
    maxTotal += maxPoints;
    state.results.push({
      question: part,
      groupKey: question.key,
      type: "short",
      response,
      awardedPoints,
      maxPoints,
      skipped: !hasAnswer,
      ai: state.shortAnswerAI.get(part.key) || null,
    });
  });
  const partCount = parts.length;
  const averageAwarded = partCount ? awardedTotal / partCount : 0;
  const averageMax = partCount ? maxTotal / partCount : 0;
  const roundedAwarded = Number(averageAwarded.toFixed(1));
  const roundedMax = Number(averageMax.toFixed(1));
  state.score += roundedAwarded;
  state.scoreBreakdown.short += roundedAwarded;
  const ratio = averageMax > 0 ? averageAwarded / averageMax : 0;
  recordPerformance(question, ratio, getQuestionTimeMs());
  state.locked = true;
  elements.skipBtn.disabled = true;
  setFeedback(
    `Svar gemt (gennemsnit): ${roundedAwarded.toFixed(1)} / ${roundedMax.toFixed(1)} point.`,
    "success"
  );
  updateTopBar();
  parts.forEach((part) => updateShortPartStatus(part));
  const activePart = getActiveShortPart(question);
  if (activePart) {
    updateShortReviewStatus(activePart);
  }
  updateShortAnswerActions(question);
}

function toggleFigure() {
  setFigureVisibility(!state.figureVisible);
}

async function gradeShortGroupAnswers(question, { auto = false } = {}) {
  if (!question || question.type !== "short" || !isShortGroup(question)) return;
  const parts = getShortParts(question);
  if (!parts.length) return;
  if (state.shortAnswerPending) {
    setShortcutTempStatus("grade", "Vurderer …", 1500);
    return;
  }

  const { hasText, hasSketch } = getShortAnswerState(question);
  const hasAnswer = hasText || hasSketch;
  if (!hasAnswer) {
    setShortReviewOpen(true);
    updateShortAnswerActions(question);
    setFeedback(
      "Skriv et svar til alle delspørgsmål eller brug Spring over i Mere.",
      "error"
    );
    setShortcutTempStatus("grade", "Mangler svar", 2000);
    return;
  }

  const partsToGrade = parts.filter(
    (part) => hasShortPartAnswer(part) && !isShortPartScored(part)
  );
  if (!partsToGrade.length) {
    partsToGrade.push(...parts.filter((part) => hasShortPartAnswer(part)));
  }
  if (!partsToGrade.length) {
    updateShortGroupStatus(question);
    updateShortAnswerActions(question);
    return;
  }

  setShortReviewOpen(true);
  const policy = getScoringPolicyForQuestion(question);
  if (policy.requiresAi && !state.aiStatus.available) {
    const activePart = getActiveShortPart(question);
    const nodes = activePart ? resolveShortReviewElements(activePart) : null;
    if (nodes?.aiFeedback) {
      nodes.aiFeedback.textContent =
        state.aiStatus.message || "Auto-bedømmelse er ikke sat op endnu.";
    }
    setShortcutTempStatus("grade", "Hjælp er ikke klar", 2000);
    setShortRetryVisible(true, activePart);
    return;
  }

  const originalKey = state.activeShortPartKey;
  for (const part of partsToGrade) {
    if (state.activeShortPartKey !== part.key) {
      setActiveShortPart(part);
    }
    setShortRetryVisible(false, part);
    updateShortReviewStatus(part);
    const upload = state.sketchUploads.get(part.key);
    const analysis = state.sketchAnalysis.get(part.key);
    if (upload && !analysis) {
      await analyzeSketch(part);
    }
    await gradeShortAnswer({ auto });
  }

  if (originalKey && originalKey !== state.activeShortPartKey) {
    const restorePart = parts.find((part) => part.key === originalKey);
    if (restorePart) {
      setActiveShortPart(restorePart);
    }
  }
  updateShortGroupStatus(question);
  updateShortAnswerActions(question);
}

async function gradeShortAnswer(options = {}) {
  const { auto = false } = options;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") return;
  const part = getActiveShortPart(question);
  if (!part) return;
  const nodes = resolveShortReviewElements(part);
  setShortRetryVisible(false, part);
  const policy = getScoringPolicyForQuestion(part);
  if (policy.requiresAi && !state.aiStatus.available) {
    if (nodes.aiFeedback) {
      nodes.aiFeedback.textContent =
        state.aiStatus.message || "Auto-bedømmelse er ikke sat op endnu.";
    }
    setShortcutTempStatus("grade", "Hjælp er ikke klar", 2000);
    setShortRetryVisible(true, part);
    return;
  }
  const { answer: combinedAnswer, hasSketch } = buildShortAnswerForGrading(part);
  if (!combinedAnswer) {
    const upload = state.sketchUploads.get(part.key);
    if (nodes.aiFeedback) {
      nodes.aiFeedback.textContent = upload
        ? "Skitseanalyse mangler. Vent på analysen, eller skriv et svar."
        : "Skriv et svar eller upload en skitse først.";
    }
    setShortcutTempStatus("grade", "Mangler svar", 2000);
    return;
  }

  setShortAnswerPending(true);
  const feedbackPrefix = policy.usesRubric
    ? "Vurderer mod rubric …"
    : hasSketch
      ? "Vurderer skitse + tekst …"
      : "Vurderer dit svar …";
  if (nodes.aiFeedback) {
    nodes.aiFeedback.textContent = auto
      ? policy.usesRubric
        ? "Auto-vurderer rubric …"
        : hasSketch
          ? "Auto-bedømmer skitse + tekst …"
          : "Auto-bedømmer dit svar …"
      : feedbackPrefix;
  }

  const modelAnswer = await resolveShortModelAnswer(part, { useSketch: hasSketch });

  try {
    if (policy.usesRubric) {
      const payload = {
        prompt: buildShortPrompt(part),
        rubric: modelAnswer,
        userAnswer: combinedAnswer,
        maxPoints: part.maxPoints || 0,
        language: "da",
        studio: getActiveCourse(),
        policyId: policy.id,
        questionKey: part.key,
        groupKey: part.groupKey || "",
      };
      let data = null;
      let usedLocal = false;
      if (state.session?.user && state.backendAvailable) {
        try {
          const res = await apiFetch("/api/rubric-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            let detail = `Rubric response ${res.status}`;
            try {
              const errorPayload = await res.json();
              if (errorPayload.error) detail = errorPayload.error;
            } catch (error) {
              detail = `Rubric response ${res.status}`;
            }
            throw new Error(detail);
          }
          data = await res.json();
        } catch (error) {
          usedLocal = true;
          if (nodes.aiFeedback) {
            nodes.aiFeedback.textContent =
              `Kunne ikke hente rubric-vurdering. ${error.message || "Bruger lokal vurdering."}`;
          }
        }
      } else {
        usedLocal = true;
      }
      if (usedLocal) {
        const local = scoreRubricAnswer({
          rubricText: modelAnswer,
          userAnswer: combinedAnswer,
          maxPoints: part.maxPoints || 0,
        });
        const feedback = local.rubric.total > 0
          ? `Rubric dækning: ${local.rubric.matched}/${local.rubric.total} kriterier.`
          : "Rubric dækning: ingen kriterier.";
        data = { ...local, feedback };
      }
      const fallbackFeedback = usedLocal
        ? "Rubric vurderet lokalt. Justér point efter behov."
        : "Rubric vurdering klar. Justér point efter behov.";
      applyShortAnswerGradeResult(part, data, { fallbackFeedback });
      setShortRetryVisible(false, part);
      return;
    }

    const res = await apiFetch("/api/grade", {
      method: "POST",
      ai: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: buildShortPrompt(part),
        modelAnswer,
        userAnswer: combinedAnswer,
        maxPoints: part.maxPoints || 0,
        sources: part.sources || [],
        language: "da",
        ignoreSketch: requiresSketch(part) && !hasSketch,
        studio: getActiveCourse(),
        policyId: policy.id,
        questionKey: part.key,
        groupKey: part.groupKey || "",
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
    applyShortAnswerGradeResult(part, data, { fallbackFeedback });
    setShortRetryVisible(false, part);
  } catch (error) {
    if (nodes.aiFeedback) {
      nodes.aiFeedback.textContent =
        `Kunne ikke hente auto-bedømmelse. ${error.message || "Tjek din adgang og forbindelsen."}`;
    }
    setShortRetryVisible(true, part);
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
    const { hasText, hasSketch } = getShortAnswerState(question);
    const hasAnswer = hasText || hasSketch;
    if (!isShortReadyForNext(question)) {
      setShortReviewOpen(true);
      const activePart = getActiveShortPart(question);
      if (activePart) {
        updateShortReviewStatus(activePart);
      }
      updateShortAnswerActions(question);
      if (!hasAnswer) {
        setFeedback(
          "Skriv et svar til alle delspørgsmål eller brug Spring over i Mere.",
          "error"
        );
        return;
      }
      setFeedback("Vurdér svarene før du går videre.", "error");
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
    button.title = state.aiStatus.message || "Hjælp er ikke klar. Tjek din adgang.";
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
    button.title = state.aiStatus.message || "Hjælp er ikke klar. Tjek din adgang.";
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
    textEl.textContent = state.aiStatus.message || "Hjælp er ikke klar. Tjek din adgang.";
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
      ai: true,
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
    textEl.textContent = `Kunne ikke hente forklaring. ${error.message || "Tjek din adgang og forbindelsen."}`;
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
    textEl.textContent = state.aiStatus.message || "Hjælp er ikke klar. Tjek din adgang.";
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
      ai: true,
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
    textEl.textContent = `Kunne ikke udvide forklaringen. ${error.message || "Tjek din adgang og forbindelsen."}`;
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
  const hintPolicy = getHintPolicy(entry?.question);
  if (hintPolicy.mode === "structured") {
    updateExpandHintButton(entry, button);
    return;
  }
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
    textEl.textContent = state.aiStatus.message || "Hjælp er ikke klar. Tjek din adgang.";
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
      ai: true,
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
    textEl.textContent = `Kunne ikke udvide hintet. ${error.message || "Tjek din adgang og forbindelsen."}`;
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
  const hintPolicy = getHintPolicy(entry?.question);
  if (hintPolicy.mode === "structured") {
    if (entry.hintLoading) return;
    entry.hintLoading = true;
    textEl.textContent = auto ? "Henter hint …" : "Henter hint …";
    textEl.classList.add("loading");
    textEl.classList.remove("hidden");
    button.textContent = "Henter …";
    button.disabled = true;
    updateExpandHintButton(entry, expandButton);

    const hintLevel = hintPolicy.level ?? 0;
    if (hintLevel <= 0) {
      entry.hintLoading = false;
      textEl.textContent = "Hints er slået fra for dette niveau.";
      textEl.classList.remove("loading");
      button.textContent = "Vis hint";
      button.disabled = true;
      updateExpandHintButton(entry, expandButton);
      return;
    }

    const hint = buildStructuredHintForQuestion(entry.question, hintLevel);
    entry.aiHint = hint || "Ingen facit til hint.";
    textEl.textContent = getHintText(entry);
    textEl.classList.remove("loading");
    button.textContent = "Skjul hint";
    entry.hintLoading = false;
    button.disabled = false;
    updateExpandHintButton(entry, expandButton);
    return;
  }

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
      ai: true,
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
    textEl.textContent = `Kunne ikke hente hint. ${error.message || "Tjek din adgang og forbindelsen."}`;
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
  const usesAiHints = queueEntries.some(
    (entry) => getHintPolicy(entry.question).mode !== "structured"
  );
  updateReviewQueueStatus(
    usesAiHints
      ? state.aiStatus.available
        ? "Henter hints …"
        : "Hjælp er ikke klar"
      : "Hints klar"
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
    const courseLabel = formatCourseLabel(entry.question.course);
    meta.textContent = `${courseLabel} • ${entry.question.category} • ${entry.question.yearLabel} • ${numberTag}`;

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
    const hintPolicy = getHintPolicy(entry.question);
    const isStructured = hintPolicy.mode === "structured";
    if (!isStructured) {
      updateExpandHintButton(entry, expandHintBtn);
    } else {
      expandHintBtn.classList.add("hidden");
      expandHintBtn.disabled = true;
    }
    const modelAnswer = getEffectiveModelAnswer(entry.question);
    const hintLevel = hintPolicy.level ?? 0;
    const canHint = isStructured
      ? hintLevel > 0 && Boolean(modelAnswer)
      : Boolean(modelAnswer);
    hintBtn.disabled = isStructured
      ? !canHint
      : !state.aiStatus.available || !canHint;
    if (isStructured) {
      if (!canHint) {
        hintBtn.title =
          hintLevel <= 0
            ? "Hints er slået fra for dette niveau."
            : "Ingen facit til hint.";
      }
    } else if (!state.aiStatus.available) {
      hintBtn.title = state.aiStatus.message || "Hjælp er ikke klar lige nu.";
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

    if (isStructured) {
      if (!canHint) {
        hintText.classList.remove("hidden");
        hintText.textContent =
          hintLevel <= 0
            ? "Hints er slået fra for dette niveau."
            : "Ingen facit til hint.";
      }
    } else if (state.aiStatus.available && canHint) {
      hintText.classList.remove("hidden");
      hintText.classList.add("loading");
      hintText.textContent = "Henter hint …";
      enqueueReviewHint(entry, hintText, hintBtn, expandHintBtn);
    } else {
      hintText.classList.remove("hidden");
      hintText.textContent = canHint ? "Hjælp er ikke klar lige nu." : "Ingen facit til hint.";
    }
  });

  if (usesAiHints && state.aiStatus.available) {
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
    const titleText = images.length > 1 ? `Figur ${index + 1}` : "Figur";
    attachFigureModalHandlers(img, {
      src,
      alt: img.alt,
      caption: captionText,
      title: titleText,
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
  const capabilities = getStudioCapabilitiesForCourse(entry?.question?.course || DEFAULT_COURSE);
  if (!capabilities.allowSketch) return null;
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
      } else if (isShortFailed(entry)) {
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
    const courseLabel = formatCourseLabel(entry.question.course);
    meta.textContent = `${courseLabel} • ${entry.question.category} • ${entry.question.yearLabel} • ${numberTag} • ${typeLabel}`;

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
        if (!isShortFailed(entry)) {
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
        if (labelTag) {
          modelLine.textContent = `Facit (${labelTag}): ${modelAnswer}`;
        } else {
          modelLine.textContent = `Facit: ${modelAnswer}`;
        }
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
        explainBtn.title = state.aiStatus.message || "Hjælp er ikke klar lige nu.";
      }

      const expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.className = "btn ghost small";
      updateExpandButton(entry, expandBtn);

      const explainStatus = document.createElement("span");
      explainStatus.className = "review-explain-status";
      explainStatus.textContent = state.aiStatus.available ? "Forklaring" : "Hjælp er ikke klar";

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
  state.sessionActive = false;
  state.sessionPaused = false;
  state.sessionPausedAt = null;
  state.sessionCourse = null;
  state.sessionNeedsRender = false;
  state.activeSessionDirty = true;
  resetCancelRoundConfirm();
  updatePausedSessionUI();
  state.scoreSummary = calculateScoreSummary();
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const usesRubric = scoringPolicy.usesRubric;
  const mcqCorrect = state.results.filter((r) => r.type === "mcq" && r.isCorrect).length;
  const mcqWrong = state.results.filter((r) => r.type === "mcq" && !r.isCorrect && !r.skipped).length;
  const mcqSkipped = state.results.filter((r) => r.type === "mcq" && r.skipped).length;
  const shortSkipMap = new Map();
  const shortMistakes = new Set();
  state.results.forEach((result) => {
    if (result?.type !== "short") return;
    const groupKey = getShortResultGroupKey(result);
    if (!groupKey) return;
    const entry = shortSkipMap.get(groupKey) || { total: 0, skipped: 0 };
    entry.total += 1;
    if (result.skipped) entry.skipped += 1;
    shortSkipMap.set(groupKey, entry);
    if (result.skipped || isShortFailed(result)) {
      shortMistakes.add(groupKey);
    }
  });
  const skippedShortGroups = [...shortSkipMap.values()].filter(
    (entry) => entry.total && entry.skipped === entry.total
  ).length;
  let correct = mcqCorrect;
  let wrong = mcqWrong;
  let skipped = mcqSkipped + skippedShortGroups;
  if (usesRubric) {
    const rubricMatched = Number(state.scoreSummary.rubricMatched) || 0;
    const rubricTotal = Number(state.scoreSummary.rubricTotal) || 0;
    correct = rubricMatched;
    wrong = Math.max(0, rubricTotal - rubricMatched);
    skipped = skippedShortGroups;
  }
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
  if (elements.resultRubricValue) {
    if (usesRubric) {
      const rubricMatched = Number(state.scoreSummary.rubricMatched) || 0;
      const rubricTotal = Number(state.scoreSummary.rubricTotal) || 0;
      elements.resultRubricValue.textContent = rubricTotal > 0
        ? `${rubricMatched} / ${rubricTotal}`
        : "—";
    } else {
      elements.resultRubricValue.textContent = "—";
    }
  }
  if (elements.resultRubricPercent) {
    elements.resultRubricPercent.textContent = usesRubric && state.scoreSummary.rubricTotal > 0
      ? `${state.scoreSummary.rubricPercent.toFixed(1)}%`
      : "—";
  }
  elements.statPace.textContent = timePerQuestion;

  const courseId = getActiveCourse();
  const currentBest = getBestScoreForCourse(courseId);
  const isNewBest = state.scoreSummary.overallPercent > currentBest;
  if (isNewBest) {
    setBestScoreForCourse(courseId, state.scoreSummary.overallPercent);
  }
  elements.bestBadge.style.display = isNewBest ? "inline-flex" : "none";
  syncActiveBestScore(courseId);

  if (state.shouldRecordHistory) {
    recordHistoryEntry();
  }

  const mistakeKeys = state.results
    .filter((result) => result.type === "mcq" && !result.isCorrect)
    .map((result) => result.question.key);
  shortMistakes.forEach((key) => mistakeKeys.push(key));
  state.lastMistakeKeys = new Set(mistakeKeys);
  localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify([...state.lastMistakeKeys]));
  if (elements.playAgainBtn) {
    elements.playAgainBtn.textContent = state.lastMistakeKeys.size ? "Gentag fejl" : "Spil igen";
  }
  if (elements.restartRoundBtn) {
    elements.restartRoundBtn.classList.toggle("hidden", !state.lastMistakeKeys.size);
  }

  markQuestionsSeen(getResultsQuestions(state.results));

  buildReviewQueue(state.results);
  buildReviewList(state.results);
  showScreen("result");
  void syncActiveSessionSnapshot(null);
  flushUserStateSync();
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

function orderQuestionsByType(questions) {
  const mcq = [];
  const short = [];
  questions.forEach((question) => {
    if (question?.type === "short") {
      short.push(question);
    } else {
      mcq.push(question);
    }
  });
  return mcq.concat(short);
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

function shouldUseWeightedMix() {
  return state.sessionSettings.adaptiveMix;
}

function pickBalancedQuestions(pool, count) {
  const groups = new Map();
  pool.forEach((question) => {
    if (!groups.has(question.category)) {
      groups.set(question.category, []);
    }
    groups.get(question.category).push(question);
  });

  const useWeighted = shouldUseWeightedMix();
  const groupList = shuffle(
    [...groups.values()].map((group) => (useWeighted ? [...group] : shuffle(group)))
  );

  const selected = [];
  while (selected.length < count && groupList.length) {
    for (let i = 0; i < groupList.length && selected.length < count; i += 1) {
      const group = groupList[i];
      if (group.length) {
        const picked = useWeighted ? pickWeightedOne(group) : group.pop();
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
  const useWeighted = shouldUseWeightedMix();
  if (useWeighted && state.sessionSettings.balancedMix) {
    return pickBalancedQuestions(pool, count);
  }
  if (useWeighted) {
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
  const unseen = pool.filter((q) => !isQuestionSeen(q));
  const seenPool = pool.filter((q) => isQuestionSeen(q));
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

    return orderQuestionsByType(selected);
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
  const shortGroups = questions.filter((q) => q.type === "short");
  if (!shortGroups.length) return;
  const parts = [];
  shortGroups.forEach((group) => {
    parts.push(...getShortParts(group));
  });
  if (!parts.length) return;
  const step = 0.5;
  const base = SHORT_TOTAL_POINTS / parts.length;
  const roundedBase = Math.floor(base / step) * step;
  let remaining = SHORT_TOTAL_POINTS - roundedBase * parts.length;

  const partPoints = new Map();
  parts.forEach((part) => {
    let points = roundedBase;
    if (remaining >= step) {
      points += step;
      remaining -= step;
    }
    partPoints.set(part.key, Number(points.toFixed(1)));
  });

  shortGroups.forEach((group) => {
    const groupParts = getShortParts(group);
    let totalPoints = 0;
    groupParts.forEach((part) => {
      const points = partPoints.get(part.key) ?? 0;
      part.maxPoints = points;
      totalPoints += points;
    });
    const averagePoints = groupParts.length ? totalPoints / groupParts.length : 0;
    group.maxPoints = Number(averagePoints.toFixed(1));
  });
}

function updateSessionScoreMeta(questions) {
  const mcqCount = questions.filter((q) => q.type === "mcq").length;
  const shortGroups = questions.filter((q) => q.type === "short");
  const shortCount = shortGroups.length;
  const shortMax = shortGroups.reduce((sum, q) => sum + (q.maxPoints || 0), 0);
  const scoringPolicy = getScoringPolicyForCourse(getActiveCourse());
  const mcqCorrectPoints = Number(scoringPolicy.mcq?.correct ?? 3);
  const mcqWrongPoints = Number(scoringPolicy.mcq?.wrong ?? -1);
  state.sessionScoreMeta = {
    mcqCount,
    mcqMax: mcqCount * mcqCorrectPoints,
    mcqMin: mcqCount * mcqWrongPoints,
    shortCount,
    shortMax,
  };
}

function getShortResultGroupKey(entry) {
  if (!entry || entry.type !== "short") return "";
  if (entry.groupKey) return entry.groupKey;
  if (entry.question?.groupKey) return `short-group-${entry.question.groupKey}`;
  const rawKey = getShortGroupKey(entry.question);
  return rawKey ? `short-group-${rawKey}` : "";
}

function getResultsQuestions(results) {
  if (!Array.isArray(results) || !results.length) return [];
  const unique = new Map();
  results.forEach((entry) => {
    if (!entry) return;
    if (entry.type === "short") {
      const groupKey = getShortResultGroupKey(entry);
      const groupQuestion = state.shortGroupsByKey.get(groupKey);
      if (groupQuestion && !unique.has(groupQuestion.key)) {
        unique.set(groupQuestion.key, groupQuestion);
      }
      return;
    }
    const question = entry?.question;
    if (!question?.key) return;
    if (!unique.has(question.key)) {
      unique.set(question.key, question);
    }
  });
  return [...unique.values()];
}

function refreshSeenGroups() {
  const groups = new Set();
  state.allQuestions.forEach((question) => {
    if (question.type !== "mcq") return;
    const groupKey = question.duplicateGroup;
    if (!groupKey) return;
    if (state.seenKeys.has(question.key)) {
      groups.add(groupKey);
    }
  });
  state.seenMcqGroups = groups;
}

function isQuestionSeen(question) {
  if (!question?.key) return false;
  if (state.seenKeys.has(question.key)) return true;
  if (question.type === "mcq" && question.duplicateGroup) {
    return state.seenMcqGroups.has(question.duplicateGroup);
  }
  return false;
}

function markQuestionsSeen(questions, { updateSummary: refreshSummary = false } = {}) {
  if (!Array.isArray(questions) || !questions.length) {
    if (refreshSummary) updateSummary();
    return;
  }
  let changed = false;
  questions.forEach((question) => {
    if (!question?.key) return;
    if (!state.seenKeys.has(question.key)) {
      state.seenKeys.add(question.key);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
    refreshSeenGroups();
    scheduleUserStateSync();
  }
  if (refreshSummary) updateSummary();
}

function resolvePool(options = {}) {
  const { forceMistakes = false, ignoreFocusMistakes = false } = options;
  const capabilities = getStudioCapabilitiesForCourse(getActiveCourse());
  const allowedTypes = [];
  if (state.settings.includeMcq && capabilities.allowMcq) allowedTypes.push("mcq");
  if (state.settings.includeShort && capabilities.allowShort) allowedTypes.push("short");

  const basePool = state.allQuestions.filter(
    (question) =>
      allowedTypes.includes(question.type) &&
      state.filters.courses.has(normalizeCourse(question.course || DEFAULT_COURSE)) &&
      state.filters.years.has(question.yearLabel) &&
      state.filters.categories.has(question.category) &&
      (!question.priority || state.filters.priorities.has(question.priority)) &&
      (!question.section || state.filters.sections.has(question.section))
  );

  let pool = basePool;
  let focusMistakesActive = false;
  let repeatFiltered = 0;
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
    const before = pool.length;
    pool = pool.filter((question) => !isQuestionSeen(question));
    repeatFiltered = Math.max(0, before - pool.length);
  }

  return { pool, basePool, focusMistakesActive, repeatFiltered };
}

function applyFilterConstraints({ focusMistakesActive } = {}) {
  const preferUnseenDisabled = state.settings.avoidRepeats;
  const preferUnseenPaused = !state.settings.avoidRepeats && focusMistakesActive;
  if (elements.togglePreferUnseen) {
    elements.togglePreferUnseen.disabled = preferUnseenDisabled;
    if (preferUnseenDisabled) {
      elements.togglePreferUnseen.title =
        "Prioritér nye spørgsmål kan ikke bruges sammen med Undgå gentagelser.";
    } else if (preferUnseenPaused) {
      elements.togglePreferUnseen.title =
        "Prioritér nye spørgsmål har ingen effekt, når fokus på fejl er aktivt.";
    } else {
      elements.togglePreferUnseen.removeAttribute("title");
    }
  }
  if (elements.toggleAvoidRepeats) {
    if (focusMistakesActive) {
      elements.toggleAvoidRepeats.title =
        "Undgå gentagelser er sat på pause, mens fokus på fejl er aktivt.";
    } else {
      elements.toggleAvoidRepeats.removeAttribute("title");
    }
  }
}

function describeSelection(selected, all, label) {
  if (!selected.length) return "Ingen valgt";
  if (selected.length === all.length) return `Alle ${label}`;
  if (selected.length <= 2) return selected.join(", ");
  return `${selected.length} ${label}`;
}

function updateSummary() {
  const { pool, basePool, focusMistakesActive, repeatFiltered } = resolvePool();
  const activeCourse = getActiveCourse();
  const isDisease = isDiseaseCourse(activeCourse);
  const yearLabelMap = isDisease ? PRIORITY_FILTER_LABELS : null;
  const selectedCourses = sortCourseIds([...state.filters.courses]);
  const selectedYears = sortYearLabels([...state.filters.years]);
  const selectedCategories = sortCategoryLabels([...state.filters.categories]);
  const selectedYearLabels = selectedYears.map((value) => resolveChipLabel(value, yearLabelMap));
  const availableYearLabels = state.available.years.map((value) =>
    resolveChipLabel(value, yearLabelMap)
  );
  const mcqPoolCount = pool.filter((q) => q.type === "mcq").length;
  const shortPoolQuestions = pool.filter((q) => q.type === "short");
  const shortPoolCount = shortPoolQuestions.length;
  const shortPoolParts = shortPoolQuestions.reduce(
    (sum, question) => sum + getShortParts(question).length,
    0
  );
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
  const preferUnseenActive =
    state.settings.preferUnseen && !state.settings.avoidRepeats && !focusMistakesActive;

  elements.poolCount.textContent = pool.length;
  if (isDisease) {
    elements.poolCountChip.textContent =
      `${pool.length} i puljen · ${poolShort} sygdomme · ${shortPoolParts} sektioner`;
  } else {
    elements.poolCountChip.textContent =
      `${pool.length} i puljen · ${poolMcq} MCQ · ${poolShort} kortsvar`;
  }
  const isInfinite = state.settings.infiniteMode;
  let roundLabel = String(roundSize);
  if (isDisease && state.settings.includeShort && !state.settings.includeMcq) {
    roundLabel = roundSize > 0 ? `${roundSize} sygdomme` : "0 sygdomme";
  }
  if (state.settings.includeMcq && state.settings.includeShort && roundSize > 0) {
    roundLabel = `${roundSize} (${mcqTarget} MCQ / ${shortTarget} kortsvar)`;
    if (isInfinite) {
      roundLabel = `Uendelig · batch ${roundLabel}`;
    }
  } else if (isInfinite) {
    const unit = isDisease ? " sygdomme" : "";
    roundLabel = roundSize > 0 ? `Uendelig · batch ${roundSize}${unit}` : "Uendelig";
  }
  elements.roundCount.textContent = roundLabel;

  const mixParts = [];
  if (state.settings.balancedMix) mixParts.push("Balanceret");
  if (state.settings.adaptiveMix) mixParts.push("Adaptiv");
  if (state.settings.shuffleQuestions) mixParts.push("Shuffle");
  if (preferUnseenActive) mixParts.push("Nye først");
  if (state.settings.infiniteMode) mixParts.push("Uendelig");
  if (state.settings.includeMcq && state.settings.includeShort) {
    mixParts.push(`Ratio ${formatRatioLabel(state.settings)}`);
  }
  if (!mixParts.length) mixParts.push("Fast rækkefølge");
  elements.mixSummary.textContent = mixParts.join(" · ");

  if (elements.courseSummary) {
    const selectedCourseLabels = selectedCourses.map((course) => formatCourseLabel(course));
    const availableCourseLabels = state.available.courses.map((course) => formatCourseLabel(course));
    elements.courseSummary.textContent = describeSelection(
      selectedCourseLabels,
      availableCourseLabels,
      "kurser"
    );
  }
  elements.yearSummary.textContent = describeSelection(
    selectedYearLabels,
    availableYearLabels,
    isDisease ? "prioriteter" : "sæt"
  );
  elements.categorySummary.textContent = describeSelection(
    selectedCategories,
    state.available.categories,
    isDisease ? "sygdomsgrupper" : "emner"
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
  if (state.settings.avoidRepeats) {
    repeatParts.push(focusMistakesActive ? "Udelukker sete (pauset)" : "Udelukker sete");
  }
  if (preferUnseenActive) repeatParts.push("Nye først");
  elements.repeatSummary.textContent = repeatParts.length ? repeatParts.join(" · ") : "Alt";

  if (!state.settings.includeMcq && !state.settings.includeShort) {
    hint = "Vælg mindst én opgavetype (MCQ eller kortsvar).";
    canStart = false;
  } else if (!selectedCourses.length || !selectedYears.length || !selectedCategories.length) {
    hint = isDisease
      ? "Vælg mindst én prioritet og én sygdomsgruppe for at starte."
      : "Vælg mindst ét emne og ét sæt for at starte.";
    canStart = false;
  } else if (state.settings.focusMistakes && !focusMistakesActive) {
    hint = hasMistakes
      ? "Fokus på fejl er slået til, men ingen fejl matcher dine filtre – runden bruger alle spørgsmål."
      : "Fokus på fejl er slået til, men der er ingen fejl endnu – runden bruger alle spørgsmål.";
  } else if (!pool.length) {
    if (state.settings.avoidRepeats && basePool.length) {
      hint = "Alle spørgsmål er allerede set – slå 'Undgå gentagelser' fra for at fortsætte.";
    } else {
      hint = "Ingen spørgsmål matcher dine filtre.";
    }
    canStart = false;
  } else if (pool.length < roundSize) {
    const baseHint = state.settings.infiniteMode
      ? `Puljen har kun ${pool.length} spørgsmål – uendelig mode gentager efter en runde.`
      : `Kun ${pool.length} spørgsmål matcher – runden forkortes.`;
    if (state.settings.avoidRepeats && repeatFiltered > 0) {
      hint = `Udelukker sete gør runden kortere. ${baseHint}`;
    } else {
      hint = baseHint;
    }
  }

  if (state.sessionActive && state.sessionPaused) {
    hint = "Du har en pauset runde. Fortsæt eller annuller for at starte en ny.";
    canStart = false;
  }

  const access = resolveRoundAccess();
  if (!access.allowed && !(state.sessionActive && state.sessionPaused)) {
    hint = getRoundAccessMessage(access.reason);
    canStart = false;
  }

  elements.selectionHint.textContent = hint;
  elements.startButtons.forEach((btn) => {
    btn.disabled = !canStart;
  });

  applyFilterConstraints({ focusMistakesActive });
  updateQuestionCountCopy({ mcqTarget, shortTarget });
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
  const isDisease = isDiseaseCourse(getActiveCourse());
  const label = isDisease
    ? `${totalLabel} · ${shortCount} sygdomme · ${yearCount} prioriteter · ${categoryCount} sygdomsgrupper`
    : `${totalLabel} · ${mcqCount} MCQ · ${shortCount} kortsvar · ${yearCount} sæt · ${categoryCount} emner`;
  elements.sessionPill.textContent = label;
}

function applySessionDisplaySettings() {
  document.body.classList.toggle("focus-mode", state.sessionSettings.focusMode);
  document.body.classList.toggle("meta-hidden", !state.sessionSettings.showMeta);
  elements.toggleFocus.textContent = state.sessionSettings.focusMode ? "Fokus: Til" : "Fokus";
  elements.toggleMeta.textContent = state.sessionSettings.showMeta ? "Skjul detaljer" : "Vis detaljer";
  setShortcutActive("focus", state.sessionSettings.focusMode);
  if (elements.endRoundBtn) {
    elements.endRoundBtn.classList.toggle("hidden", !state.sessionActive);
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
  batch = filterQuestionsForPolicy(batch, getActiveScoringPolicy());
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
  state.activeQuestions = getResultsQuestions(state.results);
  updateSessionScoreMeta(state.activeQuestions);
  showResults();
}

function startGame(options = {}) {
  if (!requireAuthGuard("Log ind for at starte en runde.")) return;
  const access = resolveRoundAccess();
  if (!access.allowed) {
    handleRoundAccessDenied(access.reason);
    return;
  }
  const {
    forceMistakes = false,
    ignoreFocusMistakes = false,
    recordHistory = true,
  } = options;
  state.shouldRecordHistory = Boolean(recordHistory);
  const { pool, focusMistakesActive } = resolvePool({ forceMistakes, ignoreFocusMistakes });
  if (!pool.length) return;

  hideRules();
  state.sessionActive = true;
  state.sessionPaused = false;
  state.sessionPausedAt = null;
  state.sessionCourse = getActiveCourse();
  state.sessionNeedsRender = false;
  state.activeSessionDirty = true;
  resetCancelRoundConfirm();
  updatePausedSessionUI();
  state.sessionSettings = { ...state.settings, focusMistakes: focusMistakesActive };
  state.sessionProfile = refreshCourseProfile(getActiveCourse());
  if (Number.isFinite(state.sessionProfile?.hintLevel)) {
    state.sessionSettings.hintLevel = state.sessionProfile.hintLevel;
  }
  state.activeQuestions = buildQuestionSet(pool);
  state.activeQuestions = filterQuestionsForPolicy(state.activeQuestions, getActiveScoringPolicy());
  assignShortPoints(state.activeQuestions);
  updateSessionScoreMeta(state.activeQuestions);
  state.currentIndex = 0;
  state.score = 0;
  state.scoreBreakdown = { mcq: 0, short: 0 };
  state.results = [];
  state.shortAnswerDrafts = new Map();
  state.shortAnswerAI = new Map();
  state.shortGroupCompletion = new Set();
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
  void syncActiveSessionSnapshot();
  flushUserStateSync();
}

function handlePlayAgainClick() {
  if (state.lastMistakeKeys.size) {
    startGame({ forceMistakes: true, recordHistory: false });
    return;
  }
  startGame();
}

function handleRestartRoundClick() {
  startGame({ ignoreFocusMistakes: true });
}

function showRules() {
  const focusTarget = elements.closeModal || elements.modalClose;
  setModalOpen(elements.modal, { initialFocus: focusTarget });
}

function hideRules() {
  setModalClosed(elements.modal);
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
  setModalOpen(elements.figureModal, { initialFocus: elements.figureModalClose });
}

function closeFigureModal() {
  if (!elements.figureModal || elements.figureModal.classList.contains("hidden")) return;
  setModalClosed(elements.figureModal);
  if (elements.figureModalImg) {
    elements.figureModalImg.src = "";
    elements.figureModalImg.alt = "";
  }
  if (elements.figureModalCaption) {
    elements.figureModalCaption.textContent = "";
  }
}

function attachFigureModalHandlers(img, { src, alt, caption, title }) {
  if (!img) return;
  const label = title ? `Åbn ${title.toLowerCase()}` : "Åbn figur";
  img.tabIndex = 0;
  img.setAttribute("role", "button");
  img.setAttribute("aria-label", label);
  const open = () => {
    openFigureModal({ src, alt, caption, title });
  };
  img.addEventListener("click", open);
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
}

function resetCancelRoundConfirm() {
  state.cancelRoundConfirmArmed = false;
  if (state.cancelRoundConfirmTimer) {
    clearTimeout(state.cancelRoundConfirmTimer);
    state.cancelRoundConfirmTimer = null;
  }
  if (elements.cancelRoundBtn) {
    elements.cancelRoundBtn.textContent = "Annuller runde";
  }
}

function updatePausedSessionUI() {
  updateCourseSwitchLock();
  if (!elements.pausedSessionPanel) return;
  const isPaused = state.sessionActive && state.sessionPaused;
  elements.pausedSessionPanel.classList.toggle("hidden", !isPaused);
  if (!isPaused) {
    resetCancelRoundConfirm();
    return;
  }
  const total = state.activeQuestions.length || 0;
  const current = total ? Math.min(state.currentIndex + 1, total) : 0;
  const answeredCount = getResultsQuestions(state.results).length;
  const summary = calculateScoreSummary();
  const isInfinite = state.sessionSettings.infiniteMode;
  const progressLabel = isInfinite ? `${current} / ∞` : `${current} / ${total}`;
  const answeredLabel = isInfinite ? `${answeredCount} besvaret` : `${answeredCount} / ${total}`;

  if (elements.pausedProgress) {
    elements.pausedProgress.textContent = total ? progressLabel : "—";
  }
  if (elements.pausedAnswered) {
    elements.pausedAnswered.textContent = total ? answeredLabel : "—";
  }
  if (elements.pausedScore) {
    elements.pausedScore.textContent = state.results.length
      ? `${summary.overallPercent.toFixed(1)}% · ${summary.grade}`
      : "—";
  }
  if (elements.finishRoundBtn) {
    const canFinish = state.results.length > 0;
    elements.finishRoundBtn.disabled = !canFinish;
    if (!canFinish) {
      elements.finishRoundBtn.title = "Besvar mindst ét spørgsmål først.";
    } else {
      elements.finishRoundBtn.removeAttribute("title");
    }
  }
  if (elements.pausedRoundNote) {
    elements.pausedRoundNote.textContent = state.results.length
      ? "Ændringer i menuen påvirker næste runde."
      : "Besvar mindst ét spørgsmål for at afslutte med resultater.";
  }
}

function pauseSession() {
  if (!state.sessionActive) {
    showScreen("menu");
    return;
  }
  clearAutoAdvance();
  stopTts();
  clearTtsPrefetch();
  clearTtsPartPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
  state.sessionPaused = true;
  state.sessionPausedAt = Date.now();
  state.activeSessionDirty = true;
  updatePausedSessionUI();
  updateSummary();
  showScreen("menu");
  void syncActiveSessionSnapshot();
  flushUserStateSync();
}

function resumeSession() {
  if (!state.sessionActive || !state.sessionPaused) return;
  const completed = getCompletedQuestionKeySet(state.results);
  const hasIncomplete = state.activeQuestions.some(
    (question) => question?.key && !completed.has(question.key)
  );
  if (!hasIncomplete && state.results.length) {
    if (!state.sessionSettings.infiniteMode) {
      state.sessionPaused = false;
      state.sessionPausedAt = null;
      state.activeSessionDirty = true;
      finishSession();
      scheduleUserStateSync();
      return;
    }
    if (state.infiniteState) {
      const previousLength = state.activeQuestions.length;
      const extended = extendInfiniteQuestionSet();
      if (extended) {
        state.currentIndex = previousLength;
        state.sessionNeedsRender = true;
      } else {
        state.sessionPaused = false;
        state.sessionPausedAt = null;
        state.activeSessionDirty = true;
        finishSession();
        scheduleUserStateSync();
        return;
      }
    } else {
      state.sessionPaused = false;
      state.sessionPausedAt = null;
      state.activeSessionDirty = true;
      finishSession();
      scheduleUserStateSync();
      return;
    }
  }
  if (state.sessionPausedAt && state.startTime) {
    state.startTime += Date.now() - state.sessionPausedAt;
  }
  state.sessionPausedAt = null;
  state.sessionPaused = false;
  resetCancelRoundConfirm();
  state.activeSessionDirty = true;
  updatePausedSessionUI();
  showScreen("quiz");
  applySessionDisplaySettings();
  updateTopBar();
  if (state.sessionNeedsRender) {
    state.sessionNeedsRender = false;
    renderQuestion();
  } else if (!state.locked) {
    state.questionStartedAt = Date.now();
  }
  void syncActiveSessionSnapshot();
  flushUserStateSync();
}

function cancelSession() {
  if (!state.sessionActive) return;
  clearAutoAdvance();
  stopTts();
  clearTtsPrefetch();
  clearTtsPartPrefetch();
  clearFigureCaptionQueue();
  state.sessionActive = false;
  state.sessionPaused = false;
  state.sessionPausedAt = null;
  state.sessionCourse = null;
  state.sessionNeedsRender = false;
  state.activeSessionDirty = true;
  state.shouldRecordHistory = false;
  state.activeQuestions = [];
  state.currentIndex = 0;
  state.score = 0;
  state.scoreBreakdown = { mcq: 0, short: 0 };
  state.results = [];
  state.shortAnswerDrafts = new Map();
  state.shortAnswerAI = new Map();
  state.shortGroupCompletion = new Set();
  state.shortAnswerPending = false;
  state.reviewHintQueue = [];
  state.reviewHintProcessing = false;
  state.optionOrder = new Map();
  state.sketchUploads = new Map();
  state.sketchAnalysis = new Map();
  state.infiniteState = null;
  state.locked = false;
  state.startTime = null;
  state.questionStartedAt = null;
  state.activeShortPartKey = null;
  state.shortPartSelectionActive = false;
  resetCancelRoundConfirm();
  updatePausedSessionUI();
  updateSummary();
  showScreen("menu");
  void syncActiveSessionSnapshot(null);
  flushUserStateSync();
}

function goToMenu() {
  clearAutoAdvance();
  stopTts();
  clearTtsPrefetch();
  clearTtsPartPrefetch();
  clearFigureCaptionQueue();
  state.questionStartedAt = null;
  state.sessionActive = false;
  state.sessionPaused = false;
  state.sessionPausedAt = null;
  state.sessionCourse = null;
  state.sessionNeedsRender = false;
  state.activeSessionDirty = true;
  resetCancelRoundConfirm();
  markQuestionsSeen(getResultsQuestions(state.results), { updateSummary: true });
  updatePausedSessionUI();
  showScreen("menu");
  void syncActiveSessionSnapshot(null);
  flushUserStateSync();
}

function resolveChipLabel(value, labelMap) {
  if (!labelMap) return String(value);
  if (labelMap instanceof Map) {
    return labelMap.get(value) || String(value);
  }
  return labelMap[value] || String(value);
}

function renderChips(container, values, selectedSet, counts, type, labelMap = null) {
  if (!container) return;
  container.innerHTML = "";
  values.forEach((value) => {
    const labelText = resolveChipLabel(value, labelMap);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.dataset.type = type;
    btn.dataset.value = String(value);
    btn.dataset.label = labelText.toLowerCase();
    const label = document.createElement("span");
    label.textContent = labelText;
    const count = document.createElement("span");
    count.className = "chip-count";
    count.textContent = String(counts.get(value) || 0);
    btn.appendChild(label);
    btn.appendChild(count);
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

function getCourseScopeQuestions() {
  if (!state.filters.courses || !state.filters.courses.size) {
    return state.allQuestions;
  }
  const allowed = state.filters.courses;
  return state.allQuestions.filter((question) =>
    allowed.has(normalizeCourse(question.course || DEFAULT_COURSE))
  );
}

function sortCourseIds(courses) {
  const order = new Map(COURSE_ORDER.map((course, index) => [course, index]));
  return [...courses].sort((a, b) => {
    const aIndex = order.get(a);
    const bIndex = order.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 99) - (bIndex ?? 99);
    }
    return String(a).localeCompare(String(b), "da");
  });
}

function sortYearLabels(labels) {
  const entries = [...labels];
  const isPrioritySet = entries.length
    && entries.every((label) => PRIORITY_LABELS[label] || PRIORITY_FILTER_LABELS[label]);
  if (isPrioritySet) {
    return sortPriorityValues(entries);
  }
  return entries.sort((a, b) => {
    const aParsed = parseYearLabel(a);
    const bParsed = parseYearLabel(b);
    const aYear = Number.isFinite(aParsed.year) ? aParsed.year : 9999;
    const bYear = Number.isFinite(bParsed.year) ? bParsed.year : 9999;
    if (aYear !== bYear) return aYear - bYear;
    return (SESSION_ORDER[aParsed.session] ?? 99) - (SESSION_ORDER[bParsed.session] ?? 99);
  });
}

function sortCategoryLabels(categories) {
  return [...categories].sort((a, b) => {
    const aIndex = CATEGORY_SORT_ORDER.get(a);
    const bIndex = CATEGORY_SORT_ORDER.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 999) - (bIndex ?? 999);
    }
    return a.localeCompare(b, "da");
  });
}

function sortSectionLabels(sections) {
  const order = new Map(getDiseaseDomainOrder().map((label, index) => [label, index]));
  return [...sections].sort((a, b) => {
    const aIndex = order.get(a);
    const bIndex = order.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 999) - (bIndex ?? 999);
    }
    return a.localeCompare(b, "da");
  });
}

function sortPriorityValues(priorities) {
  const order = new Map(PRIORITY_ORDER.map((value, index) => [value, index]));
  return [...priorities].sort((a, b) => {
    const aIndex = order.get(a);
    const bIndex = order.get(b);
    if (aIndex !== undefined || bIndex !== undefined) {
      return (aIndex ?? 999) - (bIndex ?? 999);
    }
    return String(a).localeCompare(String(b), "da");
  });
}

function reconcileFilter(type, available, { preserveEmpty = false } = {}) {
  const current = state.filters[type] || new Set();
  const next = new Set([...current].filter((value) => available.includes(value)));
  if (!next.size && available.length && !preserveEmpty) {
    state.filters[type] = new Set(available);
    return;
  }
  state.filters[type] = next;
}

function updateDiseaseFilterVisibility() {
  if (!elements.diseaseFilterDrawer) return;
  const hasDisease = state.filters.courses.has("sygdomslaere");
  const hasFilters = state.available.sections.length || state.available.priorities.length;
  const show = hasDisease && hasFilters;
  elements.diseaseFilterDrawer.classList.toggle("hidden", !show);
  if (!show) {
    elements.diseaseFilterDrawer.removeAttribute("open");
  }
}

function refreshAvailableFilters() {
  const allCounts = buildCounts(state.allQuestions);
  const scopedCounts = buildCounts(getCourseScopeQuestions());

  state.available.courses = sortCourseIds([...allCounts.courses.keys()]);
  state.counts.courses = allCounts.courses;

  state.available.years = sortYearLabels([...scopedCounts.years.keys()]);
  state.available.categories = sortCategoryLabels([...scopedCounts.categories.keys()]);
  state.available.sections = sortSectionLabels([...scopedCounts.sections.keys()]);
  state.available.priorities = sortPriorityValues([...scopedCounts.priorities.keys()]);

  state.counts.years = scopedCounts.years;
  state.counts.categories = scopedCounts.categories;
  state.counts.sections = scopedCounts.sections;
  state.counts.priorities = scopedCounts.priorities;
  state.counts.types = scopedCounts.types;

  reconcileFilter("years", state.available.years);
  reconcileFilter("categories", state.available.categories);
  reconcileFilter("sections", state.available.sections);
  reconcileFilter("priorities", state.available.priorities);

  if (elements.categorySearch) {
    elements.categorySearch.value = "";
    state.search.category = "";
  }

  updateDiseaseFilterVisibility();
  updateChips();
  updateSummary();
}

function updateChips() {
  renderChips(
    elements.courseChips,
    state.available.courses,
    state.filters.courses,
    state.counts.courses,
    "courses",
    COURSE_LABELS
  );
  const yearLabelMap = isDiseaseCourse(getActiveCourse()) ? PRIORITY_FILTER_LABELS : null;
  renderChips(
    elements.yearChips,
    state.available.years,
    state.filters.years,
    state.counts.years,
    "years",
    yearLabelMap
  );
  const filteredCategories = getFilteredCategories();
  renderChips(
    elements.categoryChips,
    filteredCategories,
    state.filters.categories,
    state.counts.categories,
    "categories"
  );
  renderChips(
    elements.priorityChips,
    state.available.priorities,
    state.filters.priorities,
    state.counts.priorities,
    "priorities",
    PRIORITY_LABELS
  );
  renderChips(
    elements.sectionChips,
    state.available.sections,
    state.filters.sections,
    state.counts.sections,
    "sections"
  );
}

function toggleSelection(type, value) {
  const set = state.filters[type];
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  if (type === "courses") {
    refreshAvailableFilters();
    return;
  }
  updateChips();
  updateSummary();
}

function setSelection(type, values) {
  state.filters[type] = new Set(values);
  if (type === "courses") {
    refreshAvailableFilters();
    return;
  }
  updateChips();
  updateSummary();
}

function updateQuestionCount(value) {
  const min = Number(elements.questionCountRange.min) || 5;
  const max = Number(elements.questionCountRange.max) || 40;
  const nextValue = Math.max(min, Math.min(max, Number(value) || min));
  state.settings.questionCount = nextValue;
  elements.questionCountRange.value = nextValue;
  saveSettings();
  if (!state.isApplyingPreset) {
    clearPresetSelection();
  }
  updateSummary();
}

function updateQuestionCountCopy({ mcqTarget, shortTarget } = {}) {
  if (!elements.questionCountLabel && !elements.questionCountInfo && !elements.questionCountHint) return;
  const includeMcq = state.settings.includeMcq;
  const includeShort = state.settings.includeShort;
  const isDisease = isDiseaseCourse(getActiveCourse());
  const isInfinite = state.settings.infiniteMode;
  const batchNote = isInfinite ? " I uendelig træning er tallet størrelsen pr. batch." : "";

  let label = "Antal spørgsmål";
  let tooltip =
    "Vælg hvor mange spørgsmål runden skal have. Hvis puljen er mindre, forkortes runden automatisk.";
  let hint = "Vælg mindst én opgavetype.";

  if (includeMcq && includeShort) {
    const ratioLabel = formatRatioLabel(state.settings);
    const hasMcqTarget = Number.isFinite(mcqTarget);
    const hasShortTarget = Number.isFinite(shortTarget);
    const mcqCount = hasMcqTarget ? mcqTarget : state.settings.questionCount;
    const shortCount = hasShortTarget
      ? shortTarget
      : estimateShortTargetFromRatio(mcqCount, state.settings);
    const splitLabel = shortCount
      ? `${mcqCount} MCQ + ${shortCount} kortsvar`
      : `${mcqCount} MCQ`;
    label = "Antal flervalg";
    tooltip =
      `Antal flervalg styrer længden; kortsvar følger forholdet (${ratioLabel}). ` +
      `Aktuelt: ${splitLabel}. Hvis puljen er mindre, forkortes runden automatisk.`;
    hint = `Antal flervalg styrer længden; kortsvar følger forholdet (${ratioLabel}). ` +
      `Aktuelt: ${splitLabel}.${batchNote}`;
  } else if (includeMcq) {
    const mcqCount = state.settings.questionCount;
    label = "Antal flervalg";
    tooltip =
      "Vælg hvor mange flervalgsspørgsmål runden skal have. Hvis puljen er mindre, forkortes runden automatisk.";
    hint = `Tallet angiver hvor mange flervalg der bruges i runden. Aktuelt: ${mcqCount} MCQ.${batchNote}`;
  } else if (includeShort) {
    const shortCount = state.settings.questionCount;
    if (isDisease) {
      label = "Antal sygdomme";
      tooltip =
        "Vælg hvor mange sygdomme runden skal have. Hvis puljen er mindre, forkortes runden automatisk.";
      hint = `Tallet angiver hvor mange sygdomme der bruges i runden. Aktuelt: ${shortCount} sygdomme.${batchNote}`;
    } else {
      label = "Antal kortsvar";
      tooltip =
        "Vælg hvor mange kortsvar runden skal have. Hvis puljen er mindre, forkortes runden automatisk.";
      hint = `Tallet angiver hvor mange kortsvar der bruges i runden. Aktuelt: ${shortCount} kortsvar.${batchNote}`;
    }
  }

  if (elements.questionCountLabel) {
    elements.questionCountLabel.textContent = label;
  }
  if (elements.questionCountInfo) {
    elements.questionCountInfo.dataset.tooltip = tooltip;
    elements.questionCountInfo.setAttribute("aria-label", `Info om ${label.toLowerCase()}`);
  }
  if (elements.questionCountHint) {
    elements.questionCountHint.textContent = hint;
  }
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
  if (elements.ratioControlRow) {
    elements.ratioControlRow.classList.toggle("hidden", !enabled);
  }
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
  if (elements.autoAdvanceRow) {
    elements.autoAdvanceRow.classList.toggle("hidden", !state.settings.autoAdvance);
  }
}

async function checkAiAvailability() {
  try {
    if (!state.backendAvailable) {
      const offlineMessage =
        state.configError || "Serveren svarer ikke lige nu.";
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
      updateDiagnosticsUI();
      return;
    }
    if (!state.session?.user) {
      const message = state.demoMode
        ? "Demo – log ind for hjælp."
        : "Log ind for at bruge hjælpen.";
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
      updateDiagnosticsUI();
      return;
    }
    if (needsConsent()) {
      const message = "Accepter vilkår for at fortsætte.";
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
      updateDiagnosticsUI();
      return;
    }
    if (state.useOwnKey && !state.userOpenAiKey) {
      setAiStatus({
        available: false,
        model: null,
        message: "Indtast din nøgle for hjælp.",
      });
      setTtsStatus({
        available: false,
        model: null,
        message: "Indtast din nøgle for oplæsning.",
      });
      updateDiagnosticsUI();
      return;
    }

    const res = await apiFetch("/api/health", { ai: true });
    if (!res.ok) {
      let aiMessage = "Hjælp er ikke klar lige nu.";
      let ttsMessage = "Oplæsning er ikke klar lige nu.";
      if (res.status === 401) {
        aiMessage = "Log ind for at bruge hjælpen.";
        ttsMessage = "Log ind for oplæsning.";
      } else if (res.status === 402) {
        aiMessage = "Kræver adgang eller egen nøgle.";
        ttsMessage = "Kræver adgang eller egen nøgle.";
      } else if (res.status === 503) {
        aiMessage = "Hjælpen er ikke sat op endnu.";
        ttsMessage = "Oplæsning er ikke sat op endnu.";
      }
      setAiStatus({ available: false, model: null, message: aiMessage });
      setTtsStatus({ available: false, model: null, message: ttsMessage });
      updateDiagnosticsUI();
      return;
    }
    const data = await res.json();
    setAiStatus({ available: true, model: data.model || null, message: "" });
    setTtsStatus({ available: true, model: data.tts_model || null, message: "" });
    updateDiagnosticsUI();
  } catch (error) {
    setAiStatus({
      available: false,
      model: null,
      message: "Hjælp er ikke klar lige nu.",
    });
    setTtsStatus({
      available: false,
      model: null,
      message: "Oplæsning er ikke klar lige nu.",
    });
    updateDiagnosticsUI();
  }
}

async function refreshDiagnostics({ notify = false } = {}) {
  await hydrateAuthProviders();
  await checkAiAvailability();
  updateDiagnosticsUI();
  if (notify) {
    setAccountStatus("Status er opdateret.");
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
    const current = state.activeQuestions[state.currentIndex];
    if (current && current.type === "short" && isShortGroup(current)) {
      prefetchShortGroupTts(current, { skipKey: state.activeShortPartKey });
    }
  }
}

function toggleTtsEnabled() {
  setTtsEnabled(!state.settings.ttsEnabled);
}

function toggleFocusMode() {
  const next = !state.sessionSettings.focusMode;
  state.sessionSettings.focusMode = next;
  state.settings.focusMode = next;
  saveSettings();
  applySessionDisplaySettings();
  setShortcutTempStatus("focus", next ? "Fokus til" : "Fokus fra");
}

async function triggerShortAutoGrade(options = {}) {
  const { scope = "active" } = options;
  const question = state.activeQuestions[state.currentIndex];
  if (!question || question.type !== "short") {
    setShortcutTempStatus("grade", "Kun kortsvar", 2000);
    return;
  }
  if (scope === "group" && isShortGroup(question)) {
    await gradeShortGroupAnswers(question, { auto: true });
    return;
  }
  const part = getActiveShortPart(question);
  if (!part) return;
  setShortRetryVisible(false, part);
  setShortReviewOpen(true);
  updateShortReviewStatus(part);
  if (state.shortAnswerPending) {
    setShortcutTempStatus("grade", "Vurderer …", 1500);
    return;
  }
  const upload = state.sketchUploads.get(part.key);
  const analysis = state.sketchAnalysis.get(part.key);
  if (upload && !analysis) {
    await analyzeSketch(part);
  }
  await gradeShortAnswer({ auto: true });
}

function performShortcutAction(action) {
  const question = state.activeQuestions[state.currentIndex];
  let acted = false;
  if (action === "next") {
    if (!elements.nextBtn?.disabled) {
      handleNextClick();
      acted = true;
    } else {
      if (question?.type === "short") {
        const status = state.shortAnswerPending ? "Vurderer …" : "Vurdér først";
        setShortcutTempStatus("next", status, 1500);
      } else {
        setShortcutTempStatus("next", "Mangler svar", 1500);
      }
    }
  } else if (action === "skip") {
    if (!elements.skipBtn?.disabled) {
      skipQuestion();
      acted = true;
    } else {
      setShortcutTempStatus("skip", "Ikke nu", 1500);
    }
  } else if (action === "grade") {
    triggerShortAutoGrade({ scope: "group" });
    acted = true;
  } else if (action === "mic") {
    toggleMicRecording();
    acted = true;
  } else if (action === "figure") {
    const target =
      question?.type === "short" && isShortGroup(question) ? getActiveShortPart(question) : question;
    if (target?.images?.length) {
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
  if (isAnyModalOpen()) return;
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && key === "c") return;
  const focusModeActive = Boolean(state.sessionSettings?.focusMode);
  if (key === "escape" && focusModeActive) {
    event.preventDefault();
    toggleFocusMode();
    return;
  }
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
  if (elements.brandBackLinks.length) {
    elements.brandBackLinks.forEach((link) => {
      link.addEventListener("click", handleBrandBackClick);
    });
  }
  if (elements.landingStartBtn) {
    elements.landingStartBtn.addEventListener("click", () => {
      if (!requireAuthGuard("Log ind for at fortsætte.")) return;
      showScreen("menu");
    });
  }
  if (elements.landingQuickBtn) {
    elements.landingQuickBtn.addEventListener("click", startGame);
  }
  if (elements.demoStartBtn) {
    elements.demoStartBtn.addEventListener("click", startDemoQuiz);
  }
  if (elements.demoShortCheckBtn) {
    elements.demoShortCheckBtn.addEventListener("click", handleDemoShortCheck);
  }
  if (elements.demoNextBtn) {
    elements.demoNextBtn.addEventListener("click", handleDemoNext);
  }
  if (elements.demoExitBtn) {
    elements.demoExitBtn.addEventListener("click", closeDemoQuiz);
  }
  if (elements.demoCloseBtn) {
    elements.demoCloseBtn.addEventListener("click", closeDemoQuiz);
  }
  if (elements.loadingHomeBtn) {
    elements.loadingHomeBtn.addEventListener("click", () => {
      setLoadingState(false);
    });
  }
  if (elements.loadingRetryBtn) {
    elements.loadingRetryBtn.addEventListener("click", () => {
      window.location.reload();
    });
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
  if (elements.authLoginBtn) {
    elements.authLoginBtn.addEventListener("click", signInWithPassword);
  }
  if (elements.authSignupBtn) {
    elements.authSignupBtn.addEventListener("click", signUpWithPassword);
  }
  if (elements.authEmailInput) {
    elements.authEmailInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (elements.authPasswordInput) {
          if (elements.authPasswordInput.value) {
            signInWithPassword();
          } else {
            elements.authPasswordInput.focus();
          }
        } else {
          signInWithEmail();
        }
      }
    });
  }
  if (elements.authPasswordInput) {
    elements.authPasswordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        signInWithPassword();
      }
    });
  }
  if (elements.authDemoBtn) {
    elements.authDemoBtn.addEventListener("click", enableDemoMode);
  }
  if (elements.authResendBtn) {
    elements.authResendBtn.addEventListener("click", resendConfirmationEmail);
  }
  if (elements.accountBtn) {
    elements.accountBtn.addEventListener("click", () => {
      if (!requireAuthGuard()) return;
      showScreen("account");
    });
  }
  if (elements.studioHumanBtn) {
    elements.studioHumanBtn.addEventListener("click", () => {
      void navigateToStudio(DEFAULT_COURSE);
    });
  }
  if (elements.studioSygdomBtn) {
    elements.studioSygdomBtn.addEventListener("click", () => {
      void navigateToStudio("sygdomslaere");
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
  if (elements.adminModeToggle) {
    elements.adminModeToggle.addEventListener("change", (event) => {
      setAdminMode(event.target.checked);
    });
  }
  if (elements.adminRefreshBtn) {
    elements.adminRefreshBtn.addEventListener("click", () => {
      void refreshAdminMetrics();
    });
  }
  if (elements.adminImportBtn) {
    elements.adminImportBtn.addEventListener("click", handleAdminImport);
  }
  if (elements.adminImportContent) {
    elements.adminImportContent.addEventListener("input", () => setAdminImportStatus(""));
  }
  if (elements.upgradeBtn) {
    elements.upgradeBtn.addEventListener("click", handleCheckout);
  }
  if (elements.portalBtn) {
    elements.portalBtn.addEventListener("click", handleBilling);
  }
  if (elements.billingBackBtn) {
    elements.billingBackBtn.addEventListener("click", () => showScreen("account"));
  }
  if (elements.billingUpdateMethodBtn) {
    elements.billingUpdateMethodBtn.addEventListener("click", openBillingUpdatePanel);
  }
  if (elements.billingChangeMethodBtn) {
    elements.billingChangeMethodBtn.addEventListener("click", openBillingUpdatePanel);
  }
  if (elements.billingUpdateCloseBtn) {
    elements.billingUpdateCloseBtn.addEventListener("click", closeBillingUpdatePanel);
  }
  if (elements.billingUpdateCancelBtn) {
    elements.billingUpdateCancelBtn.addEventListener("click", closeBillingUpdatePanel);
  }
  if (elements.billingUpdateForm) {
    elements.billingUpdateForm.addEventListener("submit", submitBillingUpdate);
  }
  if (elements.billingToggleCancelBtn) {
    elements.billingToggleCancelBtn.addEventListener("click", handleBillingToggleCancel);
  }
  if (elements.billingRefreshBtn) {
    elements.billingRefreshBtn.addEventListener("click", () => loadBillingOverview({ notify: true }));
  }
  if (elements.billingPortalBtn) {
    elements.billingPortalBtn.addEventListener("click", openStripePortal);
  }
  if (elements.billingUpgradeBtn) {
    elements.billingUpgradeBtn.addEventListener("click", handleCheckout);
  }
  if (elements.checkoutBackBtn) {
    elements.checkoutBackBtn.addEventListener("click", closeCheckout);
  }
  if (elements.checkoutCancelBtn) {
    elements.checkoutCancelBtn.addEventListener("click", closeCheckout);
  }
  if (elements.checkoutHostedBtn) {
    elements.checkoutHostedBtn.addEventListener("click", openHostedCheckout);
  }
  if (elements.checkoutPlanSubscriptionBtn) {
    elements.checkoutPlanSubscriptionBtn.addEventListener("click", () => {
      setCheckoutPlanType("subscription", { refresh: true });
    });
  }
  if (elements.checkoutPlanLifetimeBtn) {
    elements.checkoutPlanLifetimeBtn.addEventListener("click", () => {
      setCheckoutPlanType("lifetime", { refresh: true });
    });
  }
  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener("submit", submitCheckout);
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
  if (elements.consentGateAcceptBtn) {
    elements.consentGateAcceptBtn.addEventListener("click", handleConsentSave);
  }
  if (elements.consentBackBtn) {
    elements.consentBackBtn.addEventListener("click", handleLogout);
  }
  if (elements.consentGateTerms) {
    elements.consentGateTerms.addEventListener("change", () => {
      setConsentStatus("");
      updateConsentGateActions();
    });
  }
  if (elements.consentGatePrivacy) {
    elements.consentGatePrivacy.addEventListener("change", () => {
      setConsentStatus("");
      updateConsentGateActions();
    });
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
  if (elements.diagRefreshBtn) {
    elements.diagRefreshBtn.addEventListener("click", () => {
      refreshDiagnostics({ notify: true });
    });
  }
  elements.startButtons.forEach((btn) => btn.addEventListener("click", startGame));
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
  if (elements.sketchModalClose) {
    elements.sketchModalClose.addEventListener("click", () => {
      void closeSketchModal();
    });
  }
  if (elements.sketchModalDismiss) {
    elements.sketchModalDismiss.addEventListener("click", () => {
      void closeSketchModal();
    });
  }
  if (elements.sketchModalAnalyze) {
    elements.sketchModalAnalyze.addEventListener("click", () => {
      void closeSketchModal({ analyze: true });
    });
  }
  elements.backToMenu.addEventListener("click", pauseSession);
  if (elements.switchStudioBtn) {
    elements.switchStudioBtn.addEventListener("click", () => {
      const target =
        getActiveCourse() === "sygdomslaere" ? DEFAULT_COURSE : "sygdomslaere";
      if (!canSwitchCourse(target)) return;
      void navigateToStudio(target);
    });
  }
  elements.returnMenuBtn.addEventListener("click", goToMenu);
  if (elements.resumeRoundBtn) {
    elements.resumeRoundBtn.addEventListener("click", resumeSession);
  }
  if (elements.finishRoundBtn) {
    elements.finishRoundBtn.addEventListener("click", () => {
      if (!state.results.length) {
        updatePausedSessionUI();
        return;
      }
      state.sessionPaused = false;
      updatePausedSessionUI();
      finishSession();
    });
  }
  if (elements.cancelRoundBtn) {
    elements.cancelRoundBtn.addEventListener("click", () => {
      if (!state.sessionActive) return;
      if (!state.cancelRoundConfirmArmed) {
        state.cancelRoundConfirmArmed = true;
        elements.cancelRoundBtn.textContent = "Bekræft annullering";
        if (state.cancelRoundConfirmTimer) {
          clearTimeout(state.cancelRoundConfirmTimer);
        }
        state.cancelRoundConfirmTimer = setTimeout(() => {
          resetCancelRoundConfirm();
        }, 4000);
        return;
      }
      cancelSession();
    });
  }
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
      clearTtsPartPrefetch();
      scheduleTtsPrefetch();
      const current = state.activeQuestions[state.currentIndex];
      prefetchShortGroupTts(current, { skipKey: state.activeShortPartKey });
    });
  }
  if (elements.ttsVoiceSelect) {
    elements.ttsVoiceSelect.addEventListener("change", (event) => {
      const nextVoice = normalizeTtsVoice(event.target.value);
      state.settings.ttsVoice = nextVoice;
      event.target.value = nextVoice;
      saveSettings();
      clearTtsPrefetch();
      clearTtsPartPrefetch();
      scheduleTtsPrefetch();
      const current = state.activeQuestions[state.currentIndex];
      prefetchShortGroupTts(current, { skipKey: state.activeShortPartKey });
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
      clearTtsPartPrefetch();
      scheduleTtsPrefetch();
      const current = state.activeQuestions[state.currentIndex];
      prefetchShortGroupTts(current, { skipKey: state.activeShortPartKey });
    });
  }

  elements.toggleFocus.addEventListener("click", toggleFocusMode);

  elements.toggleMeta.addEventListener("click", () => {
    const next = !state.sessionSettings.showMeta;
    state.sessionSettings.showMeta = next;
    state.settings.showMeta = next;
    saveSettings();
    applySessionDisplaySettings();
  });

  if (screens.quiz) {
    screens.quiz.addEventListener("click", (event) => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      if (event.target.closest(".short-part")) return;
      clearShortPartSelection();
    });
  }

  if (elements.shortAnswerInput) {
    elements.shortAnswerInput.addEventListener("input", () => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      const part = getActiveShortPart(question);
      if (!part) return;
      const currentDraft = getShortDraft(part.key);
      const nextText = elements.shortAnswerInput.value;
      const scored = currentDraft.scored && currentDraft.text === nextText;
      saveShortDraft(part.key, {
        text: nextText,
        points: Number(elements.shortAnswerScoreRange.value) || 0,
        scored,
      });
      updateShortPartStatus(part);
      updateShortGroupStatus(question);
      updateShortReviewStatus(part);
      updateShortAnswerActions(question);
    });
  }

  if (elements.shortAnswerScoreRange) {
    elements.shortAnswerScoreRange.addEventListener("input", (event) => {
      syncShortScoreInputs(event.target.value);
    });
  }

  if (elements.shortAnswerAiRetryBtn) {
    elements.shortAnswerAiRetryBtn.addEventListener("click", async () => {
      setShortRetryVisible(false);
      await checkAiAvailability();
      triggerShortAutoGrade({ scope: "active" });
    });
  }

  if (elements.shortGradeBtn) {
    elements.shortGradeBtn.addEventListener("click", () => {
      triggerShortAutoGrade({ scope: "group" });
    });
  }

  if (elements.shortFigureGenerateBtn) {
    elements.shortFigureGenerateBtn.addEventListener("click", () => {
      const question = state.activeQuestions[state.currentIndex];
      if (!question || question.type !== "short") return;
      const part = getActiveShortPart(question);
      if (!part) return;
      fetchFigureCaptionForQuestion(part, { force: true });
    });
  }

  if (elements.shortAnswerShowAnswer) {
    elements.shortAnswerShowAnswer.addEventListener("click", () => {
      void toggleShortAnswerModelVisibility();
    });
  }

  if (elements.shortAnswerShowAnswerInline) {
    elements.shortAnswerShowAnswerInline.addEventListener("click", () => {
      void toggleShortAnswerModelVisibility();
    });
  }

  elements.modal.addEventListener("click", (evt) => {
    if (evt.target === elements.modal) {
      hideRules();
    }
  });

  if (elements.sketchModal) {
    elements.sketchModal.addEventListener("click", (evt) => {
      if (evt.target === elements.sketchModal) {
        void closeSketchModal();
      }
    });
  }

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

  if (elements.sketchToolDraw) {
    elements.sketchToolDraw.addEventListener("click", () => setSketchTool("draw"));
  }
  if (elements.sketchToolErase) {
    elements.sketchToolErase.addEventListener("click", () => setSketchTool("erase"));
  }
  if (elements.sketchToolText) {
    elements.sketchToolText.addEventListener("click", () => setSketchTool("text"));
  }
  if (elements.sketchBrushSize) {
    elements.sketchBrushSize.addEventListener("input", (event) => {
      setSketchBrushSize(event.target.value);
    });
  }
  if (elements.sketchTextSize) {
    elements.sketchTextSize.addEventListener("input", (event) => {
      setSketchTextSize(event.target.value);
    });
  }
  if (elements.sketchClearBtn) {
    elements.sketchClearBtn.addEventListener("click", clearSketchCanvas);
  }
  if (elements.sketchDeleteTextBtn) {
    elements.sketchDeleteTextBtn.addEventListener("click", removeActiveSketchTextBox);
  }
  if (elements.sketchColorButtons?.length) {
    elements.sketchColorButtons.forEach((btn) => {
      btn.addEventListener("click", () => setSketchColor(btn.dataset.color));
    });
  }
  if (elements.sketchCanvas) {
    elements.sketchCanvas.addEventListener("pointerdown", handleSketchPointerDown);
    elements.sketchCanvas.addEventListener("pointermove", handleSketchPointerMove);
    elements.sketchCanvas.addEventListener("pointerup", handleSketchPointerUp);
    elements.sketchCanvas.addEventListener("pointerleave", handleSketchPointerUp);
    elements.sketchCanvas.addEventListener("pointercancel", handleSketchPointerUp);
  }

  elements.questionCountRange.addEventListener("input", (event) => {
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
  if (elements.togglePriorityMix) {
    elements.togglePriorityMix.addEventListener("change", (event) => {
      handleSettingToggle("priorityMix", event.target.checked);
    });
  }
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

  if (elements.selectAllCourses) {
    elements.selectAllCourses.addEventListener("click", () => {
      setSelection("courses", state.available.courses);
    });
  }
  if (elements.clearCourses) {
    elements.clearCourses.addEventListener("click", () => {
      setSelection("courses", []);
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
      if (closeActiveModal()) {
        event.preventDefault();
      }
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
  if (elements.togglePriorityMix) {
    elements.togglePriorityMix.checked = state.settings.priorityMix;
  }
  elements.toggleAutoAdvance.checked = state.settings.autoAdvance;
  if (elements.toggleInfiniteMode) {
    elements.toggleInfiniteMode.checked = state.settings.infiniteMode;
  }
  elements.toggleAvoidRepeats.checked = state.settings.avoidRepeats;
  if (elements.togglePreferUnseen) {
    elements.togglePreferUnseen.checked = state.settings.preferUnseen;
  }
  elements.toggleFocusMistakes.checked = state.settings.focusMistakes;
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

async function ensureQuestionsLoaded() {
  if (state.allQuestions.length) return;
  if (state.questionsLoading) {
    await state.questionsLoading;
    return;
  }
  state.questionsLoading = (async () => {
    await loadQuestions();
  })();
  try {
    await state.questionsLoading;
  } finally {
    state.questionsLoading = null;
  }
}

async function loadQuestions() {
  const fetchOptions = { cache: "no-store" };
  const [mcqRes, shortRes, captionsRes, bookRes, auditRes, diseaseRes] = await Promise.all([
    fetch("data/questions.json", fetchOptions),
    fetch("data/kortsvar.json", fetchOptions),
    fetch("data/figure_captions.json", fetchOptions),
    fetch("data/book_captions.json", fetchOptions),
    fetch("data/figure_audit.json", fetchOptions),
    fetch("data/sygdomslaere.json", fetchOptions),
  ]);
  const mcqData = await mcqRes.json();
  const shortData = shortRes.ok ? await shortRes.json() : [];
  const captionData = captionsRes.ok ? await captionsRes.json() : {};
  const bookData = bookRes.ok ? await bookRes.json() : {};
  const auditData = auditRes.ok ? await auditRes.json() : [];
  const diseaseData = diseaseRes.ok ? await diseaseRes.json() : {};
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
      const course = normalizeCourse(question.course || DEFAULT_COURSE);
      const { yearLabel, yearDisplay, sessionLabel } = resolveYearMeta({
        year: question.year,
        session: question.session,
        course,
      });
      const payload = {
        ...question,
        type: "mcq",
        rawCategory,
        category: normalizedCategory,
        course,
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

  const shortParts = shortData
    .map((question) => {
      const normalizedCategory = normalizeCategory(question.category);
      if (!normalizedCategory) return null;
      const rawCategory = question.category;
      const course = normalizeCourse(question.course || DEFAULT_COURSE);
      const { yearLabel, yearDisplay, sessionLabel } = resolveYearMeta({
        year: question.year,
        session: question.session,
        course,
      });
      const payload = {
        ...question,
        type: "short",
        text: question.prompt,
        rawCategory,
        category: normalizedCategory,
        course,
        session: sessionLabel || null,
        yearLabel,
        yearDisplay,
        number: question.opgave,
      };
      const groupKey = getShortGroupKey(payload);
      return {
        ...payload,
        groupKey,
        key: getQuestionKey(payload),
      };
    })
    .filter(Boolean);

  const diseaseParts = Array.isArray(diseaseData?.diseases)
    ? diseaseData.diseases.flatMap((disease, index) => {
        const normalizedCategory = normalizeCategory(disease.category);
        if (!normalizedCategory) return [];
        const rawCategory = disease.category;
        const course = "sygdomslaere";
        const priority = normalizePriorityValue(disease.priority) || "medium";
        const yearLabel = priority;
        const yearDisplay = PRIORITY_LABELS[priority] || String(priority);
        const diseaseId = String(disease.id || index + 1);
        const base = {
          type: "short",
          course,
          rawCategory,
          category: normalizedCategory,
          priority,
          taskType: getStudioContract(course)?.taskType || "case_structured",
          year: yearLabel,
          yearLabel,
          yearDisplay,
          number: diseaseId,
          opgave: index + 1,
          opgaveTitle: String(disease.name || "").trim(),
          opgaveIntro: "",
          groupId: `disease-${diseaseId}`,
          disease: String(disease.name || "").trim(),
          diseaseId,
        };
        const sections = Array.isArray(disease.sections) ? disease.sections : [];
        return sections
          .map((section, sectionIndex) => {
            const prompt = String(section.title || "").trim();
            const answer = String(section.content || "").trim();
            if (!prompt || !answer) return null;
            const payload = {
              ...base,
              label: String.fromCharCode(65 + sectionIndex),
              prompt,
              text: prompt,
              domain: prompt,
              section: prompt,
              answer,
            };
            const groupKey = getShortGroupKey(payload);
            return {
              ...payload,
              groupKey,
              key: getQuestionKey(payload),
            };
          })
          .filter(Boolean);
      })
    : [];

  const allShortParts = [...shortParts, ...diseaseParts];
  state.shortQuestionGroups = buildShortQuestionGroups(allShortParts);
  const shortGroups = buildShortGroups(allShortParts);
  state.shortGroupsByKey = new Map(shortGroups.map((group) => [group.key, group]));
  state.allQuestions = [...mcqQuestions, ...shortGroups];
  state.courseStats = buildCourseStats(state.allQuestions);
  const availableImages = new Set();
  state.allQuestions.forEach((question) => {
    if (question.type === "short") {
      getShortParts(question).forEach((part) => {
        if (Array.isArray(part.images)) {
          part.images.forEach((path) => availableImages.add(path));
        }
      });
      return;
    }
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
  refreshSeenGroups();
  scheduleUserStateSync();
  const allCounts = buildCounts(state.allQuestions);
  state.countsByType = {
    mcq: allCounts.types.get("mcq") || 0,
    short: allCounts.types.get("short") || 0,
  };
  state.available.courses = sortCourseIds([...allCounts.courses.keys()]);
  const preferredCourse = isKnownCourse(state.settings.lastStudio)
    ? normalizeCourse(state.settings.lastStudio)
    : DEFAULT_COURSE;
  state.activeCourse = preferredCourse;
  state.filters.courses = new Set([preferredCourse]);
  state.counts.courses = allCounts.courses;
  refreshAvailableFilters();
  applyCourseSettings(preferredCourse);
  applyCourseFilters(preferredCourse);
  updateCourseUI(preferredCourse);
  syncActiveBestScore(preferredCourse);
}

async function init() {
  clearStoredOwnKey();
  hydrateInfoTooltips();
  attachEvents();
  resetDemoQuizState();
  setAccountStatus("");
  setBillingStatus("");
  setBillingUpdateStatus("");
  updateTopBar();
  syncActiveBestScore(getActiveCourse());
  applyTheme(getInitialTheme());
  syncSettingsToUI();
  setAiStatus(state.aiStatus);
  setTtsStatus(state.ttsStatus);
  setLoadingState(true);
  setLoadingMessage("Starter appen …", "Gør klar til din session");
  setLoadingProgress(10);
  try {
    try {
      setLoadingMessage("Henter konfiguration …", "Kobler til serveren");
      setLoadingProgress(20);
      await withTimeout(loadRuntimeConfig(), CONFIG_TIMEOUT_MS, "Konfiguration tager for lang tid");
      initSupabaseClient();
      await guardedStep(hydrateAuthProviders(), CONFIG_TIMEOUT_MS, "Login-indstillinger tog for lang tid");
      setLoadingMessage("Tjekker login …", "Finder din session");
      setLoadingProgress(35);
      try {
        await withTimeout(refreshSession(), LOGIN_TIMEOUT_MS, "Login tager for lang tid at svare");
      } catch (error) {
        console.warn("Login tjek timeout", error);
        state.authReady = true;
      }
      subscribeToAuthChanges();
      if (state.session?.user) {
        setLoadingMessage("Henter profil …", "Synkroniserer konto");
        setLoadingProgress(50);
        await guardedStep(refreshProfile(), PROFILE_TIMEOUT_MS, "Profil indlæsning tog for lang tid");
      }
      await handleReturnParams();
      if (!state.session?.user) {
        if (getStudioParamValue()) {
          redirectToAuth();
          return;
        }
        setLoadingProgress(100);
        setLoadingState(false);
        return;
      }
    } catch (error) {
      state.backendAvailable = false;
      state.configError = error.message || "Kunne ikke åbne login lige nu.";
      state.authReady = true;
      setAuthStatus(state.configError, true);
    }
    try {
      setLoadingMessage("Indlæser spørgsmål …", "Bygger spørgsmålspulje");
      setLoadingProgress(70);
      await withTimeout(
        ensureQuestionsLoaded(),
        QUESTIONS_TIMEOUT_MS,
        "Spørgsmål indlæsning tog for lang tid"
      );
    } catch (err) {
      console.error("Kunne ikke indlæse spørgsmål", err);
      elements.questionCountChip.textContent = "Fejl: kunne ikke indlæse spørgsmål";
      elements.poolCountChip.textContent = "Ingen data";
    }
    setLoadingMessage("Tjekker hjælpefunktioner …", "Assistent og oplæsning");
    setLoadingProgress(85);
    await guardedStep(checkAiAvailability(), HEALTH_TIMEOUT_MS, "AI tjek tog for lang tid");
    setLoadingMessage("Opdaterer historik …", "Klargør dashboard");
    setLoadingProgress(95);
    setLoadingProgress(100);
    setLoadingState(false);
    setTimeout(() => {
      try {
        renderHistory();
      } catch (err) {
        console.error("Kunne ikke opdatere historik", err);
      }
    }, 0);
  } finally {
    if (state.isLoading) {
      setLoadingProgress(100);
      setLoadingState(false);
    }
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.isLoading) {
    scheduleLoadingFallback();
  }
});

document.addEventListener("DOMContentLoaded", init);
