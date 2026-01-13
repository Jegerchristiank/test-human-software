const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT_PATH = path.resolve(__dirname, "..", "..");
const IMPORT_PATHS = {
  mcq: path.join(ROOT_PATH, "imports", "rawdata-mc.txt"),
  kortsvar: path.join(ROOT_PATH, "imports", "rawdata-kortsvar.txt"),
  sygdomslaere: path.join(ROOT_PATH, "imports", "rawdata-sygdomslaere.txt"),
};
const RAW_PATHS = {
  mcq: path.join(ROOT_PATH, "rawdata-mc"),
  kortsvar: path.join(ROOT_PATH, "rawdata-kortsvar"),
  sygdomslaere: path.join(ROOT_PATH, "rawdata-sygdomslaere.txt"),
};
const DATA_PATHS = {
  mcq: path.join(ROOT_PATH, "data", "questions.json"),
  kortsvar: path.join(ROOT_PATH, "data", "kortsvar.json"),
  sygdomslaere: path.join(ROOT_PATH, "data", "sygdomslaere.json"),
};

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function stripBom(text) {
  if (!text) return "";
  return text.replace(/^\uFEFF/, "");
}

function ensureTrailingNewline(text) {
  if (!text.endsWith("\n")) return `${text}\n`;
  return text;
}

async function writeImportFile(type, content) {
  const importPath = IMPORT_PATHS[type];
  if (!importPath) {
    throw new Error(`Unknown import type: ${type}`);
  }
  const normalized = ensureTrailingNewline(normalizeNewlines(stripBom(String(content || ""))));
  if (!normalized.trim()) {
    throw new Error("Import content is empty");
  }
  await fs.promises.mkdir(path.dirname(importPath), { recursive: true });
  await fs.promises.writeFile(importPath, normalized, "utf-8");
  return importPath;
}

function runPythonImport(type, mode) {
  const scriptPath = path.join(ROOT_PATH, "scripts", "import_rawdata.py");
  const pythonBin = process.env.PYTHON_BIN || "python3";
  return new Promise((resolve, reject) => {
    const child = spawn(pythonBin, [scriptPath, "--type", type, "--mode", mode], {
      cwd: ROOT_PATH,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const detail = stderr.trim() || stdout.trim() || "Import failed";
        const err = new Error(detail.slice(0, 500));
        err.code = code;
        reject(err);
      }
    });
  });
}

async function applyImport({ type, mode, content }) {
  const importPath = await writeImportFile(type, content);
  await runPythonImport(type, mode);
  return {
    importPath: path.relative(ROOT_PATH, importPath),
    rawPath: path.relative(ROOT_PATH, RAW_PATHS[type] || ""),
    dataPath: path.relative(ROOT_PATH, DATA_PATHS[type] || ""),
  };
}

module.exports = {
  applyImport,
};
