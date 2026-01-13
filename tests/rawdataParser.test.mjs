import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const {
  parseMcqRawData,
  parseKortsvarRawData,
  parseSygdomslaereRawData,
} = require("../api/_lib/rawdataParser.js");

describe("rawdata parsers", () => {
  it("parses MCQ raw data", () => {
    const raw = [
      "2024",
      "Spørgsmål 1 - Anatomi",
      "Hvad hedder knoglen i overarmen?",
      "A. Humerus (korrekt)",
      "B. Ulna",
      "C. Radius",
      "D. Femur",
      "",
    ].join("\n");
    const { items } = parseMcqRawData(raw);
    expect(items.length).toBe(1);
    expect(items[0].correctLabel).toBe("A");
    expect(items[0].category).toBe("Anatomi");
  });

  it("parses kortsvar raw data", () => {
    const raw = [
      "2023",
      "Opgave 1 Test",
      "A) Beskriv cellen.",
      "Svar: Den er rund.",
      "",
    ].join("\n");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kortsvar-"));
    const { items, warnings } = parseKortsvarRawData(raw, { imagesPath: tmpDir });
    expect(items.length).toBe(1);
    expect(items[0].label).toBe("a");
    expect(items[0].opgave).toBe(1);
    expect(warnings.missingImages.length).toBe(0);
  });

  it("parses sygdomslaere TSV", () => {
    const raw = [
      "sygdom\tprioritet\ttyngde\temne\tDefinition",
      "Astma\thøj\t1\tLungesygdomme\tKronisk inflammation.",
      "",
    ].join("\n");
    const { payload } = parseSygdomslaereRawData(raw);
    expect(payload.diseases.length).toBe(1);
    expect(payload.diseases[0].priority).toBe("high");
    expect(payload.diseases[0].sections[0].title).toBe("Definition");
  });
});
