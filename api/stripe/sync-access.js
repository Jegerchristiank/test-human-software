const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const ACTIVE_STATUSES = new Set(["trialing", "active"]);
const SUBSCRIPTION_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
  "canceled",
]);
const PLAN_TYPES = new Set(["subscription", "lifetime"]);
const LIFETIME_PLAN = "lifetime";
const MAX_ID_LENGTH = 255;
const STRIPE_SUB_RE = /^sub_[a-zA-Z0-9]+$/;
const STRIPE_PI_RE = /^pi_[a-zA-Z0-9]+$/;

function normalizeString(value, maxLen = MAX_ID_LENGTH) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > maxLen) return "";
  return trimmed;
}

function normalizePlanType(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePlan(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isLifetimePlan(value) {
  return normalizePlan(value) === LIFETIME_PLAN;
}

function toIsoSeconds(value) {
  if (!value) return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return new Date(asNumber * 1000).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function matchesUserMetadata(value, userId) {
  const metaUserId = normalizeString(value);
  if (!metaUserId) return true;
  return metaUserId === userId;
}

function sortSubscriptions(a, b) {
  const priority = [
    "active",
    "trialing",
    "past_due",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
    "canceled",
  ];
  const aIndex = priority.indexOf(a.status);
  const bIndex = priority.indexOf(b.status);
  if (aIndex !== bIndex) {
    return (aIndex === -1 ? priority.length : aIndex) - (bIndex === -1 ? priority.length : bIndex);
  }
  return (b.created || 0) - (a.created || 0);
}

async function upsertSubscription({ userId, stripeCustomerId, subscription, currentPlan }) {
  if (!userId || !subscription) return null;
  const supabase = getSupabaseAdmin();
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const currentPeriodEnd = toIsoSeconds(subscription.current_period_end);
  const status = subscription.status || null;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId || null,
      stripe_subscription_id: subscription.id,
      status,
      price_id: priceId,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (!isLifetimePlan(currentPlan)) {
    const nextPlan = ACTIVE_STATUSES.has(status) ? "paid" : "free";
    await supabase.from("profiles").update({ plan: nextPlan }).eq("id", userId);
  }

  return {
    id: subscription.id,
    status,
    price_id: priceId,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    stripe_subscription_id: subscription.id,
  };
}

async function resolveSubscriptionFromId({ stripe, subscriptionId, customerId, userId }) {
  if (!subscriptionId) return { subscription: null };
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subCustomerId = normalizeString(subscription?.customer);
  if (!subCustomerId || (customerId && subCustomerId !== customerId)) {
    return { error: "subscription_customer_mismatch" };
  }
  if (!matchesUserMetadata(subscription?.metadata?.user_id, userId)) {
    return { error: "subscription_user_mismatch" };
  }
  return { subscription, customerId: subCustomerId };
}

async function resolveSubscriptionFromCustomer({ stripe, customerId, userId }) {
  if (!customerId) return { subscription: null };
  const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const data = Array.isArray(list?.data) ? list.data : [];
  const candidates = data.filter((item) => {
    if (!item || !SUBSCRIPTION_STATUSES.has(item.status)) return false;
    return matchesUserMetadata(item.metadata?.user_id, userId);
  });
  if (!candidates.length) return { subscription: null };
  candidates.sort(sortSubscriptions);
  return { subscription: candidates[0] };
}

async function resolvePaymentIntentFromId({ stripe, paymentIntentId, customerId, userId }) {
  if (!paymentIntentId) return { intent: null };
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const intentCustomerId = normalizeString(intent?.customer);
  if (!intentCustomerId || (customerId && intentCustomerId !== customerId)) {
    return { error: "payment_intent_customer_mismatch" };
  }
  if (!matchesUserMetadata(intent?.metadata?.user_id, userId)) {
    return { error: "payment_intent_user_mismatch" };
  }
  return { intent, customerId: intentCustomerId };
}

async function resolveLifetimeIntentFromCustomer({ stripe, customerId, userId }) {
  if (!customerId) return { intent: null };
  const list = await stripe.paymentIntents.list({ customer: customerId, limit: 10 });
  const data = Array.isArray(list?.data) ? list.data : [];
  const candidates = data.filter((intent) => {
    if (!intent || intent.status !== "succeeded") return false;
    const purchaseType = normalizeString(intent?.metadata?.purchase_type);
    if (purchaseType !== "lifetime") return false;
    return matchesUserMetadata(intent?.metadata?.user_id, userId);
  });
  if (!candidates.length) return { intent: null };
  candidates.sort((a, b) => (b.created || 0) - (a.created || 0));
  return { intent: candidates[0] };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJsonAllowEmpty(req, 64 * 1024);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const validation = validatePayload(payload, {
    fields: {
      planType: {
        type: "string",
        required: false,
        maxLen: 32,
        enum: ["subscription", "lifetime"],
        enumMessage: "Invalid plan type",
      },
      subscriptionId: {
        type: "string",
        required: false,
        maxLen: MAX_ID_LENGTH,
        nullable: true,
        pattern: STRIPE_SUB_RE,
        patternMessage: "Invalid subscription id",
      },
      paymentIntentId: {
        type: "string",
        required: false,
        maxLen: MAX_ID_LENGTH,
        nullable: true,
        pattern: STRIPE_PI_RE,
        patternMessage: "Invalid payment intent id",
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const planType = normalizePlanType(payload?.planType);
  if (planType && !PLAN_TYPES.has(planType)) {
    return sendError(res, 400, "invalid_plan_type");
  }

  const subscriptionId = normalizeString(payload?.subscriptionId);
  const paymentIntentId = normalizeString(payload?.paymentIntentId);

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:sync_access",
      limit: 12,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return sendError(res, 500, "payment_not_configured");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
  const supabase = getSupabaseAdmin();
  let customerId = normalizeString(profile?.stripe_customer_id);
  let subscriptionFromId = null;
  let intentFromId = null;

  try {
    if (!customerId && subscriptionId) {
      const resolved = await resolveSubscriptionFromId({
        stripe,
        subscriptionId,
        customerId,
        userId: user.id,
      });
      if (resolved.error) {
        return sendError(res, 403, resolved.error);
      }
      subscriptionFromId = resolved.subscription || null;
      customerId = resolved.customerId || customerId;
    }
    if (!customerId && paymentIntentId) {
      const resolved = await resolvePaymentIntentFromId({
        stripe,
        paymentIntentId,
        customerId,
        userId: user.id,
      });
      if (resolved.error) {
        return sendError(res, 403, resolved.error);
      }
      intentFromId = resolved.intent || null;
      customerId = resolved.customerId || customerId;
    }

    if (!customerId) {
      await logAuditEvent({
        eventType: "stripe_access_sync",
        userId: user.id,
        status: "skipped",
        req,
        metadata: { reason: "missing_customer" },
      });
      return sendJson(res, 200, { updated: false, reason: "missing_customer" });
    }

    if (!profile?.stripe_customer_id && customerId) {
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    let updated = false;
    let subscriptionPayload = null;
    let lifetimeApplied = false;

    const shouldSyncSubscription = planType !== "lifetime";
    const shouldSyncLifetime = planType !== "subscription";

    if (shouldSyncSubscription) {
      let subscription = subscriptionFromId;
      if (!subscription && subscriptionId) {
        const resolved = await resolveSubscriptionFromId({
          stripe,
          subscriptionId,
          customerId,
          userId: user.id,
        });
        if (resolved.error) {
          return sendError(res, 403, resolved.error);
        }
        subscription = resolved.subscription || null;
      }
      if (!subscription) {
        const resolved = await resolveSubscriptionFromCustomer({
          stripe,
          customerId,
          userId: user.id,
        });
        subscription = resolved.subscription || null;
      }
      if (subscription) {
        subscriptionPayload = await upsertSubscription({
          userId: user.id,
          stripeCustomerId: customerId,
          subscription,
          currentPlan: profile?.plan || null,
        });
        updated = true;
      }
    }

    if (shouldSyncLifetime && !isLifetimePlan(profile?.plan)) {
      let intent = intentFromId;
      if (!intent && paymentIntentId) {
        const resolved = await resolvePaymentIntentFromId({
          stripe,
          paymentIntentId,
          customerId,
          userId: user.id,
        });
        if (resolved.error) {
          return sendError(res, 403, resolved.error);
        }
        intent = resolved.intent || null;
      }
      if (!intent) {
        const resolved = await resolveLifetimeIntentFromCustomer({
          stripe,
          customerId,
          userId: user.id,
        });
        intent = resolved.intent || null;
      }
      const purchaseType = normalizeString(intent?.metadata?.purchase_type);
      if (intent && intent.status === "succeeded" && purchaseType === "lifetime") {
        await supabase.from("profiles").update({ plan: LIFETIME_PLAN }).eq("id", user.id);
        lifetimeApplied = true;
        updated = true;
      }
    }

    await logAuditEvent({
      eventType: "stripe_access_sync",
      userId: user.id,
      status: "success",
      req,
      metadata: {
        updated,
        subscription_status: subscriptionPayload?.status || null,
        lifetime_applied: lifetimeApplied,
      },
    });

    return sendJson(res, 200, {
      updated,
      subscription: subscriptionPayload,
      plan: lifetimeApplied ? LIFETIME_PLAN : null,
    });
  } catch (err) {
    await logAuditEvent({
      eventType: "stripe_access_sync",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not sync Stripe access");
  }
};
