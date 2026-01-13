const { readJson } = require("../../_lib/body");
const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { isAdminUser } = require("../../_lib/admin");
const { getSupabaseAdmin } = require("../../_lib/supabase");
const { logAuditEvent } = require("../../_lib/audit");
const { hasUserOpenAiKey } = require("../../_lib/userOpenAiKey");

const BODY_LIMIT_BYTES = 64 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_ID_RE = /^[a-zA-Z0-9_\-]{6,}$/;
const ROLE_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const PLAN_VALUES = new Set(["free", "trial", "paid", "lifetime"]);

const MAX_NAME_LEN = 120;
const MAX_NOTES_LEN = 2000;
const MAX_REASON_LEN = 240;
const MAX_STRIPE_LEN = 255;
const MAX_DATE_LEN = 40;

function hasField(source, key) {
  return Boolean(source && Object.prototype.hasOwnProperty.call(source, key));
}

function normalizeOptionalText(value, maxLen) {
  if (value === null) return null;
  const text = String(value || "").trim();
  if (!text) return null;
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function parseDateValue(value) {
  if (value === null || value === undefined) return { value: null };
  const text = String(value).trim();
  if (!text) return { value: null };
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "invalid_date" };
  }
  return { value: parsed.toISOString() };
}

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
      scope: "admin:user:update",
      limit: 24,
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
      user_id: { type: "string", minLen: 1, maxLen: 200, required: true },
      profile: {
        type: "object",
        nullable: true,
        fields: {
          full_name: { type: "string", minLen: 1, maxLen: MAX_NAME_LEN, nullable: true },
          plan: { type: "string", minLen: 1, maxLen: 40 },
          is_admin: { type: "boolean", nullable: true },
          own_key_enabled: { type: "boolean", nullable: true },
          stripe_customer_id: { type: "string", minLen: 1, maxLen: MAX_STRIPE_LEN, nullable: true },
          admin_notes: { type: "string", minLen: 1, maxLen: MAX_NOTES_LEN, nullable: true },
          disabled_reason: { type: "string", minLen: 1, maxLen: MAX_REASON_LEN, nullable: true },
          terms_accepted_at: { type: "string", minLen: 1, maxLen: MAX_DATE_LEN, nullable: true },
          privacy_accepted_at: { type: "string", minLen: 1, maxLen: MAX_DATE_LEN, nullable: true },
        },
      },
      auth: {
        type: "object",
        nullable: true,
        fields: {
          email: { type: "string", minLen: 3, maxLen: 320, nullable: true },
          password: { type: "string", minLen: 8, maxLen: 200, nullable: true },
          email_confirm: { type: "boolean", nullable: true },
          role: { type: "string", minLen: 1, maxLen: 64, nullable: true },
        },
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const userId = String(payload.user_id || "").trim();
  if (!UUID_RE.test(userId)) {
    return sendError(res, 400, "invalid_user_id");
  }

  const profileInput = payload.profile || null;
  const authInput = payload.auth || null;
  const profileUpdates = {};
  const authUpdates = {};

  if (profileInput) {
    if (hasField(profileInput, "full_name")) {
      profileUpdates.full_name = normalizeOptionalText(profileInput.full_name, MAX_NAME_LEN);
    }
    if (hasField(profileInput, "plan")) {
      const plan = String(profileInput.plan || "").trim();
      if (!PLAN_VALUES.has(plan)) {
        return sendError(res, 400, "invalid_plan");
      }
      profileUpdates.plan = plan;
    }
    if (hasField(profileInput, "is_admin")) {
      profileUpdates.is_admin = Boolean(profileInput.is_admin);
    }
    if (hasField(profileInput, "own_key_enabled")) {
      profileUpdates.own_key_enabled = Boolean(profileInput.own_key_enabled);
    }
    if (hasField(profileInput, "stripe_customer_id")) {
      const stripeId = profileInput.stripe_customer_id;
      if (stripeId === null) {
        profileUpdates.stripe_customer_id = null;
      } else {
        const cleaned = String(stripeId || "").trim();
        if (!cleaned || cleaned.length > MAX_STRIPE_LEN || !STRIPE_ID_RE.test(cleaned)) {
          return sendError(res, 400, "invalid_stripe_id");
        }
        profileUpdates.stripe_customer_id = cleaned;
      }
    }
    if (hasField(profileInput, "admin_notes")) {
      profileUpdates.admin_notes = normalizeOptionalText(profileInput.admin_notes, MAX_NOTES_LEN);
    }
    if (hasField(profileInput, "disabled_reason")) {
      profileUpdates.disabled_reason = normalizeOptionalText(profileInput.disabled_reason, MAX_REASON_LEN);
    }
    if (hasField(profileInput, "terms_accepted_at")) {
      const parsed = parseDateValue(profileInput.terms_accepted_at);
      if (parsed.error) return sendError(res, 400, parsed.error);
      profileUpdates.terms_accepted_at = parsed.value;
    }
    if (hasField(profileInput, "privacy_accepted_at")) {
      const parsed = parseDateValue(profileInput.privacy_accepted_at);
      if (parsed.error) return sendError(res, 400, parsed.error);
      profileUpdates.privacy_accepted_at = parsed.value;
    }
  }

  if (authInput) {
    if (hasField(authInput, "email")) {
      const email = String(authInput.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        return sendError(res, 400, "invalid_email");
      }
      authUpdates.email = email;
      profileUpdates.email = email;
    }
    if (hasField(authInput, "password")) {
      const password = String(authInput.password || "");
      if (password.length < 8) {
        return sendError(res, 400, "invalid_password");
      }
      authUpdates.password = password;
    }
    if (hasField(authInput, "email_confirm")) {
      authUpdates.email_confirm = Boolean(authInput.email_confirm);
    }
    if (hasField(authInput, "role")) {
      const role = String(authInput.role || "").trim();
      if (!ROLE_RE.test(role) || role.toLowerCase() === "service_role") {
        return sendError(res, 400, "invalid_role");
      }
      authUpdates.role = role;
    }
  }

  if (!Object.keys(profileUpdates).length && !Object.keys(authUpdates).length) {
    return sendError(res, 400, "no_updates");
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  try {
    if (profileUpdates.own_key_enabled) {
      const hasKey = await hasUserOpenAiKey(userId);
      if (!hasKey) {
        return sendError(res, 400, "missing_key");
      }
    }

    if (Object.keys(authUpdates).length) {
      if (!supabase.auth?.admin?.updateUserById) {
        return sendError(res, 500, "auth_not_configured");
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
      if (authError) {
        throw new Error("auth_update_failed");
      }
    }

    if (Object.keys(profileUpdates).length) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...profileUpdates }, { onConflict: "id" });
      if (profileError) {
        throw new Error("profile_update_failed");
      }
    }

    await logAuditEvent({
      eventType: "admin_user_update",
      userId: user.id,
      status: "success",
      req,
      targetType: "user",
      targetId: userId,
      metadata: {
        profile_fields: Object.keys(profileUpdates).length,
        auth_fields: Object.keys(authUpdates).length,
      },
    });

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    const message = err?.message === "auth_update_failed" ? "auth_update_failed" : "profile_update_failed";
    await logAuditEvent({
      eventType: "admin_user_update",
      userId: user.id,
      status: "failure",
      req,
      targetType: "user",
      targetId: userId,
      metadata: {
        error: message,
      },
    });
    return sendError(res, 500, message);
  }
};
