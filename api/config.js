const { sendJson, sendError } = require("./_lib/response");
const { optionalEnv } = require("./_lib/env");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const supabaseUrl = optionalEnv("SUPABASE_URL");
  const supabasePublishableKey = optionalEnv("SUPABASE_PUBLISHABLE_KEY");
  const supabaseAnonKey = optionalEnv("SUPABASE_ANON_KEY");
  const supabaseKey = supabasePublishableKey || supabaseAnonKey;
  const stripePublishableKey = optionalEnv("STRIPE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return sendError(res, 500, "Missing public config");
  }

  return sendJson(res, 200, {
    supabaseUrl,
    supabaseAnonKey: supabaseKey,
    supabasePublishableKey: supabasePublishableKey || null,
    stripePublishableKey: stripePublishableKey || null,
  });
};
