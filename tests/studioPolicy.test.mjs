import { describe, it, expect } from "vitest";
import studioPolicy from "../studio-policy.js";

const {
  resolveStudioType,
  getScoringPolicy,
  getStudioCapabilities,
  getStudioPolicy,
} = studioPolicy;

describe("studio policy resolution", () => {
  it("defaults to human for unknown values", () => {
    expect(resolveStudioType("")).toBe("human");
    expect(resolveStudioType("unknown")).toBe("human");
  });

  it("maps aliases to known studio types", () => {
    expect(resolveStudioType("humanbiologi")).toBe("human");
    expect(resolveStudioType("sygdom")).toBe("sygdomslaere");
  });
});

describe("scoring policy", () => {
  it("exposes MCQ weights for human", () => {
    const policy = getScoringPolicy("human");
    expect(policy.mcq.correct).toBe(3);
    expect(policy.mcq.wrong).toBe(-1);
    expect(policy.weights).toEqual({ mcq: 0.5, short: 0.5 });
  });

  it("turns off MCQ weight for sygdomslaere", () => {
    const policy = getScoringPolicy("sygdomslaere");
    expect(policy.weights).toEqual({ mcq: 0, short: 1 });
  });
});

describe("capabilities gating", () => {
  it("allows MCQ and sketch in human studio", () => {
    const capabilities = getStudioCapabilities("human");
    expect(capabilities.allowMcq).toBe(true);
    expect(capabilities.allowSketch).toBe(true);
  });

  it("disables MCQ and sketch in sygdomslaere", () => {
    const capabilities = getStudioCapabilities("sygdomslaere");
    expect(capabilities.allowMcq).toBe(false);
    expect(capabilities.allowSketch).toBe(false);
  });
});

describe("studio policy contract", () => {
  it("exposes structured policy fields for sygdomslaere", () => {
    const policy = getStudioPolicy("sygdomslaere");
    expect(policy.taskType).toBe("case_structured");
    expect(policy.hints?.mode).toBe("structured");
  });
});
