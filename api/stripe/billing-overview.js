const Stripe = require("stripe");
const { sendJson, sendError } = require("../_lib/response");
const { getUserFromRequest, getProfileForUser, getActiveSubscription } = require("../_lib/auth");
const { enforceRateLimit } = require("../_lib/rateLimit");
const { resolveSubscriptionPaymentMethodTypes } = require("../_lib/stripe");

function toIsoSeconds(value) {
  if (!value) return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    return new Date(asNumber * 1000).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeSubscription({ stripeSubscription, dbSubscription }) {
  if (stripeSubscription) {
    const priceId = stripeSubscription.items?.data?.[0]?.price?.id || null;
    return {
      id: stripeSubscription.id,
      status: stripeSubscription.status || null,
      price_id: priceId,
      current_period_start: toIsoSeconds(stripeSubscription.current_period_start),
      current_period_end: toIsoSeconds(stripeSubscription.current_period_end),
      cancel_at_period_end: Boolean(stripeSubscription.cancel_at_period_end),
      canceled_at: toIsoSeconds(stripeSubscription.canceled_at),
      trial_end: toIsoSeconds(stripeSubscription.trial_end),
      stripe_subscription_id: stripeSubscription.id,
    };
  }
  if (dbSubscription) {
    return {
      id: dbSubscription.id,
      status: dbSubscription.status || null,
      price_id: dbSubscription.price_id || null,
      current_period_start: null,
      current_period_end: dbSubscription.current_period_end || null,
      cancel_at_period_end: Boolean(dbSubscription.cancel_at_period_end),
      canceled_at: null,
      trial_end: null,
      stripe_subscription_id: dbSubscription.stripe_subscription_id || null,
    };
  }
  return null;
}

function mapInvoice(invoice) {
  return {
    id: invoice.id,
    number: invoice.number || null,
    status: invoice.status || null,
    created: toIsoSeconds(invoice.created),
    period_start: toIsoSeconds(invoice.period_start),
    period_end: toIsoSeconds(invoice.period_end),
    amount_due: typeof invoice.amount_due === "number" ? invoice.amount_due : null,
    amount_paid: typeof invoice.amount_paid === "number" ? invoice.amount_paid : null,
    amount_remaining: typeof invoice.amount_remaining === "number" ? invoice.amount_remaining : null,
    currency: invoice.currency || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    invoice_pdf: invoice.invoice_pdf || null,
  };
}

function mapPaymentMethod(paymentMethod) {
  if (!paymentMethod) return null;
  if (paymentMethod.type === "card" && paymentMethod.card) {
    return {
      type: "card",
      brand: paymentMethod.card.brand || null,
      last4: paymentMethod.card.last4 || null,
      exp_month: paymentMethod.card.exp_month || null,
      exp_year: paymentMethod.card.exp_year || null,
      wallet: paymentMethod.card.wallet?.type || null,
    };
  }
  return {
    type: paymentMethod.type || null,
    brand: null,
    last4: null,
    exp_month: null,
    exp_year: null,
    wallet: null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendError(res, 405, "Method not allowed");
  }

  const { user, error } = await getUserFromRequest(req);
  if (error || !user) {
    return sendError(res, 401, "unauthenticated");
  }
  if (
    !(await enforceRateLimit(req, res, {
      scope: "stripe:billing",
      limit: 12,
      windowSeconds: 300,
      userId: user.id,
    }))
  ) {
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return sendError(res, 500, "payment_not_configured");
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
    const profile = await getProfileForUser(user.id, { createIfMissing: true, userData: user });
    const dbSubscription = await getActiveSubscription(user.id);
    const customerId = profile?.stripe_customer_id || null;

    let stripeSubscription = null;
    if (dbSubscription?.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
      } catch (err) {
        stripeSubscription = null;
      }
    }

    const normalizedSubscription = normalizeSubscription({ stripeSubscription, dbSubscription });
    const priceId = normalizedSubscription?.price_id || null;

    let price = null;
    if (priceId) {
      try {
        price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
      } catch (err) {
        price = null;
      }
    }

    let customer = null;
    if (customerId) {
      try {
        const fetched = await stripe.customers.retrieve(customerId);
        customer = fetched && !fetched.deleted ? fetched : null;
      } catch (err) {
        customer = null;
      }
    }

    let paymentMethod = null;
    const defaultPaymentId = customer?.invoice_settings?.default_payment_method || null;
    if (defaultPaymentId) {
      try {
        paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentId);
      } catch (err) {
        paymentMethod = null;
      }
    }

    let invoices = [];
    if (customerId) {
      try {
        const invoiceList = await stripe.invoices.list({ customer: customerId, limit: 6 });
        invoices = Array.isArray(invoiceList.data) ? invoiceList.data.map(mapInvoice) : [];
      } catch (err) {
        invoices = [];
      }
    }

    let upcomingInvoice = null;
    const subscriptionId = normalizedSubscription?.stripe_subscription_id || null;
    if (customerId && subscriptionId) {
      try {
        const upcoming = await stripe.invoices.retrieveUpcoming({
          customer: customerId,
          subscription: subscriptionId,
        });
        upcomingInvoice = upcoming
          ? {
              amount_due: typeof upcoming.amount_due === "number" ? upcoming.amount_due : null,
              currency: upcoming.currency || null,
              next_payment_attempt: toIsoSeconds(upcoming.next_payment_attempt),
              period_start: toIsoSeconds(upcoming.period_start),
              period_end: toIsoSeconds(upcoming.period_end),
            }
          : null;
      } catch (err) {
        upcomingInvoice = null;
      }
    }

    const paymentMethodTypes = resolveSubscriptionPaymentMethodTypes();

    return sendJson(res, 200, {
      subscription: normalizedSubscription,
      price: price
        ? {
            unit_amount: price.unit_amount,
            unit_amount_decimal: price.unit_amount_decimal || null,
            currency: price.currency,
            recurring: price.recurring
              ? {
                  interval: price.recurring.interval,
                  interval_count: price.recurring.interval_count,
                }
              : null,
            product: price.product && typeof price.product === "object"
              ? {
                  name: price.product.name || null,
                  description: price.product.description || null,
                }
              : null,
          }
        : null,
      paymentMethod: mapPaymentMethod(paymentMethod),
      invoices,
      upcomingInvoice,
      customer: customer
        ? {
            id: customer.id,
            email: customer.email || null,
            name: customer.name || null,
          }
        : null,
      paymentMethodTypes,
    });
  } catch (err) {
    return sendError(res, 500, "Could not load billing");
  }
};
