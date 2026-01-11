const { createClerkClient, verifyToken } = require("@clerk/backend");
const { requireEnv } = require("./env");

let clerkClient;

function getClerkClient() {
  if (clerkClient) return clerkClient;
  const secretKey = requireEnv("CLERK_SECRET_KEY");
  clerkClient = createClerkClient({ secretKey });
  return clerkClient;
}

async function verifyClerkToken(token) {
  const secretKey = requireEnv("CLERK_SECRET_KEY");
  const { data, errors } = await verifyToken(token, { secretKey });
  if (errors && errors.length) {
    return { data: null, error: errors[0] };
  }
  return { data, error: null };
}

async function getClerkUser(userId) {
  const client = getClerkClient();
  return client.users.getUser(userId);
}

module.exports = {
  getClerkClient,
  verifyClerkToken,
  getClerkUser,
};
