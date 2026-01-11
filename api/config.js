const { sendJson, sendError } = require("./_lib/response");
const { optionalEnv } = require("./_lib/env");
const { enforceRateLimit } = require("./_lib/rateLimit");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  if (
    !(await enforceRateLimit(req, res, {
      scope: "config:public",
      limit: 60,
      windowSeconds: 300,
    }))
  ) {
    return;
  }

  const supabaseUrl = optionalEnv("SUPABASE_URL");
  const supabasePublishableKey = optionalEnv("SUPABASE_PUBLISHABLE_KEY");
  const supabaseAnonKey = optionalEnv("SUPABASE_ANON_KEY");
  const supabaseKey = supabasePublishableKey || supabaseAnonKey;
  const stripePublishableKey = optionalEnv("STRIPE_PUBLISHABLE_KEY");
  const stripeSecretKey = optionalEnv("STRIPE_SECRET_KEY");
  const stripePriceId = optionalEnv("STRIPE_PRICE_ID");

  if (!supabaseUrl || !supabaseKey) {
    return sendError(
      res,
      500,
      "Missing public config (SUPABASE_URL + SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY)"
    );
  }

  return sendJson(res, 200, {
    supabaseUrl,
    supabaseAnonKey: supabaseKey,
    supabasePublishableKey: supabasePublishableKey || null,
    stripePublishableKey: stripePublishableKey || null,
    stripeConfigured: Boolean(stripeSecretKey && stripePriceId),
  });
};
