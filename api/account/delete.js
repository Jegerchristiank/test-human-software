const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const Stripe = require("stripe");

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);

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

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "account:delete",
      limit: 2,
      windowSeconds: 3600,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!payload || payload.confirm !== true) {
    return sendError(res, 400, "Confirmation required");
  }

  const supabase = getSupabaseAdmin();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    return sendError(res, 500, "Could not verify billing status");
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id);
  if (subscriptionsError) {
    return sendError(res, 500, "Could not verify billing status");
  }

  const customerId = profile?.stripe_customer_id || null;
  const subscriptionIds = new Set(
    (subscriptions || []).map((row) => row.stripe_subscription_id).filter(Boolean)
  );
  const needsStripeCleanup = Boolean(customerId || subscriptionIds.size);
  if (needsStripeCleanup) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return sendError(res, 500, "payment_not_configured");
    }
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    try {
      if (customerId) {
        const list = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 100,
        });
        list.data.forEach((subscription) => {
          if (ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
            subscriptionIds.add(subscription.id);
          }
        });
      }
      if (subscriptionIds.size) {
        const results = await Promise.allSettled(
          [...subscriptionIds].map((id) => stripe.subscriptions.cancel(id))
        );
        const failed = results.find((result) => result.status === "rejected");
        if (failed) {
          return sendError(res, 502, "Could not cancel subscription");
        }
      }
    } catch (error) {
      return sendError(res, 502, "Could not cancel subscription");
    }
  }

  try {
    await supabase.from("usage_events").delete().eq("user_id", user.id);
    await supabase.from("subscriptions").delete().eq("user_id", user.id);
    await supabase.from("user_state").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.admin.deleteUser(user.id);

    return sendJson(res, 200, { status: "deleted" });
  } catch (err) {
    return sendError(res, 500, "Could not delete account");
  }
};
