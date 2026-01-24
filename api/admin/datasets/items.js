const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { readJson } = require("../../_lib/body");
const { isAdminUser } = require("../../_lib/admin");
const {
  normalizeDataset,
  ensurePublishedVersion,
  listItems,
  createItem,
} = require("../../_lib/datasetAdmin");

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

module.exports = async function handler(req, res) {
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:dataset_items",
      limit: 60,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }
  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  if (req.method === "GET") {
    const dataset = normalizeDataset(req.query?.dataset);
    if (!dataset) return sendError(res, 400, "Invalid dataset");

    let versionId = String(req.query?.version_id || "").trim() || null;
    if (!versionId) {
      const published = await ensurePublishedVersion({ dataset, userId: user.id });
      versionId = published?.id || null;
    }
    if (!versionId) {
      return sendJson(res, 200, { items: [], count: 0, versionId: null });
    }

    const page = Math.max(1, parseNumber(req.query?.page) || 1);
    const perPage = Math.min(100, Math.max(5, parseNumber(req.query?.per_page) || 20));
    const filters = {
      search: String(req.query?.search || "").trim(),
      category: String(req.query?.category || "").trim(),
      session: String(req.query?.session || "").trim(),
      priority: String(req.query?.priority || "").trim(),
      year: parseNumber(req.query?.year),
    };
    try {
      const { items, count } = await listItems({
        dataset,
        versionId,
        filters,
        page,
        perPage,
      });
      return sendJson(res, 200, { items, count, page, perPage, versionId });
    } catch (err) {
      return sendError(res, 500, "dataset_items_unavailable");
    }
  }

  if (req.method === "POST") {
    let payload;
    try {
      payload = await readJson(req, 400000);
    } catch (err) {
      return sendError(res, 400, "Invalid JSON");
    }
    const validation = validatePayload(payload, {
      fields: {
        dataset: { type: "string", enum: ["mcq", "kortsvar", "sygdomslaere"] },
        version_id: { type: "string", minLen: 1 },
        item: { type: "object", allowUnknown: true },
      },
    });
    if (!validation.ok) {
      return sendError(res, validation.status, validation.error);
    }
    const dataset = normalizeDataset(payload.dataset);
    if (!dataset) return sendError(res, 400, "Invalid dataset");
    try {
      const created = await createItem({
        dataset,
        versionId: payload.version_id,
        input: payload.item,
      });
      return sendJson(res, 200, { ok: true, item: created });
    } catch (err) {
      const message = err?.message ? String(err.message).slice(0, 200) : "Create failed";
      return sendError(res, 400, message);
    }
  }

  res.setHeader("Allow", "GET, POST");
  return sendError(res, 405, "Method not allowed");
};
