const { getSupabaseAdmin } = require("./supabase");

function getAuthToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

async function getUserFromRequest(req) {
  const token = getAuthToken(req);
  if (!token) {
    return { user: null, error: "missing_token" };
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return { user: null, error: "invalid_token" };
    }
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: "invalid_token" };
  }
}

async function getProfileForUser(userId, { createIfMissing = false, userData = null } = {}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, stripe_customer_id, own_key_enabled, terms_accepted_at, privacy_accepted_at")
    .eq("id", userId)
    .single();

  if (!error && data) return data;
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  if (!createIfMissing) return null;

  const payload = {
    id: userId,
    email: userData?.email || null,
    full_name: userData?.user_metadata?.full_name || userData?.user_metadata?.name || null,
    plan: "free",
    own_key_enabled: false,
  };

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert(payload)
    .select("id, email, full_name, plan, stripe_customer_id, own_key_enabled, terms_accepted_at, privacy_accepted_at")
    .single();

  if (insertError) throw insertError;
  return created;
}

async function getActiveSubscription(userId) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, status, price_id, current_period_end, cancel_at_period_end, stripe_subscription_id"
    )
    .eq("user_id", userId)
    .in("status", ["trialing", "active", "past_due", "unpaid"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

module.exports = {
  getAuthToken,
  getUserFromRequest,
  getProfileForUser,
  getActiveSubscription,
};
