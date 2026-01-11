const STORAGE_KEYS = {
  settings: "sygdomslaere_settings",
  mastery: "sygdomslaere_mastery",
};

const DEFAULT_SETTINGS = {
  deckSize: 18,
  includeExcluded: false,
  weightByPriority: true,
  focusWeak: true,
  shuffleDeck: true,
};

const CURRENT_STUDIO = "sygdomslaere";
const STUDIO_PARAM = "studio";
const STUDIO_PATHS = {
  human: "index.html",
  sygdomslaere: "sygdomslaere.html",
};

const PRIORITY_LABELS = {
  high: "Høj",
  medium: "Mellem",
  low: "Lav",
  excluded: "Ikke pensum",
};

const PRIORITY_WEIGHTS = {
  high: 1.4,
  medium: 1.0,
  low: 0.8,
  excluded: 0.35,
};

const CORE_SECTIONS = new Set([
  "Definition",
  "Forekomst",
  "Ætiologi",
  "Symptomer og fund",
  "Diagnostik",
  "Behandling",
]);

const PROMPT_TEMPLATES = {
  Nøglepunkter: "Nøglepunkter for {name}.",
  Definition: "Definér {name}.",
  Forekomst: "Beskriv forekomst for {name}.",
  Patogenese: "Gør rede for patogenese ved {name}.",
  Ætiologi: "Hvad er ætiologien ved {name}?",
  "Symptomer og fund": "Nævn symptomer og fund ved {name}.",
  Diagnostik: "Hvordan diagnosticeres {name}?",
  Følgetilstande: "Hvilke følgetilstande ses ved {name}?",
  Behandling: "Beskriv behandling af {name}.",
  Forebyggelse: "Hvordan forebygges {name}?",
  Prognose: "Hvad er prognosen for {name}?",
  Samfundsbyrde: "Beskriv samfundsbyrden ved {name}.",
};

const EMPTY_WEIGHT = "Ikke angivet";

const state = {
  data: null,
  available: {
    categories: [],
    priorities: [],
    weights: [],
    sections: [],
  },
  filters: {
    categories: new Set(),
    priorities: new Set(),
    weights: new Set(),
    sections: new Set(),
  },
  search: "",
  settings: loadSettings(),
  mastery: loadMastery(),
  deck: [],
  currentIndex: 0,
  answerRevealed: false,
  sessionComplete: false,
  supabase: null,
  clerk: null,
  clerkReady: false,
  session: null,
  remoteSettings: null,
  studioResolved: false,
};

const elements = {
  studioHumanBtn: document.getElementById("studio-human-btn"),
  statDiseases: document.getElementById("stat-diseases"),
  statSections: document.getElementById("stat-sections"),
  statCategories: document.getElementById("stat-categories"),
  searchInput: document.getElementById("search-input"),
  categoryChips: document.getElementById("category-chips"),
  priorityChips: document.getElementById("priority-chips"),
  weightChips: document.getElementById("weight-chips"),
  sectionChips: document.getElementById("section-chips"),
  includeExcludedToggle: document.getElementById("toggle-include-excluded"),
  deckSizeRange: document.getElementById("deck-size"),
  deckSizeLabel: document.getElementById("deck-size-label"),
  togglePriorityWeight: document.getElementById("toggle-priority-weight"),
  toggleFocusWeak: document.getElementById("toggle-focus-weak"),
  toggleShuffle: document.getElementById("toggle-shuffle"),
  resetFiltersBtn: document.getElementById("reset-filters-btn"),
  poolCount: document.getElementById("pool-count"),
  diseaseCount: document.getElementById("disease-count"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  deckProgress: document.getElementById("deck-progress"),
  progressFill: document.getElementById("progress-fill"),
  studyMode: document.getElementById("study-mode"),
  overviewMode: document.getElementById("overview-mode"),
  cardSection: document.getElementById("card-section"),
  cardCategory: document.getElementById("card-category"),
  cardPriority: document.getElementById("card-priority"),
  cardDisease: document.getElementById("card-disease"),
  cardPrompt: document.getElementById("card-prompt"),
  cardAnswerInput: document.getElementById("card-answer-input"),
  revealBtn: document.getElementById("reveal-btn"),
  skipBtn: document.getElementById("skip-btn"),
  newSessionBtn: document.getElementById("new-session-btn"),
  cardAnswer: document.getElementById("card-answer"),
  cardAnswerText: document.getElementById("card-answer-text"),
  cardWeight: document.getElementById("card-weight"),
  ratingRow: document.getElementById("rating-row"),
  summaryFocus: document.getElementById("summary-focus"),
  summaryStrong: document.getElementById("summary-strong"),
  summaryWeak: document.getElementById("summary-weak"),
  overviewList: document.getElementById("overview-list"),
  expandAllBtn: document.getElementById("expand-all-btn"),
  insightStrong: document.getElementById("insight-strong"),
  insightMid: document.getElementById("insight-mid"),
  insightWeak: document.getElementById("insight-weak"),
  insightGoal: document.getElementById("insight-goal"),
  resetProgressBtn: document.getElementById("reset-progress-btn"),
  selectAllCategories: document.getElementById("select-all-categories"),
  selectPriorityHigh: document.getElementById("select-priority-high"),
  selectAllWeights: document.getElementById("select-all-weights"),
  selectCoreSections: document.getElementById("select-core-sections"),
};

function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  if (!saved) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    console.warn("Kunne ikke indlæse settings", error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function loadMastery() {
  const saved = localStorage.getItem(STORAGE_KEYS.mastery);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Kunne ikke indlæse progression", error);
    return {};
  }
}

function saveMastery() {
  localStorage.setItem(STORAGE_KEYS.mastery, JSON.stringify(state.mastery));
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

async function loadRuntimeConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function waitForClerkReady() {
  if (window.clerk && window.clerk.loaded) {
    return Promise.resolve(window.clerk);
  }
  return new Promise((resolve) => {
    const handler = (event) => {
      if (event?.detail?.clerk) {
        window.removeEventListener("clerk:ready", handler);
        resolve(event.detail.clerk);
      }
    };
    window.addEventListener("clerk:ready", handler);
  });
}

async function getClerkSessionToken() {
  if (!state.clerk?.session) return null;
  try {
    return await state.clerk.session.getToken();
  } catch (error) {
    return null;
  }
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = await getClerkSessionToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

function initSupabaseClient() {
  state.supabase = null;
}

async function refreshSession() {
  let clerk;
  try {
    clerk = await waitForClerkReady();
  } catch (error) {
    clerk = null;
  }
  state.clerk = clerk || null;
  state.clerkReady = Boolean(clerk?.loaded);
  const clerkUser = clerk?.user || null;
  const clerkSession = clerk?.session || null;
  if (clerkUser && clerkSession) {
    state.session = {
      user: {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
      },
      access_token: await getClerkSessionToken(),
    };
  } else {
    state.session = null;
  }
  return state.session;
}

async function loadRemoteSettings() {
  if (!state.session?.user) return null;
  const res = await apiFetch("/api/user-state", { method: "GET" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const settings = data?.userState?.settings;
  return settings && typeof settings === "object" ? settings : null;
}

async function persistLastStudio(studio) {
  if (!state.session?.user) return;
  const current = state.remoteSettings && typeof state.remoteSettings === "object"
    ? state.remoteSettings
    : {};
  const nextSettings = { ...current, lastStudio: studio };
  const res = await apiFetch("/api/user-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings: nextSettings }),
  });
  if (res.ok) {
    state.remoteSettings = nextSettings;
  }
}

async function handleStudioPreference() {
  if (state.studioResolved || !state.session?.user) return false;
  const param = getStudioParamValue();
  if (param === CURRENT_STUDIO) {
    clearStudioParam();
    await persistLastStudio(CURRENT_STUDIO);
    state.studioResolved = true;
    return false;
  }
  const lastStudio = state.remoteSettings?.lastStudio || CURRENT_STUDIO;
  if (lastStudio !== CURRENT_STUDIO && STUDIO_PATHS[lastStudio]) {
    state.studioResolved = true;
    window.location.replace(`${STUDIO_PATHS[lastStudio]}?${STUDIO_PARAM}=${lastStudio}`);
    return true;
  }
  await persistLastStudio(CURRENT_STUDIO);
  state.studioResolved = true;
  return false;
}

async function navigateToStudio(studio) {
  if (!studio || studio === CURRENT_STUDIO) return;
  const switchTimeoutMs = 250;
  try {
    await Promise.race([
      persistLastStudio(studio),
      new Promise((resolve) => setTimeout(resolve, switchTimeoutMs)),
    ]);
  } catch (error) {
    console.warn("Kunne ikke nå at gemme studio-valg før skift", error);
  }
  const target = STUDIO_PATHS[studio] || STUDIO_PATHS[CURRENT_STUDIO];
  window.location.href = `${target}?${STUDIO_PARAM}=${studio}`;
}

async function initStudioSession() {
  try {
    const config = await loadRuntimeConfig();
    if (!config) return false;
    initSupabaseClient(config);
    await refreshSession();
    if (!state.session?.user) return false;
    state.remoteSettings = (await loadRemoteSettings()) || {};
    return await handleStudioPreference();
  } catch (error) {
    return false;
  }
}

function normalizeWeight(weight) {
  const cleaned = String(weight || "").trim();
  return cleaned ? cleaned : EMPTY_WEIGHT;
}

function formatPrompt(sectionTitle, diseaseName) {
  const template = PROMPT_TEMPLATES[sectionTitle];
  if (template) return template.replace("{name}", diseaseName);
  return `Beskriv ${sectionTitle.toLowerCase()} for ${diseaseName}.`;
}

function buildAvailableFilters(data) {
  const categories = data.meta.categories || [];
  const priorities = data.meta.priorities || [];
  const sectionsFromData = new Set();
  const weights = new Set(data.meta.weights || []);
  let hasEmptyWeight = false;

  data.diseases.forEach((disease) => {
    if (!disease.weight) {
      hasEmptyWeight = true;
    }
    if (Array.isArray(disease.sections)) {
      disease.sections.forEach((section) => sectionsFromData.add(section.title));
    }
  });

  if (hasEmptyWeight) weights.add(EMPTY_WEIGHT);

  const orderedSections = data.meta.sectionOrder || [];
  const extraSections = [...sectionsFromData].filter(
    (section) => !orderedSections.includes(section)
  );

  state.available = {
    categories,
    priorities,
    weights: [...weights],
    sections: [...orderedSections, ...extraSections],
  };
}

function getVisiblePriorities() {
  return state.settings.includeExcluded
    ? state.available.priorities
    : state.available.priorities.filter((value) => value !== "excluded");
}

function resetFilters() {
  state.filters.categories = new Set(state.available.categories);
  state.filters.priorities = new Set(getVisiblePriorities());
  state.filters.weights = new Set(state.available.weights);
  state.filters.sections = new Set(state.available.sections);
  state.search = "";
  if (elements.searchInput) elements.searchInput.value = "";
}

function applyCoreSections() {
  const core = state.available.sections.filter((section) => CORE_SECTIONS.has(section));
  state.filters.sections = new Set(core.length ? core : state.available.sections);
}

function buildCounts(data) {
  const counts = {
    categories: new Map(),
    priorities: new Map(),
    weights: new Map(),
    sections: new Map(),
  };

  data.diseases.forEach((disease) => {
    counts.categories.set(
      disease.category,
      (counts.categories.get(disease.category) || 0) + 1
    );
    counts.priorities.set(
      disease.priority,
      (counts.priorities.get(disease.priority) || 0) + 1
    );
    const weight = normalizeWeight(disease.weight);
    counts.weights.set(weight, (counts.weights.get(weight) || 0) + 1);
    if (Array.isArray(disease.sections)) {
      disease.sections.forEach((section) => {
        counts.sections.set(section.title, (counts.sections.get(section.title) || 0) + 1);
      });
    }
  });

  return counts;
}

function renderChips(container, values, selectedSet, counts) {
  if (!container) return;
  container.innerHTML = "";
  values.forEach((value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.dataset.value = value;
    btn.textContent = value;
    const count = document.createElement("span");
    count.className = "chip-count";
    count.textContent = String(counts.get(value) || 0);
    btn.appendChild(count);
    if (selectedSet.has(value)) btn.classList.add("active");
    btn.addEventListener("click", () => toggleFilter(container, value));
    container.appendChild(btn);
  });
}

function renderPriorityChips(container, values, selectedSet, counts) {
  if (!container) return;
  container.innerHTML = "";
  values.forEach((value) => {
    const label = PRIORITY_LABELS[value] || value;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.dataset.value = value;
    btn.textContent = label;
    const count = document.createElement("span");
    count.className = "chip-count";
    count.textContent = String(counts.get(value) || 0);
    btn.appendChild(count);
    if (selectedSet.has(value)) btn.classList.add("active");
    btn.addEventListener("click", () => toggleFilter(container, value));
    container.appendChild(btn);
  });
}

function toggleFilter(container, value) {
  let targetSet = null;
  if (container === elements.categoryChips) targetSet = state.filters.categories;
  if (container === elements.priorityChips) targetSet = state.filters.priorities;
  if (container === elements.weightChips) targetSet = state.filters.weights;
  if (container === elements.sectionChips) targetSet = state.filters.sections;
  if (!targetSet) return;
  if (targetSet.has(value)) {
    targetSet.delete(value);
  } else {
    targetSet.add(value);
  }
  refreshSessionFromFilters();
}

function getFilteredDiseases() {
  const term = state.search.trim().toLowerCase();
  return state.data.diseases.filter((disease) => {
    if (state.filters.categories.size && !state.filters.categories.has(disease.category)) {
      return false;
    }
    if (state.filters.priorities.size && !state.filters.priorities.has(disease.priority)) {
      return false;
    }
    const weight = normalizeWeight(disease.weight);
    if (state.filters.weights.size && !state.filters.weights.has(weight)) {
      return false;
    }
    if (term) {
      const haystack = `${disease.name} ${disease.category}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });
}

function buildCardPool(diseases) {
  const cards = [];
  diseases.forEach((disease) => {
    if (!Array.isArray(disease.sections)) return;
    disease.sections.forEach((section) => {
      if (state.filters.sections.size && !state.filters.sections.has(section.title)) return;
      cards.push({
        id: `${disease.id}::${section.title}`,
        disease,
        section,
      });
    });
  });
  return cards;
}

function getMasteryScore(cardId) {
  const entry = state.mastery[cardId];
  return entry ? entry.score : 0;
}

function getMasteryBucket(score) {
  if (score >= 2) return "strong";
  if (score === 1) return "mid";
  return "weak";
}

function getCardWeight(card) {
  let weight = 1;
  if (state.settings.weightByPriority) {
    weight *= PRIORITY_WEIGHTS[card.disease.priority] || 1;
  }
  if (state.settings.focusWeak) {
    const score = getMasteryScore(card.id);
    if (score >= 2) weight *= 0.6;
    else if (score === 1) weight *= 1.0;
    else weight *= 1.35;
  }
  return weight;
}

function weightedSample(pool, size) {
  const available = [...pool];
  const result = [];
  while (result.length < size && available.length) {
    const total = available.reduce((sum, card) => sum + getCardWeight(card), 0);
    let pick = Math.random() * total;
    let index = 0;
    for (; index < available.length; index += 1) {
      pick -= getCardWeight(available[index]);
      if (pick <= 0) break;
    }
    const [chosen] = available.splice(index, 1);
    result.push(chosen);
  }
  return result;
}

function buildDeck(pool) {
  const size = Math.min(state.settings.deckSize, pool.length);
  if (!size) return [];
  const deck = state.settings.shuffleDeck
    ? weightedSample(pool, size)
    : pool.slice(0, size);
  return deck;
}

function updateDeckProgress() {
  const total = state.deck.length;
  const current = total ? state.currentIndex + 1 : 0;
  if (elements.deckProgress) {
    elements.deckProgress.textContent = `${current} / ${total}`;
  }
  if (elements.progressFill) {
    const pct = total ? (current / total) * 100 : 0;
    elements.progressFill.style.width = `${pct}%`;
  }
}

function updateCardControls({ hasDeck, isComplete }) {
  const showStudyActions = hasDeck && !isComplete;
  if (elements.revealBtn) elements.revealBtn.classList.toggle("hidden", !showStudyActions);
  if (elements.skipBtn) elements.skipBtn.classList.toggle("hidden", !showStudyActions);
  if (elements.newSessionBtn) elements.newSessionBtn.classList.toggle("hidden", !isComplete);
  if (elements.cardAnswerInput) elements.cardAnswerInput.disabled = !showStudyActions;
}

function renderCard() {
  if (!state.deck.length) {
    elements.cardPrompt.textContent = "Ingen kort matcher dine valg.";
    elements.cardDisease.textContent = "Sygdom";
    elements.cardSection.textContent = "—";
    elements.cardCategory.textContent = "—";
    elements.cardPriority.textContent = "—";
    elements.cardAnswer.classList.add("hidden");
    elements.ratingRow.classList.add("hidden");
    elements.cardAnswerInput.value = "";
    updateCardControls({ hasDeck: false, isComplete: false });
    updateDeckProgress();
    return;
  }

  if (state.sessionComplete) {
    elements.cardPrompt.textContent = "Session afsluttet. Klar til en ny runde?";
    elements.cardDisease.textContent = "Session";
    elements.cardSection.textContent = "—";
    elements.cardCategory.textContent = "—";
    elements.cardPriority.textContent = "—";
    elements.cardAnswer.classList.add("hidden");
    elements.ratingRow.classList.add("hidden");
    elements.cardAnswerInput.value = "";
    updateCardControls({ hasDeck: true, isComplete: true });
    updateDeckProgress();
    return;
  }

  const card = state.deck[state.currentIndex];
  const { disease, section } = card;
  elements.cardSection.textContent = section.title;
  elements.cardCategory.textContent = disease.category;
  elements.cardPriority.textContent = disease.priorityLabel || PRIORITY_LABELS[disease.priority];
  elements.cardDisease.textContent = disease.name;
  elements.cardPrompt.textContent = formatPrompt(section.title, disease.name);
  elements.cardAnswerText.textContent = section.content;
  elements.cardWeight.textContent = normalizeWeight(disease.weight);
  elements.cardAnswer.classList.add("hidden");
  elements.ratingRow.classList.add("hidden");
  elements.cardAnswerInput.value = "";
  state.answerRevealed = false;
  updateCardControls({ hasDeck: true, isComplete: false });
  updateDeckProgress();
}

function recordMastery(cardId, score) {
  const previous = state.mastery[cardId] || { score: 0, seen: 0 };
  state.mastery[cardId] = {
    score,
    seen: previous.seen + 1,
    updatedAt: Date.now(),
  };
  saveMastery();
}

function handleReveal() {
  if (!state.deck.length || state.answerRevealed || state.sessionComplete) return;
  state.answerRevealed = true;
  elements.cardAnswer.classList.remove("hidden");
  elements.ratingRow.classList.remove("hidden");
}

function goToNextCard() {
  if (!state.deck.length || state.sessionComplete) return;
  if (state.currentIndex < state.deck.length - 1) {
    state.currentIndex += 1;
    renderCard();
    return;
  }
  state.sessionComplete = true;
  renderCard();
}

function handleRating(score) {
  if (!state.deck.length || state.sessionComplete) return;
  const card = state.deck[state.currentIndex];
  recordMastery(card.id, score);
  updateInsights();
  goToNextCard();
}

function buildFocusSummary() {
  const parts = [];
  const categoryCount = state.filters.categories.size;
  const priorityCount = state.filters.priorities.size;
  const sectionCount = state.filters.sections.size;

  if (categoryCount && categoryCount !== state.available.categories.length) {
    parts.push(
      categoryCount <= 2
        ? [...state.filters.categories].join(", ")
        : `${categoryCount} kategorier`
    );
  }

  if (priorityCount && priorityCount !== getVisiblePriorities().length) {
    const labels = [...state.filters.priorities].map((value) => PRIORITY_LABELS[value]);
    parts.push(labels.join(" · "));
  }

  if (sectionCount && sectionCount !== state.available.sections.length) {
    parts.push(
      sectionCount <= 2
        ? [...state.filters.sections].join(", ")
        : `${sectionCount} sektioner`
    );
  }

  return parts.length ? parts.join(" | ") : "Hele pensum";
}

function updateSummaryCards(pool) {
  const focus = buildFocusSummary();
  if (elements.summaryFocus) elements.summaryFocus.textContent = focus;

  let strong = 0;
  let weak = 0;
  pool.forEach((card) => {
    const bucket = getMasteryBucket(getMasteryScore(card.id));
    if (bucket === "strong") strong += 1;
    if (bucket === "weak") weak += 1;
  });
  if (elements.summaryStrong) elements.summaryStrong.textContent = strong;
  if (elements.summaryWeak) elements.summaryWeak.textContent = weak;
}

function renderOverview(diseases) {
  if (!elements.overviewList) return;
  elements.overviewList.innerHTML = "";

  diseases.forEach((disease) => {
    const card = document.createElement("details");
    card.className = "overview-card";
    const summary = document.createElement("summary");
    const title = document.createElement("div");
    title.className = "overview-title";
    title.textContent = disease.name;
    const meta = document.createElement("div");
    meta.className = "overview-meta";
    const category = document.createElement("span");
    category.className = "chip";
    category.textContent = disease.category;
    const priority = document.createElement("span");
    priority.className = "priority-pill";
    priority.textContent = disease.priorityLabel || PRIORITY_LABELS[disease.priority];
    meta.append(category, priority);
    summary.append(title, meta);
    card.appendChild(summary);

    (disease.sections || []).forEach((section) => {
      if (state.filters.sections.size && !state.filters.sections.has(section.title)) return;
      const block = document.createElement("div");
      block.className = "section-block";
      const heading = document.createElement("h4");
      heading.textContent = section.title;
      const content = document.createElement("p");
      content.textContent = section.content;
      block.append(heading, content);
      card.appendChild(block);
    });

    elements.overviewList.appendChild(card);
  });
}

function updateInsights() {
  const allCards = buildCardPool(state.data.diseases);
  let strong = 0;
  let mid = 0;
  let weak = 0;
  allCards.forEach((card) => {
    const bucket = getMasteryBucket(getMasteryScore(card.id));
    if (bucket === "strong") strong += 1;
    else if (bucket === "mid") mid += 1;
    else weak += 1;
  });

  if (elements.insightStrong) elements.insightStrong.textContent = strong;
  if (elements.insightMid) elements.insightMid.textContent = mid;
  if (elements.insightWeak) elements.insightWeak.textContent = weak;
  if (elements.insightGoal) elements.insightGoal.textContent = state.settings.deckSize;
}

function updateUI() {
  const counts = buildCounts(state.data);
  renderChips(elements.categoryChips, state.available.categories, state.filters.categories, counts.categories);
  renderPriorityChips(
    elements.priorityChips,
    getVisiblePriorities(),
    state.filters.priorities,
    counts.priorities
  );
  renderChips(elements.weightChips, state.available.weights, state.filters.weights, counts.weights);
  renderChips(elements.sectionChips, state.available.sections, state.filters.sections, counts.sections);

  const diseases = getFilteredDiseases();
  const pool = buildCardPool(diseases);

  if (elements.poolCount) elements.poolCount.textContent = `${pool.length} kort`;
  if (elements.diseaseCount) elements.diseaseCount.textContent = `${diseases.length} sygdomme`;

  updateSummaryCards(pool);
  renderOverview(diseases);
}

function refreshSessionFromFilters() {
  updateUI();
  startSession();
}

function startSession({ scroll = false } = {}) {
  if (!state.data) return;
  const diseases = getFilteredDiseases();
  const pool = buildCardPool(diseases);
  state.deck = buildDeck(pool);
  state.currentIndex = 0;
  state.sessionComplete = false;
  state.answerRevealed = false;
  renderCard();
  updateSummaryCards(pool);
  if (scroll && elements.studyMode) {
    elements.studyMode.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setMode(mode) {
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  elements.studyMode.classList.toggle("hidden", mode !== "study");
  elements.overviewMode.classList.toggle("hidden", mode !== "overview");
}

function attachEvents() {
  if (elements.studioHumanBtn) {
    elements.studioHumanBtn.addEventListener("click", () => {
      void navigateToStudio("human");
    });
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      refreshSessionFromFilters();
    });
  }

  if (elements.includeExcludedToggle) {
    elements.includeExcludedToggle.addEventListener("change", (event) => {
      state.settings.includeExcluded = event.target.checked;
      resetFilters();
      refreshSessionFromFilters();
      saveSettings();
    });
  }

  if (elements.deckSizeRange) {
    elements.deckSizeRange.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      state.settings.deckSize = value;
      elements.deckSizeLabel.textContent = `${value} kort`;
      updateInsights();
      startSession();
      saveSettings();
    });
  }

  if (elements.togglePriorityWeight) {
    elements.togglePriorityWeight.addEventListener("change", (event) => {
      state.settings.weightByPriority = event.target.checked;
      startSession();
      saveSettings();
    });
  }

  if (elements.toggleFocusWeak) {
    elements.toggleFocusWeak.addEventListener("change", (event) => {
      state.settings.focusWeak = event.target.checked;
      startSession();
      saveSettings();
    });
  }

  if (elements.toggleShuffle) {
    elements.toggleShuffle.addEventListener("change", (event) => {
      state.settings.shuffleDeck = event.target.checked;
      startSession();
      saveSettings();
    });
  }

  if (elements.resetFiltersBtn) {
    elements.resetFiltersBtn.addEventListener("click", () => {
      resetFilters();
      refreshSessionFromFilters();
    });
  }

  if (elements.revealBtn) {
    elements.revealBtn.addEventListener("click", handleReveal);
  }

  if (elements.skipBtn) {
    elements.skipBtn.addEventListener("click", () => {
      goToNextCard();
    });
  }

  if (elements.newSessionBtn) {
    elements.newSessionBtn.addEventListener("click", () => {
      startSession();
    });
  }

  if (elements.ratingRow) {
    elements.ratingRow.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-score]");
      if (!button) return;
      const score = Number(button.dataset.score || 0);
      handleRating(score);
    });
  }

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });

  if (elements.expandAllBtn) {
    elements.expandAllBtn.addEventListener("click", () => {
      const cards = elements.overviewList.querySelectorAll("details");
      const shouldOpen = [...cards].some((card) => !card.open);
      cards.forEach((card) => {
        card.open = shouldOpen;
      });
      elements.expandAllBtn.textContent = shouldOpen ? "Fold alle ind" : "Fold alle ud";
    });
  }

  if (elements.resetProgressBtn) {
    elements.resetProgressBtn.addEventListener("click", () => {
      const confirmReset = window.confirm(
        "Vil du nulstille progressionen? Det kan ikke fortrydes."
      );
      if (!confirmReset) return;
      state.mastery = {};
      saveMastery();
      updateInsights();
      updateUI();
      renderCard();
    });
  }

  if (elements.selectAllCategories) {
    elements.selectAllCategories.addEventListener("click", () => {
      state.filters.categories = new Set(state.available.categories);
      refreshSessionFromFilters();
    });
  }

  if (elements.selectPriorityHigh) {
    elements.selectPriorityHigh.addEventListener("click", () => {
      state.filters.priorities = new Set(["high"]);
      refreshSessionFromFilters();
    });
  }

  if (elements.selectAllWeights) {
    elements.selectAllWeights.addEventListener("click", () => {
      state.filters.weights = new Set(state.available.weights);
      refreshSessionFromFilters();
    });
  }

  if (elements.selectCoreSections) {
    elements.selectCoreSections.addEventListener("click", () => {
      applyCoreSections();
      refreshSessionFromFilters();
    });
  }
}

function syncSettingsToUI() {
  if (elements.deckSizeRange) elements.deckSizeRange.value = state.settings.deckSize;
  if (elements.deckSizeLabel) elements.deckSizeLabel.textContent = `${state.settings.deckSize} kort`;
  if (elements.includeExcludedToggle) {
    elements.includeExcludedToggle.checked = state.settings.includeExcluded;
  }
  if (elements.togglePriorityWeight) {
    elements.togglePriorityWeight.checked = state.settings.weightByPriority;
  }
  if (elements.toggleFocusWeak) {
    elements.toggleFocusWeak.checked = state.settings.focusWeak;
  }
  if (elements.toggleShuffle) {
    elements.toggleShuffle.checked = state.settings.shuffleDeck;
  }
}

async function init() {
  const redirected = await initStudioSession();
  if (redirected) return;
  try {
    const response = await fetch("data/sygdomslaere.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Kunne ikke hente data");
    state.data = await response.json();
  } catch (error) {
    console.error(error);
    elements.cardPrompt.textContent = "Kunne ikke hente sygdomsdata.";
    return;
  }

  buildAvailableFilters(state.data);
  resetFilters();
  syncSettingsToUI();
  attachEvents();
  updateUI();
  updateInsights();
  startSession();

  if (elements.statDiseases) elements.statDiseases.textContent = state.data.diseases.length;
  if (elements.statSections) elements.statSections.textContent = state.available.sections.length;
  if (elements.statCategories) elements.statCategories.textContent = state.available.categories.length;
}

init();
