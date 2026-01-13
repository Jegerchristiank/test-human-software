const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { isAdminUser } = require("../_lib/admin");
const { getSupabaseAdmin } = require("../_lib/supabase");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STRIPE_ID_RE = /^[a-zA-Z0-9_\-]{6,}$/;

const MAX_PER_PAGE = 50;
const DEFAULT_PER_PAGE = 20;
const MAX_QUERY_LEN = 200;
const PLAN_VALUES = new Set(["free", "trial", "paid", "lifetime"]);
const STATUS_VALUES = new Set(["active", "disabled"]);
const MODE_VALUES = new Set(["email", "name", "user_id", "stripe_customer_id"]);

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseQuery(req) {
  const url = new URL(req.url || "", "http://localhost");
  return {
    page: url.searchParams.get("page"),
    perPage: url.searchParams.get("per_page"),
    query: url.searchParams.get("query"),
    mode: url.searchParams.get("mode"),
    plan: url.searchParams.get("plan"),
    status: url.searchParams.get("status"),
  };
}

async function getAuthUser(supabase, userId) {
  if (!supabase.auth?.admin?.getUserById || !userId) return null;
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) return null;
    return data?.user || null;
  } catch (error) {
    return null;
  }
}

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
      scope: "admin:users",
      limit: 30,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }
  if (!(await isAdminUser(user))) {
    return sendError(res, 403, "forbidden");
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return sendError(res, 500, "supabase_not_configured");
  }

  const params = parseQuery(req);
  const page = parsePositiveInt(params.page, 1);
  const perPage = Math.min(parsePositiveInt(params.perPage, DEFAULT_PER_PAGE), MAX_PER_PAGE);
  const query = params.query ? String(params.query).trim() : "";
  const mode = params.mode ? String(params.mode).trim() : "email";
  const plan = params.plan ? String(params.plan).trim() : "all";
  const status = params.status ? String(params.status).trim() : "all";

  if (query && query.length > MAX_QUERY_LEN) {
    return sendError(res, 400, "invalid_query");
  }
  if (mode && !MODE_VALUES.has(mode)) {
    return sendError(res, 400, "invalid_mode");
  }
  if (plan !== "all" && !PLAN_VALUES.has(plan)) {
    return sendError(res, 400, "invalid_plan");
  }
  if (status !== "all" && !STATUS_VALUES.has(status)) {
    return sendError(res, 400, "invalid_status");
  }

  if (query) {
    if (mode === "email" && !EMAIL_RE.test(query)) return sendError(res, 400, "invalid_email");
    if (mode === "user_id" && !UUID_RE.test(query)) return sendError(res, 400, "invalid_user_id");
    if (mode === "stripe_customer_id" && !STRIPE_ID_RE.test(query)) {
      return sendError(res, 400, "invalid_stripe_id");
    }
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let profileQuery = supabase
    .from("profiles")
    .select(
      "id, email, full_name, plan, is_admin, own_key_enabled, stripe_customer_id, admin_notes, disabled_at, disabled_reason, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (plan !== "all") {
    profileQuery = profileQuery.eq("plan", plan);
  }
  if (status === "disabled") {
    profileQuery = profileQuery.not("disabled_at", "is", null);
  } else if (status === "active") {
    profileQuery = profileQuery.is("disabled_at", null);
  }
  if (query) {
    if (mode === "email") {
      profileQuery = profileQuery.ilike("email", query);
    } else if (mode === "name") {
      profileQuery = profileQuery.ilike("full_name", `%${query}%`);
    } else if (mode === "user_id") {
      profileQuery = profileQuery.eq("id", query);
    } else if (mode === "stripe_customer_id") {
      profileQuery = profileQuery.eq("stripe_customer_id", query);
    }
  }

  const { data, error: listError, count } = await profileQuery.range(from, to);
  if (listError) {
    return sendError(res, 500, "profiles_query_failed");
  }

  const profiles = Array.isArray(data) ? data : [];
  const authUsers = await Promise.all(profiles.map((profile) => getAuthUser(supabase, profile.id)));

  const users = profiles.map((profile, index) => {
    const authUser = authUsers[index] || null;
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      plan: profile.plan,
      is_admin: profile.is_admin,
      own_key_enabled: profile.own_key_enabled,
      stripe_customer_id: profile.stripe_customer_id,
      admin_notes: profile.admin_notes,
      disabled_at: profile.disabled_at,
      disabled_reason: profile.disabled_reason,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      auth: authUser
        ? {
            email: authUser.email || null,
            created_at: authUser.created_at || null,
            last_sign_in_at: authUser.last_sign_in_at || null,
            banned_until: authUser.banned_until || null,
            role: authUser.role || null,
            email_confirmed_at: authUser.email_confirmed_at || null,
            phone_confirmed_at: authUser.phone_confirmed_at || null,
          }
        : null,
    };
  });

  return sendJson(res, 200, {
    ok: true,
    page,
    per_page: perPage,
    total: typeof count === "number" ? count : users.length,
    users,
  });
};
