const { readJson } = require("./_lib/body");
const { sendJson, sendError } = require("./_lib/response");
const { getUserFromRequest } = require("./_lib/auth");
const { getSupabaseAdmin } = require("./_lib/supabase");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { validatePayload } = require("./_lib/validate");
const { logAuditEvent } = require("./_lib/audit");

const MAX_HISTORY = 500;
const MAX_KEYS = 5000;
const MAX_THEME_LEN = 16;

const USER_STATE_SCHEMA = {
  fields: {
    settings: { type: "object", nullable: true, allowUnknown: true },
    active_session: { type: "object", nullable: true, allowUnknown: true },
    history: {
      type: "array",
      maxItems: MAX_HISTORY,
      item: { type: "object", allowUnknown: true },
    },
    seen: {
      type: "array",
      maxItems: MAX_KEYS,
      item: { type: "string", maxLen: 120 },
    },
    mistakes: {
      type: "array",
      maxItems: MAX_KEYS,
      item: { type: "string", maxLen: 120 },
    },
    performance: { type: "object", nullable: true, allowUnknown: true },
    figure_captions: { type: "object", nullable: true, allowUnknown: true },
    best_score: { type: "number", min: 0, max: 100 },
    best_scores: { type: "object", nullable: true, allowUnknown: true },
    theme: { type: "string", maxLen: MAX_THEME_LEN },
    show_meta: { type: "boolean" },
  },
};

const USER_STATE_SELECT =
  "settings, active_session, history, seen, mistakes, performance, figure_captions, best_score, best_scores, theme, show_meta, updated_at";

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }

  const rateScope = req.method === "GET" ? "user_state:read" : "user_state:write";
  const rateLimit = req.method === "GET" ? 120 : 180;
  if (
    !(await enforceRateLimit(req, res, {
      scope: rateScope,
      limit: rateLimit,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    try {
      const { data, error: fetchError } = await supabase
        .from("user_state")
        .select(USER_STATE_SELECT)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      return sendJson(res, 200, { userState: data || null });
    } catch (err) {
      return sendError(res, 500, "Could not load user state");
    }
  }

  let payload;
  try {
    payload = await readJson(req);
  } catch (error) {
    const status = error.message === "Payload too large" ? 413 : 400;
    return sendError(res, status, error.message || "Invalid JSON");
  }

  const validation = validatePayload(payload, USER_STATE_SCHEMA);
  if (!validation.ok) {
    return sendError(res, validation.status, validation.error);
  }

  const hasFields = Object.keys(payload || {}).length > 0;
  if (!hasFields) {
    return sendError(res, 400, "No updates provided");
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("user_state")
      .select(USER_STATE_SELECT)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const merged = {
      ...(existing || {}),
      ...payload,
      user_id: user.id,
    };
    delete merged.updated_at;

    const { data, error: upsertError } = await supabase
      .from("user_state")
      .upsert(merged, { onConflict: "user_id" })
      .select(USER_STATE_SELECT)
      .single();

    if (upsertError) {
      throw upsertError;
    }

    await logAuditEvent({
      eventType: "user_state_updated",
      userId: user.id,
      status: "success",
      req,
      metadata: { field_count: Object.keys(payload || {}).length },
    });

    return sendJson(res, 200, { userState: data });
  } catch (err) {
    await logAuditEvent({
      eventType: "user_state_updated",
      userId: user.id,
      status: "failure",
      req,
    });
    return sendError(res, 500, "Could not update user state");
  }
};
