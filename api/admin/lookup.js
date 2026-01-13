const { readJson } = require("../_lib/body");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { validatePayload } = require("../_lib/validate");
const { isAdminUser } = require("../_lib/admin");
const { getSupabaseAdmin } = require("../_lib/supabase");
const { logAuditEvent } = require("../_lib/audit");

const BODY_LIMIT_BYTES = 256 * 1024;
const QUERY_MAX_LEN = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_ID_RE = /^[a-zA-Z0-9_\-]{6,}$/;

async function safeCount(queryPromise) {
  try {
    const { count, error } = await queryPromise;
    if (error) return null;
    return typeof count === "number" ? count : 0;
  } catch (error) {
    return null;
  }
}

function validateQuery(mode, query) {
  if (!query || query.length > QUERY_MAX_LEN) return "invalid_query";
  if (mode === "email" && !EMAIL_RE.test(query)) return "invalid_email";
  if (mode === "user_id" && !UUID_RE.test(query)) return "invalid_user_id";
  if (mode.startsWith("stripe_") && !STRIPE_ID_RE.test(query)) return "invalid_stripe_id";
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Method not allowed");
  }

  let payload;
  try {
    payload = await readJson(req, BODY_LIMIT_BYTES);
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
      scope: "admin:lookup",
      limit: 20,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  const validation = validatePayload(payload, {
    fields: {
      mode: {
        type: "string",
        enum: ["email", "user_id", "stripe_customer_id", "stripe_subscription_id"],
        enumMessage: "Invalid lookup mode",
      },
      query: {
        type: "string",
        minLen: 1,
        maxLen: QUERY_MAX_LEN,
      },
    },
  });
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const mode = String(payload.mode || "").trim();
  const rawQuery = String(payload.query || "").trim();
  const query = mode === "email" ? rawQuery.toLowerCase() : rawQuery;
  const queryError = validateQuery(mode, query);
  if (queryError) {
    return sendError(res, 400, queryError);
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  let profile = null;
  let subscriptions = [];
  let userId = null;
  const lookupMeta = { mode };

  try {
    if (mode === "stripe_subscription_id") {
      const { data, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", query)
        .order("created_at", { ascending: false })
        .limit(5);
      if (subError) throw subError;
      subscriptions = Array.isArray(data) ? data : [];
      userId = subscriptions[0]?.user_id || null;
    } else {
      const profileQuery = supabase.from("profiles").select("*");
      if (mode === "email") {
        profileQuery.ilike("email", query);
      } else if (mode === "user_id") {
        profileQuery.eq("id", query);
      } else if (mode === "stripe_customer_id") {
        profileQuery.eq("stripe_customer_id", query);
      }
      const { data, error: profileError } = await profileQuery.maybeSingle();
      if (profileError && profileError.code !== "PGRST116") throw profileError;
      profile = data || null;
      userId = profile?.id || null;
    }

    if (userId && !profile) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (profileError && profileError.code !== "PGRST116") throw profileError;
      profile = profileData || null;
    }

    if (userId && !subscriptions.length) {
      const { data: subs, error: subsError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (subsError) throw subsError;
      subscriptions = Array.isArray(subs) ? subs : [];
    }

    if (!userId) {
      await logAuditEvent({
        eventType: "admin_profile_lookup",
        userId: user.id,
        status: "failure",
        req,
        metadata: lookupMeta,
      });
      return sendError(res, 404, "not_found");
    }

    const { data: userState, error: userStateError } = await supabase
      .from("user_state")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (userStateError && userStateError.code !== "PGRST116") throw userStateError;

    const now = Date.now();
    const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [usageTotal, usage7d, evalTotal, eval7d, auditTotal, audit7d] = await Promise.all([
      safeCount(
        supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", userId)
      ),
      safeCount(
        supabase
          .from("usage_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", since7d)
      ),
      safeCount(
        supabase
          .from("evaluation_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
      ),
      safeCount(
        supabase
          .from("evaluation_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", since7d)
      ),
      safeCount(
        supabase.from("audit_events").select("id", { count: "exact", head: true }).eq("user_id", userId)
      ),
      safeCount(
        supabase
          .from("audit_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", since7d)
      ),
    ]);

    const [usageRecent, evalRecent, auditRecent] = await Promise.all([
      supabase
        .from("usage_events")
        .select("id, event_type, model, mode, prompt_chars, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("evaluation_logs")
        .select("id, studio, policy_id, evaluation_type, question_key, group_key, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("audit_events")
        .select("id, actor_type, event_type, status, target_type, target_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    let authUser = null;
    if (userId && supabase.auth?.admin?.getUserById) {
      try {
        const authResult = await supabase.auth.admin.getUserById(userId);
        authUser = authResult?.data?.user || null;
      } catch (error) {
        authUser = null;
      }
    }

    const usageRecentData = usageRecent.error ? [] : usageRecent.data || [];
    const evalRecentData = evalRecent.error ? [] : evalRecent.data || [];
    const auditRecentData = auditRecent.error ? [] : auditRecent.data || [];

    await logAuditEvent({
      eventType: "admin_profile_lookup",
      userId: user.id,
      status: "success",
      req,
      metadata: lookupMeta,
    });

    return sendJson(res, 200, {
      ok: true,
      lookup: { mode, query: rawQuery },
      profile,
      auth_user: authUser,
      subscriptions,
      user_state: userState || null,
      usage: {
        total: usageTotal,
        last7d: usage7d,
        recent: usageRecentData,
      },
      evaluation_logs: {
        total: evalTotal,
        last7d: eval7d,
        recent: evalRecentData,
      },
      audit_events: {
        total: auditTotal,
        last7d: audit7d,
        recent: auditRecentData,
      },
    });
  } catch (err) {
    await logAuditEvent({
      eventType: "admin_profile_lookup",
      userId: user.id,
      status: "failure",
      req,
      metadata: lookupMeta,
    });
    return sendError(res, 500, "lookup_failed");
  }
};
