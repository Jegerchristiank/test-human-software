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
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "user-1", email: "user@example.com", user_metadata: {} },
      error: null,
    })),
    getProfileForUser: vi.fn(async () => ({
      id: "user-1",
      email: "user@example.com",
      full_name: null,
      plan: "free",
      stripe_customer_id: null,
      own_key_enabled: false,
      terms_accepted_at: null,
      privacy_accepted_at: null,
    })),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/userOpenAiKey.js", {
    upsertUserOpenAiKey: vi.fn(async () => true),
    deleteUserOpenAiKey: vi.fn(async () => true),
    hasUserOpenAiKey: vi.fn(async () => true),
  });
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => ({
      from: () => ({
        update: (updates) => ({
          eq: () => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "user-1",
                  email: "user@example.com",
                  full_name: null,
                  plan: "free",
                  stripe_customer_id: null,
                  own_key_enabled: Boolean(updates.own_key_enabled),
                  terms_accepted_at: null,
                  privacy_accepted_at: null,
                },
                error: null,
              }),
            }),
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
  const payload = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from([Buffer.from(payload)]);
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

async function callHandler(handler, body, options = {}) {
  const req = createReq(body, options);
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

describe("own-key API", () => {
  it("rejects short keys", async () => {
    const handler = await loadHandler("../api/own-key.js");
    const res = await callHandler(handler, { openAiKey: "sk-short" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("OpenAI key too short");
  });

  it("saves valid keys", async () => {
    const handler = await loadHandler("../api/own-key.js");
    const key = "sk-test-1234567890".padEnd(25, "x");
    const res = await callHandler(handler, { openAiKey: key });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.status).toBe("saved");
    expect(payload.profile?.own_key_present).toBe(true);
  });

  it("clears keys", async () => {
    const handler = await loadHandler("../api/own-key.js");
    const res = await callHandler(handler, undefined, { method: "DELETE" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.status).toBe("cleared");
  });
});
