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

function setupMocks({ admin = true, supabase } = {}) {
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
  if (supabase) {
    stubModule("../api/_lib/supabase.js", {
      getSupabaseAdmin: vi.fn(() => supabase),
    });
  }
  stubModule("../api/_lib/userOpenAiKey.js", {
    hasUserOpenAiKey: vi.fn(async () => true),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "POST", headers = {}, url = "/api" } = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  const req = Readable.from(payload ? [Buffer.from(payload)] : []);
  req.method = method;
  req.headers = headers;
  req.url = url;
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

describe("Admin user dashboard endpoints", () => {
  it("rejects non-admin users list", async () => {
    setupMocks({ admin: false });
    const handler = await loadHandler("../api/admin/users.js");
    const res = await callHandler(handler, undefined, {
      method: "GET",
      url: "/api/admin/users?page=1",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(403);
    expect(payload.error).toBe("forbidden");
  });

  it("lists users for admin", async () => {
    const profiles = [
      { id: "user-1", email: "user@example.com", full_name: "User", plan: "free", is_admin: false },
    ];
    const supabase = {
      from() {
        return {
          select() {
            return this;
          },
          order() {
            return this;
          },
          range() {
            return Promise.resolve({ data: profiles, error: null, count: 1 });
          },
          eq() {
            return this;
          },
          ilike() {
            return this;
          },
          is() {
            return this;
          },
          not() {
            return this;
          },
        };
      },
      auth: {
        admin: {
          getUserById: vi.fn(async () => ({
            data: { user: { id: "user-1", email: "user@example.com" } },
            error: null,
          })),
        },
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/users.js");
    const res = await callHandler(handler, undefined, {
      method: "GET",
      url: "/api/admin/users?page=1",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.users.length).toBe(1);
  });

  it("rejects unsafe auth roles on user update", async () => {
    setupMocks({ admin: true, supabase: { auth: { admin: { updateUserById: vi.fn() } }, from: vi.fn() } });
    const handler = await loadHandler("../api/admin/user/update.js");
    const res = await callHandler(handler, {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      auth: { role: "service_role" },
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("invalid_role");
  });

  it("creates users for admins", async () => {
    const createUser = vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null }));
    const insertProfile = vi.fn(async () => ({ error: null }));
    const supabase = {
      auth: { admin: { createUser } },
      from() {
        return { insert: insertProfile };
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/user/create.js");
    const res = await callHandler(handler, {
      email: "new@example.com",
      password: "supersecret",
      invite: false,
      profile: { full_name: "New User" },
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("updates user profile and auth", async () => {
    const authUpdate = vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null }));
    const profileUpsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      auth: { admin: { updateUserById: authUpdate } },
      from() {
        return { upsert: profileUpsert };
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/user/update.js");
    const res = await callHandler(handler, {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      profile: { plan: "paid", is_admin: true },
      auth: { email: "user@example.com" },
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
    expect(authUpdate).toHaveBeenCalled();
  });

  it("bans a user via admin action", async () => {
    const authUpdate = vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null }));
    const profileUpdateEq = vi.fn(async () => ({ error: null }));
    const profileUpdate = vi.fn(() => ({ eq: profileUpdateEq }));
    const supabase = {
      auth: { admin: { updateUserById: authUpdate } },
      from(table) {
        if (table === "profiles") {
          return { update: profileUpdate };
        }
        return { delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) };
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/user/action.js");
    const res = await callHandler(handler, {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      action: "ban",
      reason: "terms breach",
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("hard deletes a user without Stripe cleanup", async () => {
    const deleteEq = vi.fn(async () => ({ error: null }));
    const profileQuery = {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      maybeSingle: vi.fn(async () => ({ data: { stripe_customer_id: null }, error: null })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    };
    const subscriptionsQuery = {
      select() {
        return this;
      },
      eq: vi.fn(async () => ({ data: [], error: null })),
      delete: vi.fn(() => ({ eq: deleteEq })),
    };
    const supabase = {
      auth: { admin: { deleteUser: vi.fn(async () => ({ error: null })) } },
      from(table) {
        if (table === "profiles") return profileQuery;
        if (table === "subscriptions") return subscriptionsQuery;
        return { delete: vi.fn(() => ({ eq: deleteEq })) };
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/user/action.js");
    const res = await callHandler(handler, {
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      action: "delete_hard",
      cancel_stripe: false,
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("upserts subscriptions for admins", async () => {
    const profileSelect = {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      maybeSingle: vi.fn(async () => ({
        data: { plan: "free", stripe_customer_id: "cus_123" },
        error: null,
      })),
    };
    const profileUpdateEq = vi.fn(async () => ({ error: null }));
    const profileUpdate = vi.fn(() => ({ eq: profileUpdateEq }));
    const subscriptionsInsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from(table) {
        if (table === "profiles") {
          return { ...profileSelect, update: profileUpdate };
        }
        if (table === "subscriptions") {
          return { insert: subscriptionsInsert };
        }
        return {};
      },
    };
    setupMocks({ admin: true, supabase });
    const handler = await loadHandler("../api/admin/subscription.js");
    const res = await callHandler(handler, {
      action: "upsert",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      stripe_subscription_id: "sub_123",
      status: "active",
      price_id: "price_123",
      cancel_at_period_end: false,
    });
    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.ok).toBe(true);
  });
});
