function setSecurityHeaders(res) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()"
  );
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
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
  const body = JSON.stringify(responsePayload);
  res.statusCode = status;
  setSecurityHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function sendError(res, status, message, extra = {}) {
  sendJson(res, status, { error: message, ...extra });
}

module.exports = {
  sendJson,
  sendError,
  setSecurityHeaders,
};
