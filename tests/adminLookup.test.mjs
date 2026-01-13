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

function createQueryBuilder(table, responses) {
  const query = {
    _selectArgs: null,
    select(...args) {
      this._selectArgs = args;
      return this;
    },
    eq() {
      return this;
    },
    ilike() {
      return this;
    },
    gte() {
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve(responses.single[table] || { data: null, error: null });
    },
    then(resolve, reject) {
      const response = responses.list[table] || { data: [], error: null };
      const selectArgs = this._selectArgs || [];
      const options = selectArgs[1] || {};
      if (options && options.count) {
        const count = responses.counts[table] ?? 0;
        return Promise.resolve({ count, error: null }).then(resolve, reject);
      }
      return Promise.resolve(response).then(resolve, reject);
    },
  };
  return query;
}

function setupMocks({ admin = true } = {}) {
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "admin-1", email: "admin@example.com" },
      error: null,
    })),
  });
  stubModule("../api/_lib/admin.js", {
    isAdminUser: vi.fn(async () => admin),
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
  });

  const profile = {
    id: "user-1",
    email: "student@example.com",
    full_name: "Student",
    plan: "paid",
    stripe_customer_id: "cus_123",
  };
  const subscriptions = [{
    id: "sub-1",
    user_id: "user-1",
    status: "active",
    stripe_subscription_id: "sub_123",
    created_at: "2026-01-01T00:00:00Z",
  }];
  const userState = { user_id: "user-1", settings: { theme: "light" } };

  const responses = {
    single: {
      profiles: { data: profile, error: null },
      user_state: { data: userState, error: null },
    },
    list: {
      subscriptions: { data: subscriptions, error: null },
      usage_events: { data: [{ id: "usage-1" }], error: null },
      evaluation_logs: { data: [{ id: "eval-1" }], error: null },
      audit_events: { data: [{ id: "audit-1" }], error: null },
    },
    counts: {
      usage_events: 2,
      evaluation_logs: 1,
      audit_events: 1,
    },
  };

  const supabase = {
    from(table) {
      return createQueryBuilder(table, responses);
    },
    auth: {
      admin: {
        getUserById: vi.fn(async () => ({ data: { user: { id: "user-1", email: "student@example.com" } } })),
      },
    },
  };

  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: vi.fn(() => supabase),
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
  const req = Readable.from(payload ? [Buffer.from(payload)] : []);
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
  const resolved = require.resolve(path);
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("Admin lookup endpoint", () => {
  it("rejects non-admin lookup", async () => {
    setupMocks({ admin: false });
    const handler = await loadHandler("../api/admin/lookup.js");
    const res = await callHandler(handler, { mode: "email", query: "student@example.com" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(403);
    expect(payload.error).toBe("forbidden");
  });

  it("rejects invalid lookup mode", async () => {
    setupMocks({ admin: true });
    const handler = await loadHandler("../api/admin/lookup.js");
    const res = await callHandler(handler, { mode: "bad", query: "x" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Invalid lookup mode");
  });

  it("returns profile data for email lookup", async () => {
    setupMocks({ admin: true });
    const handler = await loadHandler("../api/admin/lookup.js");
    const res = await callHandler(handler, { mode: "email", query: "student@example.com" });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.profile?.email).toBe("student@example.com");
    expect(payload.usage?.total).toBe(2);
  });
});
