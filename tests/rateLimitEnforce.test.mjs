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

function setupMocks({ rpcImpl } = {}) {
  stubModule("../api/_lib/supabase.js", {
    getSupabaseAdmin: () => ({
      rpc: rpcImpl,
    }),
  });
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
});

function createReq() {
  return {
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
  };
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

async function loadRateLimit(mocks) {
  setupMocks(mocks);
  const resolved = require.resolve("../api/_lib/rateLimit.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  return require(resolved);
}

describe("rate limit enforcement", () => {
  it("fails closed when the rate limiter errors", async () => {
    const mod = await loadRateLimit({
      rpcImpl: vi.fn(async () => ({ data: null, error: { message: "fail" } })),
    });
    const req = createReq();
    const res = createRes();
    const allowed = await mod.enforceRateLimit(req, res, {
      scope: "test",
      limit: 1,
      windowSeconds: 60,
      userId: null,
    });
    const payload = JSON.parse(res.body);
    expect(allowed).toBe(false);
    expect(res.statusCode).toBe(503);
    expect(payload.error).toBe("rate_limit_unavailable");
  });
});
