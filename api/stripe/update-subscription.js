const Stripe = require("stripe");
const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");

const ACTIVE_STATUSES = new Set(["trialing", "active"]);

async function syncSubscription({ userId, stripeCustomerId, subscription }) {
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

  if (typeof payload.cancelAtPeriodEnd !== "boolean") {
    return sendError(res, 400, "Missing cancel flag");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:subscription_update",
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

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
    const subscription = await getActiveSubscription(user.id);
    if (!subscription?.stripe_subscription_id) {
      return sendError(res, 404, "subscription_missing");
    }

    const updated = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: payload.cancelAtPeriodEnd,
    });

    await syncSubscription({
      userId: user.id,
      stripeCustomerId: profile?.stripe_customer_id || null,
      subscription: updated,
    });

    const priceId = updated.items?.data?.[0]?.price?.id || null;
    const currentPeriodEnd = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toISOString()
      : null;

    return sendJson(res, 200, {
      subscription: {
        id: updated.id,
        status: updated.status || null,
        price_id: priceId,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: Boolean(updated.cancel_at_period_end),
        stripe_subscription_id: updated.id,
      },
    });
  } catch (err) {
    return sendError(res, 500, "Could not update subscription");
  }
};
