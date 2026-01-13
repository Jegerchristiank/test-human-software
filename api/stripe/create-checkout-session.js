const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { getBaseUrl } = require("../_lib/url");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { resolveOneTimePaymentMethodTypes } = require("../_lib/stripe");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const PAID_PLANS = new Set(["paid", "trial", "lifetime"]);
const PLAN_TYPES = new Set(["subscription", "lifetime"]);

function normalizePlan(plan) {
  return typeof plan === "string" ? plan.toLowerCase() : "free";
}

function normalizePlanType(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "subscription";
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
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const planType = normalizePlanType(payload?.planType);
  if (!PLAN_TYPES.has(planType)) {
    return sendError(res, 400, "invalid_plan_type");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:checkout",
      limit: 6,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const subscriptionPriceId = process.env.STRIPE_PRICE_ID;
  const lifetimePriceId = process.env.STRIPE_LIFETIME_PRICE_ID;
  const baseUrl = getBaseUrl(req);
  const missing = [];
  if (!secretKey) missing.push("secret");
  if (planType === "subscription" && !subscriptionPriceId) missing.push("subscription_price");
  if (planType === "lifetime" && !lifetimePriceId) missing.push("lifetime_price");
  if (!baseUrl) missing.push("base_url");
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

    const priceId = planType === "subscription" ? subscriptionPriceId : lifetimePriceId;
    const price = await stripe.prices.retrieve(priceId);
    if (planType === "subscription" && !price?.recurring) {
      return sendError(res, 400, "price_not_recurring");
    }
    if (planType === "lifetime" && price?.recurring) {
      return sendError(res, 400, "price_recurring");
    }

    const sessionPayload = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
    };

    if (planType === "subscription") {
      sessionPayload.mode = "subscription";
      sessionPayload.subscription_data = {
        metadata: {
          user_id: user.id,
        },
      };
    } else {
      sessionPayload.mode = "payment";
      sessionPayload.payment_intent_data = {
        metadata: {
          user_id: user.id,
          purchase_type: "lifetime",
        },
      };
      const paymentMethodTypes = resolveOneTimePaymentMethodTypes();
      if (paymentMethodTypes.length) {
        sessionPayload.payment_method_types = paymentMethodTypes;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    await logAuditEvent({
      eventType: "stripe_checkout_session_created",
      userId: user.id,
      status: "success",
      req,
      targetType: "stripe_session",
      targetId: session.id,
    });

    return sendJson(res, 200, { url: session.url });
  } catch (err) {
    await logAuditEvent({
      eventType: "stripe_checkout_session_created",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not create checkout session");
  }
};
