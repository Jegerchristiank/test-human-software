const Stripe = require("stripe");
const { readRawBody } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit, checkRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const ACTIVE_STATUSES = new Set(["trialing", "active"]);
const MAX_ID_LENGTH = 200;
const STRIPE_EVENT_STATUSES = {
  RECEIVED: "received",
  PROCESSED: "processed",
  FAILED: "failed",
};

const EVENT_SCHEMA = {
  allowUnknown: true,
  fields: {
    id: { type: "string", required: true, maxLen: MAX_ID_LENGTH },
    type: { type: "string", required: true, maxLen: MAX_ID_LENGTH },
    object: { type: "string", required: true, maxLen: MAX_ID_LENGTH },
    livemode: { type: "boolean", required: true },
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

function resolveWebhookSecrets(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function enforceUserRateLimit(req, res, { userId, scope, limit, windowSeconds }) {
  if (!userId) return true;
  const result = await checkRateLimit({
    req,
    scope,
    limit,
    windowSeconds,
    userId,
  });
  if (result.error) {
    sendError(res, 503, "rate_limit_unavailable");
    return false;
  }
  if (!result.allowed) {
    sendError(res, 429, "rate_limited");
    return false;
  }
  return true;
}

async function recordWebhookEvent({ eventId, eventType, livemode }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("stripe_webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
    livemode: Boolean(livemode),
    status: STRIPE_EVENT_STATUSES.RECEIVED,
  });
  if (!error) return { duplicate: false };
  if (error.code === "23505") {
    const { data, error: readError } = await supabase
      .from("stripe_webhook_events")
      .select("status")
      .eq("event_id", eventId)
      .maybeSingle();
    if (readError) return { error: readError };
    if (data?.status === STRIPE_EVENT_STATUSES.PROCESSED) {
      return { duplicate: true };
    }
    return { duplicate: false };
  }
  return { error };
}

async function markWebhookEventProcessed(eventId) {
  if (!eventId) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from("stripe_webhook_events")
    .update({
      status: STRIPE_EVENT_STATUSES.PROCESSED,
      processed_at: new Date().toISOString(),
    })
    .eq("event_id", eventId);
}

async function markWebhookEventFailed(eventId) {
  if (!eventId) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from("stripe_webhook_events")
    .update({ status: STRIPE_EVENT_STATUSES.FAILED })
    .eq("event_id", eventId);
}

function resolveUserIdFromEvent(event) {
  if (!event?.type) return "";
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    return normalizeString(session?.client_reference_id || session?.metadata?.user_id);
  }
  if (event.type.startsWith("customer.subscription.")) {
    const subscription = event.data?.object;
    return normalizeString(subscription?.metadata?.user_id);
  }
  return "";
}

async function rejectWebhook(res, req, { eventId = null, eventType = null, reason = null } = {}) {
  await markWebhookEventFailed(eventId);
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

  const rateLimitOptions = {
    scope: "stripe:webhook",
    limit: 120,
    windowSeconds: 60,
  };

  if (
    !(await enforceRateLimit(req, res, {
      ...rateLimitOptions,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecrets = resolveWebhookSecrets(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secretKey || !webhookSecrets.length) {
    return sendError(res, 500, "Stripe not configured");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return sendError(res, 400, "Missing signature");
  }

  let event;
  let eventId = null;
  let eventType = null;
  let rawBody;
  try {
    rawBody = await readRawBody(req, 2 * 1024 * 1024);
  } catch (err) {
    const status = err?.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, err?.message || "Invalid payload");
  }

  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
      break;
    } catch (err) {
      // Try next secret to support rotation.
    }
  }
  if (!event) {
    return sendError(res, 400, "Webhook signature verification failed");
  }

  try {
    const validation = validatePayload(event, EVENT_SCHEMA);
    if (!validation.ok) {
      return rejectWebhook(res, req, { reason: "invalid_payload" });
    }

    eventId = normalizeString(event.id);
    eventType = normalizeString(event.type);
    if (!eventId || !eventType) {
      return rejectWebhook(res, req, { reason: "missing_event_fields" });
    }

    const record = await recordWebhookEvent({
      eventId,
      eventType,
      livemode: event.livemode,
    });
    if (record?.error) {
      throw record.error;
    }
    if (record?.duplicate) {
      return sendJson(res, 200, { received: true });
    }

    const rateLimitUserId = resolveUserIdFromEvent(event);
    if (
      !(await enforceUserRateLimit(req, res, {
        ...rateLimitOptions,
        userId: rateLimitUserId,
      }))
    ) {
      await markWebhookEventFailed(eventId);
      return;
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
          if (!rateLimitUserId || rateLimitUserId !== userId) {
            if (
              !(await enforceUserRateLimit(req, res, {
                ...rateLimitOptions,
                userId,
              }))
            ) {
              await markWebhookEventFailed(eventId);
              return;
            }
          }
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

    await markWebhookEventProcessed(eventId);

    return sendJson(res, 200, { received: true });
  } catch (err) {
    await markWebhookEventFailed(eventId);
    await logAuditEvent({
      eventType: "stripe_webhook",
      actorType: "webhook",
      status: "failure",
      req,
      targetType: eventId ? "stripe_event" : null,
      targetId: eventId,
      metadata: { reason: "handler_error" },
    });
    return sendError(res, 500, "Webhook handler failed");
  }
};
