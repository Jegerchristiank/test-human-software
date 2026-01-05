const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "account:delete",
      limit: 2,
      windowSeconds: 3600,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!payload || payload.confirm !== true) {
    return sendError(res, 400, "Confirmation required");
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("usage_events").delete().eq("user_id", user.id);
    await supabase.from("subscriptions").delete().eq("user_id", user.id);
    await supabase.from("user_state").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.admin.deleteUser(user.id);

    return sendJson(res, 200, { status: "deleted" });
  } catch (err) {
    return sendError(res, 500, "Could not delete account");
  }
};
