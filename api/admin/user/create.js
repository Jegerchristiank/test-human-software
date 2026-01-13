const { readJson } = require("../../_lib/body");
const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { isAdminUser } = require("../../_lib/admin");
const { getSupabaseAdmin } = require("../../_lib/supabase");
const { logAuditEvent } = require("../../_lib/audit");

const BODY_LIMIT_BYTES = 64 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLAN_VALUES = new Set(["free", "trial", "paid", "lifetime"]);
const MAX_NAME_LEN = 120;
const MAX_NOTES_LEN = 2000;
const MAX_STRIPE_LEN = 255;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req, BODY_LIMIT_BYTES);
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
      scope: "admin:user:create",
      limit: 12,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }
  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  const validation = validatePayload(payload, {
    fields: {
      email: { type: "string", minLen: 3, maxLen: 320, required: true },
      password: { type: "string", minLen: 8, maxLen: 200, nullable: true },
      invite: { type: "boolean", nullable: true },
      confirm_email: { type: "boolean", nullable: true },
      profile: {
        type: "object",
        nullable: true,
        fields: {
          full_name: { type: "string", minLen: 1, maxLen: MAX_NAME_LEN, nullable: true },
          plan: { type: "string", nullable: true },
          is_admin: { type: "boolean", nullable: true },
          own_key_enabled: { type: "boolean", nullable: true },
          admin_notes: { type: "string", minLen: 1, maxLen: MAX_NOTES_LEN, nullable: true },
          stripe_customer_id: { type: "string", minLen: 1, maxLen: MAX_STRIPE_LEN, nullable: true },
        },
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return sendError(res, 400, "invalid_email");
  }

  const invite = Boolean(payload.invite);
  const password = payload.password ? String(payload.password) : "";
  if (!invite && password.length < 8) {
    return sendError(res, 400, "password_required");
  }

  const profile = payload.profile || {};
  const plan = PLAN_VALUES.has(profile.plan) ? profile.plan : "free";
  const profilePayload = {
    full_name: profile.full_name ? String(profile.full_name).trim() : null,
    plan,
    is_admin: Boolean(profile.is_admin),
    own_key_enabled: Boolean(profile.own_key_enabled),
    admin_notes: profile.admin_notes ? String(profile.admin_notes) : null,
    stripe_customer_id: profile.stripe_customer_id
      ? String(profile.stripe_customer_id).trim()
      : null,
  };

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  try {
    let authUser = null;
    if (invite) {
      const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
      if (inviteError || !data?.user) {
        return sendError(res, 400, "invite_failed");
      }
      authUser = data.user;
    } else {
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: Boolean(payload.confirm_email),
      });
      if (createError || !data?.user) {
        return sendError(res, 400, "create_failed");
      }
      authUser = data.user;
    }

    const userId = authUser?.id;
    if (!userId) {
      return sendError(res, 500, "create_failed");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        ...profilePayload,
      });
    if (profileError) {
      return sendError(res, 500, "profile_create_failed");
    }

    await logAuditEvent({
      eventType: "admin_user_create",
      userId: user.id,
      status: "success",
      req,
      targetType: "user",
      targetId: userId,
      metadata: { action: invite ? "invite" : "create" },
    });

    return sendJson(res, 200, { ok: true, user_id: userId });
  } catch (err) {
    await logAuditEvent({
      eventType: "admin_user_create",
      userId: user.id,
      status: "failure",
      req,
      metadata: { action: "create" },
    });
    return sendError(res, 500, "create_failed");
  }
};
