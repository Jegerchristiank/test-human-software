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

function createStripeMock({ subscription, paymentIntent } = {}) {
  return function StripeMock() {
    return {
      subscriptions: {
        retrieve: vi.fn(async () => subscription || null),
        list: vi.fn(async () => ({ data: [] })),
      },
      paymentIntents: {
        retrieve: vi.fn(async () => paymentIntent || null),
        list: vi.fn(async () => ({ data: [] })),
      },
    };
  };
}

function setupMocks({ stripeConfig, profile, supabaseMock } = {}) {
  stubModule("stripe", createStripeMock(stripeConfig));
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "user-1", email: "user@example.com" },
      error: null,
    })),
    getProfileForUser: vi.fn(async () => profile),
  });
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
  });
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => supabaseMock,
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq(body, { method = "POST" } = {}) {
  const payload = Buffer.from(JSON.stringify(body ?? {}));
  const req = Readable.from([payload]);
  req.method = method;
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

async function loadHandler(mocks) {
  setupMocks(mocks);
  const resolved = require.resolve("../api/stripe/sync-access.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("stripe sync-access", () => {
  it("syncs an active subscription and upgrades plan", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";

    const supabaseCalls = { profileUpdates: [], subscriptionUpserts: [] };
    const supabaseMock = {
      from: (table) => {
        if (table === "subscriptions") {
          return {
            upsert: async (payload) => {
              supabaseCalls.subscriptionUpserts.push(payload);
              return { data: null, error: null };
            },
          };
        }
        if (table === "profiles") {
          return {
            update: (payload) => {
              supabaseCalls.profileUpdates.push(payload);
              return { eq: async () => ({ data: null, error: null }) };
            },
          };
        }
        return {};
      },
    };

    const subscription = {
      id: "sub_123",
      status: "active",
      customer: "cus_123",
      metadata: { user_id: "user-1" },
      items: { data: [{ price: { id: "price_123" } }] },
      current_period_end: 1735689600,
      cancel_at_period_end: false,
    };

    const handler = await loadHandler({
      stripeConfig: { subscription },
      profile: { id: "user-1", plan: "free", stripe_customer_id: "cus_123" },
      supabaseMock,
    });

    const req = createReq({ planType: "subscription", subscriptionId: "sub_123" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.updated).toBe(true);
    expect(payload.subscription.stripe_subscription_id).toBe("sub_123");
    expect(supabaseCalls.profileUpdates).toContainEqual({ plan: "paid" });
    expect(supabaseCalls.subscriptionUpserts[0].stripe_subscription_id).toBe("sub_123");
  });

  it("syncs a lifetime payment intent and marks lifetime plan", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";

    const supabaseCalls = { profileUpdates: [] };
    const supabaseMock = {
      from: (table) => {
        if (table === "profiles") {
          return {
            update: (payload) => {
              supabaseCalls.profileUpdates.push(payload);
              return { eq: async () => ({ data: null, error: null }) };
            },
          };
        }
        return {};
      },
    };

    const paymentIntent = {
      id: "pi_123",
      status: "succeeded",
      customer: "cus_999",
      metadata: { user_id: "user-1", purchase_type: "lifetime" },
    };

    const handler = await loadHandler({
      stripeConfig: { paymentIntent },
      profile: { id: "user-1", plan: "free", stripe_customer_id: "cus_999" },
      supabaseMock,
    });

    const req = createReq({ planType: "lifetime", paymentIntentId: "pi_123" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.updated).toBe(true);
    expect(payload.plan).toBe("lifetime");
    expect(supabaseCalls.profileUpdates).toContainEqual({ plan: "lifetime" });
  });
});
