const Stripe = require("stripe");
const { readJson } = require("../../_lib/body");
const { sendJson, sendError } = require("../../_lib/response");
const { getUserFromRequest } = require("../../_lib/auth");
const { enforceRateLimit } = require("../../_lib/rateLimit");
const { validatePayload } = require("../../_lib/validate");
const { isAdminUser } = require("../../_lib/admin");
const { getSupabaseAdmin } = require("../../_lib/supabase");
const { logAuditEvent } = require("../../_lib/audit");

const BODY_LIMIT_BYTES = 64 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_REASON_LEN = 240;
const BAN_DURATION = "876000h";
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);
const ACTIONS = new Set([
  "ban",
  "unban",
  "clear_user_state",
  "clear_usage",
  "clear_evaluation_logs",
  "clear_audit_events",
  "clear_openai_key",
  "delete_soft",
  "delete_hard",
]);

async function cancelStripeSubscriptions({ customerId, subscriptionIds }) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: "payment_not_configured" };
  }
  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  if (customerId) {
    const list = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    list.data.forEach((subscription) => {
      if (ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        subscriptionIds.add(subscription.id);
      }
    });
  }

  if (!subscriptionIds.size) return { ok: true };
  const results = await Promise.allSettled(
    [...subscriptionIds].map((id) => stripe.subscriptions.cancel(id))
  );
  const failed = results.find((result) => result.status === "rejected");
  if (failed) {
    return { ok: false, error: "stripe_cancel_failed" };
  }
  return { ok: true };
}

async function hardDeleteUser({ supabase, userId, cancelStripe }) {
  let customerId = null;
  let subscriptionIds = new Set();

  if (cancelStripe) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) {
      return { ok: false, error: "profile_lookup_failed" };
    }
    customerId = profile?.stripe_customer_id || null;

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId);
    if (subscriptionsError) {
      return { ok: false, error: "subscription_lookup_failed" };
    }
    subscriptionIds = new Set(
      (subscriptions || []).map((row) => row.stripe_subscription_id).filter(Boolean)
    );
  }

  if (cancelStripe && (customerId || subscriptionIds.size)) {
    const cancelResult = await cancelStripeSubscriptions({ customerId, subscriptionIds });
    if (!cancelResult.ok) {
      return cancelResult;
    }
  }

  const deletionSteps = [
    { table: "evaluation_logs", column: "user_id" },
    { table: "usage_events", column: "user_id" },
    { table: "subscriptions", column: "user_id" },
    { table: "user_state", column: "user_id" },
    { table: "user_openai_keys", column: "user_id" },
    { table: "profiles", column: "id" },
  ];

  for (const step of deletionSteps) {
    const { error: deleteError } = await supabase
      .from(step.table)
      .delete()
      .eq(step.column, userId);
    if (deleteError) {
      return { ok: false, error: "data_delete_failed", table: step.table };
    }
  }

  if (!supabase.auth?.admin?.deleteUser) {
    return { ok: true, warning: "auth_not_configured" };
  }
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    return { ok: true, warning: "auth_delete_failed" };
  }

  return { ok: true };
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
      scope: "admin:user:action",
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

  const validation = validatePayload(payload, {
    fields: {
      user_id: { type: "string", minLen: 1, maxLen: 200, required: true },
      action: {
        type: "string",
        minLen: 1,
        maxLen: 64,
        required: true,
        enum: Array.from(ACTIONS),
        enumMessage: "invalid_action",
      },
      reason: { type: "string", minLen: 1, maxLen: MAX_REASON_LEN, nullable: true },
      cancel_stripe: { type: "boolean", nullable: true },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const userId = String(payload.user_id || "").trim();
  if (!UUID_RE.test(userId)) {
    return sendError(res, 400, "invalid_user_id");
  }

  const action = String(payload.action || "").trim();
  const reason = payload.reason ? String(payload.reason).trim() : null;
  const cancelStripe = payload.cancel_stripe !== false;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  try {
    let actionWarning = null;
    if (action === "ban" || action === "delete_soft") {
      if (!supabase.auth?.admin?.updateUserById) {
        return sendError(res, 500, "auth_not_configured");
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: BAN_DURATION,
      });
      if (authError) {
        return sendError(res, 500, "ban_failed");
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          disabled_at: new Date().toISOString(),
          disabled_reason: reason,
        })
        .eq("id", userId);
      if (profileError) {
        return sendError(res, 500, "profile_update_failed");
      }
    } else if (action === "unban") {
      if (!supabase.auth?.admin?.updateUserById) {
        return sendError(res, 500, "auth_not_configured");
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });
      if (authError) {
        return sendError(res, 500, "unban_failed");
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          disabled_at: null,
          disabled_reason: null,
        })
        .eq("id", userId);
      if (profileError) {
        return sendError(res, 500, "profile_update_failed");
      }
    } else if (action === "clear_user_state") {
      const { error: deleteError } = await supabase
        .from("user_state")
        .delete()
        .eq("user_id", userId);
      if (deleteError) {
        return sendError(res, 500, "clear_failed");
      }
    } else if (action === "clear_usage") {
      const { error: deleteError } = await supabase
        .from("usage_events")
        .delete()
        .eq("user_id", userId);
      if (deleteError) {
        return sendError(res, 500, "clear_failed");
      }
    } else if (action === "clear_evaluation_logs") {
      const { error: deleteError } = await supabase
        .from("evaluation_logs")
        .delete()
        .eq("user_id", userId);
      if (deleteError) {
        return sendError(res, 500, "clear_failed");
      }
    } else if (action === "clear_audit_events") {
      const { error: deleteError } = await supabase
        .from("audit_events")
        .delete()
        .eq("user_id", userId);
      if (deleteError) {
        return sendError(res, 500, "clear_failed");
      }
    } else if (action === "clear_openai_key") {
      const { error: deleteError } = await supabase
        .from("user_openai_keys")
        .delete()
        .eq("user_id", userId);
      if (deleteError) {
        return sendError(res, 500, "clear_failed");
      }
    } else if (action === "delete_hard") {
      const result = await hardDeleteUser({ supabase, userId, cancelStripe });
      if (!result.ok) {
        return sendError(res, 500, result.error || "delete_failed");
      }
      actionWarning = result.warning || null;
    }

    await logAuditEvent({
      eventType: "admin_user_action",
      userId: user.id,
      status: "success",
      req,
      targetType: "user",
      targetId: userId,
      metadata: actionWarning ? { action, warning: actionWarning } : { action },
    });

    return sendJson(res, 200, actionWarning ? { ok: true, warning: actionWarning } : { ok: true });
  } catch (err) {
    await logAuditEvent({
      eventType: "admin_user_action",
      userId: user.id,
      status: "failure",
      req,
      targetType: "user",
      targetId: userId,
      metadata: { action },
    });
    return sendError(res, 500, "action_failed");
  }
};
