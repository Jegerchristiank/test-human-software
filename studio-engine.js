(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  } else {
    root.StudioEngine = engine;
  }
  if (root && !root.studioPolicy) {
    root.studioPolicy = {
      getStudioPolicy: engine.getStudioPolicy,
    };
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const COURSE_ALIASES = {
    "human biologi": "human",
    humanbiologi: "human",
    human: "human",
    sygdomslære: "sygdomslaere",
    sygdomslaere: "sygdomslaere",
    sygdom: "sygdomslaere",
  };

  const DISEASE_DOMAINS = [
    { key: "definition", label: "Definition", core: true },
    { key: "incidence", label: "Forekomst", core: true },
    { key: "pathogenesis", label: "Patogenese", core: true },
    { key: "etiology", label: "Ætiologi", core: true },
    { key: "symptoms", label: "Symptomer og fund", core: true },
    { key: "diagnostics", label: "Diagnostik", core: true },
    { key: "complications", label: "Følgetilstande", core: false },
    { key: "treatment", label: "Behandling", core: true },
    { key: "prevention", label: "Forebyggelse", core: false },
    { key: "prognosis", label: "Prognose", core: false },
  ];

  const DISEASE_DOMAIN_SETS = {
    core: DISEASE_DOMAINS.filter((domain) => domain.core).map((domain) => domain.label),
    core_plus: DISEASE_DOMAINS.filter((domain) =>
      domain.core || ["Følgetilstande", "Forebyggelse", "Prognose"].includes(domain.label)
    ).map((domain) => domain.label),
    full: DISEASE_DOMAINS.map((domain) => domain.label),
  };

  const DOMAIN_GUIDANCE = {
    Definition: "Start med den præcise definition og afgrænsning.",
    Forekomst: "Angiv prævalens/incidens, alder og køn hvis relevant.",
    Patogenese: "Forklar de vigtigste mekanismer og sygdomsforløb.",
    Ætiologi: "Beskriv årsager og udløsende faktorer.",
    "Symptomer og fund": "Nævn de typiske symptomer og kliniske fund.",
    Diagnostik: "Fremhæv centrale undersøgelser og kriterier.",
    Følgetilstande: "Nævn vigtige komplikationer eller følgetilstande.",
    Behandling: "Skitsér hovedlinjer i behandling og evt. 1. valg.",
    Forebyggelse: "Nævn relevante forebyggende tiltag.",
    Prognose: "Angiv forventet forløb og prognose.",
  };

  const KEYWORD_STOPWORDS = new Set([
    "og",
    "i",
    "på",
    "af",
    "til",
    "for",
    "med",
    "hos",
    "som",
    "det",
    "den",
    "der",
    "de",
    "en",
    "et",
    "er",
    "har",
    "kan",
    "ikke",
    "ved",
    "samt",
    "eller",
    "fra",
    "over",
    "under",
    "mellem",
    "ofte",
    "typisk",
    "ofte",
    "særligt",
  ]);

  const CONTRACTS = {
    human: {
      id: "human",
      version: "2026-01-11",
      taskType: "mixed",
      capabilities: {
        mcq: true,
        short: true,
        sketch: true,
        hints: "ai",
      },
      hints: {
        mode: "ai",
      },
    },
    sygdomslaere: {
      id: "sygdomslaere",
      version: "2026-01-11",
      taskType: "case_structured",
      capabilities: {
        mcq: false,
        short: true,
        sketch: false,
        hints: "structured",
      },
      domains: DISEASE_DOMAINS,
      hints: {
        mode: "structured",
        defaultLevel: 3,
        levels: [
          { level: 0, label: "Ingen hints", description: "Ingen hjælp vises." },
          { level: 1, label: "Nøgleord", description: "Kort nøgleords-hint." },
          { level: 2, label: "Forklaring", description: "Forklarende hint med fokus og nøgleord." },
          { level: 3, label: "Mini-modelsvar", description: "Kort modelleret svarudsnit." },
        ],
      },
      progression: {
        source: "session_history",
        window: 3,
        lockDomains: false,
        defaults: {
          hintLevel: 3,
          domainSetKey: "core",
          label: "Begynder",
        },
        levels: [
          { min: 0, max: 59.9, hintLevel: 3, domainSetKey: "core", label: "Begynder" },
          { min: 60, max: 74.9, hintLevel: 2, domainSetKey: "core_plus", label: "Øvet" },
          { min: 75, max: 87.9, hintLevel: 1, domainSetKey: "full", label: "Avanceret" },
          { min: 88, max: 100, hintLevel: 0, domainSetKey: "full", label: "Ekspert" },
        ],
        domainSets: DISEASE_DOMAIN_SETS,
      },
    },
  };

  const SCORING_POLICY_META = {
    human: {
      id: "humanbiologi:v1",
      label: "HumanbiologiPolicy",
      allowTypes: ["mcq", "short"],
      usesRubric: false,
      requiresAi: true,
      usesGrade: true,
      weight: { mcq: 0.5, short: 0.5 },
    },
    sygdomslaere: {
      id: "sygdomslaere:v1",
      label: "SygdomslaerePolicy",
      allowTypes: ["short"],
      usesRubric: true,
      requiresAi: false,
      usesGrade: false,
      weight: { mcq: 0, short: 1 },
    },
  };

  function normalizeCourseId(courseId) {
    const cleaned = String(courseId || "").trim().toLowerCase();
    if (!cleaned) return "human";
    return COURSE_ALIASES[cleaned] || cleaned;
  }

  function getContract(courseId) {
    const normalized = normalizeCourseId(courseId);
    return CONTRACTS[normalized] || CONTRACTS.human;
  }

  function getDomainOrder(courseId) {
    const contract = getContract(courseId);
    if (!contract?.domains) return [];
    return contract.domains.map((domain) => domain.label);
  }

  function getDomainSets(courseId) {
    const contract = getContract(courseId);
    if (contract?.progression?.domainSets) {
      return contract.progression.domainSets;
    }
    return { full: getDomainOrder(courseId) };
  }

  function resolveHistoryScore(entry) {
    const raw = entry?.shortPercent ?? entry?.overallPercent;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return null;
    return Math.max(0, Math.min(numeric, 100));
  }

  function deriveProgressionProfile(courseId, historyEntries = []) {
    const contract = getContract(courseId);
    const progression = contract?.progression;
    const hintDefaults = contract?.hints?.defaultLevel ?? 0;
    const domainSets = getDomainSets(courseId);
    const fallbackDomainSet = domainSets.full || [];

    if (!progression) {
      return {
        courseId: contract.id,
        hintLevel: hintDefaults,
        domainSetKey: "full",
        domainLabels: fallbackDomainSet,
        tier: "Standard",
        average: null,
      };
    }

    const windowed = Array.isArray(historyEntries)
      ? historyEntries.slice(-Math.max(1, progression.window || 3))
      : [];
    const scores = windowed.map(resolveHistoryScore).filter((value) => value !== null);
    const average = scores.length
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : null;

    let selected = progression.defaults || {};
    if (average !== null) {
      const match = progression.levels.find(
        (level) => average >= level.min && average <= level.max
      );
      if (match) selected = match;
    }

    const domainSetKey = selected.domainSetKey || "full";
    const domainLabels = domainSets[domainSetKey] || fallbackDomainSet;
    const hintLevel =
      Number.isFinite(selected.hintLevel) ? selected.hintLevel : hintDefaults;

    return {
      courseId: contract.id,
      hintLevel,
      domainSetKey,
      domainLabels,
      tier: selected.label || "",
      average,
    };
  }

  function extractKeywords(text, { max = 6, minLength = 4 } = {}) {
    const tokens = String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .match(/[a-zæøå0-9%+\-]+/gi);
    if (!tokens) return [];
    const keywords = [];
    tokens.forEach((token) => {
      const normalized = token.toLowerCase();
      if (normalized.length < minLength) return;
      if (KEYWORD_STOPWORDS.has(normalized)) return;
      if (keywords.includes(normalized)) return;
      keywords.push(normalized);
    });
    return keywords.slice(0, max);
  }

  function buildMiniModelAnswer(text, { maxLength = 260 } = {}) {
    const cleaned = String(text || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return "";
    const sentences = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
    const snippet = sentences.slice(0, 2).join(" ").trim();
    if (snippet.length <= maxLength) return snippet;
    return `${snippet.slice(0, maxLength).trim()}…`;
  }

  function buildStructuredHint({ level, domainLabel, modelAnswer }) {
    const safeLevel = Number(level) || 0;
    if (safeLevel <= 0) return "";
    const safeAnswer = String(modelAnswer || "").trim();
    const domainHint = DOMAIN_GUIDANCE[domainLabel] || "Fokusér på det vigtigste.";
    const keywords = extractKeywords(safeAnswer, { max: 6 });
    const keywordText = keywords.length ? `Nøgleord: ${keywords.join(", ")}.` : "";

    if (safeLevel === 1) {
      return keywordText || domainHint;
    }
    if (safeLevel === 2) {
      return `${domainHint}${keywordText ? ` ${keywordText}` : ""}`;
    }
    const miniAnswer = buildMiniModelAnswer(safeAnswer);
    return miniAnswer ? `Mini-modelsvar: ${miniAnswer}` : domainHint;
  }

  function getStudioPolicy(courseId) {
    const contract = getContract(courseId);
    const allowMcq = Boolean(contract.capabilities?.mcq);
    const allowShort = contract.capabilities?.short !== false;
    const allowSketch = Boolean(contract.capabilities?.sketch);
    const hintMode = contract.hints?.mode || contract.capabilities?.hints || "ai";
    const isDisease = contract.id === "sygdomslaere";
    const policyMeta = SCORING_POLICY_META[contract.id] || SCORING_POLICY_META.human;
    return {
      studioType: contract.id,
      taskType: contract.taskType,
      domains: contract.domains ? contract.domains.map((domain) => domain.label) : [],
      hints: contract.hints || null,
      progression: contract.progression || null,
      scoringPolicy: {
        id: policyMeta.id,
        label: policyMeta.label,
        allowTypes: policyMeta.allowTypes,
        usesRubric: policyMeta.usesRubric,
        requiresAi: policyMeta.requiresAi,
        usesGrade: policyMeta.usesGrade,
        mcq: { correct: 3, wrong: -1, skip: 0 },
        weights: policyMeta.weight,
        shortFailRatio: 0.5,
      },
      capabilities: {
        allowMcq,
        allowShort,
        allowSketch,
        allowShuffleOptions: allowMcq,
        allowAutoFigureCaptions: allowMcq,
        hintMode,
      },
    };
  }

  return {
    getContract,
    getStudioPolicy,
    getDomainOrder,
    getDomainSets,
    deriveProgressionProfile,
    buildStructuredHint,
    extractKeywords,
  };
});
