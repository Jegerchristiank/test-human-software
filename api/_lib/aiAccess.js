const MIN_KEY_LENGTH = 20;

function isLikelyOpenAiKey(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!trimmed.startsWith("sk-")) return false;
  return trimmed.length >= MIN_KEY_LENGTH;
}

function resolveAiAccess({
  userKey,
  plan,
  serverKey,
} = {}) {
  const trimmedUserKey = typeof userKey === "string" ? userKey.trim() : "";
  if (isLikelyOpenAiKey(trimmedUserKey)) {
    return {
      allowed: true,
      mode: "user",
      key: trimmedUserKey,
      reason: null,
    };
  }

  const normalizedPlan = typeof plan === "string" ? plan.toLowerCase() : "free";
  if (normalizedPlan === "paid" || normalizedPlan === "trial" || normalizedPlan === "lifetime") {
    if (typeof serverKey === "string" && serverKey.trim()) {
      return {
        allowed: true,
        mode: "owner",
        key: serverKey.trim(),
        reason: null,
      };
    }
    return {
      allowed: false,
      mode: null,
      key: null,
      reason: "missing_key",
    };
  }

  return {
    allowed: false,
    mode: null,
    key: null,
    reason: "payment_required",
  };
}

module.exports = {
  isLikelyOpenAiKey,
  resolveAiAccess,
};
