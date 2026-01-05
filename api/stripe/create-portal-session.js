const Stripe = require("stripe");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser } = require("../_lib/auth");
const { getBaseUrl } = require("../_lib/url");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");

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
      scope: "stripe:portal",
      limit: 6,
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
  let customerId = profile?.stripe_customer_id || null;
  const portalConfigId = process.env.STRIPE_PORTAL_CONFIGURATION_ID;

  try {
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

    const baseUrl = process.env.STRIPE_BASE_URL || getBaseUrl(req);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/?portal=return`,
      ...(portalConfigId ? { configuration: portalConfigId } : {}),
    });
    return sendJson(res, 200, { url: session.url });
  } catch (err) {
    return sendError(res, 500, "Could not create portal session");
  }
};
