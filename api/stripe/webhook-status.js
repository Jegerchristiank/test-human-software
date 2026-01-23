const { sendJson, sendError } = require("../_lib/response");
const { enforceRateLimit } = require("../_lib/rateLimit");

const WEBHOOK_PATH = "/api/stripe/webhook";

function normalizeBaseUrl(req) {
  const envBase = (process.env.STRIPE_BASE_URL || "").trim();
  if (envBase) {
    return envBase.replace(/\/+$/, "");
  }

  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").trim();
  if (!host) return "";
  const protoHeader = req.headers["x-forwarded-proto"] || "";
  const proto = protoHeader.split(",")[0].trim().toLowerCase();
  const scheme = proto === "http" || proto === "https" ? proto : "https";
  return `${scheme}://${host}`;
}

function hasWebhookSecret() {
  return (process.env.STRIPE_WEBHOOK_SECRET || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean).length;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:webhook-status",
      limit: 30,
      windowSeconds: 300,
    }))
  ) {
    return;
  }

  const baseUrl = normalizeBaseUrl(req);
  const expectedEndpoint = baseUrl ? `${baseUrl}${WEBHOOK_PATH}` : WEBHOOK_PATH;
  const stripeSecretConfigured = Boolean((process.env.STRIPE_SECRET_KEY || "").trim());
  const webhookSecretConfigured = Boolean(hasWebhookSecret());

  return sendJson(res, 200, {
    webhookConfigured: stripeSecretConfigured && webhookSecretConfigured,
    expectedEndpoint,
    guidance:
      "Set this URL as the Stripe webhook endpoint and re-enable deliveries in the Stripe Dashboard.",
  });
};
