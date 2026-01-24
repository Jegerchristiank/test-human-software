const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { readJson } = require("../../_lib/body");
const { isAdminUser } = require("../../_lib/admin");
const {
  normalizeDataset,
  ensurePublishedVersion,
  listVersions,
  cloneDraftFromVersion,
  createDraftVersion,
  buildQaSummary,
} = require("../../_lib/datasetAdmin");

module.exports = async function handler(req, res) {
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:dataset_versions",
      limit: 20,
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
    if (!dataset) {
      return sendError(res, 400, "Invalid dataset");
    }
    try {
      await ensurePublishedVersion({ dataset, userId: user.id });
      const versions = await listVersions({ dataset });
      return sendJson(res, 200, { dataset, versions });
    } catch (err) {
      return sendError(res, 500, "dataset_versions_unavailable");
    }
  }

  if (req.method === "POST") {
    let payload;
    try {
      payload = await readJson(req, 200000);
    } catch (err) {
      return sendError(res, 400, "Invalid JSON");
    }
    const validation = validatePayload(payload, {
      fields: {
        dataset: { type: "string", enum: ["mcq", "kortsvar", "sygdomslaere"] },
        action: { type: "string", enum: ["clone", "empty"] },
        base_version_id: { type: "string", nullable: true },
        note: { type: "string", nullable: true, maxLen: 200 },
      },
    });
    if (!validation.ok) {
      return sendError(res, validation.status, validation.error);
    }
    const dataset = normalizeDataset(payload.dataset);
    if (!dataset) {
      return sendError(res, 400, "Invalid dataset");
    }
    try {
      if (payload.action === "clone") {
        const baseVersionId =
          payload.base_version_id ||
          (await ensurePublishedVersion({ dataset, userId: user.id }))?.id;
        if (!baseVersionId) {
          return sendError(res, 400, "missing_base_version");
        }
        const draft = await cloneDraftFromVersion({
          dataset,
          baseVersionId,
          userId: user.id,
        });
        return sendJson(res, 200, { ok: true, draftId: draft.id, version: draft });
      }

      if (payload.action === "empty") {
        const qaSummary = buildQaSummary(dataset, []);
        const draft = await createDraftVersion({
          dataset,
          rows: [],
          rawText: null,
          qaSummary,
          userId: user.id,
          source: "manual",
          note: payload.note || "Tom kladde",
        });
        return sendJson(res, 200, { ok: true, draftId: draft.id, version: draft });
      }
    } catch (err) {
      return sendError(res, 500, "draft_create_failed");
    }
  }

  res.setHeader("Allow", "GET, POST");
  return sendError(res, 405, "Method not allowed");
};
