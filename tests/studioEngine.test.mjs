import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const engine = require("../studio-engine.js");

describe("studio engine contracts", () => {
  it("marks sygdomslaere as case_structured", () => {
    expect(engine.getContract("sygdomslaere").taskType).toBe("case_structured");
  });

  it("exposes fixed disease domains", () => {
    const domains = engine.getDomainOrder("sygdomslaere");
    expect(domains).toContain("Ætiologi");
    expect(domains).toContain("Patogenese");
    expect(domains).toContain("Behandling");
  });

  it("derives hint level from history window", () => {
    const profile = engine.deriveProgressionProfile("sygdomslaere", [
      { shortPercent: 92 },
      { shortPercent: 90 },
      { shortPercent: 88 },
    ]);
    expect(profile.hintLevel).toBe(0);
  });

  it("builds keyword hints for level 1", () => {
    const hint = engine.buildStructuredHint({
      level: 1,
      domainLabel: "Ætiologi",
      modelAnswer:
        "Autoimmun reaktion med genetisk disposition og miljøpåvirkning. Rygning øger risikoen.",
    });
    expect(hint).toMatch(/Nøgleord/);
  });
});
