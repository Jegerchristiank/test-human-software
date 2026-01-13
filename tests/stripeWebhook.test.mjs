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

function createStripeMock(constructEventImpl) {
  function StripeMock() {
    return {
      webhooks: {
        constructEvent: constructEventImpl,
      },
    };
  }
  return StripeMock;
}

function setupMocks({ constructEventImpl, supabaseMock } = {}) {
  stubModule("stripe", createStripeMock(constructEventImpl || (() => ({}))));
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
    checkRateLimit: vi.fn(async () => ({ allowed: true, error: null })),
  });
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => supabaseMock,
  });
  stubModule("../api/_lib/audit.js", {
    logAuditEvent: vi.fn(async () => {}),
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

async function loadHandler(mocks) {
  setupMocks(mocks);
  const resolved = require.resolve("../api/stripe/webhook.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

describe("stripe webhook", () => {
  it("rejects requests without a Stripe signature", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    const handler = await loadHandler({
      supabaseMock: { from: () => ({}) },
    });
    const req = createReq({ ok: true });
    const res = createRes();

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(payload.error).toBe("Missing signature");
  });

  it("skips duplicate processed events", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    const calls = { profileUpdates: 0 };
    const supabaseMock = {
      from: (table) => {
        if (table === "stripe_webhook_events") {
          return {
            insert: async () => ({ error: { code: "23505" } }),
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { status: "processed" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            update: () => {
              calls.profileUpdates += 1;
              return { eq: async () => ({ data: null, error: null }) };
            },
          };
        }
        return {};
      },
    };

    const event = {
      id: "evt_123",
      type: "checkout.session.completed",
      object: "event",
      livemode: false,
      data: {
        object: {
          client_reference_id: "user-1",
          customer: "cus_123",
          metadata: {},
        },
      },
    };

    const handler = await loadHandler({
      constructEventImpl: () => event,
      supabaseMock,
    });
    const req = createReq(event, { headers: { "stripe-signature": "sig" } });
    const res = createRes();

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.received).toBe(true);
    expect(calls.profileUpdates).toBe(0);
  });

  it("syncs checkout session customers and marks processed", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    const calls = { profileUpdates: [], eventUpdates: [] };
    const supabaseMock = {
      from: (table) => {
        if (table === "stripe_webhook_events") {
          return {
            insert: async () => ({ error: null }),
            update: (payload) => {
              calls.eventUpdates.push(payload);
              return { eq: async () => ({ data: null, error: null }) };
            },
          };
        }
        if (table === "profiles") {
          return {
            update: (payload) => {
              calls.profileUpdates.push(payload);
              return { eq: async () => ({ data: null, error: null }) };
            },
          };
        }
        return {};
      },
    };

    const event = {
      id: "evt_456",
      type: "checkout.session.completed",
      object: "event",
      livemode: false,
      data: {
        object: {
          client_reference_id: "user-2",
          customer: "cus_456",
          metadata: {},
        },
      },
    };

    const handler = await loadHandler({
      constructEventImpl: () => event,
      supabaseMock,
    });
    const req = createReq(event, { headers: { "stripe-signature": "sig" } });
    const res = createRes();

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.received).toBe(true);
    expect(calls.profileUpdates[0]).toEqual({ stripe_customer_id: "cus_456" });
    expect(calls.eventUpdates.some((update) => update.status === "processed")).toBe(true);
  });
});
