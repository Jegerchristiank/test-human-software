const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { getBaseUrl } = require("../_lib/url");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { resolveSubscriptionPaymentMethodTypes } = require("../_lib/stripe");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

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
  const baseUrl = getBaseUrl(req);
  const missing = [];
  if (!secretKey) missing.push("secret");
  if (!priceId) missing.push("price");
  if (!baseUrl) missing.push("base_url");
  if (missing.length) {
    return sendError(res, 500, "payment_not_configured", { missing });
  }

  const existing = await getActiveSubscription(user.id);
  if (existing) {
    return sendError(res, 409, "subscription_active");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });

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
    const paymentMethodTypes = resolveSubscriptionPaymentMethodTypes();
    const paymentSettings = {
      save_default_payment_method: "on_subscription",
      ...(paymentMethodTypes.length ? { payment_method_types: paymentMethodTypes } : {}),
    };

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: paymentSettings,
      metadata: { user_id: user.id },
      expand: ["latest_invoice.payment_intent"],
    });

    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent?.client_secret) {
      return sendError(res, 500, "Could not create payment intent");
    }

    await logAuditEvent({
      eventType: "stripe_subscription_created",
      userId: user.id,
      status: "success",
      req,
      targetType: "stripe_subscription",
      targetId: subscription.id,
    });

    return sendJson(res, 200, {
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
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
    console.error("stripe_subscription_error", {
      message,
      code,
    });
    await logAuditEvent({
      eventType: "stripe_subscription_created",
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
