function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return "";
  return `${proto}://${host}`;
}

module.exports = {
  getBaseUrl,
};
