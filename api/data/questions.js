const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { getDatasetPayload } = require("../_lib/datasets");

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
      scope: "data:mcq",
      limit: 60,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  try {
    const payload = await getDatasetPayload("mcq");
    if (!Array.isArray(payload)) {
      return sendError(res, 500, "data_missing");
    }
    return sendJson(res, 200, payload);
  } catch (error) {
    return sendError(res, 500, "data_unavailable");
  }
};
