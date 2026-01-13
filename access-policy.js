(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.accessPolicy = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PAID_PLANS = new Set(["paid", "trial"]);
  const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
    "trialing",
    "active",
    "past_due",
    "unpaid",
  ]);

  function normalize(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
  }

  function hasPaidPlan({ plan } = {}) {
    return PAID_PLANS.has(normalize(plan));
  }

  function hasPaidAccess({ plan, subscriptionStatus } = {}) {
    if (hasPaidPlan({ plan })) return true;
    return ACTIVE_SUBSCRIPTION_STATUSES.has(normalize(subscriptionStatus));
  }

  function hasOwnKeyAccess({ useOwnKey, userKey } = {}) {
    if (!useOwnKey) return false;
    if (typeof userKey !== "string") return false;
    return Boolean(userKey.trim());
  }

  function resolveRoundAccess({ plan, subscriptionStatus, useOwnKey, userKey } = {}) {
    if (hasPaidAccess({ plan, subscriptionStatus })) {
      return { allowed: true, reason: null };
    }
    if (hasOwnKeyAccess({ useOwnKey, userKey })) {
      return { allowed: true, reason: null };
    }
    if (useOwnKey) {
      return { allowed: false, reason: "missing_key" };
    }
    return { allowed: false, reason: "payment_required" };
  }

  return {
    hasPaidPlan,
    hasPaidAccess,
    hasOwnKeyAccess,
    resolveRoundAccess,
  };
});
