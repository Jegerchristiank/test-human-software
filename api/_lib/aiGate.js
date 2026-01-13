const { getUserFromRequest, getProfileForUser } = require("./auth");
const { isLikelyOpenAiKey, resolveAiAccess } = require("./aiAccess");
const { fetchUserOpenAiKey } = require("./userOpenAiKey");

async function requireAiAccess(req) {
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return { error: "unauthenticated" };
  }

  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
  const plan = profile?.plan || "free";
  const headerKey = req.headers["x-user-openai-key"] || req.headers["x-openai-key"] || "";
  let userKey = typeof headerKey === "string" ? headerKey : "";

  if (!isLikelyOpenAiKey(userKey) && profile?.own_key_enabled) {
    try {
      const storedKey = await fetchUserOpenAiKey(user.id);
      if (storedKey) {
        userKey = storedKey;
      }
    } catch (error) {
      userKey = "";
    }
  }

  const access = resolveAiAccess({
    userKey,
    plan,
    serverKey: process.env.OPENAI_API_KEY,
  });

  if (!access.allowed) {
    if (profile?.own_key_enabled && !isLikelyOpenAiKey(userKey)) {
      return { error: "missing_key", user, profile };
    }
    return { error: access.reason || "payment_required", user, profile };
  }

  return { user, profile, access, error: null };
}

module.exports = {
  requireAiAccess,
};
