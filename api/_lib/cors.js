const DEFAULT_ALLOWED_ORIGINS = ["https://biologistudio.dk"];
const DEV_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8000",
];

const DEFAULT_ALLOWED_METHODS = ["GET", "POST", "OPTIONS"];
const DEFAULT_ALLOWED_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-User-OpenAI-Key",
  "X-OpenAI-Key",
  "Stripe-Signature",
];

function normalizeOrigin(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (!url.protocol || !url.host) return "";
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return "";
  }
}

function readEnvOrigins() {
  const raw = process.env.CORS_ALLOW_ORIGINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);
}

function getAllowedOrigins() {
  const origins = new Set();
  DEFAULT_ALLOWED_ORIGINS.forEach((origin) => {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  });
  readEnvOrigins().forEach((origin) => origins.add(origin));
  if (process.env.NODE_ENV !== "production") {
    DEV_ALLOWED_ORIGINS.forEach((origin) => origins.add(origin));
  }
  return origins;
}

function resolveAllowedOrigin(originHeader) {
  const origin = normalizeOrigin(originHeader);
  if (!origin) return "";
  const allowed = getAllowedOrigins();
  return allowed.has(origin) ? origin : "";
}

function appendVaryHeader(res, value) {
  if (!res || typeof res.getHeader !== "function") return;
  const existing = res.getHeader("Vary");
  if (!existing) {
    res.setHeader("Vary", value);
    return;
  }
  const current = Array.isArray(existing) ? existing.join(", ") : String(existing);
  const parts = current
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (!parts.includes(String(value).toLowerCase())) {
    res.setHeader("Vary", `${current}, ${value}`);
  }
}

function applyCorsHeaders(
  req,
  res,
  {
    allowMethods = DEFAULT_ALLOWED_METHODS,
    allowHeaders = DEFAULT_ALLOWED_HEADERS,
    maxAgeSeconds = 600,
  } = {}
) {
  if (!req || !res) return false;
  const allowedOrigin = resolveAllowedOrigin(req.headers?.origin);
  if (!allowedOrigin) return false;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  appendVaryHeader(res, "Origin");
  if (allowMethods) {
    const methods = Array.isArray(allowMethods) ? allowMethods : [String(allowMethods)];
    res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  }
  if (allowHeaders) {
    const headers = Array.isArray(allowHeaders) ? allowHeaders : [String(allowHeaders)];
    res.setHeader("Access-Control-Allow-Headers", headers.join(", "));
  }
  res.setHeader("Access-Control-Max-Age", String(maxAgeSeconds));
  return true;
}

module.exports = {
  applyCorsHeaders,
  getAllowedOrigins,
  normalizeOrigin,
  resolveAllowedOrigin,
};
