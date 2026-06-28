import type { Meta, StoryObj } from "@storybook/react";
import { PricingTable } from "./PricingTable";
import { MonetizeKitProvider } from "../provider";
import type { Plan } from "../types";

const storybookEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env ?? {};

const storybookBaseUrl =
  storybookEnv.STORYBOOK_MONETIZEKIT_BASE_URL || "https://app.monetizekit.app";
const storybookPublishableKey =
  storybookEnv.STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY || "pk_demo";

// Theme / locale / currency are controlled from the toolbar (see .storybook
// globals); the decorator provides the MonetizeKitProvider.
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
    pricing: [
      { type: "flat", amount: 499, currency: "USD", interval: "monthly" },
      { type: "flat", amount: 4990, currency: "USD", interval: "annually" },
    ],
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
      { type: "flat", amount: 999, currency: "USD", interval: "monthly" },
      { type: "flat", amount: 9990, currency: "USD", interval: "annually" },
      {
        type: "usage",
        amount: 0,
        currency: "USD",
        interval: "monthly",
        meterId: "meter_mk_mtc",
        meterDisplayName: "Tracked Customers",
        includedUnits: 25000,
        tierMode: "graduated",
        tieredPricing: [{ upTo: 100000, unitPrice: 0.012 }, { upTo: null, unitPrice: 0.006 }],
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
    entitlements: [{ featureKey: "sso", featureDisplayName: "SSO / SAML", type: "boolean", value: true }],
  },
];

const meta: Meta<typeof PricingTable> = {
  title: "Components/PricingTable",
  component: PricingTable,
  args: { plans, highlightPlan: "Pro" },
};
export default meta;

type Story = StoryObj<typeof PricingTable>;

export const Default: Story = {};

export const WithBillingToggle: Story = { args: { showBillingToggle: true } };

/** Empty catalog → illustrative sample plans behind a clear disclaimer. */
export const SampleWhenEmpty: Story = { args: { plans: [], highlightPlan: "Growth" } };

/**
 * Live external-consumer story. Renders the PricingTable against a real catalog
 * API via a browser-safe publishable key. The key can come from story args, the
 * Storybook publishableKey global, or STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY.
 * The base URL defaults from STORYBOOK_MONETIZEKIT_BASE_URL.
 */
export const Live: StoryObj<{ publishableKey?: string; baseUrl?: string }> = {
  args: { publishableKey: "", baseUrl: "" },
  render: (args, context) => {
    const publishableKey =
      args.publishableKey ||
      (context.globals.publishableKey as string | undefined) ||
      storybookPublishableKey;
    const baseUrl = args.baseUrl || storybookBaseUrl;
    const hasLiveKey = Boolean(publishableKey && publishableKey !== "pk_demo");

    return hasLiveKey ? (
      <MonetizeKitProvider
        publishableKey={publishableKey}
        baseUrl={baseUrl}
        appearance="memphis"
      >
        <PricingTable highlightPlan="Pro" />
      </MonetizeKitProvider>
    ) : (
      <p data-testid="live-needs-args">
        Provide a publishable key via the toolbar, story args, or
        STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY to render live pricing.
      </p>
    );
  },
};
