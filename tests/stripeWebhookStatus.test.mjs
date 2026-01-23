import { createRequire } from "node:module";
import { describe, it, expect, afterEach, vi } from "vitest";

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

function loadHandler() {
  stubModule("../api/_lib/rateLimit.js", {
    enforceRateLimit: vi.fn(async () => true),
  });
  const resolved = require.resolve("../api/stripe/webhook-status.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  const mod = require(resolved);
  return mod.default || mod;
}

function createReq({ method = "GET", headers = {} } = {}) {
  const req = { method, headers, socket: { remoteAddress: "127.0.0.1" } };
  return req;
}

function createRes(req) {
  return {
    statusCode: 200,
    headers: {},
    req,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_BASE_URL;
});

describe("stripe webhook status", () => {
  it("reports configured webhook endpoint using host header when secrets are set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_live_123";

    const handler = await loadHandler();
    const req = createReq({
      headers: {
        host: "biologistudio.dk",
        "x-forwarded-proto": "https",
      },
    });
    const res = createRes(req);

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.webhookConfigured).toBe(true);
    expect(payload.expectedEndpoint).toBe("https://biologistudio.dk/api/stripe/webhook");
  });

  it("returns not configured when webhook secrets are missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_123";
    process.env.STRIPE_WEBHOOK_SECRET = "";
    process.env.STRIPE_BASE_URL = "https://biologistudio.dk";

    const handler = await loadHandler();
    const req = createReq();
    const res = createRes(req);

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(payload.webhookConfigured).toBe(false);
    expect(payload.expectedEndpoint).toBe("https://biologistudio.dk/api/stripe/webhook");
  });

  it("rejects non-GET methods", async () => {
    const handler = await loadHandler();
    const req = createReq({ method: "POST" });
    const res = createRes(req);

    await handler(req, res);

    const payload = JSON.parse(res.body);
    expect(res.statusCode).toBe(405);
    expect(payload.error).toBe("Method not allowed");
    expect(res.headers.Allow).toBe("GET");
  });
});
