const STUDIO_TYPES = Object.freeze({
  human: "human",
  sygdomslaere: "sygdomslaere",
});

const STUDIO_ALIASES = Object.freeze({
  human: STUDIO_TYPES.human,
  "human biologi": STUDIO_TYPES.human,
  humanbiologi: STUDIO_TYPES.human,
  sygdomslaere: STUDIO_TYPES.sygdomslaere,
  sygdom: STUDIO_TYPES.sygdomslaere,
});

const SCORING_POLICY_META = Object.freeze({
  [STUDIO_TYPES.human]: Object.freeze({
    id: "humanbiologi:v1",
    label: "HumanbiologiPolicy",
    allowTypes: Object.freeze(["mcq", "short"]),
    usesRubric: false,
    requiresAi: true,
    usesGrade: true,
  }),
  [STUDIO_TYPES.sygdomslaere]: Object.freeze({
    id: "sygdomslaere:v1",
    label: "SygdomslaerePolicy",
    allowTypes: Object.freeze(["short"]),
    usesRubric: true,
    requiresAi: false,
    usesGrade: false,
  }),
});

const SCORING_POLICY_SCORES = Object.freeze({
  [STUDIO_TYPES.human]: Object.freeze({
    mcq: Object.freeze({ correct: 3, wrong: -1, skip: 0 }),
    weights: Object.freeze({ mcq: 0.5, short: 0.5 }),
    shortFailRatio: 0.5,
  }),
  [STUDIO_TYPES.sygdomslaere]: Object.freeze({
    mcq: Object.freeze({ correct: 3, wrong: -1, skip: 0 }),
    weights: Object.freeze({ mcq: 0, short: 1 }),
    shortFailRatio: 0.5,
  }),
});

const CAPABILITIES = Object.freeze({
  [STUDIO_TYPES.human]: Object.freeze({
    allowMcq: true,
    allowShort: true,
    allowSketch: true,
    allowShuffleOptions: true,
    allowAutoFigureCaptions: true,
  }),
  [STUDIO_TYPES.sygdomslaere]: Object.freeze({
    allowMcq: false,
    allowShort: true,
    allowSketch: false,
    allowShuffleOptions: false,
    allowAutoFigureCaptions: false,
  }),
});

let cachedEngine = null;

function resolveEngine() {
  if (typeof window !== "undefined" && window.StudioEngine) {
    return window.StudioEngine;
  }
  if (cachedEngine) return cachedEngine;
  if (typeof require === "function") {
    try {
      cachedEngine = require("./studio-engine.js");
    } catch (error) {
      cachedEngine = null;
    }
  }
  return cachedEngine;
}

function resolveStudioType(value) {
  const engine = resolveEngine();
  if (engine?.getContract) {
    const contract = engine.getContract(value);
    return contract?.id || STUDIO_TYPES.human;
  }
  if (!value) return STUDIO_TYPES.human;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return STUDIO_TYPES.human;
  return STUDIO_ALIASES[normalized] || STUDIO_TYPES.human;
}

function copyScoringPolicy(policy, meta) {
  return {
    id: meta.id,
    label: meta.label,
    allowTypes: Array.isArray(meta.allowTypes) ? [...meta.allowTypes] : [],
    usesRubric: Boolean(meta.usesRubric),
    requiresAi: Boolean(meta.requiresAi),
    usesGrade: Boolean(meta.usesGrade),
    mcq: { ...policy.mcq },
    weights: { ...policy.weights },
    shortFailRatio: policy.shortFailRatio,
  };
}

function copyCapabilities(capabilities) {
  return {
    allowMcq: Boolean(capabilities.allowMcq),
    allowShort: Boolean(capabilities.allowShort),
    allowSketch: Boolean(capabilities.allowSketch),
    allowShuffleOptions: Boolean(capabilities.allowShuffleOptions),
    allowAutoFigureCaptions: Boolean(capabilities.allowAutoFigureCaptions),
  };
}

function buildFallbackPolicy(studioType) {
  const policy = SCORING_POLICY_SCORES[studioType] || SCORING_POLICY_SCORES[STUDIO_TYPES.human];
  const meta = SCORING_POLICY_META[studioType] || SCORING_POLICY_META[STUDIO_TYPES.human];
  const capabilities = CAPABILITIES[studioType] || CAPABILITIES[STUDIO_TYPES.human];
  const isDisease = studioType === STUDIO_TYPES.sygdomslaere;
  return {
    studioType,
    taskType: isDisease ? "case_structured" : "mixed",
    domains: [],
    hints: isDisease ? { mode: "structured", defaultLevel: 3 } : { mode: "ai" },
    progression: isDisease ? { source: "session_history" } : null,
    scoringPolicy: copyScoringPolicy(policy, meta),
    capabilities: {
      ...copyCapabilities(capabilities),
      hintMode: isDisease ? "structured" : "ai",
    },
  };
}

function getScoringPolicy(value) {
  const engine = resolveEngine();
  if (engine?.getStudioPolicy) {
    return engine.getStudioPolicy(value)?.scoringPolicy;
  }
  const studioType = resolveStudioType(value);
  return buildFallbackPolicy(studioType).scoringPolicy;
}

function getStudioCapabilities(value) {
  const engine = resolveEngine();
  if (engine?.getStudioPolicy) {
    return engine.getStudioPolicy(value)?.capabilities;
  }
  const studioType = resolveStudioType(value);
  const capabilities = CAPABILITIES[studioType] || CAPABILITIES[STUDIO_TYPES.human];
  return copyCapabilities(capabilities);
}

function getStudioPolicy(value) {
  const engine = resolveEngine();
  if (engine?.getStudioPolicy) {
    return engine.getStudioPolicy(value);
  }
  const studioType = resolveStudioType(value);
  return buildFallbackPolicy(studioType);
}

const exported = {
  STUDIO_TYPES,
  resolveStudioType,
  getScoringPolicy,
  getStudioCapabilities,
  getStudioPolicy,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = exported;
}

if (typeof window !== "undefined") {
  window.studioPolicy = exported;
}
