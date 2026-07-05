import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { UsageBanner } from "./UsageBanner";
import { MonetizeKitProvider } from "../provider";
import type { ThemeMode, ThemeName } from "../theme/tokens";

// The banner reads live usage via the client. Stub fetch (keyed on the meter id)
// so each story shows a deterministic fill level without a backend.
const USAGE_FIXTURES: Record<string, { current: number; limit: number | null }> = {
  healthy: { current: 3200, limit: 10000 },
  near_limit: { current: 8600, limit: 10000 },
  over_limit: { current: 12500, limit: 10000 },
};

function stubUsageFetch() {
  const original = window.fetch;
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const match = url.match(/\/usage\/[^/]+\/([^?]+)/);
    if (match) {
      const meter = decodeURIComponent(match[1]!);
      const data = USAGE_FIXTURES[meter] ?? { current: 0, limit: null };
      return new Response(JSON.stringify({ meterId: meter, ...data }), {
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

const meta: Meta<typeof UsageBanner> = {
  title: "Components/UsageBanner",
  component: UsageBanner,
  beforeEach: () => stubUsageFetch(),
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
          <div style={{ maxWidth: 420 }}>
            <Story />
          </div>
        </MonetizeKitProvider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof UsageBanner>;

export const Healthy: Story = {
  args: { meterId: "healthy", label: "API calls" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("progressbar")).toBeInTheDocument();
  },
};

export const NearLimit: Story = {
  args: { meterId: "near_limit", label: "API calls" },
};

export const OverLimit: Story = {
  args: { meterId: "over_limit", label: "API calls" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/Over included allotment/i)).toBeInTheDocument();
  },
};
