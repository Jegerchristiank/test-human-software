const { getSupabaseAdmin } = require("./supabase");

async function isAdminUser(user) {
  if (!user || !user.id) return false;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return false;
    return Boolean(data.is_admin);
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
