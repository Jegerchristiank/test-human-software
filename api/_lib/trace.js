const crypto = require("crypto");

const TRACE_HEADER = "x-trace-id";
const TRACE_ID_MAX = 64;
const TRACE_ID_PATTERN = /^[a-zA-Z0-9._-]+$/;

function sanitizeTraceId(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!TRACE_ID_PATTERN.test(trimmed)) return "";
  if (trimmed.length > TRACE_ID_MAX) {
    return trimmed.slice(0, TRACE_ID_MAX);
  }
  return trimmed;
}

function generateTraceId() {
  return crypto.randomBytes(12).toString("hex");
}

function applyTraceId(req, res) {
  const headerValue = req.headers?.[TRACE_HEADER] || "";
  const traceId = sanitizeTraceId(headerValue) || generateTraceId();
  res.traceId = traceId;
  res.setHeader("x-trace-id", traceId);
  return traceId;
}

module.exports = {
  applyTraceId,
  TRACE_HEADER,
};
