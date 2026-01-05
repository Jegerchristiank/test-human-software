const { getUserFromRequest, getProfileForUser } = require("./auth");
const { resolveAiAccess } = require("./aiAccess");

async function requireAiAccess(req) {
  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return { error: "unauthenticated" };
  }

  const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
  const plan = profile?.plan || "free";
  const userKey = req.headers["x-user-openai-key"] || req.headers["x-openai-key"] || "";

  const access = resolveAiAccess({
    userKey,
    plan,
    serverKey: process.env.OPENAI_API_KEY,
  });

  if (!access.allowed) {
    return { error: access.reason || "payment_required", user, profile };
  }

  return { user, profile, access, error: null };
}

module.exports = {
  requireAiAccess,
};
