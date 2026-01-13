const { sendJson, sendError } = require("./_lib/response");
const { optionalEnv } = require("./_lib/env");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("./_lib/auth");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { isLikelyOpenAiKey, resolveAiAccess } = require("./_lib/aiAccess");
const { fetchUserOpenAiKey } = require("./_lib/userOpenAiKey");

const PAID_PLANS = new Set(["paid", "pro", "trial", "lifetime"]);
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);

function normalizePlan(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "free";
}

function isPaidPlan(value) {
  return PAID_PLANS.has(normalizePlan(value));
}

function isActiveSubscription(subscription) {
  const status = String(subscription?.status || "").toLowerCase();
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendError(res, 405, "Method not allowed");
    }

    const model = optionalEnv("OPENAI_MODEL", "gpt-5.2");
    const ttsModel = optionalEnv("OPENAI_TTS_MODEL", "tts-1");
    const supabaseUrl = optionalEnv("SUPABASE_URL");
    const supabaseServiceKey = optionalEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return sendJson(res, 503, {
        status: "auth_unavailable",
        model,
        tts_model: ttsModel,
      });
    }
    const headerKey = req.headers["x-user-openai-key"] || req.headers["x-openai-key"] || "";
    let userKey = typeof headerKey === "string" ? headerKey : "";

    let plan = "free";
    let user = null;
    let authError = null;
    let profile = null;
    if (!isLikelyOpenAiKey(userKey)) {
      const auth = await getUserFromRequest(req);
      user = auth.user;
      authError = auth.error;
    }

    if (
      !(await enforceRateLimit(req, res, {
        scope: "health",
        limit: 60,
        windowSeconds: 300,
        userId: user?.id,
      }))
    ) {
      return;
    }

    if (!isLikelyOpenAiKey(userKey)) {
      if (authError || !user) {
        return sendJson(res, 401, {
          status: "unauthenticated",
          model,
          tts_model: ttsModel,
        });
      }
      profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
      plan = profile?.plan || "free";
      if (!isPaidPlan(plan)) {
        try {
          const subscription = await getActiveSubscription(user.id);
          if (isActiveSubscription(subscription)) {
            plan = "paid";
          }
        } catch (error) {
          console.warn("health_subscription_lookup_failed", error?.message || error);
        }
      }
      if (profile?.own_key_enabled) {
        try {
          const storedKey = await fetchUserOpenAiKey(user.id);
          if (storedKey) {
            userKey = storedKey;
          }
        } catch (error) {
          userKey = "";
        }
      }
    }

    const access = resolveAiAccess({
      userKey,
      plan,
      serverKey: process.env.OPENAI_API_KEY,
    });

    if (!access.allowed) {
      let status = access.reason || "unavailable";
      if (profile?.own_key_enabled && !isLikelyOpenAiKey(userKey)) {
        status = "missing_key";
      }
      const httpStatus = status === "missing_key" ? 503 : 402;
      return sendJson(res, httpStatus, {
        status,
        model,
        tts_model: ttsModel,
      });
    }

    return sendJson(res, 200, {
      status: "ok",
      model,
      tts_model: ttsModel,
      mode: access.mode,
    });
  } catch (error) {
    console.warn("health_check_failed", error?.message || error);
    return sendError(res, 500, "health_unavailable");
  }
};
