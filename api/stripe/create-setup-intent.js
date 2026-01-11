const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { resolveSetupPaymentMethodTypes } = require("../_lib/stripe");
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
      scope: "stripe:setup",
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

    let paymentMethodTypes = resolveSetupPaymentMethodTypes();
    let setupIntent;
    try {
      setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        payment_method_types: paymentMethodTypes,
      });
    } catch (err) {
      const message = String(err?.message || "").toLowerCase();
      const canRetry = paymentMethodTypes.length > 1 &&
        (message.includes("payment method") && message.includes("activated"));
      if (!canRetry) {
        throw err;
      }
      paymentMethodTypes = ["card"];
      setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        payment_method_types: paymentMethodTypes,
      });
    }

    if (!setupIntent.client_secret) {
      return sendError(res, 500, "Could not create setup intent");
    }

    await logAuditEvent({
      eventType: "stripe_setup_intent_created",
      userId: user.id,
      status: "success",
      req,
      targetType: "stripe_setup_intent",
      targetId: setupIntent.id,
    });

    return sendJson(res, 200, {
      clientSecret: setupIntent.client_secret,
      paymentMethodTypes,
    });
  } catch (err) {
    await logAuditEvent({
      eventType: "stripe_setup_intent_created",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not create setup intent");
  }
};
