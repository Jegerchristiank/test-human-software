import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { describe, it, expect, vi, afterEach } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const cachedModules = new Set();

function stubModule(modulePath, exports) {
  const resolved = require.resolve(modulePath);
  const stub = new Module(resolved);
  stub.exports = exports;
  stub.loaded = true;
  require.cache[resolved] = stub;
  cachedModules.add(resolved);
}

function setupMocks() {
  stubModule("../api/_lib/aiGate.js", {
    requireAiAccess: vi.fn(async () => ({
      error: null,
      user: { id: "user-1" },
      access: { key: "test-key", mode: "user" },
    })),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/openai.js", {
    callOpenAiJson: vi.fn(async () => ({
      score: 1,
      feedback: "ok",
      missing: [],
      matched: [],
      explanation: "ok",
      hint: "ok",
    })),
    callOpenAiTts: vi.fn(async () => Buffer.from("audio")),
  });
  stubModule("../api/_lib/usage.js", {
    logUsageEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/evaluationLog.js", {
    logEvaluationEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "user-1" },
      error: null,
    })),
  });
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        upsert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    }),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "POST", headers = {} } = {}) {
  const req = Readable.from([Buffer.from(JSON.stringify(body))]);
  req.method = method;
  req.headers = headers;
  req.socket = { remoteAddress: "127.0.0.1" };
  return req;
}

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

async function callHandler(handler, body) {
  const req = createReq(body);
  const res = createRes();
  await handler(req, res);
  return res;
}

async function loadHandler(path) {
  setupMocks();
  const resolved = require.resolve(path);
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("API validation", () => {
  it("rejects oversized grade prompt", async () => {
    const handler = await loadHandler("../api/grade.js");
    const res = await callHandler(handler, {
      prompt: "a".repeat(3001),
      modelAnswer: "model",
      userAnswer: "answer",
      maxPoints: 5,
      language: "da",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(413);
    expect(payload.error).toBe("Prompt too long");
  });

  it("rejects non-human studio for grade", async () => {
    const handler = await loadHandler("../api/grade.js");
    const res = await callHandler(handler, {
      prompt: "Prompt",
      modelAnswer: "Model",
      userAnswer: "Answer",
      maxPoints: 5,
      language: "da",
      studio: "sygdomslaere",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid studio");
  });

  it("accepts sources array in grade payload", async () => {
    const handler = await loadHandler("../api/grade.js");
    const res = await callHandler(handler, {
      prompt: "Prompt",
      modelAnswer: "Model",
      userAnswer: "Answer",
      maxPoints: 5,
      language: "da",
      sources: ["Pensum: Side 1."],
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.score).toBe(1);
  });

  it("rejects non-array sources for grade", async () => {
    const handler = await loadHandler("../api/grade.js");
    const res = await callHandler(handler, {
      prompt: "Prompt",
      modelAnswer: "Model",
      userAnswer: "Answer",
      maxPoints: 5,
      language: "da",
      sources: "Pensum: side 1",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid sources");
  });

  it("rejects negative awardedPoints in hint", async () => {
    const handler = await loadHandler("../api/hint.js");
    const res = await callHandler(handler, {
      question: "q",
      modelAnswer: "m",
      userAnswer: "u",
      maxPoints: 5,
      awardedPoints: -1,
      language: "da",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid awardedPoints");
  });

  it("rejects too many MCQ options in explain", async () => {
    const handler = await loadHandler("../api/explain.js");
    const options = Array.from({ length: 9 }, (_, index) => ({
      label: String.fromCharCode(65 + index),
      text: `Option ${index + 1}`,
    }));
    const res = await callHandler(handler, {
      type: "mcq",
      question: "q",
      options,
      correctLabel: "A",
      userLabel: "B",
      language: "da",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(413);
    expect(payload.error).toBe("Too many options");
  });

  it("rejects oversized tts text", async () => {
    const handler = await loadHandler("../api/tts.js");
    const res = await callHandler(handler, {
      text: "a".repeat(2001),
      voice: "alloy",
      speed: 1,
      language: "da",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(413);
    expect(payload.error).toBe("Text too long");
  });

  it("rejects unknown fields in user state", async () => {
    const handler = await loadHandler("../api/user-state.js");
    const res = await callHandler(handler, {
      unexpected: "value",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Unknown field: unexpected");
  });

  it("scores rubric deterministically", async () => {
    const handler = await loadHandler("../api/rubric-score.js");
    const res = await callHandler(handler, {
      prompt: "Definition",
      rubric: "Alpha beta. Gamma delta.",
      userAnswer: "alpha",
      maxPoints: 4,
      language: "da",
      studio: "sygdomslaere",
      policyId: "sygdomslaere:v1",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.score).toBe(2);
    expect(payload.rubric.total).toBe(2);
    expect(payload.rubric.matched).toBe(1);
  });
});
