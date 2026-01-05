const crypto = require("crypto");
const { getSupabaseAdmin } = require("./supabase");
const { sendError } = require("./response");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24);
}

async function checkRateLimit({ req, scope, limit, windowSeconds, userId }) {
  const ip = getClientIp(req);
  const keySource = userId ? `u:${userId}` : `ip:${hashValue(ip)}`;
  const key = `rl:${scope}:${keySource}`;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_limit: limit,
  });
  if (error) {
    console.warn("rate_limit_error", error.message || error);
    return { allowed: true, error };
  }
  return { allowed: Boolean(data) };
}

async function enforceRateLimit(req, res, options) {
  const { allowed } = await checkRateLimit({ req, ...options });
  if (!allowed) {
    sendError(res, 429, "rate_limited");
    return false;
  }
  return true;
}

module.exports = {
  checkRateLimit,
  enforceRateLimit,
};
