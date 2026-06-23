/**
 * Illustrative sample data used to show what a surface *could* look like when no
 * real catalog/customer data is available yet (e.g. a fresh workspace with no
 * plans or products defined). Always paired with a visible <SampleNotice/> so it
 * is never mistaken for live data.
 */
import type { CreditBalance, Plan, UsageResult } from "../types";

export const SAMPLE_PLANS: Plan[] = [
  {
    id: "sample_free",
    name: "Starter",
    description: "Evaluate the platform and model your catalog",
    pricing: [{ type: "flat", amount: 0, currency: "USD", interval: "monthly" }],
    entitlements: [
      { featureKey: "max_customers", featureDisplayName: "Tracked customers", type: "limit", value: 100 },
      { featureKey: "api_access", featureDisplayName: "REST & GraphQL API", type: "boolean", value: true },
      { featureKey: "metering", featureDisplayName: "Usage metering", type: "boolean", value: true },
    ],
  },
  {
    id: "sample_pro",
    name: "Growth",
    description: "Product-led monetization at scale",
    pricing: [{ type: "flat", amount: 49900, currency: "USD", interval: "monthly" }],
    entitlements: [
      { featureKey: "max_customers", featureDisplayName: "Tracked customers", type: "limit", value: 10000 },
      { featureKey: "stripe", featureDisplayName: "Stripe integration", type: "boolean", value: true },
      { featureKey: "experiments", featureDisplayName: "Experiments & A/B testing", type: "boolean", value: true },
      { featureKey: "widgets", featureDisplayName: "Embeddable widgets", type: "boolean", value: true },
    ],
  },
  {
    id: "sample_scale",
    name: "Scale",
    description: "Volume-based capacity pricing",
    pricing: [
      { type: "flat", amount: 99900, currency: "USD", interval: "monthly" },
      {
        type: "usage",
        amount: 0,
        currency: "USD",
        interval: "monthly",
        meterId: "sample_mtc",
        meterDisplayName: "Tracked customers",
        includedUnits: 25000,
        tierMode: "graduated",
        tieredPricing: [
          { upTo: 100000, unitPrice: 0.012 },
          { upTo: null, unitPrice: 0.006 },
        ],
      },
    ],
    entitlements: [
      { featureKey: "everything_pro", featureDisplayName: "Everything in Growth", type: "boolean", value: true },
      { featureKey: "approvals", featureDisplayName: "Approval workflows", type: "boolean", value: true },
    ],
  },
  {
    id: "sample_enterprise",
    name: "Enterprise",
    description: "Governance, scale, and advanced controls",
    tags: ["contact_sales"],
    pricing: [],
    entitlements: [
      { featureKey: "sso", featureDisplayName: "SSO / SAML", type: "boolean", value: true },
      { featureKey: "sla", featureDisplayName: "Custom SLA", type: "boolean", value: true },
    ],
  },
];

export const SAMPLE_USAGE: Record<string, UsageResult> = {
  api_calls: { meterId: "api_calls", current: 72000, limit: 100000 },
  seats: { meterId: "seats", current: 8, limit: 10 },
  storage_gb: { meterId: "storage_gb", current: 3, limit: 10 },
};

export const SAMPLE_CREDITS: CreditBalance = { balance: 120000, currency: "USD" };

export const SAMPLE_PORTAL = {
  planName: "Growth",
  meterIds: ["api_calls", "seats"],
} as const;

/** Default disclaimer copy shown alongside sample data. */
export const SAMPLE_NOTICE_TEXT =
  "Sample data for illustration only — define plans and products to show live values.";
