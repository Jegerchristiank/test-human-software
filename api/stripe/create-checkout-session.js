const Stripe = require("stripe");
const { readJsonAllowEmpty } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { getBaseUrl } = require("../_lib/url");
const { enforceRateLimit } = require("../_lib/rateLimit");
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
      scope: "stripe:checkout",
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/?checkout=cancel`,
    });

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
