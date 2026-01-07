function getBaseUrl() {
  const baseUrl = process.env.STRIPE_BASE_URL || "";
  return baseUrl.replace(/\/+$/, "");
}

module.exports = {
  getBaseUrl,
};
