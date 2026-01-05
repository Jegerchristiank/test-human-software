const Stripe = require("stripe");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser } = require("../_lib/auth");
const { getBaseUrl } = require("../_lib/url");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return sendError(res, 500, "Stripe not configured");
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
  const customerId = profile?.stripe_customer_id;
  if (!customerId) {
    return sendError(res, 400, "No Stripe customer" );
  }

  try {
    const baseUrl = process.env.STRIPE_BASE_URL || getBaseUrl(req);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/?portal=return`,
    });
    return sendJson(res, 200, { url: session.url });
  } catch (err) {
    return sendError(res, 500, "Could not create portal session");
  }
};
