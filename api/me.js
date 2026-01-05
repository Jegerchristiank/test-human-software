const { sendJson, sendError } = require("./_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }

  try {
    const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
    const subscription = await getActiveSubscription(user.id);

    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      },
      profile,
      subscription,
    });
  } catch (err) {
    return sendError(res, 500, "Could not load profile");
  }
};
