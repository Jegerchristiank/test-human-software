const crypto = require("crypto");
const { getSupabaseAdmin } = require("./supabase");

function stableStringify(value) {
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${pairs.join(",")}}`;
}

function hashPayload(payload) {
  if (payload === undefined) return null;
  const serialized = stableStringify(payload);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

async function logEvaluationEvent(userId, event = {}) {
  if (!userId) return;
  const inputHash = hashPayload(event.input);
  const outputHash = hashPayload(event.output);
  if (!inputHash || !outputHash) return;
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("evaluation_logs").insert({
      user_id: userId,
      studio: event.studio || null,
      policy_id: event.policyId || null,
      evaluation_type: event.evaluationType || "unknown",
      question_key: event.questionKey || null,
      group_key: event.groupKey || null,
      input_hash: inputHash,
      output_hash: outputHash,
      input_version: event.inputVersion || "v1",
      output_version: event.outputVersion || "v1",
      meta: event.meta && typeof event.meta === "object" ? event.meta : null,
    });
  } catch (error) {
    // Avoid blocking user flows if logging fails.
  }
}

module.exports = {
  hashPayload,
  logEvaluationEvent,
  stableStringify,
};
