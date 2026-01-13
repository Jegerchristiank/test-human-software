const fs = require("fs");
const path = require("path");
const { getSupabaseAdmin } = require("./supabase");

const ROOT_PATH = path.resolve(__dirname, "..", "..");
const DATA_PATHS = {
  mcq: path.join(ROOT_PATH, "data", "questions.json"),
  kortsvar: path.join(ROOT_PATH, "data", "kortsvar.json"),
  sygdomslaere: path.join(ROOT_PATH, "data", "sygdomslaere.json"),
};

async function readJsonFile(filePath) {
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

async function getFileInfo(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      bytes: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch (error) {
    return null;
  }
}

async function getDatasetSnapshot(type) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dataset_snapshots")
    .select("dataset, payload, raw_text, item_count, updated_at")
    .eq("dataset", type)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  return data || null;
}

async function getDatasetPayload(type, { allowFallback = true } = {}) {
  let snapshot = null;
  try {
    snapshot = await getDatasetSnapshot(type);
  } catch (error) {
    snapshot = null;
  }
  if (snapshot && snapshot.payload) return snapshot.payload;
  if (!allowFallback) return null;
  const dataPath = DATA_PATHS[type];
  if (!dataPath) return null;
  return readJsonFile(dataPath);
}

async function getDatasetFileInfo(type) {
  const dataPath = DATA_PATHS[type];
  if (!dataPath) return null;
  return getFileInfo(dataPath);
}

module.exports = {
  DATA_PATHS,
  getDatasetPayload,
  getDatasetSnapshot,
  getDatasetFileInfo,
  readJsonFile,
};
