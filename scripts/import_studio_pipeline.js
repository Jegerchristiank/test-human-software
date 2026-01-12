#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const DEFAULT_CHUNK_SIZE = 200;
const PIPELINE_PATH = path.resolve(__dirname, "..", "supabase", "studio_pipeline.sql");
const EXPECTED_TABLES = new Set([
  "ingest_runs",
  "study_items",
  "item_choices",
  "item_parts",
  "item_model_answers",
  "item_sources",
  "item_assets",
  "asset_annotations",
]);

function parseArgs(argv) {
  const args = {
    chunkSize: DEFAULT_CHUNK_SIZE,
    dryRun: false,
    verify: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--chunk-size") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("--chunk-size requires a number");
      }
      const value = Number.parseInt(next, 10);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--chunk-size must be a positive integer");
      }
      args.chunkSize = value;
      i += 1;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--verify") {
      args.verify = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseSqlString(text) {
  let trimmed = text.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    trimmed = trimmed.slice(1, -1);
  }
  return trimmed.replace(/''/g, "'");
}

function findNextInsert(sqlText, startIndex) {
  const needle = "insert into public.";
  const needleLength = needle.length;
  let inString = false;
  for (let i = startIndex; i <= sqlText.length - needleLength; i += 1) {
    const ch = sqlText[i];
    if (ch === "'") {
      if (inString) {
        if (sqlText[i + 1] === "'") {
          i += 1;
          continue;
        }
        inString = false;
      } else {
        inString = true;
      }
    }
    if (!inString) {
      const slice = sqlText.slice(i, i + needleLength).toLowerCase();
      if (slice === needle) {
        return i;
      }
    }
  }
  return -1;
}

function findStatementEnd(sqlText, startIndex) {
  let inString = false;
  for (let i = startIndex; i < sqlText.length; i += 1) {
    const ch = sqlText[i];
    if (ch === "'") {
      if (inString) {
        if (sqlText[i + 1] === "'") {
          i += 1;
        } else {
          inString = false;
        }
      } else {
        inString = true;
      }
      continue;
    }
    if (!inString && ch === ";") {
      return i;
    }
  }
  throw new Error("Unterminated SQL statement (missing semicolon)");
}

function findMatchingParen(text, startIndex) {
  let depth = 0;
  let inString = false;
  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "'") {
      if (inString) {
        if (text[i + 1] === "'") {
          i += 1;
        } else {
          inString = false;
        }
      } else {
        inString = true;
      }
      continue;
    }
    if (inString) {
      continue;
    }
    if (ch === "(") {
      depth += 1;
    } else if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  throw new Error("Unbalanced parentheses in SQL statement");
}

function findKeywordOutsideString(text, keyword, startIndex) {
  const lower = text.toLowerCase();
  const target = keyword.toLowerCase();
  let inString = false;
  for (let i = startIndex; i <= text.length - target.length; i += 1) {
    const ch = text[i];
    if (ch === "'") {
      if (inString) {
        if (text[i + 1] === "'") {
          i += 1;
        } else {
          inString = false;
        }
      } else {
        inString = true;
      }
    }
    if (inString) {
      continue;
    }
    if (lower.slice(i, i + target.length) === target) {
      const before = i > 0 ? lower[i - 1] : " ";
      const after = i + target.length < lower.length ? lower[i + target.length] : " ";
      if (!/[a-z0-9_]/.test(before) && !/[a-z0-9_]/.test(after)) {
        return i;
      }
    }
  }
  return -1;
}

function splitColumns(columnsText) {
  return columnsText
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitValues(valuesText) {
  const tokens = [];
  let current = "";
  let depth = 0;
  let inString = false;
  for (let i = 0; i < valuesText.length; i += 1) {
    const ch = valuesText[i];
    if (ch === "'") {
      if (inString) {
        if (valuesText[i + 1] === "'") {
          current += "''";
          i += 1;
          continue;
        }
        inString = false;
        current += ch;
        continue;
      }
      inString = true;
      current += ch;
      continue;
    }
    if (!inString) {
      if (ch === "(") {
        depth += 1;
      } else if (ch === ")") {
        depth -= 1;
      } else if (ch === "," && depth === 0) {
        tokens.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) {
    tokens.push(current.trim());
  }
  return tokens;
}

function parseSelectRef(text) {
  let inner = text.trim();
  if (inner.startsWith("(") && inner.endsWith(")")) {
    inner = inner.slice(1, -1).trim();
  }
  const match = inner.match(
    /^select\s+id\s+from\s+public\.([a-z_]+)\s+where\s+([a-z_]+)\s*=\s*(.+)$/i
  );
  if (!match) {
    throw new Error(`Unsupported subselect format: ${text}`);
  }
  const valueToken = match[3].trim();
  return {
    __ref: {
      table: match[1],
      column: match[2],
      value: parseValueToken(valueToken),
    },
  };
}

function parseValueToken(token) {
  const trimmed = token.trim();
  if (/^null$/i.test(trimmed)) {
    return null;
  }
  if (/^true$/i.test(trimmed)) {
    return true;
  }
  if (/^false$/i.test(trimmed)) {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed.startsWith("'")) {
    if (!trimmed.endsWith("'")) {
      throw new Error(`Unterminated string literal: ${trimmed.slice(0, 32)}...`);
    }
    return parseSqlString(trimmed);
  }
  if (trimmed.startsWith("(") && trimmed.toLowerCase().includes("select")) {
    return parseSelectRef(trimmed);
  }
  return trimmed;
}

function parseInsertStatement(statement) {
  const tableMatch = statement.match(/insert\s+into\s+public\.([a-z_]+)/i);
  if (!tableMatch) {
    return null;
  }
  const table = tableMatch[1];
  const afterTableIndex = tableMatch.index + tableMatch[0].length;
  const columnsStart = statement.indexOf("(", afterTableIndex);
  if (columnsStart === -1) {
    throw new Error(`Missing column list for ${table}`);
  }
  const columnsEnd = findMatchingParen(statement, columnsStart);
  const columnsRaw = statement.slice(columnsStart + 1, columnsEnd);
  const columns = splitColumns(columnsRaw);
  const valuesKeywordIndex = findKeywordOutsideString(statement, "values", columnsEnd);
  if (valuesKeywordIndex === -1) {
    throw new Error(`Missing VALUES clause for ${table}`);
  }
  const valuesStart = statement.indexOf("(", valuesKeywordIndex);
  const valuesEnd = findMatchingParen(statement, valuesStart);
  const valuesRaw = statement.slice(valuesStart + 1, valuesEnd);
  const values = splitValues(valuesRaw);
  if (columns.length !== values.length) {
    throw new Error(
      `Column/value mismatch for ${table}: ${columns.length} columns, ${values.length} values`
    );
  }
  const row = {};
  for (let i = 0; i < columns.length; i += 1) {
    row[columns[i]] = parseValueToken(values[i]);
  }
  return { table, row };
}

function parsePipelineSql(sqlText) {
  const rowsByTable = {};
  for (const table of EXPECTED_TABLES) {
    rowsByTable[table] = [];
  }
  let cursor = 0;
  while (true) {
    const start = findNextInsert(sqlText, cursor);
    if (start === -1) {
      break;
    }
    const end = findStatementEnd(sqlText, start);
    const statement = sqlText.slice(start, end + 1);
    const parsed = parseInsertStatement(statement);
    if (parsed) {
      if (!EXPECTED_TABLES.has(parsed.table)) {
        throw new Error(`Unexpected table in SQL: ${parsed.table}`);
      }
      rowsByTable[parsed.table].push(parsed.row);
    }
    cursor = end + 1;
  }
  return rowsByTable;
}

function isRef(value) {
  return Boolean(value && typeof value === "object" && value.__ref);
}

function getSourceKeys(rows, columnName) {
  return rows
    .map((row) => row[columnName])
    .filter((value) => typeof value === "string" && value.length > 0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(operation, label, retries = 3, delayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      const wait = delayMs * attempt;
      console.warn(`[retry] ${label} failed (attempt ${attempt}/${retries}). Retrying in ${wait}ms.`);
      await sleep(wait);
    }
  }
  throw lastError;
}

async function fetchIdMap(supabase, table, keyColumn, keys, chunkSize) {
  const uniqueKeys = Array.from(new Set(keys));
  const map = new Map();
  for (let i = 0; i < uniqueKeys.length; i += chunkSize) {
    const chunk = uniqueKeys.slice(i, i + chunkSize);
    const { data } = await withRetry(
      async () => {
        const response = await supabase
          .from(table)
          .select(`id, ${keyColumn}`)
          .in(keyColumn, chunk);
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response;
      },
      `fetch ${table} ids chunk ${Math.floor(i / chunkSize) + 1}`,
      3,
      700
    );
    for (const row of data || []) {
      map.set(row[keyColumn], row.id);
    }
  }
  const missing = uniqueKeys.filter((key) => !map.has(key));
  if (missing.length) {
    const sample = missing.slice(0, 5).join(", ");
    throw new Error(`Missing ${table} ids for ${missing.length} keys (e.g. ${sample})`);
  }
  return map;
}

function resolveReferences(rows, resolver) {
  return rows.map((row) => {
    const resolved = {};
    for (const [key, value] of Object.entries(row)) {
      if (isRef(value)) {
        const resolvedValue = resolver(value.__ref);
        if (resolvedValue === undefined) {
          throw new Error(`Unresolved reference for ${key}`);
        }
        resolved[key] = resolvedValue;
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  });
}

function dedupeRows(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing ${key} for dedupe`);
    }
    map.set(value, row);
  }
  return Array.from(map.values());
}

async function upsertInChunks(supabase, table, rows, onConflict, chunkSize) {
  if (!rows.length) {
    return;
  }
  const dedupedRows = dedupeRows(rows, onConflict);
  const total = Math.ceil(dedupedRows.length / chunkSize);
  for (let i = 0; i < dedupedRows.length; i += chunkSize) {
    const chunk = dedupedRows.slice(i, i + chunkSize);
    await withRetry(
      async () => {
        const { error } = await supabase
          .from(table)
          .upsert(chunk, { onConflict, returning: "minimal" });
        if (error) {
          throw new Error(error.message);
        }
      },
      `upsert ${table} chunk ${Math.floor(i / chunkSize) + 1}/${total}`,
      3,
      700
    );
    const index = Math.floor(i / chunkSize) + 1;
    console.log(`[${table}] chunk ${index}/${total} (${chunk.length} rows)`);
  }
}

async function countRows(supabase, table) {
  const { count } = await withRetry(
    async () => {
      const response = await supabase
        .from(table)
        .select("id", { count: "exact", head: true });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response;
    },
    `count ${table}`,
    3,
    700
  );
  return count || 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!fs.existsSync(PIPELINE_PATH)) {
    throw new Error(`Pipeline SQL not found at ${PIPELINE_PATH}`);
  }

  const sqlText = fs.readFileSync(PIPELINE_PATH, "utf-8");
  const rowsByTable = parsePipelineSql(sqlText);

  const totals = Object.fromEntries(
    Object.entries(rowsByTable).map(([table, rows]) => [table, rows.length])
  );
  console.log("Parsed pipeline rows:", totals);

  if (args.dryRun) {
    console.log("Dry run complete.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const fetchChunkSize = Math.min(args.chunkSize, 100);
  const studySlugs = ["human", "sygdomslaere"];
  const studyMap = await fetchIdMap(
    supabase,
    "studies",
    "slug",
    studySlugs,
    fetchChunkSize
  );

  const domainKeys = Array.from(
    new Set(
      Object.values(rowsByTable.item_parts)
        .flatMap((row) =>
          Object.values(row)
            .filter(isRef)
            .map((ref) =>
              ref.__ref.table === "disease_domains" ? ref.__ref.value : null
            )
            .filter((value) => typeof value === "string")
        )
        .filter(Boolean)
    )
  );
  const domainMap = domainKeys.length
    ? await fetchIdMap(
        supabase,
        "disease_domains",
        "domain_key",
        domainKeys,
        fetchChunkSize
      )
    : new Map();

  const maps = {
    itemBySourceKey: new Map(),
    partBySourceKey: new Map(),
    assetBySourceKey: new Map(),
  };

  const resolver = (ref) => {
    const value = ref.value;
    if (ref.table === "studies" && ref.column === "slug") {
      return studyMap.get(value);
    }
    if (ref.table === "disease_domains" && ref.column === "domain_key") {
      return domainMap.get(value);
    }
    if (ref.table === "study_items" && ref.column === "source_key") {
      return maps.itemBySourceKey.get(value);
    }
    if (ref.table === "item_parts" && ref.column === "source_key") {
      return maps.partBySourceKey.get(value);
    }
    if (ref.table === "item_assets" && ref.column === "source_key") {
      return maps.assetBySourceKey.get(value);
    }
    throw new Error(`Unhandled reference: ${ref.table}.${ref.column}`);
  };

  await upsertInChunks(
    supabase,
    "ingest_runs",
    resolveReferences(rowsByTable.ingest_runs, resolver),
    "id",
    args.chunkSize
  );

  await upsertInChunks(
    supabase,
    "study_items",
    resolveReferences(rowsByTable.study_items, resolver),
    "source_key",
    args.chunkSize
  );

  const itemKeys = getSourceKeys(rowsByTable.study_items, "source_key");
  maps.itemBySourceKey = await fetchIdMap(
    supabase,
    "study_items",
    "source_key",
    itemKeys,
    fetchChunkSize
  );

  await upsertInChunks(
    supabase,
    "item_choices",
    resolveReferences(rowsByTable.item_choices, resolver),
    "source_key",
    args.chunkSize
  );

  await upsertInChunks(
    supabase,
    "item_parts",
    resolveReferences(rowsByTable.item_parts, resolver),
    "source_key",
    args.chunkSize
  );

  const partKeys = getSourceKeys(rowsByTable.item_parts, "source_key");
  maps.partBySourceKey = await fetchIdMap(
    supabase,
    "item_parts",
    "source_key",
    partKeys,
    fetchChunkSize
  );

  await upsertInChunks(
    supabase,
    "item_model_answers",
    resolveReferences(rowsByTable.item_model_answers, resolver),
    "source_key",
    args.chunkSize
  );

  await upsertInChunks(
    supabase,
    "item_sources",
    resolveReferences(rowsByTable.item_sources, resolver),
    "source_key",
    args.chunkSize
  );

  await upsertInChunks(
    supabase,
    "item_assets",
    resolveReferences(rowsByTable.item_assets, resolver),
    "source_key",
    args.chunkSize
  );

  const assetKeys = getSourceKeys(rowsByTable.item_assets, "source_key");
  maps.assetBySourceKey = await fetchIdMap(
    supabase,
    "item_assets",
    "source_key",
    assetKeys,
    fetchChunkSize
  );

  await upsertInChunks(
    supabase,
    "asset_annotations",
    resolveReferences(rowsByTable.asset_annotations, resolver),
    "source_key",
    args.chunkSize
  );

  if (args.verify) {
    const tableOrder = [
      "ingest_runs",
      "study_items",
      "item_choices",
      "item_parts",
      "item_model_answers",
      "item_sources",
      "item_assets",
      "asset_annotations",
    ];
    for (const table of tableOrder) {
      const count = await countRows(supabase, table);
      console.log(`[${table}] count = ${count}`);
    }
  }

  console.log("Import complete.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
