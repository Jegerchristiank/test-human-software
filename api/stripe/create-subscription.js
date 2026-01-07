const Stripe = require("stripe");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { getBaseUrl } = require("../_lib/url");
const { enforceRateLimit } = require("../_lib/rateLimit");

const SUPPORTED_PAYMENT_METHODS = new Set([
  "ach_debit",
  "acss_debit",
  "affirm",
  "amazon_pay",
  "au_becs_debit",
  "bacs_debit",
  "bancontact",
  "boleto",
  "card",
  "cashapp",
  "crypto",
  "custom",
  "customer_balance",
  "eps",
  "fpx",
  "giropay",
  "grabpay",
  "ideal",
  "kakao_pay",
  "klarna",
  "konbini",
  "kr_card",
  "link",
  "multibanco",
  "naver_pay",
  "nz_bank_account",
  "p24",
  "pay_by_bank",
  "payco",
  "paynow",
  "paypal",
  "payto",
  "promptpay",
  "revolut_pay",
  "sepa_debit",
  "sofort",
  "stripe_balance",
  "us_bank_account",
  "wechat_pay",
]);

function resolvePaymentMethodTypes() {
  const raw = String(process.env.STRIPE_PAYMENT_METHOD_TYPES || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const filtered = raw.filter((entry) => SUPPORTED_PAYMENT_METHODS.has(entry));
  if (!filtered.length) return [];
  if (!filtered.includes("card")) {
    filtered.unshift("card");
  }
  return [...new Set(filtered)];
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
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
    const paymentMethodTypes = resolvePaymentMethodTypes();
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
    return sendError(res, 500, "stripe_error", {
      message: message || null,
      code: code ? String(code) : null,
    });
  }
};
