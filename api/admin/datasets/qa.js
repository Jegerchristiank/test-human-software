const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { isAdminUser } = require("../../_lib/admin");
const { getQaSummaryForVersion } = require("../../_lib/datasetAdmin");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "admin:dataset_qa",
      limit: 30,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }
  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }
  const versionId = String(req.query?.version_id || "").trim();
  if (!versionId) {
    return sendError(res, 400, "Missing version_id");
  }
  try {
    const qaSummary = await getQaSummaryForVersion({ versionId });
    return sendJson(res, 200, { qaSummary });
  } catch (err) {
    return sendError(res, 500, "qa_unavailable");
  }
};
