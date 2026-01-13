import { describe, it, expect } from "vitest";
import accessPolicy from "../access-policy.js";

const { hasPaidPlan, hasPaidAccess, hasOwnKeyAccess, resolveRoundAccess } = accessPolicy;

describe("access policy", () => {
  it("treats paid plans as paid without subscriptions", () => {
    expect(hasPaidPlan({ plan: "paid" })).toBe(true);
    expect(hasPaidPlan({ plan: "pro" })).toBe(true);
    expect(hasPaidPlan({ plan: "trial" })).toBe(true);
    expect(hasPaidPlan({ plan: "lifetime" })).toBe(true);
    expect(hasPaidPlan({ plan: "free" })).toBe(false);
  });

  it("treats paid plans as access", () => {
    expect(hasPaidAccess({ plan: "paid" })).toBe(true);
    expect(hasPaidAccess({ plan: "pro" })).toBe(true);
    expect(hasPaidAccess({ plan: "trial" })).toBe(true);
    expect(hasPaidAccess({ plan: "lifetime" })).toBe(true);
    expect(hasPaidAccess({ plan: "free" })).toBe(false);
  });

  it("treats active subscription statuses as access", () => {
    expect(hasPaidAccess({ subscriptionStatus: "active" })).toBe(true);
    expect(hasPaidAccess({ subscriptionStatus: "trialing" })).toBe(true);
    expect(hasPaidAccess({ subscriptionStatus: "canceled" })).toBe(false);
  });

  it("requires a key when own key is enabled", () => {
    expect(
      hasOwnKeyAccess({ useOwnKey: true, userKey: "sk-test-key" })
    ).toBe(true);
    expect(hasOwnKeyAccess({ useOwnKey: true, userKey: "", keyStored: true })).toBe(true);
    expect(hasOwnKeyAccess({ useOwnKey: true, userKey: "   " })).toBe(false);
    expect(hasOwnKeyAccess({ useOwnKey: false, userKey: "sk-test-key" })).toBe(false);
  });

  it("denies access when no plan or key is present", () => {
    const missingKey = resolveRoundAccess({ useOwnKey: true, userKey: "" });
    expect(missingKey.allowed).toBe(false);
    expect(missingKey.reason).toBe("missing_key");

    const unpaid = resolveRoundAccess({ plan: "free", subscriptionStatus: "canceled" });
    expect(unpaid.allowed).toBe(false);
    expect(unpaid.reason).toBe("payment_required");
  });

  it("allows access with a key even on free plan", () => {
    const access = resolveRoundAccess({
      plan: "free",
      useOwnKey: true,
      userKey: "sk-test-key",
    });
    expect(access.allowed).toBe(true);
    expect(access.reason).toBe(null);
  });

  it("allows access with stored key even when input is empty", () => {
    const access = resolveRoundAccess({
      plan: "free",
      useOwnKey: true,
      userKey: "",
      keyStored: true,
    });
    expect(access.allowed).toBe(true);
    expect(access.reason).toBe(null);
  });
});
