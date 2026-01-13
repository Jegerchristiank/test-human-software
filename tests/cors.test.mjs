import { describe, it, expect, vi, afterEach } from "vitest";

const baseEnv = { ...process.env };

function resetEnv() {
  Object.keys(process.env).forEach((key) => {
    if (!(key in baseEnv)) {
      delete process.env[key];
    }
  });
  Object.entries(baseEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

async function loadCorsModule(env = {}) {
  resetEnv();
  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  vi.resetModules();
  return import("../api/_lib/cors.js");
}

async function loadResponseModule(env = {}) {
  resetEnv();
  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  vi.resetModules();
  return import("../api/_lib/response.js");
}

function buildRes() {
  const headers = new Map();
  return {
    req: null,
    statusCode: 0,
    endCalled: false,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase());
    },
    end() {
      this.endCalled = true;
    },
  };
}

afterEach(() => {
  resetEnv();
});

describe("applyCorsHeaders", () => {
  it("allows the default production origin", async () => {
    const { applyCorsHeaders } = await loadCorsModule({ NODE_ENV: "production" });
    const req = { headers: { origin: "https://biologistudio.dk/" } };
    const res = buildRes();
    const allowed = applyCorsHeaders(req, res);
    expect(allowed).toBe(true);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBe("https://biologistudio.dk");
  });

  it("denies unknown origins", async () => {
    const { applyCorsHeaders } = await loadCorsModule({ NODE_ENV: "production" });
    const req = { headers: { origin: "https://evil.example" } };
    const res = buildRes();
    const allowed = applyCorsHeaders(req, res);
    expect(allowed).toBe(false);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  });

  it("accepts origins from CORS_ALLOW_ORIGINS", async () => {
    const { applyCorsHeaders } = await loadCorsModule({
      NODE_ENV: "production",
      CORS_ALLOW_ORIGINS: "https://example.com",
    });
    const req = { headers: { origin: "https://example.com" } };
    const res = buildRes();
    const allowed = applyCorsHeaders(req, res);
    expect(allowed).toBe(true);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBe("https://example.com");
  });
});

describe("sendError preflight handling", () => {
  it("responds to OPTIONS with 204 for allowed origins", async () => {
    const { sendError } = await loadResponseModule({ NODE_ENV: "production" });
    const res = buildRes();
    res.req = { method: "OPTIONS", headers: { origin: "https://biologistudio.dk" } };
    res.setHeader("Allow", "POST");
    sendError(res, 405, "Method not allowed");
    expect(res.statusCode).toBe(204);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBe("https://biologistudio.dk");
    expect(res.getHeader("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(res.endCalled).toBe(true);
  });

  it("rejects OPTIONS for disallowed origins", async () => {
    const { sendError } = await loadResponseModule({ NODE_ENV: "production" });
    const res = buildRes();
    res.req = { method: "OPTIONS", headers: { origin: "https://evil.example" } };
    res.setHeader("Allow", "GET");
    sendError(res, 405, "Method not allowed");
    expect(res.statusCode).toBe(403);
    expect(res.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
    expect(res.endCalled).toBe(true);
  });
});
