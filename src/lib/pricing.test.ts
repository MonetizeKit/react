import { describe, expect, it } from "vitest";
import { includedFeatures } from "./pricing";
import type { Plan } from "../types";

describe("includedFeatures", () => {
  it("renders only included boolean features and value-bearing entitlements", () => {
    const plan: Plan = {
      id: "plan_pro",
      name: "Pro",
      entitlements: [
        { featureKey: "api", featureDisplayName: "API access", type: "boolean", value: true },
        { featureKey: "sso", featureDisplayName: "SSO", type: "boolean", value: false },
        { featureKey: "customers", featureDisplayName: "Customers", type: "limit", value: 5000 },
        { featureKey: "seats", featureDisplayName: "Seats", type: "limit", value: 9999 },
        { featureKey: "support", featureDisplayName: "Support", type: "enum", value: "Priority" },
        { featureKey: "region", featureDisplayName: "Region", type: "string", value: "US" },
      ],
    };

    expect(includedFeatures(plan, "en-US", 10)).toEqual([
      { key: "api", label: "API access" },
      { key: "customers", label: "Customers: 5,000" },
      { key: "seats", label: "Seats: Unlimited" },
      { key: "support", label: "Support: Priority" },
      { key: "region", label: "Region: US" },
    ]);
  });

  it("limits the number of returned feature rows", () => {
    const plan: Plan = {
      id: "plan_scale",
      name: "Scale",
      entitlements: [
        { featureKey: "one", featureDisplayName: "One", type: "boolean", value: true },
        { featureKey: "two", featureDisplayName: "Two", type: "boolean", value: true },
      ],
    };

    expect(includedFeatures(plan, "en-US", 1)).toEqual([{ key: "one", label: "One" }]);
  });
});
