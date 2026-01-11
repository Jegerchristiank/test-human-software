const crypto = require("crypto");
const { getSupabaseAdmin } = require("./supabase");
const { sendError } = require("./response");

const TRUST_PROXY = ["1", "true", "yes"].includes(
  String(process.env.TRUST_PROXY || "").trim().toLowerCase()
);
const FORWARDED_HEADERS = (process.env.TRUST_PROXY_HEADERS || "x-forwarded-for")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function normalizeIp(raw) {
  if (!raw) return "";
  let value = String(raw).trim();
  if (!value || value.toLowerCase() === "unknown") return "";
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    if (end !== -1) {
      value = value.slice(1, end);
    }
  }
  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount === 1 && value.includes(".")) {
    value = value.split(":")[0];
  }
  if (value.startsWith("::ffff:")) {
    value = value.slice("::ffff:".length);
  }
  return value;
}

function isValidIpv4(value) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return false;
  return value.split(".").every((part) => {
    const num = Number(part);
    return Number.isInteger(num) && num >= 0 && num <= 255;
  });
}

function isValidIpv6(value) {
  if (!value.includes(":")) return false;
  return /^[0-9a-f:]+$/i.test(value);
}

function isValidIp(value) {
  return isValidIpv4(value) || isValidIpv6(value);
}

function getForwardedIp(req) {
  const values = [];
  FORWARDED_HEADERS.forEach((header) => {
    const raw = req.headers[header];
    if (typeof raw === "string" && raw.trim()) {
      values.push(raw);
    }
  });
  if (!values.length) return "";
  const tokens = values
    .join(",")
    .split(",")
    .map((entry) => normalizeIp(entry))
    .filter(Boolean);
  for (const token of tokens) {
    if (isValidIp(token)) return token;
  }
  return "";
}

function getClientIp(req) {
  const remote = normalizeIp(req.socket?.remoteAddress || "");
  if (TRUST_PROXY) {
    const realIp = normalizeIp(req.headers["x-real-ip"]);
    if (isValidIp(realIp)) return realIp;
    const forwarded = getForwardedIp(req);
    if (forwarded) return forwarded;
  }
  if (isValidIp(remote)) return remote;
  return remote || "unknown";
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
    return { allowed: false, error };
  }
  return { allowed: Boolean(data), error: null };
}

async function enforceRateLimit(req, res, options) {
  const { userId, limit, windowSeconds, scope, ipLimit, userLimit } = options;
  const ipCheck = await checkRateLimit({
    req,
    scope,
    limit: ipLimit ?? limit,
    windowSeconds,
    userId: null,
  });
  if (ipCheck.error) {
    sendError(res, 503, "rate_limit_unavailable");
    return false;
  }
  if (!ipCheck.allowed) {
    sendError(res, 429, "rate_limited");
    return false;
  }
  if (userId) {
    const userCheck = await checkRateLimit({
      req,
      scope,
      limit: userLimit ?? limit,
      windowSeconds,
      userId,
    });
    if (userCheck.error) {
      sendError(res, 503, "rate_limit_unavailable");
      return false;
    }
    if (!userCheck.allowed) {
      sendError(res, 429, "rate_limited");
      return false;
    }
  }
  return true;
}

module.exports = {
  checkRateLimit,
  enforceRateLimit,
  getClientIp,
};
