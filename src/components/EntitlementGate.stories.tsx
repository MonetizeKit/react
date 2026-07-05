import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { EntitlementGate } from "./EntitlementGate";
import { MonetizeKitProvider } from "../provider";
import type { ThemeMode, ThemeName } from "../theme/tokens";

// Stub the entitlement check keyed on the feature key so both branches are
// demonstrable without a backend: `*_enabled` → allowed, otherwise denied.
function stubEntitlementFetch() {
  const original = window.fetch;
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const match = url.match(/\/entitlements\/[^/]+\/([^?]+)/);
    if (match) {
      const featureKey = decodeURIComponent(match[1]!);
      const allowed = featureKey.endsWith("_enabled");
      return new Response(JSON.stringify({ featureKey, value: allowed, allowed }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return original(input, init);
  }) as typeof fetch;
  return () => {
    window.fetch = original;
  };
}

const meta: Meta<typeof EntitlementGate> = {
  title: "Components/EntitlementGate",
  component: EntitlementGate,
  beforeEach: () => stubEntitlementFetch(),
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as ThemeName) ?? "default";
      const mode = (context.globals.mode as ThemeMode) ?? "light";
      return (
        <MonetizeKitProvider
          publishableKey="pk_demo"
          baseUrl="https://app.monetizekit.app"
          customerId="cus_demo"
          appearance={{ theme, mode }}
        >
          <Story />
        </MonetizeKitProvider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof EntitlementGate>;

export const Entitled: Story = {
  args: {
    feature: "beta_dashboard_enabled",
    children: <div data-testid="gated">✅ You have access to the beta dashboard.</div>,
    fallback: <div>Upgrade to access the beta dashboard.</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId("gated")).toBeInTheDocument();
  },
};

export const NotEntitled: Story = {
  args: {
    feature: "beta_dashboard_locked",
    children: <div>✅ You have access to the beta dashboard.</div>,
    fallback: <div data-testid="fallback">Upgrade to access the beta dashboard.</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId("fallback")).toBeInTheDocument();
  },
};
