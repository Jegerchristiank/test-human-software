const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { readJson } = require("../../_lib/body");
const { isAdminUser } = require("../../_lib/admin");
const {
  getItemById,
  updateItem,
  deleteItem,
  normalizeDataset,
} = require("../../_lib/datasetAdmin");

module.exports = async function handler(req, res) {
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:dataset_item",
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
    const id = String(req.query?.id || "").trim();
    if (!id) {
      return sendError(res, 400, "Missing item id");
    }
    try {
      const item = await getItemById(id);
      if (!item) return sendError(res, 404, "Not found");
      return sendJson(res, 200, { item });
    } catch (err) {
      return sendError(res, 500, "dataset_item_unavailable");
    }
  }

  if (req.method === "PATCH") {
    let payload;
    try {
      payload = await readJson(req, 400000);
    } catch (err) {
      return sendError(res, 400, "Invalid JSON");
    }
    const validation = validatePayload(payload, {
      fields: {
        id: { type: "string", minLen: 1 },
        dataset: { type: "string", enum: ["mcq", "kortsvar", "sygdomslaere"] },
        item: { type: "object", allowUnknown: true },
      },
    });
    if (!validation.ok) {
      return sendError(res, validation.status, validation.error);
    }
    const dataset = normalizeDataset(payload.dataset);
    if (!dataset) return sendError(res, 400, "Invalid dataset");
    try {
      const updated = await updateItem({ id: payload.id, dataset, input: payload.item });
      return sendJson(res, 200, { ok: true, item: updated });
    } catch (err) {
      const message = err?.message ? String(err.message).slice(0, 200) : "Update failed";
      return sendError(res, 400, message);
    }
  }

  if (req.method === "DELETE") {
    let payload;
    try {
      payload = await readJson(req, 200000);
    } catch (err) {
      return sendError(res, 400, "Invalid JSON");
    }
    const validation = validatePayload(payload, {
      fields: {
        id: { type: "string", minLen: 1 },
      },
    });
    if (!validation.ok) {
      return sendError(res, validation.status, validation.error);
    }
    try {
      await deleteItem({ id: payload.id });
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendError(res, 500, "Delete failed");
    }
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  return sendError(res, 405, "Method not allowed");
};
