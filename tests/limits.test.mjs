import { describe, it, expect } from "vitest";
import { LIMITS, clampNumber, isValidLanguage } from "../api/_lib/limits.js";

describe("limits helpers", () => {
  it("clampNumber returns null for non-finite values", () => {
    expect(clampNumber("nope")).toBe(null);
    expect(clampNumber(undefined)).toBe(null);
  });

  it("clampNumber enforces min/max bounds", () => {
    expect(clampNumber(5, { min: 0, max: 10 })).toBe(5);
    expect(clampNumber(-1, { min: 0, max: 10 })).toBe(null);
    expect(clampNumber(11, { min: 0, max: 10 })).toBe(null);
  });

  it("isValidLanguage accepts basic language tags", () => {
    expect(isValidLanguage("da")).toBe(true);
    expect(isValidLanguage("en-us")).toBe(true);
    expect(isValidLanguage("EN")).toBe(true);
  });

  it("isValidLanguage rejects invalid tags", () => {
    expect(isValidLanguage("")).toBe(false);
    expect(isValidLanguage("e")).toBe(false);
    expect(isValidLanguage("en_us")).toBe(false);
    expect(isValidLanguage("123")).toBe(false);
  });

  it("exposes expected limit defaults", () => {
    expect(LIMITS.maxPromptChars).toBe(3000);
    expect(LIMITS.maxTtsChars).toBe(2000);
    expect(LIMITS.maxTotalChars).toBe(12000);
  });
});
