const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { getUserFromRequest } = require("./_lib/auth");
const { getSupabaseAdmin } = require("./_lib/supabase");
const { enforceRateLimit } = require("./_lib/rateLimit");

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
      scope: "account:profile",
      limit: 20,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const updates = {};
  if (typeof payload.fullName === "string") {
    updates.full_name = payload.fullName.trim() || null;
  }
  if (typeof payload.ownKeyEnabled === "boolean") {
    updates.own_key_enabled = payload.ownKeyEnabled;
  }
  if (payload.acceptTerms) {
    updates.terms_accepted_at = new Date().toISOString();
  }
  if (payload.acceptPrivacy) {
    updates.privacy_accepted_at = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return sendError(res, 400, "No updates provided");
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, plan, stripe_customer_id, own_key_enabled, terms_accepted_at, privacy_accepted_at")
      .single();

    if (updateError) {
      throw updateError;
    }

    return sendJson(res, 200, { profile: data });
  } catch (err) {
    return sendError(res, 500, "Could not update profile");
  }
};
