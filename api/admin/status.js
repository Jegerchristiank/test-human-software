const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { isAdminUser, isImportEnabled } = require("../_lib/admin");

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
      scope: "admin:status",
      limit: 20,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!isAdminUser(user)) {
    return sendError(res, 403, "forbidden");
  }

  return sendJson(res, 200, {
    admin: true,
    importEnabled: isImportEnabled(),
  });
};
