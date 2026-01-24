const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { readJson } = require("../../_lib/body");
const { isAdminUser } = require("../../_lib/admin");
const { publishVersion } = require("../../_lib/datasetAdmin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:dataset_publish",
      limit: 10,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }
  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  let payload;
  try {
    payload = await readJson(req, 200000);
  } catch (err) {
    return sendError(res, 400, "Invalid JSON");
  }
  const validation = validatePayload(payload, {
    fields: {
      version_id: { type: "string", minLen: 1 },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }
  try {
    const result = await publishVersion({ versionId: payload.version_id, userId: user.id });
    return sendJson(res, 200, { ok: true, result });
  } catch (err) {
    const message = err?.message ? String(err.message).slice(0, 200) : "Publish failed";
    return sendError(res, 500, message);
  }
};
