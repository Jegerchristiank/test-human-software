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

function setupMocks({
  user = null,
  authError = "missing_token",
  profile = null,
  subscription = null,
  rateLimited = false,
} = {}) {
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({ user, error: authError })),
    getProfileForUser: vi.fn(async () => profile),
    getActiveSubscription: vi.fn(async () => subscription),
  });
  stubModule("../api/_lib/userOpenAiKey.js", {
    hasUserOpenAiKey: vi.fn(async () => false),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => !rateLimited),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq({ body = null, method = "GET", headers = {} } = {}) {
  const payload = body ? Buffer.from(JSON.stringify(body)) : Buffer.from("");
  const req = Readable.from([payload]);
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
    getHeader(key) {
      return this.headers[key];
    },
    end(body) {
      this.body = body;
    },
  };
}

async function callHandler(handler, options) {
  const req = createReq(options);
  const res = createRes();
  await handler(req, res);
  return res;
}

async function loadHandler(path, mocks) {
  setupMocks(mocks);
  const resolved = require.resolve(path);
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("routing and auth integration", () => {
  it("blocks unsupported methods", async () => {
    const handler = await loadHandler("../api/me.js");
    const res = await callHandler(handler, { method: "POST" });
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("GET");
  });

  it("requires authentication for /api/me", async () => {
    const handler = await loadHandler("../api/me.js", { user: null, authError: "missing_token" });
    const res = await callHandler(handler, { method: "GET" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(401);
    expect(payload.error).toBe("unauthenticated");
  });

  it("returns profile payload when authenticated", async () => {
    const handler = await loadHandler("../api/me.js", {
      user: { id: "user-1", email: "user@example.com", user_metadata: { full_name: "User" } },
      authError: null,
      profile: { id: "user-1", plan: "free" },
      subscription: { id: "sub-1", status: "active" },
    });
    const res = await callHandler(handler, { method: "GET" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.user.id).toBe("user-1");
    expect(payload.profile.plan).toBe("free");
    expect(payload.subscription.status).toBe("active");
  });
});
