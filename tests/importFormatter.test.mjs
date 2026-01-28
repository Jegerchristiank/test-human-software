import { createRequire } from "node:module";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const cachedModules = new Set();
const originalOpenAiKey = process.env.OPENAI_API_KEY;

function stubModule(modulePath, exports) {
  const resolved = require.resolve(modulePath);
  const stub = new Module(resolved);
  stub.exports = exports;
  stub.loaded = true;
  require.cache[resolved] = stub;
  cachedModules.add(resolved);
}

function loadFormatter() {
  const resolved = require.resolve("../api/_lib/importFormatter.js");
  delete require.cache[resolved];
  cachedModules.add(resolved);
  return require(resolved);
}

afterEach(() => {
  for (const id of cachedModules) {
    delete require.cache[id];
  }
  cachedModules.clear();
  if (originalOpenAiKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
});

describe("import formatter", () => {
  it("returns formatted text and warnings", async () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    stubModule("../api/_lib/openai.js", {
      callOpenAiJson: vi.fn(async () => ({
        raw_text: [
          "2024",
          "Spørgsmål 1 – Test",
          "Hvad er 2+2?",
          "A. 4 (KORREKT)",
          "B. 2",
          "C. 3",
          "D. 5",
          "",
        ].join("\n"),
        warnings: ["Skipped question 2 (incomplete)"],
      })),
    });

    const { formatImportContent } = loadFormatter();
    const result = await formatImportContent({ type: "mcq", content: "rå tekst" });
    expect(result.formattedText.endsWith("\n")).toBe(true);
    expect(result.formattedText).toContain("Spørgsmål 1");
    expect(result.warnings).toEqual(["Skipped question 2 (incomplete)"]);
  });

  it("rejects missing OpenAI key", async () => {
    delete process.env.OPENAI_API_KEY;
    stubModule("../api/_lib/openai.js", {
      callOpenAiJson: vi.fn(async () => ({})),
    });
    const { formatImportContent } = loadFormatter();
    await expect(formatImportContent({ type: "mcq", content: "rå tekst" })).rejects.toThrow(
      "OPENAI_API_KEY"
    );
  });

  it("rejects invalid AI response", async () => {
    process.env.OPENAI_API_KEY = "sk-test-key";
    stubModule("../api/_lib/openai.js", {
      callOpenAiJson: vi.fn(async () => ({ nope: true })),
    });
    const { formatImportContent } = loadFormatter();
    await expect(formatImportContent({ type: "mcq", content: "rå tekst" })).rejects.toThrow(
      "Invalid AI response"
    );
  });

  it("bypasses AI for sygdomslaere CSV input", async () => {
    delete process.env.OPENAI_API_KEY;
    const openAiStub = { callOpenAiJson: vi.fn(async () => ({})) };
    stubModule("../api/_lib/openai.js", openAiStub);
    const { formatImportContent } = loadFormatter();
    const csv = [
      "Sygdom;Tyngde;Emne;Definition;Prioritet",
      "Influenza;Høj;Infektion;Virus;Høj",
      "Astma;Mellem;Luftveje;Kronisk inflammation;Lav",
    ].join("\n");
    const result = await formatImportContent({ type: "sygdomslaere", content: csv });
    expect(result.formattedText).toContain("Sygdom\tTyngde\tEmne\tDefinition\tprioritet");
    expect(result.formattedText).toContain("Influenza\tHøj\tInfektion\tVirus\tHøj");
    expect(result.model).toBe("uden AI");
    expect(openAiStub.callOpenAiJson).not.toHaveBeenCalled();
  });
});
