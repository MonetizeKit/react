import { describe, expect, it } from "vitest";
import { describePlanPrice, describeUsageTerm, formatMoney } from "./format";
import type { Plan, PricingTerm } from "../types";

describe("formatMoney", () => {
  it("formats whole and fractional amounts", () => {
    expect(formatMoney(99, "USD", "en-US")).toBe("$99");
    expect(formatMoney(0.015, "USD", "en-US")).toBe("$0.015");
  });
});

describe("describePlanPrice", () => {
  it("renders a flat monthly headline", () => {
    const plan: Plan = {
      id: "p1",
      name: "Pro",
      pricing: [{ type: "flat", amount: 99, currency: "USD", interval: "monthly" }],
    };
    const d = describePlanPrice(plan, "en-US");
    expect(d.contactSales).toBe(false);
    expect(d.headline).toBe("$99/mo");
  });

  it("adds a '+ usage' caption when metered terms exist", () => {
    const plan: Plan = {
      id: "p2",
      name: "Scale",
      pricing: [
        { type: "flat", amount: 299, currency: "USD", interval: "monthly" },
        { type: "usage", amount: 0, currency: "USD", interval: "monthly", meterId: "m" },
      ],
    };
    expect(describePlanPrice(plan, "en-US").caption).toBe("+ usage");
  });

  it("renders contact-sales for the contact_sales tag or empty pricing", () => {
    expect(
      describePlanPrice({ id: "e", name: "Enterprise", tags: ["contact_sales"], pricing: [] })
        .contactSales,
    ).toBe(true);
    expect(describePlanPrice({ id: "x", name: "X" }).contactSales).toBe(true);
  });
});

describe("describeUsageTerm", () => {
  it("describes included units + first tier rate", () => {
    const term: PricingTerm = {
      type: "usage",
      amount: 0,
      currency: "USD",
      interval: "monthly",
      meterDisplayName: "MTC",
      includedUnits: 5000,
      tierMode: "graduated",
      tieredPricing: [{ upTo: 25000, unitPrice: 0.015 }, { upTo: null, unitPrice: 0.006 }],
    };
    const text = describeUsageTerm(term, "en-US");
    expect(text).toContain("included");
    expect(text).toContain("$0.015");
  });
});
