const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { logAuditEvent } = require("../_lib/audit");

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

    let profile = null;
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, plan, own_key_enabled, terms_accepted_at, privacy_accepted_at, created_at")
      .eq("id", user.id)
      .single();
    if (profileError && profileError.code !== "PGRST116") {
      await logAuditEvent({
        eventType: "account_exported",
        userId: user.id,
        status: "failure",
        req,
        metadata: { stage: "profiles" },
      });
      return sendError(res, 500, "Could not export data");
    }
    profile = profileData || null;

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("subscriptions")
      .select("id, status, price_id, current_period_end, cancel_at_period_end, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (subscriptionsError) {
      await logAuditEvent({
        eventType: "account_exported",
        userId: user.id,
        status: "failure",
        req,
        metadata: { stage: "subscriptions" },
      });
      return sendError(res, 500, "Could not export data");
    }

    const { data: usageEvents, error: usageEventsError } = await supabase
      .from("usage_events")
      .select("event_type, model, mode, prompt_chars, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (usageEventsError) {
      await logAuditEvent({
        eventType: "account_exported",
        userId: user.id,
        status: "failure",
        req,
        metadata: { stage: "usage_events" },
      });
      return sendError(res, 500, "Could not export data");
    }

    const { data: evaluationLogs, error: evaluationLogsError } = await supabase
      .from("evaluation_logs")
      .select(
        "studio, policy_id, evaluation_type, question_key, group_key, input_hash, output_hash, input_version, output_version, meta, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (evaluationLogsError) {
      await logAuditEvent({
        eventType: "account_exported",
        userId: user.id,
        status: "failure",
        req,
        metadata: { stage: "evaluation_logs" },
      });
      return sendError(res, 500, "Could not export data");
    }

    const { data: userState, error: userStateError } = await supabase
      .from("user_state")
      .select(
        "settings, history, seen, mistakes, performance, figure_captions, best_score, best_scores, theme, show_meta, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();
    if (userStateError) {
      await logAuditEvent({
        eventType: "account_exported",
        userId: user.id,
        status: "failure",
        req,
        metadata: { stage: "user_state" },
      });
      return sendError(res, 500, "Could not export data");
    }

    await logAuditEvent({
      eventType: "account_exported",
      userId: user.id,
      status: "success",
      req,
    });

    return sendJson(res, 200, {
      exported_at: new Date().toISOString(),
      profile: profile || null,
      subscriptions: subscriptions || [],
      usage_events: usageEvents || [],
      evaluation_logs: evaluationLogs || [],
      user_state: userState || null,
    });
  } catch (err) {
    await logAuditEvent({
      eventType: "account_exported",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not export data");
  }
};
