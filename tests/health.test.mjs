import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const cachedModules = new Set();
const originalOpenAiKey = process.env.OPENAI_API_KEY;
const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function stubModule(modulePath, exports) {
  const resolved = require.resolve(modulePath);
  const stub = new Module(resolved);
  stub.exports = exports;
  stub.loaded = true;
  require.cache[resolved] = stub;
  cachedModules.add(resolved);
}

function setupMocks({ user, profile, subscription } = {}) {
  const userValue = user ?? { id: "user-1", email: "user@example.com" };
  const profileValue = profile ?? { plan: "paid", own_key_enabled: false };
  const subscriptionValue = subscription ?? null;

  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({ user: userValue, error: null })),
    getProfileForUser: vi.fn(async () => profileValue),
    getActiveSubscription: vi.fn(async () => subscriptionValue),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/userOpenAiKey.js", {
    fetchUserOpenAiKey: vi.fn(async () => null),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
  if (originalOpenAiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
  if (originalSupabaseUrl === undefined) {
    delete process.env.SUPABASE_URL;
  } else {
    process.env.SUPABASE_URL = originalSupabaseUrl;
  }
  if (originalSupabaseServiceKey === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceKey;
  }
});

function createReq() {
  const req = Readable.from([]);
  req.method = "GET";
  req.headers = {};
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

async function callHandler(handler) {
  const req = createReq();
  const res = createRes();
  await handler(req, res);
  return res;
}

async function loadHandler(options) {
  setupMocks(options);
  const resolved = require.resolve("../api/health.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("/api/health", () => {
  it("returns ok for paid plan with server key", async () => {
    process.env.OPENAI_API_KEY = "sk-test-1234567890".padEnd(25, "x");
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const handler = await loadHandler({
      profile: { plan: "paid", own_key_enabled: false },
    });
    const res = await callHandler(handler);
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.status).toBe("ok");
  });

  it("treats active subscriptions as paid", async () => {
    process.env.OPENAI_API_KEY = "sk-test-1234567890".padEnd(25, "x");
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const handler = await loadHandler({
      profile: { plan: "free", own_key_enabled: false },
      subscription: { status: "active" },
    });
    const res = await callHandler(handler);
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.status).toBe("ok");
  });

  it("returns payment_required for free plan without access", async () => {
    process.env.OPENAI_API_KEY = "sk-test-1234567890".padEnd(25, "x");
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const handler = await loadHandler({
      profile: { plan: "free", own_key_enabled: false },
      subscription: null,
    });
    const res = await callHandler(handler);
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(402);
    expect(payload.status).toBe("payment_required");
  });

  it("returns missing_key for paid plan without server key", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    const handler = await loadHandler({
      profile: { plan: "paid", own_key_enabled: false },
    });
    const res = await callHandler(handler);
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(503);
    expect(payload.status).toBe("missing_key");
  });

  it("returns auth_unavailable when Supabase env is missing", async () => {
    process.env.OPENAI_API_KEY = "sk-test-1234567890".padEnd(25, "x");
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const handler = await loadHandler({
      profile: { plan: "paid", own_key_enabled: false },
    });
    const res = await callHandler(handler);
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(503);
    expect(payload.status).toBe("auth_unavailable");
  });
});
