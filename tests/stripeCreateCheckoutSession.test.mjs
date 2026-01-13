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

function createStripeMock({ pricesById, session, customer, calls }) {
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
      checkout: {
        sessions: {
          create: vi.fn(async (payload) => {
            calls.sessionPayload = payload;
            return session;
          }),
        },
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
  const resolved = require.resolve("../api/stripe/create-checkout-session.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("stripe create-checkout-session", () => {
  it("includes MobilePay for lifetime checkout when configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_PRICE_ID = "price_sub";
    process.env.STRIPE_LIFETIME_PRICE_ID = "price_life";
    process.env.STRIPE_PAYMENT_METHOD_TYPES = "card,mobilepay";
    process.env.STRIPE_BASE_URL = "https://example.com/";

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
            recurring: null,
          },
        },
        customer: { id: "cus_test" },
        session: { id: "cs_test", url: "https://checkout.test/session" },
        calls,
      },
      supabaseMock,
    });

    const req = createReq({ planType: "lifetime" });
    const res = createRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.url).toBe("https://checkout.test/session");
    expect(calls.sessionPayload.mode).toBe("payment");
    expect(calls.sessionPayload.payment_method_types).toEqual(["card", "mobilepay"]);
    expect(calls.sessionPayload.payment_intent_data?.metadata).toEqual({
      user_id: "user-1",
      purchase_type: "lifetime",
    });
    expect(supabaseCalls.profileUpdates[0]).toEqual({ stripe_customer_id: "cus_test" });
  });
});
