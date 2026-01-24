const { getSupabaseAdmin } = require("./supabase");
const { getDatasetSnapshot } = require("./datasets");
const { normalizeHumanCategory, HUMAN_CATEGORY_LABELS } = require("./rawdataParser");

const DATASETS = ["mcq", "kortsvar", "sygdomslaere"];
const VERSION_STATUSES = ["draft", "published", "archived"];
const PRIORITY_LABELS = {
  high: "Høj",
  medium: "Mellem",
  low: "Lav",
  excluded: "Ikke pensum",
};
const DISEASE_SECTION_ORDER = [
  "Definition",
  "Forekomst",
  "Patogenese",
  "Ætiologi",
  "Symptomer og fund",
  "Diagnostik",
  "Følgetilstande",
  "Behandling",
  "Forebyggelse",
  "Prognose",
];

function normalizeDataset(value) {
  const dataset = String(value || "").trim().toLowerCase();
  return DATASETS.includes(dataset) ? dataset : null;
}

function normalizeSessionKey(value) {
  const cleaned = String(value || "").trim().toLowerCase();
  return cleaned || "standard";
}

function normalizeText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9æøå\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSearchText(parts) {
  const joined = parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
  return joined.slice(0, 4000);
}

function resolveHumanCategory(value, { allowUnknown = false } = {}) {
  const normalized = normalizeHumanCategory(value);
  if (normalized) return normalized;
  if (allowUnknown) {
    return String(value || "").trim() || "Ukendt";
  }
  return null;
}

function buildMcqKey(question) {
  return `mcq:${question.year}:${normalizeSessionKey(question.session)}:${question.number}`;
}

function buildShortKey(question) {
  const label = question.label ? String(question.label).toLowerCase() : "main";
  return `short:${question.year}:${normalizeSessionKey(question.session)}:${question.opgave}:${label}`;
}

function buildDiseaseKey(disease) {
  const raw = disease.id || slugify(disease.name || "");
  return `disease:${raw || "unknown"}`;
}

function buildMcqRow(question, { allowUnknown = false } = {}) {
  const category = resolveHumanCategory(question.category, { allowUnknown });
  if (!category) {
    throw new Error(`Unknown MCQ category '${question.category}'`);
  }
  const payload = {
    year: Number(question.year),
    number: Number(question.number),
    session: question.session || null,
    category,
    text: String(question.text || "").trim(),
    options: Array.isArray(question.options) ? question.options : [],
    correctLabel: question.correctLabel || "",
  };
  return {
    dataset: "mcq",
    item_type: "mcq",
    item_key: buildMcqKey(payload),
    year: payload.year,
    session: payload.session,
    number: payload.number,
    category: payload.category,
    title: payload.text,
    search_text: buildSearchText([
      payload.category,
      payload.text,
      ...(payload.options || []).map((opt) => opt?.text || ""),
    ]),
    payload,
  };
}

function buildShortRow(question, { allowUnknown = false } = {}) {
  const category = resolveHumanCategory(question.category, { allowUnknown });
  if (!category) {
    throw new Error(`Unknown kortsvar category '${question.category}'`);
  }
  const payload = {
    type: "short",
    year: Number(question.year),
    session: question.session || null,
    category,
    opgave: Number(question.opgave),
    opgaveTitle: question.opgaveTitle || null,
    opgaveIntro: question.opgaveIntro || null,
    label: question.label || null,
    prompt: String(question.prompt || "").trim(),
    answer: String(question.answer || "").trim(),
    sources: Array.isArray(question.sources) ? question.sources : [],
    images: Array.isArray(question.images) ? question.images : [],
  };
  return {
    dataset: "kortsvar",
    item_type: "short",
    item_key: buildShortKey(payload),
    year: payload.year,
    session: payload.session,
    opgave: payload.opgave,
    label: payload.label || null,
    category: payload.category,
    title: payload.prompt,
    search_text: buildSearchText([
      payload.category,
      payload.opgaveTitle,
      payload.prompt,
      payload.answer,
    ]),
    payload,
  };
}

function buildDiseaseRow(disease) {
  const rawPriority = String(disease.priority || "medium").trim().toLowerCase();
  const priority = PRIORITY_LABELS[rawPriority] ? rawPriority : "medium";
  const payload = {
    id: disease.id || slugify(disease.name || ""),
    name: String(disease.name || "").trim(),
    category: String(disease.category || "").trim(),
    weight: disease.weight || "",
    priority,
    priorityLabel: PRIORITY_LABELS[priority] || "Mellem",
    sections: Array.isArray(disease.sections) ? disease.sections : [],
  };
  return {
    dataset: "sygdomslaere",
    item_type: "disease",
    item_key: buildDiseaseKey(payload),
    category: payload.category,
    priority: payload.priority,
    weight: payload.weight,
    title: payload.name,
    search_text: buildSearchText([
      payload.name,
      payload.category,
      ...(payload.sections || []).map((section) => section?.title || ""),
      ...(payload.sections || []).map((section) => section?.content || ""),
    ]),
    payload,
  };
}

function buildRowsFromPayload(dataset, payload, { allowUnknown = false } = {}) {
  if (dataset === "mcq") {
    const items = Array.isArray(payload) ? payload : [];
    return items.map((item) => buildMcqRow(item, { allowUnknown }));
  }
  if (dataset === "kortsvar") {
    const items = Array.isArray(payload) ? payload : [];
    return items.map((item) => buildShortRow(item, { allowUnknown }));
  }
  const diseases = Array.isArray(payload?.diseases) ? payload.diseases : [];
  return diseases.map((disease) => buildDiseaseRow(disease));
}

function buildPayloadFromRows(dataset, rows) {
  if (dataset === "mcq") {
    return rows.map((row) => row.payload);
  }
  if (dataset === "kortsvar") {
    return rows.map((row) => row.payload);
  }
  const diseases = rows.map((row) => row.payload);
  const weights = new Set();
  const categories = new Set();
  diseases.forEach((disease) => {
    if (disease?.weight) weights.add(disease.weight);
    if (disease?.category) categories.add(disease.category);
  });
  return {
    meta: {
      source: "admin_publish",
      generatedAt: new Date().toISOString(),
      sectionOrder: DISEASE_SECTION_ORDER,
      priorities: Object.keys(PRIORITY_LABELS),
      weights: Array.from(weights.values()).sort((a, b) => a.localeCompare(b, "da")),
      categories: Array.from(categories.values()).sort((a, b) => a.localeCompare(b, "da")),
    },
    diseases,
  };
}

function summarizeWarnings(entries, limit = 20) {
  const list = entries.filter(Boolean);
  return {
    count: list.length,
    sample: list.slice(0, limit),
  };
}

function buildQaSummary(dataset, rows, extraWarnings = {}) {
  const missingAnswers = [];
  const emptySections = [];
  const missingPrompts = [];
  const missingCorrect = [];
  rows.forEach((row) => {
    if (dataset === "mcq") {
      const payload = row.payload || {};
      if (!String(payload.correctLabel || "").trim()) {
        missingCorrect.push(`${payload.year || "?"} spørgsmål ${payload.number || "?"}`);
      }
      const options = Array.isArray(payload.options) ? payload.options : [];
      if (options.some((opt) => !String(opt?.text || "").trim())) {
        missingAnswers.push(`${payload.year || "?"} spørgsmål ${payload.number || "?"}`);
      }
    } else if (dataset === "kortsvar") {
      const payload = row.payload || {};
      if (!String(payload.prompt || "").trim()) {
        missingPrompts.push(`${payload.year || "?"} opgave ${payload.opgave || "?"}`);
      }
      if (!String(payload.answer || "").trim()) {
        missingAnswers.push(`${payload.year || "?"} opgave ${payload.opgave || "?"}`);
      }
    } else {
      const payload = row.payload || {};
      const sections = Array.isArray(payload.sections) ? payload.sections : [];
      if (!sections.length) {
        emptySections.push(payload.name || payload.id || "Ukendt sygdom");
      }
      if (sections.some((section) => !String(section?.content || "").trim())) {
        emptySections.push(payload.name || payload.id || "Ukendt sygdom");
      }
    }
  });

  const formatWarnings = Array.isArray(extraWarnings?.formatWarnings)
    ? extraWarnings.formatWarnings
    : [];
  const missingImages = Array.isArray(extraWarnings?.missingImages)
    ? extraWarnings.missingImages
    : [];
  const unmatchedImages = Array.isArray(extraWarnings?.unmatchedImages)
    ? extraWarnings.unmatchedImages
    : [];

  return {
    itemCount: rows.length,
    warnings: {
      missingCorrect: summarizeWarnings(missingCorrect),
      missingPrompts: summarizeWarnings(missingPrompts),
      missingAnswers: summarizeWarnings(missingAnswers),
      emptySections: summarizeWarnings(emptySections),
      formatWarnings: summarizeWarnings(formatWarnings),
      missingImages: summarizeWarnings(missingImages),
      unmatchedImages: summarizeWarnings(unmatchedImages),
    },
  };
}

async function insertDatasetItems({ supabase, versionId, rows }) {
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize).map((row) => ({
      version_id: versionId,
      dataset: row.dataset,
      item_type: row.item_type,
      item_key: row.item_key,
      year: row.year ?? null,
      session: row.session ?? null,
      number: row.number ?? null,
      opgave: row.opgave ?? null,
      label: row.label ?? null,
      category: row.category ?? null,
      priority: row.priority ?? null,
      weight: row.weight ?? null,
      title: row.title ?? null,
      search_text: row.search_text ?? null,
      payload: row.payload,
    }));
    const { error } = await supabase.from("dataset_items").insert(chunk);
    if (error) {
      throw error;
    }
  }
}

async function recordVersionEvent({ supabase, dataset, versionId, actor, action, metadata }) {
  await supabase.from("dataset_version_events").insert({
    dataset,
    version_id: versionId || null,
    action,
    actor: actor || null,
    metadata: metadata || null,
  });
}

async function ensurePublishedVersion({ dataset, userId }) {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("dataset_versions")
    .select("*")
    .eq("dataset", dataset)
    .eq("status", "published")
    .maybeSingle();
  if (existing) return existing;

  const snapshot = await getDatasetSnapshot(dataset);
  if (!snapshot || !snapshot.payload) return null;

  const rows = buildRowsFromPayload(dataset, snapshot.payload, { allowUnknown: true });
  const qaSummary = buildQaSummary(dataset, rows);
  const { data: version, error } = await supabase
    .from("dataset_versions")
    .insert({
      dataset,
      status: "published",
      source: "legacy_snapshot",
      item_count: rows.length,
      raw_text: snapshot.raw_text || null,
      qa_summary: qaSummary,
      created_by: userId || null,
      published_by: userId || null,
      published_at: new Date().toISOString(),
      note: "Auto-migreret fra dataset_snapshots",
    })
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  await insertDatasetItems({ supabase, versionId: version.id, rows });
  await supabase
    .from("dataset_snapshots")
    .update({ published_version_id: version.id })
    .eq("dataset", dataset);
  await recordVersionEvent({
    supabase,
    dataset,
    versionId: version.id,
    actor: userId,
    action: "publish",
    metadata: { source: "legacy_snapshot" },
  });
  return version;
}

async function createDraftVersion({
  dataset,
  rows,
  rawText,
  qaSummary,
  userId,
  source,
  baseVersionId,
  note,
}) {
  const supabase = getSupabaseAdmin();
  const { data: version, error } = await supabase
    .from("dataset_versions")
    .insert({
      dataset,
      status: "draft",
      source: source || "manual",
      base_version_id: baseVersionId || null,
      item_count: rows.length,
      raw_text: rawText || null,
      qa_summary: qaSummary || null,
      created_by: userId || null,
      note: note || null,
    })
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  await insertDatasetItems({ supabase, versionId: version.id, rows });
  await recordVersionEvent({
    supabase,
    dataset,
    versionId: version.id,
    actor: userId,
    action: source === "admin_import" ? "import" : "draft",
    metadata: { itemCount: rows.length },
  });
  return version;
}

async function cloneDraftFromVersion({ dataset, baseVersionId, userId }) {
  const supabase = getSupabaseAdmin();
  const { data: base, error: baseError } = await supabase
    .from("dataset_versions")
    .select("*")
    .eq("id", baseVersionId)
    .maybeSingle();
  if (baseError || !base) {
    throw baseError || new Error("Base version not found");
  }
  const { data: items, error: itemsError } = await supabase
    .from("dataset_items")
    .select("*")
    .eq("version_id", baseVersionId);
  if (itemsError) {
    throw itemsError;
  }
  const rows = (items || []).map((row) => ({
    dataset: row.dataset,
    item_type: row.item_type,
    item_key: row.item_key,
    year: row.year,
    session: row.session,
    number: row.number,
    opgave: row.opgave,
    label: row.label,
    category: row.category,
    priority: row.priority,
    weight: row.weight,
    title: row.title,
    search_text: row.search_text,
    payload: row.payload,
  }));
  return createDraftVersion({
    dataset,
    rows,
    rawText: base.raw_text || null,
    qaSummary: base.qa_summary || null,
    userId,
    source: "clone_published",
    baseVersionId,
    note: `Klonet fra ${baseVersionId}`,
  });
}

async function listVersions({ dataset }) {
  const supabase = getSupabaseAdmin();
  const query = supabase
    .from("dataset_versions")
    .select(
      "id, dataset, status, source, base_version_id, item_count, created_at, updated_at, published_at, created_by, published_by, qa_summary, note"
    )
    .order("created_at", { ascending: false });
  if (dataset) query.eq("dataset", dataset);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function listItems({ dataset, versionId, filters, page, perPage }) {
  const supabase = getSupabaseAdmin();
  const query = supabase
    .from("dataset_items")
    .select(
      "id, item_key, item_type, year, session, number, opgave, label, category, priority, weight, title",
      { count: "exact" }
    )
    .eq("dataset", dataset)
    .eq("version_id", versionId)
    .order("year", { ascending: true })
    .order("number", { ascending: true })
    .order("opgave", { ascending: true })
    .order("label", { ascending: true })
    .order("title", { ascending: true });

  if (filters?.year) query.eq("year", filters.year);
  if (filters?.session) query.ilike("session", filters.session);
  if (filters?.category) query.ilike("category", `%${filters.category}%`);
  if (filters?.priority) query.eq("priority", filters.priority);
  if (filters?.search) query.ilike("search_text", `%${filters.search}%`);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], count: count || 0 };
}

async function getItemById(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dataset_items")
    .select("id, dataset, version_id, item_key, item_type, payload")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

function buildMcqPayload(input) {
  const year = Number(input.year);
  const number = Number(input.number);
  if (!Number.isFinite(year)) {
    throw new Error("Invalid MCQ year");
  }
  if (!Number.isFinite(number)) {
    throw new Error("Invalid MCQ question number");
  }
  const session = normalizeText(input.session);
  const category = normalizeHumanCategory(input.category);
  if (!category) {
    throw new Error(`Unknown MCQ category '${input.category}'`);
  }
  const questionText = String(input.text || "").trim();
  const optionsInput = Array.isArray(input.options) ? input.options : [];
  const correctLabel = String(input.correctLabel || "").trim().toUpperCase();
  const labels = ["A", "B", "C", "D"];
  const options = labels.map((label) => {
    const match = optionsInput.find(
      (opt) => String(opt?.label || "").trim().toUpperCase() === label
    );
    return {
      label,
      text: String(match?.text || "").trim(),
      isCorrect: correctLabel ? label === correctLabel : Boolean(match?.isCorrect),
    };
  });
  const resolvedCorrect =
    options.find((opt) => opt.isCorrect)?.label || correctLabel || "";
  return {
    year,
    number,
    session,
    category,
    text: questionText,
    options,
    correctLabel: resolvedCorrect,
  };
}

function buildShortPayload(input) {
  const year = Number(input.year);
  if (!Number.isFinite(year)) {
    throw new Error("Invalid kortsvar year");
  }
  const session = normalizeText(input.session);
  const opgave = Number(input.opgave);
  if (!Number.isFinite(opgave)) {
    throw new Error("Invalid kortsvar opgave number");
  }
  const category = normalizeHumanCategory(input.category);
  if (!category) {
    throw new Error(`Unknown kortsvar category '${input.category}'`);
  }
  return {
    type: "short",
    year,
    session,
    category,
    opgave,
    opgaveTitle: normalizeText(input.opgaveTitle),
    opgaveIntro: normalizeText(input.opgaveIntro),
    label: normalizeText(input.label),
    prompt: String(input.prompt || "").trim(),
    answer: String(input.answer || "").trim(),
    sources: Array.isArray(input.sources) ? input.sources : [],
    images: Array.isArray(input.images) ? input.images : [],
  };
}

function buildDiseasePayload(input) {
  const priority = String(input.priority || "").trim().toLowerCase() || "medium";
  const cleanPriority = PRIORITY_LABELS[priority] ? priority : "medium";
  const name = String(input.name || "").trim();
  if (!name) {
    throw new Error("Missing sygdomsnavn");
  }
  const category = String(input.category || "").trim();
  if (!category) {
    throw new Error("Missing sygdomskategori");
  }
  const sections = Array.isArray(input.sections)
    ? input.sections.map((section) => ({
        title: String(section?.title || "").trim(),
        content: String(section?.content || "").trim(),
      }))
    : [];
  return {
    id: normalizeText(input.id) || slugify(input.name || ""),
    name,
    category,
    weight: String(input.weight || "").trim(),
    priority: cleanPriority,
    priorityLabel: PRIORITY_LABELS[cleanPriority] || "Mellem",
    sections,
  };
}

function buildRowFromInput(dataset, input) {
  if (dataset === "mcq") return buildMcqRow(buildMcqPayload(input));
  if (dataset === "kortsvar") return buildShortRow(buildShortPayload(input));
  return buildDiseaseRow(buildDiseasePayload(input));
}

async function createItem({ dataset, versionId, input }) {
  const supabase = getSupabaseAdmin();
  const row = buildRowFromInput(dataset, input);
  const { data, error } = await supabase
    .from("dataset_items")
    .insert({
      version_id: versionId,
      dataset: row.dataset,
      item_type: row.item_type,
      item_key: row.item_key,
      year: row.year ?? null,
      session: row.session ?? null,
      number: row.number ?? null,
      opgave: row.opgave ?? null,
      label: row.label ?? null,
      category: row.category ?? null,
      priority: row.priority ?? null,
      weight: row.weight ?? null,
      title: row.title ?? null,
      search_text: row.search_text ?? null,
      payload: row.payload,
    })
    .select("id")
    .single();
  if (error) throw error;
  await updateVersionCount(supabase, versionId);
  return data;
}

async function updateItem({ id, dataset, input }) {
  const supabase = getSupabaseAdmin();
  const row = buildRowFromInput(dataset, input);
  const { data, error } = await supabase
    .from("dataset_items")
    .update({
      item_key: row.item_key,
      year: row.year ?? null,
      session: row.session ?? null,
      number: row.number ?? null,
      opgave: row.opgave ?? null,
      label: row.label ?? null,
      category: row.category ?? null,
      priority: row.priority ?? null,
      weight: row.weight ?? null,
      title: row.title ?? null,
      search_text: row.search_text ?? null,
      payload: row.payload,
    })
    .eq("id", id)
    .select("id, version_id")
    .single();
  if (error) throw error;
  return data;
}

async function deleteItem({ id }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dataset_items")
    .delete()
    .eq("id", id)
    .select("version_id, dataset")
    .single();
  if (error) throw error;
  if (data?.version_id) {
    await updateVersionCount(supabase, data.version_id);
  }
  return data;
}

async function bulkUpdate({ dataset, versionId, itemIds, patch }) {
  const supabase = getSupabaseAdmin();
  const updates = {};
  if (patch.category) {
    if (dataset === "mcq" || dataset === "kortsvar") {
      const category = normalizeHumanCategory(patch.category);
      if (!category) {
        throw new Error(`Unknown category '${patch.category}'`);
      }
      updates.category = category;
    } else {
      updates.category = patch.category;
    }
  }
  if (patch.session !== undefined) updates.session = normalizeText(patch.session);
  if (patch.priority) updates.priority = patch.priority;
  if (!Object.keys(updates).length) {
    throw new Error("No valid fields to update");
  }
  const { error } = await supabase
    .from("dataset_items")
    .update(updates)
    .eq("dataset", dataset)
    .eq("version_id", versionId)
    .in("id", itemIds);
  if (error) throw error;
}

async function updateVersionCount(supabase, versionId) {
  const { count, error } = await supabase
    .from("dataset_items")
    .select("id", { count: "exact", head: true })
    .eq("version_id", versionId);
  if (error) throw error;
  await supabase.from("dataset_versions").update({ item_count: count || 0 }).eq("id", versionId);
}

async function publishVersion({ versionId, userId }) {
  const supabase = getSupabaseAdmin();
  const { data: version, error: versionError } = await supabase
    .from("dataset_versions")
    .select("*")
    .eq("id", versionId)
    .maybeSingle();
  if (versionError || !version) {
    throw versionError || new Error("Version not found");
  }
  const dataset = version.dataset;
  const { data: rows, error: rowsError } = await supabase
    .from("dataset_items")
    .select("payload, year, session, number, opgave, label, title, category, priority, weight")
    .eq("version_id", versionId)
    .order("year", { ascending: true })
    .order("number", { ascending: true })
    .order("opgave", { ascending: true })
    .order("label", { ascending: true })
    .order("title", { ascending: true });
  if (rowsError) throw rowsError;
  const payload = buildPayloadFromRows(dataset, rows || []);
  const qaSummary = buildQaSummary(dataset, rows || []);

  await supabase
    .from("dataset_versions")
    .update({ status: "archived" })
    .eq("dataset", dataset)
    .eq("status", "published")
    .neq("id", versionId);

  const now = new Date().toISOString();
  await supabase
    .from("dataset_versions")
    .update({
      status: "published",
      published_at: now,
      published_by: userId || null,
      qa_summary: qaSummary,
    })
    .eq("id", versionId);

  const { error: snapshotError } = await supabase
    .from("dataset_snapshots")
    .upsert(
      {
        dataset,
        payload,
        raw_text: version.raw_text || null,
        item_count: Array.isArray(payload) ? payload.length : payload?.diseases?.length || 0,
        imported_by: userId || null,
        source: "admin_publish",
        published_version_id: versionId,
      },
      { onConflict: "dataset" }
    );
  if (snapshotError) {
    throw snapshotError;
  }

  await recordVersionEvent({
    supabase,
    dataset,
    versionId,
    actor: userId,
    action: version.status === "archived" ? "rollback" : "publish",
    metadata: { itemCount: qaSummary.itemCount },
  });

  return { versionId, dataset, qaSummary };
}

async function getQaSummaryForVersion({ versionId }) {
  const supabase = getSupabaseAdmin();
  const { data: version, error: versionError } = await supabase
    .from("dataset_versions")
    .select("id, dataset, qa_summary")
    .eq("id", versionId)
    .maybeSingle();
  if (versionError || !version) {
    throw versionError || new Error("Version not found");
  }
  const { data: rows, error: rowsError } = await supabase
    .from("dataset_items")
    .select("payload")
    .eq("version_id", versionId);
  if (rowsError) throw rowsError;
  const qaSummary = buildQaSummary(version.dataset, rows || []);
  return qaSummary;
}

module.exports = {
  DATASETS,
  VERSION_STATUSES,
  HUMAN_CATEGORY_LABELS,
  normalizeDataset,
  ensurePublishedVersion,
  buildRowsFromPayload,
  buildQaSummary,
  createDraftVersion,
  cloneDraftFromVersion,
  listVersions,
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  bulkUpdate,
  publishVersion,
  getQaSummaryForVersion,
};
