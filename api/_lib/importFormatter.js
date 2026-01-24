const { optionalEnv } = require("./env");
const { callOpenAiJson } = require("./openai");
const { validatePayload } = require("./validate");
const { normalizeNewlines, stripBom, HUMAN_CATEGORY_LABELS } = require("./rawdataParser");

const DEFAULT_IMPORT_MODEL = "gpt-4o-mini";
const MAX_AI_IMPORT_CHARS = 250_000;
const MAX_FORMATTED_CHARS = 1_500_000;

function ensureTrailingNewline(text) {
  if (text.endsWith("\n")) return text;
  return `${text}\n`;
}

function cleanInput(text) {
  return ensureTrailingNewline(normalizeNewlines(stripBom(String(text || ""))));
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
