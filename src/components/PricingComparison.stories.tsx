import type { Meta, StoryObj } from "@storybook/react";
import { MonetizeKitProvider } from "../provider";
import { PricingComparison } from "./PricingComparison";
import { AlertBanner } from "./AlertBanner";
import type { Appearance } from "../theme/tokens";

const meta: Meta<typeof PricingComparison> = {
  title: "Components/PricingComparison",
  component: PricingComparison,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof PricingComparison>;

function comparison(appearance: Appearance): Story {
  return {
    render: () => (
      <MonetizeKitProvider publishableKey="pk_demo" baseUrl="https://app.monetizekit.app" appearance={appearance}>
        <div style={{ padding: "2rem", background: "var(--mk-bg, #fff)" }}>
          {/* Empty plans → illustrative sample comparison behind a disclaimer. */}
          <PricingComparison plans={[]} highlightPlan="Growth" />
        </div>
      </MonetizeKitProvider>
    ),
  };
}

export const SampleConsole: Story = comparison("console");
export const SampleMemphis: Story = comparison("memphis");
export const SampleLight: Story = comparison("light");

export const Banners: StoryObj<typeof AlertBanner> = {
  render: () => (
    <MonetizeKitProvider publishableKey="pk_demo" baseUrl="https://app.monetizekit.app" appearance="console">
      <div style={{ padding: "2rem", background: "var(--mk-bg, #fff)", display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 560 }}>
        <AlertBanner variant="warning" icon="⚠" title="You are at 80% of your API call limit" description="Your Pro plan includes 100,000 API calls per month." progress={0.8} actions={[{ label: "Upgrade Plan" }, { label: "Dismiss", variant: "ghost" }]} />
        <AlertBanner variant="danger" icon="●" title="Monthly budget reached" description="You have reached your monthly budget of $500." progress={1} actions={[{ label: "Top Up Credits" }, { label: "Contact Admin", variant: "ghost" }]} />
        <AlertBanner variant="info" icon="◆" title="Credits running low" description="You have 1,200 credits remaining (~3 days)." actions={[{ label: "Buy More Credits" }, { label: "Dismiss", variant: "ghost" }]} />
        <AlertBanner variant="neutral" icon="▣" title="Trial ends in 3 days" description="Add a payment method to keep your Pro features." actions={[{ label: "Add Payment" }, { label: "See Pro plan", variant: "ghost" }]} />
      </div>
    </MonetizeKitProvider>
  ),
};
