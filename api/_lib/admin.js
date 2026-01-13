const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
);

function normalizeEmail(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

function isAdminUser(user) {
  if (!user) return false;
  const email = normalizeEmail(user.email || user.user_metadata?.email || "");
  if (!email) return false;
  return ADMIN_EMAILS.has(email);
}

function isImportEnabled() {
  const raw = String(process.env.ADMIN_IMPORT_ENABLED || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

module.exports = {
  isAdminUser,
  isImportEnabled,
};
