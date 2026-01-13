const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { getUserFromRequest, getProfileForUser } = require("./_lib/auth");
const { getSupabaseAdmin } = require("./_lib/supabase");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { validatePayload } = require("./_lib/validate");
const { logAuditEvent } = require("./_lib/audit");
const { isLikelyOpenAiKey } = require("./_lib/aiAccess");
const {
  upsertUserOpenAiKey,
  deleteUserOpenAiKey,
} = require("./_lib/userOpenAiKey");

const OPENAI_KEY_MAX = 200;

function mapProfile(profile, hasKey) {
  if (!profile) return null;
  return {
    ...profile,
    own_key_present: Boolean(hasKey),
  };
}

async function updateOwnKeyEnabled(userId, enabled) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .update({ own_key_enabled: Boolean(enabled) })
    .eq("id", userId)
    .select("id, email, full_name, plan, stripe_customer_id, own_key_enabled, terms_accepted_at, privacy_accepted_at")
    .single();
  if (error) throw error;
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "POST, DELETE");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "account:own-key",
      limit: 10,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  try {
    await getProfileForUser(user.id, { createIfMissing: true, userData: user });

    if (req.method === "DELETE") {
      await deleteUserOpenAiKey(user.id);
      const profile = await updateOwnKeyEnabled(user.id, false);
      await logAuditEvent({
        eventType: "own_access_cleared",
        userId: user.id,
        status: "success",
        req,
      });
      return sendJson(res, 200, {
        status: "cleared",
        profile: mapProfile(profile, false),
      });
    }

    let payload;
    try {
      payload = await readJson(req);
    } catch (error) {
      const status = error.message === "Payload too large" ? 413 : 400;
      return sendError(res, status, error.message || "Invalid JSON");
    }
    const validation = validatePayload(payload, {
      fields: {
        openAiKey: {
          type: "string",
          minLen: 20,
          maxLen: OPENAI_KEY_MAX,
          minLenMessage: "OpenAI key too short",
          maxLenMessage: "OpenAI key too long",
          maxLenStatus: 413,
        },
      },
    });
    if (!validation.ok) {
      return sendError(res, validation.status, validation.error);
    }

    const openAiKey = payload.openAiKey.trim();
    if (!isLikelyOpenAiKey(openAiKey)) {
      return sendError(res, 400, "Invalid OpenAI key");
    }

    await upsertUserOpenAiKey(user.id, openAiKey);
    const profile = await updateOwnKeyEnabled(user.id, true);
    await logAuditEvent({
      eventType: "own_access_saved",
      userId: user.id,
      status: "success",
      req,
    });
    return sendJson(res, 200, {
      status: "saved",
      profile: mapProfile(profile, true),
    });
  } catch (err) {
    if (err?.code === "MISSING_ENV" || /OPENAI_KEY_ENCRYPTION_SECRET/i.test(err?.message || "")) {
      return sendError(res, 503, "key_storage_unavailable");
    }
    await logAuditEvent({
      eventType: req.method === "DELETE" ? "own_access_cleared" : "own_access_saved",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not update key");
  }
};
