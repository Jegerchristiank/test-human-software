const SUBSCRIPTION_PAYMENT_METHODS = new Set([
  "ach_debit",
  "acss_debit",
  "affirm",
  "amazon_pay",
  "au_becs_debit",
  "bacs_debit",
  "bancontact",
  "boleto",
  "card",
  "cashapp",
  "crypto",
  "custom",
  "customer_balance",
  "eps",
  "fpx",
  "giropay",
  "grabpay",
  "ideal",
  "kakao_pay",
  "klarna",
  "konbini",
  "kr_card",
  "link",
  "multibanco",
  "naver_pay",
  "nz_bank_account",
  "p24",
  "pay_by_bank",
  "payco",
  "paynow",
  "paypal",
  "payto",
  "promptpay",
  "revolut_pay",
  "sepa_debit",
  "sofort",
  "stripe_balance",
  "us_bank_account",
  "wechat_pay",
]);

const SETUP_PAYMENT_METHODS = new Set([
  "card",
  "acss_debit",
  "au_becs_debit",
  "bacs_debit",
  "sepa_debit",
  "us_bank_account",
]);

const ONE_TIME_PAYMENT_METHODS = new Set([...SUBSCRIPTION_PAYMENT_METHODS]);

function resolvePaymentMethodTypes(rawValue, supported, options = {}) {
  const { ensureCard = false, fallbackToCard = false } = options;
  const raw = String(rawValue || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const filtered = raw.filter((entry) => supported.has(entry));
  if (!filtered.length) {
    return fallbackToCard ? ["card"] : [];
  }
  if (ensureCard && !filtered.includes("card")) {
    filtered.unshift("card");
  }
  return [...new Set(filtered)];
}

function resolveSubscriptionPaymentMethodTypes() {
  return resolvePaymentMethodTypes(process.env.STRIPE_PAYMENT_METHOD_TYPES, SUBSCRIPTION_PAYMENT_METHODS, {
    ensureCard: true,
    fallbackToCard: false,
  });
}

function resolveSetupPaymentMethodTypes() {
  return resolvePaymentMethodTypes(process.env.STRIPE_PAYMENT_METHOD_TYPES, SETUP_PAYMENT_METHODS, {
    ensureCard: true,
    fallbackToCard: true,
  });
}

function resolveOneTimePaymentMethodTypes() {
  return resolvePaymentMethodTypes(process.env.STRIPE_PAYMENT_METHOD_TYPES, ONE_TIME_PAYMENT_METHODS, {
    ensureCard: true,
    fallbackToCard: false,
  });
}

module.exports = {
  resolveSubscriptionPaymentMethodTypes,
  resolveSetupPaymentMethodTypes,
  resolveOneTimePaymentMethodTypes,
};
