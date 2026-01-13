const { applyCorsHeaders } = require("./cors");

function setSecurityHeaders(res) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

function resolveAllowMethods(req, res) {
  if (res && typeof res.getHeader === "function") {
    const allow = res.getHeader("Allow");
    if (allow) {
      const allowValue = Array.isArray(allow) ? allow.join(",") : String(allow);
      const methods = allowValue
        .split(",")
        .map((entry) => entry.trim().toUpperCase())
        .filter(Boolean);
      if (!methods.includes("OPTIONS")) {
        methods.push("OPTIONS");
      }
      return methods;
    }
  }
  const method = req?.method ? String(req.method).toUpperCase() : "";
  if (!method) return null;
  if (method === "OPTIONS") return ["OPTIONS"];
  return [method, "OPTIONS"];
}

function sendJson(res, status, payload) {
  const traceId = res.traceId;
  let responsePayload = payload;
  if (traceId && payload && typeof payload === "object" && !Array.isArray(payload)) {
    if (!Object.prototype.hasOwnProperty.call(payload, "trace_id")) {
      responsePayload = { ...payload, trace_id: traceId };
    }
  }
  if (traceId && typeof res.getHeader === "function" && !res.getHeader("x-trace-id")) {
    res.setHeader("x-trace-id", traceId);
  }
  if (res.req) {
    const allowMethods = resolveAllowMethods(res.req, res);
    applyCorsHeaders(res.req, res, { allowMethods });
  }
  const body = JSON.stringify(responsePayload);
  res.statusCode = status;
  setSecurityHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function sendError(res, status, message, extra = {}) {
  if (res.req && res.req.method === "OPTIONS") {
    const allowMethods = resolveAllowMethods(res.req, res);
    const allowed = applyCorsHeaders(res.req, res, { allowMethods });
    res.statusCode = allowed ? 204 : 403;
    setSecurityHeaders(res);
    res.end();
    return;
  }
  sendJson(res, status, { error: message, ...extra });
}

module.exports = {
  sendJson,
  sendError,
  setSecurityHeaders,
};
