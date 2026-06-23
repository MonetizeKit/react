import type { Meta, StoryObj } from "@storybook/react";
import { MonetizeKitProvider } from "../provider";
import { PricingTable } from "./PricingTable";
import type { Appearance } from "../theme/tokens";
import type { Plan } from "../types";

const plans: Plan[] = [
  {
    id: "plan_free",
    name: "Free",
    description: "Evaluate the platform",
    pricing: [{ type: "flat", amount: 0, currency: "USD", interval: "monthly" }],
    entitlements: [
      { featureKey: "max_customers", featureDisplayName: "Customers", type: "limit", value: 100 },
      { featureKey: "api", featureDisplayName: "REST & GraphQL API", type: "boolean", value: true },
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    description: "Product-led monetization at scale",
    pricing: [{ type: "flat", amount: 99, currency: "USD", interval: "monthly" }],
    entitlements: [
      { featureKey: "max_customers", featureDisplayName: "Customers", type: "limit", value: 10000 },
      { featureKey: "stripe", featureDisplayName: "Stripe Integration", type: "boolean", value: true },
    ],
  },
  {
    id: "plan_scale",
    name: "Scale",
    description: "Volume-based capacity pricing",
    pricing: [
      { type: "flat", amount: 299, currency: "USD", interval: "monthly" },
      {
        type: "usage",
        amount: 0,
        currency: "USD",
        interval: "monthly",
        meterId: "meter_mk_mtc",
        meterDisplayName: "Tracked Customers",
        includedUnits: 5000,
        tierMode: "graduated",
        tieredPricing: [{ upTo: 25000, unitPrice: 0.015 }, { upTo: null, unitPrice: 0.006 }],
      },
    ],
    entitlements: [
      { featureKey: "everything_pro", featureDisplayName: "Everything in Pro", type: "boolean", value: true },
    ],
  },
  {
    id: "plan_ent",
    name: "Enterprise",
    description: "Governance, scale, and controls",
    tags: ["contact_sales"],
    pricing: [],
    entitlements: [
      { featureKey: "sso", featureDisplayName: "SSO / SAML", type: "boolean", value: true },
    ],
  },
];

const meta: Meta<typeof PricingTable> = {
  title: "Components/PricingTable",
  component: PricingTable,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof PricingTable>;

function withProvider(appearance: Appearance): Story {
  return {
    render: () => (
      <MonetizeKitProvider publishableKey="pk_demo" baseUrl="https://app.monetizekit.app" appearance={appearance}>
        <div style={{ padding: "2rem", background: "var(--mk-bg, #fff)" }}>
          <PricingTable plans={plans} highlightPlan="Pro" />
        </div>
      </MonetizeKitProvider>
    ),
  };
}

export const Memphis: Story = withProvider("memphis");
export const Dashboard: Story = withProvider("dashboard");
export const Light: Story = withProvider("light");
export const Dark: Story = withProvider("dark");
