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

async function loadRateLimitModule(env = {}) {
  resetEnv();
  Object.entries(env).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
  vi.resetModules();
  const mod = await import("../api/_lib/rateLimit.js");
  return mod.getClientIp;
}

function buildReq({ remoteAddress = "10.0.0.5", headers = {} } = {}) {
  return {
    headers,
    socket: { remoteAddress },
  };
}

afterEach(() => {
  resetEnv();
});

describe("rate limit client IP parsing", () => {
  it("ignores forwarded headers when TRUST_PROXY is false", async () => {
    const getClientIp = await loadRateLimitModule({ TRUST_PROXY: "false" });
    const req = buildReq({
      remoteAddress: "10.0.0.5",
      headers: {
        "x-forwarded-for": "203.0.113.9",
        "x-real-ip": "198.51.100.1",
      },
    });
    expect(getClientIp(req)).toBe("10.0.0.5");
  });

  it("prefers x-real-ip when TRUST_PROXY is true", async () => {
    const getClientIp = await loadRateLimitModule({ TRUST_PROXY: "true" });
    const req = buildReq({
      remoteAddress: "10.0.0.5",
      headers: {
        "x-forwarded-for": "203.0.113.9",
        "x-real-ip": "198.51.100.1",
      },
    });
    expect(getClientIp(req)).toBe("198.51.100.1");
  });

  it("uses forwarded headers when TRUST_PROXY is true and real-ip missing", async () => {
    const getClientIp = await loadRateLimitModule({ TRUST_PROXY: "true" });
    const req = buildReq({
      remoteAddress: "10.0.0.5",
      headers: {
        "x-forwarded-for": "unknown, 203.0.113.9, 10.0.0.1",
      },
    });
    expect(getClientIp(req)).toBe("203.0.113.9");
  });

  it("respects TRUST_PROXY_HEADERS order", async () => {
    const getClientIp = await loadRateLimitModule({
      TRUST_PROXY: "true",
      TRUST_PROXY_HEADERS: "x-client-ip, x-forwarded-for",
    });
    const req = buildReq({
      remoteAddress: "10.0.0.5",
      headers: {
        "x-client-ip": "198.51.100.8",
        "x-forwarded-for": "203.0.113.9",
      },
    });
    expect(getClientIp(req)).toBe("198.51.100.8");
  });
});
