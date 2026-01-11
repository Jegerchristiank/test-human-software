const Stripe = require("stripe");
const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { logAuditEvent } = require("../_lib/audit");

const PAYMENT_METHOD_MAX = 200;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const validation = validatePayload(payload, {
    fields: {
      paymentMethodId: {
        type: "string",
        required: true,
        requiredMessage: "Missing payment method",
        minLen: 1,
        minLenMessage: "Missing payment method",
        maxLen: PAYMENT_METHOD_MAX,
        maxLenMessage: "Payment method too long",
        maxLenStatus: 413,
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const paymentMethodId = String(payload.paymentMethodId || "").trim();
  if (!paymentMethodId) {
    return sendError(res, 400, "Missing payment method");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:payment_method",
      limit: 8,
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

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
    const customerId = profile?.stripe_customer_id || null;
    if (!customerId) {
      return sendError(res, 400, "Missing customer");
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const existingCustomer = paymentMethod.customer || null;
    if (existingCustomer && existingCustomer !== customerId) {
      return sendError(res, 400, "Payment method already attached");
    }
    if (!existingCustomer) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    }

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const subscription = await getActiveSubscription(user.id);
    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        default_payment_method: paymentMethodId,
      });
    }

    const updated = await stripe.paymentMethods.retrieve(paymentMethodId);
    await logAuditEvent({
      eventType: "stripe_payment_method_set",
      userId: user.id,
      status: "success",
      req,
      targetType: "stripe_payment_method",
      targetId: paymentMethodId,
    });
    return sendJson(res, 200, { paymentMethod: updated });
  } catch (err) {
    await logAuditEvent({
      eventType: "stripe_payment_method_set",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not update payment method");
  }
};
