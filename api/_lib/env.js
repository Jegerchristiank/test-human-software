function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing ${name}`);
    error.code = "MISSING_ENV";
    throw error;
  }
  return value;
}

function optionalEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value;
}

module.exports = {
  requireEnv,
  optionalEnv,
};
