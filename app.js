const state = {
  allQuestions: [],
  activeQuestions: [],
  currentIndex: 0,
  score: 0,
  startTime: null,
  locked: false,
  results: [],
  bestScore: Number(localStorage.getItem("ku_mcq_best_score") || 0),
};

const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
};

const elements = {
  startButtons: [
    document.getElementById("start-btn"),
    document.getElementById("start-btn-secondary"),
    document.getElementById("modal-start-btn"),
  ],
  rulesButton: document.getElementById("rules-btn"),
  closeModal: document.getElementById("close-modal"),
  modal: document.getElementById("rules-modal"),
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
  backToMenu: document.getElementById("back-to-menu"),
  finalScore: document.getElementById("final-score"),
  finalMessage: document.getElementById("final-message"),
  statCorrect: document.getElementById("stat-correct"),
  statWrong: document.getElementById("stat-wrong"),
  statSkipped: document.getElementById("stat-skipped"),
  statPace: document.getElementById("stat-pace"),
  bestBadge: document.getElementById("best-badge"),
  playAgainBtn: document.getElementById("play-again-btn"),
  returnMenuBtn: document.getElementById("return-menu-btn"),
  questionCountChip: document.getElementById("question-count-chip"),
  reviewList: document.getElementById("review-list"),
};

const FEEDBACK = [
  { min: 50, text: "Du er i topform! Eksamen bliver en leg." },
  { min: 30, text: "Stærkt arbejde – du er godt på vej." },
  { min: 10, text: "Solid indsats, hold tempoet og finpuds detaljerne." },
  { min: -100, text: "Fortsæt øvelsen, og brug 'spring over' strategisk." },
];

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
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickQuestions(count) {
  const shuffled = shuffle(state.allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function formatTempo() {
  if (!state.startTime) return "—";
  const elapsed = (Date.now() - state.startTime) / 1000;
  const perQuestion = elapsed / Math.max(1, state.results.length || state.currentIndex || 1);
  return `${perQuestion.toFixed(1)}s / spørgsmål`;
}

function updateTopBar() {
  const total = state.activeQuestions.length || 24;
  elements.progressText.textContent = `${Math.min(state.currentIndex + 1, total)} / ${total}`;
  elements.progressFill.style.width = `${(state.currentIndex / total) * 100}%`;
  elements.scoreValue.textContent = state.score;
  elements.bestScoreValue.textContent = state.bestScore;
  elements.tempoText.textContent = `Tempo: ${formatTempo()}`;
}

function clearOptions() {
  elements.optionsContainer.innerHTML = "";
}

function renderQuestion() {
  state.locked = false;
  elements.nextBtn.disabled = true;
  elements.skipBtn.disabled = false;
  elements.feedbackArea.textContent = "";
  clearOptions();

  const currentQuestion = state.activeQuestions[state.currentIndex];
  if (!currentQuestion) return;

  elements.questionCategory.textContent = currentQuestion.category;
  elements.questionYear.textContent = `År ${currentQuestion.year}`;
  elements.questionNumber.textContent = `#${currentQuestion.number}`;
  elements.questionText.textContent = currentQuestion.text;

  currentQuestion.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.label = option.label;
    btn.innerHTML = `<span class="label">${option.label}</span>${option.text}`;
    btn.addEventListener("click", () => handleAnswer(option.label));
    elements.optionsContainer.appendChild(btn);
  });

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
  elements.feedbackArea.textContent = isCorrect
    ? "Korrekt! +3 point"
    : `Forkert. Rigtigt svar: ${question.correctLabel} (+0), du fik -1`;
  highlightOptions(label, question.correctLabel);
  lockOptions();
  elements.nextBtn.disabled = false;
  elements.skipBtn.disabled = true;
  updateTopBar();
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
  elements.feedbackArea.textContent = "Sprunget over – ingen point ændret.";
  state.locked = true;
  elements.nextBtn.disabled = false;
  elements.skipBtn.disabled = true;
  lockOptions();
  updateTopBar();
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

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${index + 1}. ${entry.question.text}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${entry.question.category} • ${entry.question.year}`;

    const answer = document.createElement("div");
    answer.className = "meta";
    if (entry.skipped) {
      answer.textContent = "Sprunget over";
    } else if (entry.isCorrect) {
      answer.textContent = `Korrekt (${entry.question.correctLabel})`;
    } else {
      answer.textContent = `Forkert (${entry.selected}), korrekt var ${entry.question.correctLabel}`;
    }

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(answer);
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

  const isNewBest = state.score > state.bestScore;
  if (isNewBest) {
    state.bestScore = state.score;
    localStorage.setItem("ku_mcq_best_score", String(state.bestScore));
  }
  elements.bestBadge.style.display = isNewBest ? "inline-flex" : "none";
  elements.bestScoreValue.textContent = state.bestScore;

  buildReviewList(state.results);
  showScreen("result");
}

function startGame() {
  if (!state.allQuestions.length) return;
  hideRules();
  state.activeQuestions = pickQuestions(24);
  state.currentIndex = 0;
  state.score = 0;
  state.results = [];
  state.startTime = Date.now();
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
  showScreen("start");
}

async function loadQuestions() {
  const res = await fetch("data/questions.json");
  const data = await res.json();
  state.allQuestions = data;
  elements.questionCountChip.textContent = `${data.length} spørgsmål klar`;
}

function attachEvents() {
  elements.startButtons.forEach((btn) => btn.addEventListener("click", startGame));
  elements.skipBtn.addEventListener("click", skipQuestion);
  elements.nextBtn.addEventListener("click", goToNextQuestion);
  elements.rulesButton.addEventListener("click", showRules);
  elements.closeModal.addEventListener("click", hideRules);
  elements.backToMenu.addEventListener("click", goToMenu);
  elements.returnMenuBtn.addEventListener("click", goToMenu);
  elements.playAgainBtn.addEventListener("click", startGame);

  elements.modal.addEventListener("click", (evt) => {
    if (evt.target === elements.modal) {
      hideRules();
    }
  });
}

async function init() {
  attachEvents();
  updateTopBar();
  elements.bestScoreValue.textContent = state.bestScore;
  try {
    await loadQuestions();
  } catch (err) {
    console.error("Kunne ikke indlæse spørgsmål", err);
    elements.questionCountChip.textContent = "Fejl: kunne ikke indlæse spørgsmål";
  }
}

document.addEventListener("DOMContentLoaded", init);
