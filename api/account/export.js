const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "account:export",
      limit: 3,
      windowSeconds: 3600,
      userId: user.id,
    }))
  ) {
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, plan, own_key_enabled, terms_accepted_at, privacy_accepted_at, created_at")
      .eq("id", user.id)
      .single();

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("id, status, price_id, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: usageEvents } = await supabase
      .from("usage_events")
      .select("event_type, model, mode, prompt_chars, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000);

    const { data: userState } = await supabase
      .from("user_state")
      .select(
        "settings, history, seen, mistakes, performance, figure_captions, best_score, theme, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    return sendJson(res, 200, {
      exported_at: new Date().toISOString(),
      profile: profile || null,
      subscriptions: subscriptions || [],
      usage_events: usageEvents || [],
      user_state: userState || null,
    });
  } catch (err) {
    return sendError(res, 500, "Could not export data");
  }
};
