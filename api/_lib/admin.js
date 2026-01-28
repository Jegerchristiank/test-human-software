const { getSupabaseAdmin } = require("./supabase");

function isEmailConfirmed(user) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

async function isAdminUser(user) {
  if (!user || !user.id) return false;
  if (user?.app_metadata?.role === "admin" || user?.app_metadata?.is_admin === true) {
    return true;
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (!error && data?.is_admin) {
      return true;
    }

    const email = user.email;
    if (!email || !isEmailConfirmed(user)) {
      return false;
    }

    const { data: emailProfile, error: emailError } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("email", email)
      .eq("is_admin", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (emailError || !emailProfile?.is_admin) {
      return false;
    }
    if (!data?.is_admin) {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, email, is_admin: true }, { onConflict: "id" });
    }
    return true;
  } catch (error) {
    return false;
  }
}

function isImportEnabled() {
  const raw = String(process.env.ADMIN_IMPORT_ENABLED || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

module.exports = {
  isAdminUser,
  isImportEnabled,
};
