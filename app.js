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
};

const FEEDBACK = [
  { min: 50, text: "Du er i topform! Eksamen bliver en leg." },
  { min: 30, text: "Stærkt arbejde – du er godt på vej." },
  { min: 10, text: "Solid indsats, hold tempoet og finpuds detaljerne." },
  { min: -100, text: "Fortsæt øvelsen, og brug 'spring over' strategisk." },
];

const CATEGORY_ALIASES = {
  "Blodet og immunsystemet": "Blod og immunsystemet",
  "Blodet": "Blod og immunsystemet",
  "Immunsystemet": "Blod og immunsystemet",
  "Cellens byggesten": "Cellebiologi",
  "Cellulære transportmekanismer": "Cellebiologi",
  "Den kemiske basis for liv": "Cellebiologi",
  "Fordøjelseskanalen": "Fordøjelse",
  "Mave-tarmkanalen": "Fordøjelse",
  "Hjerte og kredsløb": "Kredsløb",
  "Kredsløb/respiration": "Kredsløb",
  "Lever og kredsløb": "Kredsløb",
  "Lungefysiologi": "Respiration",
  "Lunger": "Respiration",
  "Respirationssystemet": "Respiration",
  "Det respiratoriske system": "Respiration",
  "Nyrer": "Nyrer og urinveje",
  "Syre-base-regulering": "Syre-base",
  "Histologi / anatomi": "Histologi",
  "Hormoner": "Endokrinologi",
  "Skelettet": "Bevægeapparatet",
};

const DEPRECATED_CATEGORY = /udgået/i;
const SESSION_ORDER = {
  ordinær: 0,
  sygeeksamen: 1,
};

const state = {
  allQuestions: [],
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  startTime: null,
  locked: false,
  results: [],
  bestScore: Number(localStorage.getItem(STORAGE_KEYS.bestScore) || 0),
  settings: loadSettings(),
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
  autoAdvanceDelay: document.getElementById("auto-advance-delay"),
  autoAdvanceLabel: document.getElementById("auto-advance-label"),
  backToMenu: document.getElementById("back-to-menu"),
  sessionPill: document.getElementById("session-pill"),
  progressText: document.getElementById("progress-text"),
  tempoText: document.getElementById("tempo-text"),
  progressFill: document.getElementById("progress-fill"),
  scoreValue: document.getElementById("score-value"),
  bestScoreValue: document.getElementById("best-score-value"),
  questionCategory: document.getElementById("question-category"),
  questionYear: document.getElementById("question-year"),
  questionNumber: document.getElementById("question-number"),
  questionText: document.getElementById("question-text"),
  optionsContainer: document.getElementById("options-container"),
  feedbackArea: document.getElementById("feedback-area"),
  skipBtn: document.getElementById("skip-btn"),
  nextBtn: document.getElementById("next-btn"),
  flagBtn: document.getElementById("flag-btn"),
  toggleFocus: document.getElementById("toggle-focus"),
  toggleMeta: document.getElementById("toggle-meta"),
  questionMeta: document.getElementById("question-meta"),
  finalScore: document.getElementById("final-score"),
  finalMessage: document.getElementById("final-message"),
  statCorrect: document.getElementById("stat-correct"),
  statWrong: document.getElementById("stat-wrong"),
  statSkipped: document.getElementById("stat-skipped"),
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
  return `${question.year}-${sessionKey}-${question.number}-${question.category}`;
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
  questions.forEach((question) => {
    years.set(question.yearLabel, (years.get(question.yearLabel) || 0) + 1);
    categories.set(question.category, (categories.get(question.category) || 0) + 1);
  });
  return { years, categories };
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

function updateTopBar() {
  const total = state.activeQuestions.length || 0;
  const current = Math.min(state.currentIndex + 1, total);
  elements.progressText.textContent = `${current} / ${total}`;
  elements.progressFill.style.width = total ? `${(state.currentIndex / total) * 100}%` : "0%";
  elements.scoreValue.textContent = state.score;
  elements.bestScoreValue.textContent = state.bestScore;
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

function renderQuestion() {
  clearAutoAdvance();
  state.locked = false;
  elements.nextBtn.disabled = true;
  elements.skipBtn.disabled = false;
  setFeedback("");
  clearOptions();

  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (!currentQuestion) return;

  elements.questionCategory.textContent = currentQuestion.category;
  elements.questionYear.textContent = `År ${currentQuestion.yearDisplay}`;
  elements.questionNumber.textContent = `#${currentQuestion.number}`;
  elements.questionText.textContent = currentQuestion.text;

  const options = state.sessionSettings.shuffleOptions
    ? shuffle(currentQuestion.options)
    : currentQuestion.options;

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.label = option.label;
    btn.innerHTML = `<span class="label">${option.label}</span>${option.text}`;
    btn.addEventListener("click", () => handleAnswer(option.label));
    elements.optionsContainer.appendChild(btn);
  });

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

function handleAnswer(label) {
  if (state.locked) return;
  const question = state.activeQuestions[state.currentIndex];
  const isCorrect = question.correctLabel === label;
  const delta = isCorrect ? 3 : -1;
  state.score += delta;
  state.results.push({
    question,
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
  state.results.push({
    question,
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

function maybeAutoAdvance() {
  if (!state.sessionSettings.autoAdvance) return;
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
    if (entry.skipped) {
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
    meta.textContent = `${entry.question.category} • ${entry.question.yearLabel}`;

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
    correctLine.textContent = `Korrekt svar: ${entry.question.correctLabel}. ${correctOption?.text || ""}`;

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(selectedLine);
    card.appendChild(correctLine);
    elements.reviewList.appendChild(card);
  });
}

function getFeedbackText(score) {
  for (const rule of FEEDBACK) {
    if (score >= rule.min) return rule.text;
  }
  return FEEDBACK[FEEDBACK.length - 1].text;
}

function showResults() {
  const correct = state.results.filter((r) => r.isCorrect).length;
  const wrong = state.results.filter((r) => !r.isCorrect && !r.skipped).length;
  const skipped = state.results.filter((r) => r.skipped).length;
  const timePerQuestion = formatTempo();
  elements.progressFill.style.width = "100%";

  elements.finalScore.textContent = state.score;
  elements.finalMessage.textContent = getFeedbackText(state.score);
  elements.statCorrect.textContent = correct;
  elements.statWrong.textContent = wrong;
  elements.statSkipped.textContent = skipped;
  elements.statPace.textContent = timePerQuestion;
  elements.statFlagged.textContent = state.flaggedKeys.size;

  const isNewBest = state.score > state.bestScore;
  if (isNewBest) {
    state.bestScore = state.score;
    localStorage.setItem(STORAGE_KEYS.bestScore, String(state.bestScore));
  }
  elements.bestBadge.style.display = isNewBest ? "inline-flex" : "none";
  elements.bestScoreValue.textContent = state.bestScore;

  const mistakeKeys = state.results
    .filter((result) => !result.isCorrect)
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
    return a.number - b.number;
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

function buildQuestionSet(pool) {
  const count = Math.min(state.sessionSettings.questionCount, pool.length);
  if (count <= 0) return [];

  if (state.sessionSettings.balancedMix) {
    return pickBalancedQuestions(pool, count);
  }

  const ordered = state.sessionSettings.shuffleQuestions ? shuffle(pool) : sortQuestions(pool);
  return ordered.slice(0, count);
}

function resolvePool() {
  const basePool = state.allQuestions.filter(
    (question) =>
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
  const roundSize = Math.min(state.settings.questionCount, pool.length);

  elements.poolCount.textContent = pool.length;
  elements.poolCountChip.textContent = `${pool.length} i puljen`;
  elements.roundCount.textContent = roundSize;

  const mixParts = [];
  if (state.settings.balancedMix) mixParts.push("Balanceret");
  if (state.settings.shuffleQuestions) mixParts.push("Shuffle");
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

  if (!selectedYears.length || !selectedCategories.length) {
    hint = "Vælg mindst ét emne og ét sæt for at starte.";
    canStart = false;
  } else if (state.settings.focusMistakes && !focusMistakesActive) {
    hint = hasMistakes
      ? "Fokus på fejl er slået til, men ingen fejl matcher dine filtre – runden bruger alle spørgsmål."
      : "Fokus på fejl er slået til, men der er ingen fejl endnu – runden bruger alle spørgsmål.";
  } else if (!pool.length) {
    hint = "Ingen spørgsmål matcher dine filtre.";
    canStart = false;
  } else if (pool.length < state.settings.questionCount) {
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
  const label = `${state.activeQuestions.length} spørgsmål · ${yearCount} sæt · ${categoryCount} emner`;
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
  state.currentIndex = 0;
  state.score = 0;
  state.results = [];
  state.flaggedKeys = new Set();
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
  if (key === "a" || key === "b" || key === "c" || key === "d") {
    handleAnswer(key.toUpperCase());
  } else if (key === "n") {
    if (!elements.nextBtn.disabled) {
      goToNextQuestion();
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
  elements.nextBtn.addEventListener("click", goToNextQuestion);
  elements.rulesButton.addEventListener("click", showRules);
  elements.closeModal.addEventListener("click", hideRules);
  elements.modalClose.addEventListener("click", hideRules);
  elements.backToMenu.addEventListener("click", goToMenu);
  elements.returnMenuBtn.addEventListener("click", goToMenu);
  elements.playAgainBtn.addEventListener("click", startGame);
  elements.flagBtn.addEventListener("click", toggleFlag);

  elements.toggleFocus.addEventListener("click", () => {
    state.sessionSettings.focusMode = !state.sessionSettings.focusMode;
    applySessionDisplaySettings();
  });

  elements.toggleMeta.addEventListener("click", () => {
    state.sessionSettings.showMeta = !state.sessionSettings.showMeta;
    applySessionDisplaySettings();
  });

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
  elements.autoAdvanceDelay.value = state.settings.autoAdvanceDelay;
  updateAutoAdvanceLabel();
}

async function loadQuestions() {
  const res = await fetch("data/questions.json");
  const data = await res.json();
  state.allQuestions = data
    .map((question) => {
      const normalizedCategory = normalizeCategory(question.category);
      if (!normalizedCategory) return null;
      const rawCategory = question.category;
      const sessionLabel = formatSessionLabel(question.session || "");
      const sessionTitle = sessionLabel ? formatSessionTitle(sessionLabel) : "";
      const yearLabel = sessionTitle ? `${question.year} ${sessionTitle}` : String(question.year);
      const yearDisplay = sessionTitle ? `${question.year} · ${sessionTitle}` : String(question.year);
      return {
        ...question,
        rawCategory,
        category: normalizedCategory,
        session: sessionLabel || null,
        yearLabel,
        yearDisplay,
        key: getQuestionKey({
          year: question.year,
          session: sessionLabel || null,
          number: question.number,
          category: rawCategory,
        }),
      };
    })
    .filter(Boolean);
  const availableKeys = new Set(state.allQuestions.map((question) => question.key));
  state.seenKeys = new Set([...state.seenKeys].filter((key) => availableKeys.has(key)));
  state.lastMistakeKeys = new Set(
    [...state.lastMistakeKeys].filter((key) => availableKeys.has(key))
  );
  localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify([...state.seenKeys]));
  localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify([...state.lastMistakeKeys]));
  state.counts = buildCounts(state.allQuestions);
  state.available.years = [...state.counts.years.keys()].sort((a, b) => {
    const aParsed = parseYearLabel(a);
    const bParsed = parseYearLabel(b);
    if (aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
    return (SESSION_ORDER[aParsed.session] ?? 99) - (SESSION_ORDER[bParsed.session] ?? 99);
  });
  state.available.categories = [...state.counts.categories.keys()].sort((a, b) =>
    a.localeCompare(b, "da")
  );
  state.filters.years = new Set(state.available.years);
  state.filters.categories = new Set(state.available.categories);
  elements.questionCountChip.textContent = `${state.allQuestions.length} spørgsmål i databasen`;
  updateChips();
  updateSummary();
}

async function init() {
  attachEvents();
  updateTopBar();
  elements.bestScoreValue.textContent = state.bestScore;
  applyTheme(getInitialTheme());
  syncSettingsToUI();
  try {
    await loadQuestions();
  } catch (err) {
    console.error("Kunne ikke indlæse spørgsmål", err);
    elements.questionCountChip.textContent = "Fejl: kunne ikke indlæse spørgsmål";
    elements.poolCountChip.textContent = "Ingen data";
  }
}

document.addEventListener("DOMContentLoaded", init);
