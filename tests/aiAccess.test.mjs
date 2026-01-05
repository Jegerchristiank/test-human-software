import { describe, it, expect } from "vitest";
import aiAccess from "../api/_lib/aiAccess.js";

const { isLikelyOpenAiKey, resolveAiAccess } = aiAccess;

describe("isLikelyOpenAiKey", () => {
  it("accepts plausible keys", () => {
    expect(isLikelyOpenAiKey("sk-test-1234567890".padEnd(25, "x"))).toBe(true);
  });

  it("rejects empty or short keys", () => {
    expect(isLikelyOpenAiKey("")).toBe(false);
    expect(isLikelyOpenAiKey("sk-123")).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isLikelyOpenAiKey(null)).toBe(false);
    expect(isLikelyOpenAiKey(123)).toBe(false);
  });
});

describe("resolveAiAccess", () => {
  it("prefers user key when provided", () => {
    const access = resolveAiAccess({
      userKey: "sk-user-1234567890".padEnd(25, "x"),
      plan: "free",
      serverKey: "sk-server-1234567890".padEnd(25, "x"),
    });
    expect(access.allowed).toBe(true);
    expect(access.mode).toBe("user");
  });

  it("allows paid plan with server key", () => {
    const access = resolveAiAccess({
      plan: "paid",
      serverKey: "sk-server-1234567890".padEnd(25, "x"),
    });
    expect(access.allowed).toBe(true);
    expect(access.mode).toBe("owner");
  });

  it("blocks paid plan when server key missing", () => {
    const access = resolveAiAccess({
      plan: "paid",
      serverKey: "",
    });
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe("missing_key");
  });

  it("blocks free plan without user key", () => {
    const access = resolveAiAccess({
      plan: "free",
      serverKey: "sk-server-1234567890".padEnd(25, "x"),
    });
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe("payment_required");
  });
});
