const Stripe = require("stripe");
const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { isAdminUser } = require("../_lib/admin");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { logAuditEvent } = require("../_lib/audit");

const BODY_LIMIT_BYTES = 64 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_SUB_RE = /^sub_[A-Za-z0-9]+$/;
const PRICE_RE = /^price_[A-Za-z0-9]+$/;
const STATUS_VALUES = new Set([
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused",
]);
const ACTIVE_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);

function parseDateValue(value) {
  if (value === null || value === undefined) return { value: null };
  const text = String(value).trim();
  if (!text) return { value: null };
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "invalid_period_end" };
  }
  return { value: parsed.toISOString() };
}

async function cancelStripeSubscription(subscriptionId) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: "payment_not_configured" };
  }
  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  await stripe.subscriptions.cancel(subscriptionId);
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
      scope: "admin:subscription",
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
      action: {
        type: "string",
        required: true,
        enum: ["upsert", "delete"],
        enumMessage: "invalid_action",
      },
      subscription_id: { type: "string", minLen: 1, maxLen: 200, nullable: true },
      user_id: { type: "string", minLen: 1, maxLen: 200, nullable: true },
      stripe_subscription_id: { type: "string", minLen: 1, maxLen: 255, nullable: true },
      status: { type: "string", minLen: 1, maxLen: 40, nullable: true },
      price_id: { type: "string", minLen: 1, maxLen: 255, nullable: true },
      current_period_end: { type: "string", minLen: 1, maxLen: 40, nullable: true },
      cancel_at_period_end: { type: "boolean", nullable: true },
      cancel_stripe: { type: "boolean", nullable: true },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const action = String(payload.action || "").trim();
  const subscriptionId = payload.subscription_id ? String(payload.subscription_id).trim() : null;
  const userId = payload.user_id ? String(payload.user_id).trim() : null;
  const stripeSubscriptionId = payload.stripe_subscription_id
    ? String(payload.stripe_subscription_id).trim()
    : null;
  const status = payload.status ? String(payload.status).trim() : null;
  const priceId = payload.price_id ? String(payload.price_id).trim() : null;
  const cancelAtPeriodEnd =
    typeof payload.cancel_at_period_end === "boolean" ? payload.cancel_at_period_end : null;
  const hasStripeSubField = Object.prototype.hasOwnProperty.call(payload, "stripe_subscription_id");
  const hasStatusField = Object.prototype.hasOwnProperty.call(payload, "status");
  const hasPriceField = Object.prototype.hasOwnProperty.call(payload, "price_id");
  const hasPeriodField = Object.prototype.hasOwnProperty.call(payload, "current_period_end");
  const hasCancelField = Object.prototype.hasOwnProperty.call(payload, "cancel_at_period_end");
  const cancelStripe = payload.cancel_stripe === true;

  if (subscriptionId && !UUID_RE.test(subscriptionId)) {
    return sendError(res, 400, "invalid_subscription_id");
  }
  if (userId && !UUID_RE.test(userId)) {
    return sendError(res, 400, "invalid_user_id");
  }
  if (stripeSubscriptionId && !STRIPE_SUB_RE.test(stripeSubscriptionId)) {
    return sendError(res, 400, "invalid_stripe_subscription_id");
  }
  if (priceId && !PRICE_RE.test(priceId)) {
    return sendError(res, 400, "invalid_price_id");
  }
  if (status && !STATUS_VALUES.has(status)) {
    return sendError(res, 400, "invalid_status");
  }

  const parsedPeriodEnd = parseDateValue(payload.current_period_end);
  if (parsedPeriodEnd.error) {
    return sendError(res, 400, parsedPeriodEnd.error);
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  try {
    if (action === "delete") {
      if (!subscriptionId) {
        return sendError(res, 400, "subscription_id_required");
      }
      const { data: existing, error: lookupError } = await supabase
        .from("subscriptions")
        .select("id, user_id, stripe_subscription_id")
        .eq("id", subscriptionId)
        .maybeSingle();
      if (lookupError) {
        return sendError(res, 500, "subscription_lookup_failed");
      }
      if (!existing) {
        return sendError(res, 404, "subscription_not_found");
      }
      if (cancelStripe && existing.stripe_subscription_id) {
        const cancelResult = await cancelStripeSubscription(existing.stripe_subscription_id);
        if (!cancelResult.ok) {
          return sendError(res, 502, cancelResult.error);
        }
      }
      const { error: deleteError } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionId);
      if (deleteError) {
        return sendError(res, 500, "subscription_delete_failed");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", existing.user_id)
        .maybeSingle();
      if (profile?.plan !== "lifetime") {
      const { count, error: activeError } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", existing.user_id)
        .in("status", Array.from(ACTIVE_STATUSES));
      if (!activeError && typeof count === "number" && count === 0) {
        await supabase.from("profiles").update({ plan: "free" }).eq("id", existing.user_id);
      }
    }

      await logAuditEvent({
        eventType: "admin_subscription_delete",
        userId: user.id,
        status: "success",
        req,
        targetType: "subscription",
        targetId: subscriptionId,
      });

      return sendJson(res, 200, { ok: true });
    }

    if (!subscriptionId && !userId) {
      return sendError(res, 400, "missing_user_id");
    }

    let existing = null;
    let targetUserId = userId;
    if (subscriptionId) {
      const { data, error: lookupError } = await supabase
        .from("subscriptions")
        .select("id, user_id, stripe_subscription_id, status, price_id, current_period_end, cancel_at_period_end")
        .eq("id", subscriptionId)
        .maybeSingle();
      if (lookupError) {
        return sendError(res, 500, "subscription_lookup_failed");
      }
      if (!data) {
        return sendError(res, 404, "subscription_not_found");
      }
      existing = data;
      targetUserId = data.user_id;
    }

    if (!targetUserId) {
      return sendError(res, 400, "missing_user_id");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, stripe_customer_id")
      .eq("id", targetUserId)
      .maybeSingle();

    const record = {
      user_id: targetUserId,
      stripe_customer_id: profile?.stripe_customer_id || null,
      stripe_subscription_id: hasStripeSubField
        ? stripeSubscriptionId
        : existing?.stripe_subscription_id || null,
      status: hasStatusField ? status : existing?.status || null,
      price_id: hasPriceField ? priceId : existing?.price_id || null,
      current_period_end: hasPeriodField ? parsedPeriodEnd.value : existing?.current_period_end || null,
      cancel_at_period_end:
        hasCancelField && cancelAtPeriodEnd !== null
          ? cancelAtPeriodEnd
          : existing?.cancel_at_period_end ?? false,
    };

    if (subscriptionId) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(record)
        .eq("id", subscriptionId);
      if (updateError) {
        return sendError(res, 500, "subscription_update_failed");
      }
    } else {
      const { error: insertError } = await supabase.from("subscriptions").insert(record);
      if (insertError) {
        return sendError(res, 500, "subscription_create_failed");
      }
    }

    if (profile?.plan !== "lifetime" && record.status) {
      const nextPlan = ACTIVE_STATUSES.has(record.status) ? "paid" : "free";
      await supabase.from("profiles").update({ plan: nextPlan }).eq("id", targetUserId);
    }

    await logAuditEvent({
      eventType: "admin_subscription_upsert",
      userId: user.id,
      status: "success",
      req,
      targetType: "subscription",
      targetId: subscriptionId,
    });

    return sendJson(res, 200, { ok: true });
  } catch (err) {
    await logAuditEvent({
      eventType: "admin_subscription_upsert",
      userId: user.id,
      status: "failure",
      req,
      targetType: "subscription",
      targetId: subscriptionId,
    });
    return sendError(res, 500, "subscription_failed");
  }
};
