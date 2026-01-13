const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { resolveOneTimePaymentMethodTypes } = require("../_lib/stripe");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const PAID_PLANS = new Set(["paid", "trial", "lifetime"]);

function normalizePlan(plan) {
  return typeof plan === "string" ? plan.toLowerCase() : "free";
}

function resolveUnitAmount(price) {
  if (!price) return null;
  if (typeof price.unit_amount === "number" && Number.isFinite(price.unit_amount)) {
    return price.unit_amount;
  }
  if (typeof price.unit_amount_decimal === "string") {
    const parsed = Number(price.unit_amount_decimal);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return null;
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

  const validation = validatePayload(payload, { fields: {} });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:subscription",
      limit: 6,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const missing = [];
  if (!secretKey) missing.push("secret");
  if (!priceId) missing.push("price");
  if (missing.length) {
    return sendError(res, 500, "payment_not_configured", { missing });
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
  if (PAID_PLANS.has(normalizePlan(profile?.plan))) {
    return sendError(res, 409, "subscription_active");
  }
  const existing = await getActiveSubscription(user.id);
  if (existing) {
    return sendError(res, 409, "subscription_active");
  }

  try {
    let customerId = profile?.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      const supabase = getSupabaseAdmin();
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (price?.recurring) {
      return sendError(res, 400, "price_recurring");
    }
    const amount = resolveUnitAmount(price);
    if (!amount) {
      return sendError(res, 500, "price_amount_missing");
    }
    const paymentMethodTypes = resolveOneTimePaymentMethodTypes();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: price.currency,
      customer: customerId,
      metadata: {
        user_id: user.id,
        purchase_type: "lifetime",
      },
      ...(paymentMethodTypes.length
        ? { payment_method_types: paymentMethodTypes }
        : { automatic_payment_methods: { enabled: true } }),
    });
    if (!paymentIntent?.client_secret) {
      return sendError(res, 500, "Could not create payment intent");
    }

    await logAuditEvent({
      eventType: "stripe_payment_intent_created",
      userId: user.id,
      status: "success",
      req,
      targetType: "stripe_payment_intent",
      targetId: paymentIntent.id,
    });

    return sendJson(res, 200, {
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
      customerId,
      price: {
        unit_amount: price.unit_amount,
        unit_amount_decimal: price.unit_amount_decimal || null,
        currency: price.currency,
        recurring: price.recurring
          ? {
              interval: price.recurring.interval,
              interval_count: price.recurring.interval_count,
            }
          : null,
        product: price.product && typeof price.product === "object"
          ? {
              name: price.product.name || null,
              description: price.product.description || null,
            }
          : null,
      },
    });
  } catch (err) {
    const message = err?.message ? String(err.message) : "";
    const code = err?.code || err?.decline_code || err?.type;
    console.error("stripe_payment_intent_error", {
      message,
      code,
    });
    await logAuditEvent({
      eventType: "stripe_payment_intent_created",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "stripe_error", {
      message: message || null,
      code: code ? String(code) : null,
    });
  }
};
