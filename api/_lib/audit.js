const crypto = require("crypto");
const { getSupabaseAdmin } = require("./supabase");
const { getClientIp } = require("./rateLimit");

const MAX_METADATA_KEYS = 12;
const MAX_METADATA_VALUE_LEN = 200;
const BLOCKED_KEY_FRAGMENTS = ["token", "secret", "password", "authorization", "email", "key"];

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24);
}

function isSafeMetadataKey(key) {
  if (!/^[a-z0-9_]+$/i.test(key)) return false;
  const lower = key.toLowerCase();
  return !BLOCKED_KEY_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function sanitizeMetadata(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const clean = {};
  for (const [key, value] of Object.entries(meta)) {
    if (Object.keys(clean).length >= MAX_METADATA_KEYS) break;
    if (!isSafeMetadataKey(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) continue;
      clean[key] =
        trimmed.length > MAX_METADATA_VALUE_LEN ? trimmed.slice(0, MAX_METADATA_VALUE_LEN) : trimmed;
      continue;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    }
  }
  return Object.keys(clean).length ? clean : null;
}

async function logAuditEvent({
  eventType,
  userId,
  actorType = "user",
  status = "success",
  targetType = null,
  targetId = null,
  req = null,
  metadata = null,
} = {}) {
  if (!eventType) return;
  try {
    const supabase = getSupabaseAdmin();
    const ip = req ? getClientIp(req) : null;
    const ipHash = ip ? hashValue(ip) : null;
    const cleanMetadata = sanitizeMetadata(metadata);
    await supabase.from("audit_events").insert({
      event_type: eventType,
      user_id: userId || null,
      actor_type: actorType,
      status,
      target_type: targetType,
      target_id: targetId,
      ip_hash: ipHash,
      metadata: cleanMetadata,
    });
  } catch (error) {
    // Avoid blocking user flows if audit logging fails.
  }
}

module.exports = {
  logAuditEvent,
};
