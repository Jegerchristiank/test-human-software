const { optionalEnv } = require("./env");
const { callOpenAiJson } = require("./openai");
const { validatePayload } = require("./validate");
const { normalizeNewlines, stripBom, HUMAN_CATEGORY_LABELS } = require("./rawdataParser");

const DEFAULT_IMPORT_MODEL = "gpt-4o-mini";
const MAX_AI_IMPORT_CHARS = 250_000;
const MAX_FORMATTED_CHARS = 1_500_000;
const SYGDOM_REQUIRED_HEADERS = new Set(["sygdom", "emne"]);
const SYGDOM_HEADER_LABELS = {
  sygdom: "Sygdom",
  tyngde: "Tyngde",
  emne: "Emne",
  definition: "Definition",
  forekomst: "Forekomst",
  patogenese: "Patogenese",
  ætiologi: "Ætiologi",
  "symptomer og fund": "Symptomer og fund",
  diagnostik: "Diagnostik",
  følgetilstande: "Følgetilstande",
  behandling: "Behandling",
  forebyggelse: "Forebyggelse",
  prognose: "Prognose",
  prioritet: "prioritet",
};
const SYGDOM_HEADER_KEYS = new Set(Object.keys(SYGDOM_HEADER_LABELS));
const SYGDOM_HEADER_ALIASES = {
  disease: "sygdom",
  navn: "sygdom",
  name: "sygdom",
  weight: "tyngde",
  severity: "tyngde",
  topic: "emne",
  kategori: "emne",
  category: "emne",
  incidence: "forekomst",
  etiologi: "ætiologi",
  aetiologi: "ætiologi",
  aetiology: "ætiologi",
  "symptomer/fund": "symptomer og fund",
  diagnosis: "diagnostik",
  sequelae: "følgetilstande",
  treatment: "behandling",
  prevention: "forebyggelse",
  prognosis: "prognose",
  priority: "prioritet",
};

function ensureTrailingNewline(text) {
  if (text.endsWith("\n")) return text;
  return `${text}\n`;
}

function cleanInput(text) {
  return ensureTrailingNewline(normalizeNewlines(stripBom(String(text || ""))));
}

function normalizeHeaderLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[.:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizeSygdomHeader(value) {
  const normalized = normalizeHeaderLabel(value);
  if (!normalized) return "";
  if (SYGDOM_HEADER_ALIASES[normalized]) return SYGDOM_HEADER_ALIASES[normalized];
  return normalized;
}

function splitDelimitedLine(line, delimiter) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      fields.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "\r") continue;
    if (!inQuotes && ch === delimiter) {
      row.push(field);
      field = "";
      continue;
    }
    if (!inQuotes && ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }
  row.push(field);
  rows.push(row);
  return rows;
}

function sanitizeDelimitedCell(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\t+/g, " ")
    .trim();
}

function firstNonEmptyLine(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    if (line && line.trim()) return line;
  }
  return "";
}

function detectSygdomDelimitedFormat(text) {
  const headerLine = firstNonEmptyLine(text);
  if (!headerLine) return null;
  const candidates = ["\t", ";", ","];
  let best = null;
  for (const delimiter of candidates) {
    if (!headerLine.includes(delimiter)) continue;
    const cells = splitDelimitedLine(headerLine, delimiter);
    if (cells.length < 2) continue;
    const canonical = cells.map((cell) => canonicalizeSygdomHeader(cell));
    const matchCount = canonical.filter((cell) => SYGDOM_HEADER_KEYS.has(cell)).length;
    const hasRequired = Array.from(SYGDOM_REQUIRED_HEADERS).every((key) => canonical.includes(key));
    if (!hasRequired || matchCount < 3) continue;
    if (!best || matchCount > best.matchCount) {
      best = { delimiter, matchCount };
    }
  }
  return best;
}

function formatSygdomDelimited(text, delimiter) {
  const rows = parseDelimited(text, delimiter)
    .map((row) => row.map((cell) => sanitizeDelimitedCell(cell)))
    .filter((row) => row.some((cell) => cell));
  if (!rows.length) return "";
  const header = rows[0].map((cell) => {
    const canonical = canonicalizeSygdomHeader(cell);
    return SYGDOM_HEADER_LABELS[canonical] || cell || "";
  });
  const outputRows = [header, ...rows.slice(1)];
  const result = outputRows.map((row) => row.join("\t")).join("\n");
  return ensureTrailingNewline(result);
}

function buildSystemPrompt(type) {
  const baseRules = [
    "Du er en strikt formatteringsmotor for eksamensdata.",
    "Returner kun JSON-objektet {\"raw_text\": \"...\", \"warnings\": [\"...\"]}.",
    "Ingen markdown, ingen ekstra felter, ingen forklaringer.",
    "Bevar fagligt indhold og rækkefølge; normalisér kun layout og whitespace.",
    "Hvis en opgave er ufuldstændig eller tvetydig, så spring den over og tilføj en kort advarsel i warnings.",
  ].join(" ");

  if (type === "mcq") {
    return [
      baseRules,
      "Output raw_text i dette format:",
      "YYYY - [ordinær|sygeeksamen] (valgfrit)",
      "Spørgsmål <nr> – <kategori>",
      "<spørgsmål>",
      "A. <svar>",
      "B. <svar>",
      "C. <svar>",
      "D. <svar> (KORREKT)",
      "Regler:",
      "- Præcis ét korrekt svar pr. spørgsmål. Marker korrekt svar med '(KORREKT)'.",
      "- Hvis input bruger point (fx 3/-1, 'point', '+3'), vælg højeste positive score som korrekt.",
      "- Hvis (korrekt)/(rigtigt) findes og konflikter, følg markeringen og tilføj warning.",
      "- Fjern pointangivelser og støj fra svarlinjerne.",
      `- Kategorier skal være en af: ${HUMAN_CATEGORY_LABELS.join(", ")}.`,
      "- Hvis kategori mangler eller ikke matcher listen sikkert, spring spørgsmålet over og tilføj warning.",
      "- Hold spørgsmål og svar på én linje hver.",
    ].join("\n");
  }

  if (type === "kortsvar") {
    return [
      baseRules,
      "Output raw_text i dette format:",
      "YYYY",
      "Hovedemne <nr>: <titel>",
      "Underspørgsmål <nr> - a) <prompt>",
      "Svar: <besvarelse>",
      "Kilde: <kilde> (valgfri)",
      "Regler:",
      "- Brug 'Hovedemne' og 'Underspørgsmål' labels.",
      "- Hvis delspørgsmål mangler bogstav, brug a), b), c) i rækkefølge.",
      "- Behold linjeskift i svar, men undgå tomme linjer.",
      "- Hvis kilde mangler, udelad Kilde-linjen.",
      `- Kategorier skal være en af: ${HUMAN_CATEGORY_LABELS.join(", ")}.`,
      "- Hvis kategori mangler eller ikke matcher listen sikkert, spring opgaven over og tilføj warning.",
    ].join("\n");
  }

  if (type === "sygdomslaere") {
    return [
      baseRules,
      "Output raw_text som TSV med præcis denne header (tab-separeret):",
      "Sygdom\tTyngde\tEmne\tDefinition\tForekomst\tPatogenese\tÆtiologi\tSymptomer og fund\tDiagnostik\tFølgetilstande\tBehandling\tForebyggelse\tPrognose\tprioritet",
      "Regler:",
      "- Én sygdom pr. linje, ingen tomme linjer.",
      "- Brug tabs som separator; ingen ekstra kolonner.",
      "- Undgå tabs i tekstfelter (erstat med mellemrum).",
      "- prioritet: Høj/Mellem/Lav/Ikke pensum hvis muligt; ellers tomt.",
    ].join("\n");
  }

  return baseRules;
}

function buildUserPrompt(type, content) {
  return `Kildetekst (${type}):\n${content}`;
}

function sanitizeWarnings(warnings) {
  if (!Array.isArray(warnings)) return null;
  const clean = warnings
    .map((warning) => String(warning || "").trim())
    .filter(Boolean);
  return clean.length ? clean : null;
}

class ImportFormatError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

async function formatImportContent({ type, content }) {
  if (!["mcq", "kortsvar", "sygdomslaere"].includes(type)) {
    throw new ImportFormatError("Invalid import type", 400);
  }
  const cleanedInput = cleanInput(content);
  if (!cleanedInput.trim()) {
    throw new ImportFormatError("Import content is empty", 400);
  }

  if (type === "sygdomslaere") {
    const detected = detectSygdomDelimitedFormat(cleanedInput);
    if (detected) {
      const formattedText = formatSygdomDelimited(cleanedInput, detected.delimiter);
      if (!formattedText.trim()) {
        throw new ImportFormatError("Import content is empty", 400);
      }
      if (formattedText.length > MAX_FORMATTED_CHARS) {
        throw new ImportFormatError("Import content too large", 413);
      }
      return {
        formattedText,
        warnings: null,
        model: "uden AI",
      };
    }
  }

  if (cleanedInput.length > MAX_AI_IMPORT_CHARS) {
    throw new ImportFormatError(
      "Import content too large for AI formatting. Split the import into smaller batches.",
      413
    );
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new ImportFormatError("AI formatting is not configured (missing OPENAI_API_KEY).", 503);
  }

  const systemPrompt = buildSystemPrompt(type);
  const userPrompt = buildUserPrompt(type, cleanedInput);
  const model = optionalEnv("OPENAI_IMPORT_MODEL", DEFAULT_IMPORT_MODEL);

  let response;
  try {
    response = await callOpenAiJson({ apiKey, model, systemPrompt, userPrompt });
  } catch (error) {
    const status = Number.isFinite(error?.status) ? error.status : 502;
    throw new ImportFormatError(error?.message || "AI formatting failed", status);
  }

  const validation = validatePayload(response, {
    fields: {
      raw_text: {
        type: "string",
        minLen: 1,
        maxLen: MAX_FORMATTED_CHARS,
        maxLenMessage: "AI formatted content too large",
        maxLenStatus: 413,
      },
      warnings: {
        type: "array",
        item: { type: "string", minLen: 1, maxLen: 240 },
      },
    },
  });
  if (!validation.ok) {
    throw new ImportFormatError(`Invalid AI response: ${validation.error}`, 502);
  }

  const formattedText = cleanInput(response.raw_text);
  if (!formattedText.trim()) {
    throw new ImportFormatError("AI formatting returned empty output", 502);
  }

  return {
    formattedText,
    warnings: sanitizeWarnings(response.warnings),
    model,
  };
}

module.exports = {
  formatImportContent,
};
