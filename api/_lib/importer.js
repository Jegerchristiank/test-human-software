const fs = require("fs");
const path = require("path");
const { getSupabaseAdmin } = require("./supabase");
const {
  normalizeNewlines,
  stripBom,
  parseMcqRawData,
  parseKortsvarRawData,
  parseSygdomslaereRawData,
} = require("./rawdataParser");

const ROOT_PATH = path.resolve(__dirname, "..", "..");
const RAW_PATHS = {
  mcq: path.join(ROOT_PATH, "rawdata-mc"),
  kortsvar: path.join(ROOT_PATH, "rawdata-kortsvar"),
  sygdomslaere: path.join(ROOT_PATH, "rawdata-sygdomslaere.txt"),
};

function ensureTrailingNewline(text) {
  if (text.endsWith("\n")) return text;
  return `${text}\n`;
}

function stripSygdomHeader(text) {
  const lines = text.split("\n");
  let index = 0;
  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }
  if (index >= lines.length) return text;
  if (isSygdomHeader(lines[index])) {
    index += 1;
    while (index < lines.length && !lines[index].trim()) {
      index += 1;
    }
    const remaining = lines.slice(index).join("\n");
    return remaining ? ensureTrailingNewline(remaining) : "";
  }
  return text;
}

function firstNonemptyLine(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.trim()) return line;
  }
  return null;
}

function isSygdomHeader(line) {
  const lowered = String(line || "").trim().toLowerCase();
  if (!lowered) return false;
  return ["sygdom", "tyngde", "emne"].every((token) => lowered.includes(token));
}

function ensureSygdomHeader(text, fallbackRaw) {
  const firstLine = firstNonemptyLine(text);
  if (firstLine && isSygdomHeader(firstLine)) return text;
  const fallbackLine = fallbackRaw ? firstNonemptyLine(fallbackRaw) : null;
  if (!fallbackLine || !isSygdomHeader(fallbackLine)) {
    throw new Error("Missing header for sygdomslaere import");
  }
  const trimmed = text.replace(/^\n+/, "");
  return ensureTrailingNewline(`${fallbackLine}\n${trimmed}`);
}

function mergeAppend(existing, newText, gapLines) {
  const existingClean = normalizeNewlines(existing).replace(/\n+$/g, "");
  const newClean = normalizeNewlines(newText).replace(/^\n+/g, "");
  if (!existingClean) return ensureTrailingNewline(newClean);
  const gap = "\n".repeat(Math.max(gapLines, 1));
  return ensureTrailingNewline(`${existingClean}${gap}${newClean}`);
}

async function readFallbackRaw(type) {
  const rawPath = RAW_PATHS[type];
  if (!rawPath) return "";
  try {
    return await fs.promises.readFile(rawPath, "utf-8");
  } catch (error) {
    return "";
  }
}

async function getSnapshot(type) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dataset_snapshots")
    .select("dataset, raw_text, item_count, updated_at")
    .eq("dataset", type)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  return data || null;
}

async function saveSnapshot({
  type,
  payload,
  rawText,
  itemCount,
  userId,
  warnings,
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dataset_snapshots")
    .upsert(
      {
        dataset: type,
        payload,
        raw_text: rawText,
        item_count: itemCount,
        imported_by: userId || null,
        source: "admin_import",
      },
      { onConflict: "dataset" }
    )
    .select("dataset, item_count, updated_at")
    .single();
  if (error) {
    throw error;
  }
  return {
    dataset: data.dataset,
    itemCount: data.item_count,
    updatedAt: data.updated_at,
    warnings,
  };
}

async function applyImport({ type, mode, content, userId }) {
  const cleaned = ensureTrailingNewline(
    normalizeNewlines(stripBom(String(content || "")))
  );
  if (!cleaned.trim()) {
    throw new Error("Import content is empty");
  }

  const snapshot = await getSnapshot(type);
  const existingRaw = snapshot?.raw_text || (await readFallbackRaw(type));
  let importText = cleaned;

  if (type === "sygdomslaere") {
    if (mode === "append") {
      importText = stripSygdomHeader(importText);
      if (!importText.trim()) {
        throw new Error("Sygdomslaere import contains only a header row");
      }
    } else {
      importText = ensureSygdomHeader(importText, existingRaw);
    }
  }

  let mergedRaw = "";
  if (mode === "append") {
    const gap = type === "sygdomslaere" ? 1 : 2;
    mergedRaw = mergeAppend(existingRaw || "", importText, gap);
  } else {
    mergedRaw = ensureTrailingNewline(importText);
  }

  let payload = null;
  let itemCount = 0;
  let warnings = null;

  if (type === "mcq") {
    const parsed = parseMcqRawData(mergedRaw);
    payload = parsed.items;
    itemCount = Array.isArray(payload) ? payload.length : 0;
  } else if (type === "kortsvar") {
    const parsed = parseKortsvarRawData(mergedRaw);
    payload = parsed.items;
    itemCount = Array.isArray(payload) ? payload.length : 0;
    warnings = parsed.warnings || null;
  } else if (type === "sygdomslaere") {
    const parsed = parseSygdomslaereRawData(mergedRaw);
    payload = parsed.payload;
    itemCount = Array.isArray(payload?.diseases) ? payload.diseases.length : 0;
  } else {
    throw new Error(`Unknown import type: ${type}`);
  }

  return saveSnapshot({
    type,
    payload,
    rawText: mergedRaw,
    itemCount,
    userId,
    warnings,
  });
}

module.exports = {
  applyImport,
};
