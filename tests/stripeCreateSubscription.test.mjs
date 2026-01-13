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

function createStripeMock({ pricesById, subscription, paymentIntent, customer, calls }) {
  return function StripeMock() {
    return {
      customers: {
        create: vi.fn(async (payload) => {
          calls.customerPayload = payload;
          return customer;
        }),
      },
      prices: {
        retrieve: vi.fn(async (priceId) => {
          calls.priceIds.push(priceId);
          return pricesById[priceId] || null;
        }),
      },
      subscriptions: {
        create: vi.fn(async (payload) => {
          calls.subscriptionPayload = payload;
          return subscription;
        }),
      },
      paymentIntents: {
        create: vi.fn(async (payload) => {
          calls.paymentIntentPayload = payload;
          return paymentIntent;
        }),
      },
    };
  };
}

function setupMocks({ stripeConfig, supabaseMock } = {}) {
  stubModule("stripe", createStripeMock(stripeConfig));
  stubModule("../api/_lib/auth.js", {
    getUserFromRequest: vi.fn(async () => ({
      user: { id: "user-1", email: "user@example.com" },
      error: null,
    })),
    getProfileForUser: vi.fn(async () => ({
      id: "user-1",
      plan: "free",
      stripe_customer_id: null,
    })),
    getActiveSubscription: vi.fn(async () => null),
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
  const resolved = require.resolve("../api/stripe/create-subscription.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("stripe create-subscription", () => {
  it("rejects non-recurring subscription prices", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_PRICE_ID = "price_sub";
    process.env.STRIPE_LIFETIME_PRICE_ID = "price_life";
    process.env.STRIPE_PAYMENT_METHOD_TYPES = "card";

    const calls = { priceIds: [] };
    const supabaseCalls = { profileUpdates: [] };
    const supabaseMock = {
      from: () => ({
        update: (payload) => {
          supabaseCalls.profileUpdates.push(payload);
          return { eq: async () => ({ data: null, error: null }) };
        },
      }),
    };

    const handler = await loadHandler({
      stripeConfig: {
        pricesById: {
          price_sub: { id: "price_sub", currency: "dkk", recurring: null },
        },
        customer: { id: "cus_test" },
        paymentIntent: { id: "pi_test", client_secret: "secret" },
        subscription: null,
        calls,
      },
      supabaseMock,
    });

    const req = createReq({ planType: "subscription" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("price_not_recurring");
    expect(supabaseCalls.profileUpdates[0]).toEqual({ stripe_customer_id: "cus_test" });
  });

  it("creates a subscription for recurring prices", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_PRICE_ID = "price_sub";
    process.env.STRIPE_LIFETIME_PRICE_ID = "price_life";
    process.env.STRIPE_PAYMENT_METHOD_TYPES = "card";

    const calls = { priceIds: [] };
    const supabaseCalls = { profileUpdates: [] };
    const supabaseMock = {
      from: () => ({
        update: (payload) => {
          supabaseCalls.profileUpdates.push(payload);
          return { eq: async () => ({ data: null, error: null }) };
        },
      }),
    };

    const subscription = {
      id: "sub_live",
      latest_invoice: {
        payment_intent: { client_secret: "pi_secret" },
      },
    };

    const handler = await loadHandler({
      stripeConfig: {
        pricesById: {
          price_sub: {
            id: "price_sub",
            currency: "dkk",
            unit_amount: 17900,
            recurring: { interval: "month", interval_count: 1 },
            product: { name: "Pro", description: "Abonnement" },
          },
        },
        customer: { id: "cus_live" },
        paymentIntent: null,
        subscription,
        calls,
      },
      supabaseMock,
    });

    const req = createReq({ planType: "subscription" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.clientSecret).toBe("pi_secret");
    expect(payload.subscriptionId).toBe("sub_live");
    expect(payload.price.currency).toBe("dkk");
    expect(calls.subscriptionPayload.items).toEqual([{ price: "price_sub" }]);
    expect(calls.subscriptionPayload.metadata).toEqual({ user_id: "user-1" });
    expect(calls.subscriptionPayload.payment_settings).toEqual({ payment_method_types: ["card"] });
    expect(supabaseCalls.profileUpdates[0]).toEqual({ stripe_customer_id: "cus_live" });
  });

  it("creates a payment intent for lifetime prices", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_PRICE_ID = "price_sub";
    process.env.STRIPE_LIFETIME_PRICE_ID = "price_life";
    process.env.STRIPE_PAYMENT_METHOD_TYPES = "card";

    const calls = { priceIds: [] };
    const supabaseCalls = { profileUpdates: [] };
    const supabaseMock = {
      from: () => ({
        update: (payload) => {
          supabaseCalls.profileUpdates.push(payload);
          return { eq: async () => ({ data: null, error: null }) };
        },
      }),
    };

    const handler = await loadHandler({
      stripeConfig: {
        pricesById: {
          price_life: {
            id: "price_life",
            currency: "dkk",
            unit_amount: 150000,
            recurring: null,
            product: { name: "Pro", description: "Livstid" },
          },
        },
        customer: { id: "cus_live" },
        paymentIntent: { id: "pi_live", client_secret: "secret_live" },
        subscription: null,
        calls,
      },
      supabaseMock,
    });

    const req = createReq({ planType: "lifetime" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.clientSecret).toBe("secret_live");
    expect(payload.intentId).toBe("pi_live");
    expect(payload.price.currency).toBe("dkk");
    expect(calls.paymentIntentPayload.amount).toBe(150000);
    expect(calls.paymentIntentPayload.currency).toBe("dkk");
    expect(calls.paymentIntentPayload.customer).toBe("cus_live");
    expect(calls.paymentIntentPayload.metadata).toEqual({
      user_id: "user-1",
      purchase_type: "lifetime",
    });
    expect(calls.paymentIntentPayload.payment_method_types).toEqual(["card"]);
    expect(supabaseCalls.profileUpdates[0]).toEqual({ stripe_customer_id: "cus_live" });
  });
});
