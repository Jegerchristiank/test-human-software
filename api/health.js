const { sendJson, sendError } = require("./_lib/response");
const { optionalEnv } = require("./_lib/env");
const { getUserFromRequest, getProfileForUser } = require("./_lib/auth");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { isLikelyOpenAiKey, resolveAiAccess } = require("./_lib/aiAccess");
const { fetchUserOpenAiKey } = require("./_lib/userOpenAiKey");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const model = optionalEnv("OPENAI_MODEL", "gpt-5.2");
  const ttsModel = optionalEnv("OPENAI_TTS_MODEL", "tts-1");
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
    if (profile?.own_key_enabled) {
      try {
        const storedKey = await fetchUserOpenAiKey(user.id);
        if (storedKey) {
          userKey = storedKey;
        }
      } catch (error) {
        userKey = \"\";
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
};
