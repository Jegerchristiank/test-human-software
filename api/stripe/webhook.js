const Stripe = require("stripe");
const { readRawBody } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const ACTIVE_STATUSES = new Set(["trialing", "active"]);
const MAX_ID_LENGTH = 200;

const EVENT_SCHEMA = {
  allowUnknown: true,
  fields: {
    id: { type: "string", required: true, maxLen: MAX_ID_LENGTH },
    type: { type: "string", required: true, maxLen: MAX_ID_LENGTH },
    data: {
      type: "object",
      required: true,
      allowUnknown: true,
      fields: {
        object: { type: "object", required: true, allowUnknown: true },
      },
    },
  },
};

function normalizeString(value, maxLen = MAX_ID_LENGTH) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > maxLen) return "";
  return trimmed;
}

async function rejectWebhook(res, req, { eventId = null, eventType = null, reason = null } = {}) {
  await logAuditEvent({
    eventType: "stripe_webhook",
    actorType: "webhook",
    status: "denied",
    req,
    targetType: eventId ? "stripe_event" : null,
    targetId: eventId || null,
    metadata: {
      stripe_event_type: eventType || null,
      reason: reason || "invalid_payload",
    },
  });
  return sendError(res, 400, "Invalid webhook payload");
}

async function upsertSubscription({
  userId,
  stripeCustomerId,
  subscription,
}) {
  if (!userId || !subscription) return;
  const supabase = getSupabaseAdmin();
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId || null,
      stripe_subscription_id: subscription.id,
      status: subscription.status || null,
      price_id: priceId,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    },
    { onConflict: "stripe_subscription_id" }
  );

  const nextPlan = ACTIVE_STATUSES.has(subscription.status) ? "paid" : "free";
  await supabase.from("profiles").update({ plan: nextPlan }).eq("id", userId);
}

async function syncProfileCustomer({ userId, stripeCustomerId }) {
  if (!userId || !stripeCustomerId) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", userId);
}

async function findUserIdByCustomer(stripeCustomerId) {
  if (!stripeCustomerId) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return data?.id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:webhook",
      limit: 120,
      windowSeconds: 60,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return sendError(res, 500, "Stripe not configured");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return sendError(res, 400, "Missing signature");
  }

  let event;
  try {
    const rawBody = await readRawBody(req, 2 * 1024 * 1024);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return sendError(res, 400, "Webhook signature verification failed");
  }

  try {
    const validation = validatePayload(event, EVENT_SCHEMA);
    if (!validation.ok) {
      return rejectWebhook(res, req, { reason: "invalid_payload" });
    }

    const eventId = normalizeString(event.id);
    const eventType = normalizeString(event.type);
    if (!eventId || !eventType) {
      return rejectWebhook(res, req, { reason: "missing_event_fields" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = normalizeString(session?.client_reference_id || session?.metadata?.user_id);
        const customerId = normalizeString(session?.customer);
        if (userId && customerId) {
          await syncProfileCustomer({
            userId,
            stripeCustomerId: customerId,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = normalizeString(subscription?.customer);
        if (!stripeCustomerId) {
          return rejectWebhook(res, req, { eventId, eventType, reason: "missing_customer" });
        }
        const userId = await findUserIdByCustomer(stripeCustomerId);
        if (userId) {
          await upsertSubscription({
            userId,
            stripeCustomerId,
            subscription,
          });
        }
        break;
      }
      default:
        break;
    }

    await logAuditEvent({
      eventType: "stripe_webhook",
      actorType: "webhook",
      status: "success",
      req,
      targetType: "stripe_event",
      targetId: eventId,
      metadata: { stripe_event_type: eventType },
    });

    return sendJson(res, 200, { received: true });
  } catch (err) {
    await logAuditEvent({
      eventType: "stripe_webhook",
      actorType: "webhook",
      status: "failure",
      req,
      metadata: { reason: "handler_error" },
    });
    return sendError(res, 500, "Webhook handler failed");
  }
};
