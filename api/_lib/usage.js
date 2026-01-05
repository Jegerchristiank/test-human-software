const { getSupabaseAdmin } = require("./supabase");

async function logUsageEvent(userId, { eventType, model, mode, promptChars } = {}) {
  if (!userId) return;
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("usage_events").insert({
      user_id: userId,
      event_type: eventType || "unknown",
      model: model || null,
      mode: mode || null,
      prompt_chars: typeof promptChars === "number" ? promptChars : null,
    });
  } catch (error) {
    // Avoid blocking user flows if logging fails.
  }
}

module.exports = {
  logUsageEvent,
};
