const { createClient } = require("@supabase/supabase-js");
const { requireEnv } = require("./env");

let adminClient;

function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  const url = requireEnv("SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return adminClient;
}

module.exports = {
  getSupabaseAdmin,
};
