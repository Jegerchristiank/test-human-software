const { sendJson, sendError } = require("./_lib/response");
const { optionalEnv } = require("./_lib/env");
const { getUserFromRequest, getProfileForUser } = require("./_lib/auth");
const { enforceRateLimit } = require("./_lib/rateLimit");
const { resolveAiAccess } = require("./_lib/aiAccess");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const model = optionalEnv("OPENAI_MODEL", "gpt-5.2");
  const ttsModel = optionalEnv("OPENAI_TTS_MODEL", "tts-1");
  const userKey = req.headers["x-user-openai-key"] || req.headers["x-openai-key"] || "";

  let plan = "free";
  let user = null;
  let authError = null;
  if (!userKey) {
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

  if (!userKey) {
    if (authError || !user) {
      return sendJson(res, 401, {
        status: "unauthenticated",
        model,
        tts_model: ttsModel,
      });
    }
    const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
    plan = profile?.plan || "free";
  }

  const access = resolveAiAccess({
    userKey,
    plan,
    serverKey: process.env.OPENAI_API_KEY,
  });

  if (!access.allowed) {
    const status = access.reason || "unavailable";
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
