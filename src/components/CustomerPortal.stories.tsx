import type { Meta, StoryObj } from "@storybook/react";
import { MonetizeKitProvider } from "../provider";
import { CustomerPortal } from "./CustomerPortal";
import type { Appearance } from "../theme/tokens";

const meta: Meta<typeof CustomerPortal> = {
  title: "Components/CustomerPortal",
  component: CustomerPortal,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof CustomerPortal>;

/** Sample mode: shows what the portal *could* look like with no live data. */
function sampleWithProvider(appearance: Appearance): Story {
  return {
    render: () => (
      <MonetizeKitProvider publishableKey="pk_demo" baseUrl="https://app.monetizekit.app" appearance={appearance}>
        <div style={{ padding: "2rem", background: "var(--mk-bg, #fff)" }}>
          <CustomerPortal sample showBranding />
        </div>
      </MonetizeKitProvider>
    ),
  };
}

export const SampleConsole: Story = sampleWithProvider("console");
export const SampleMidnight: Story = sampleWithProvider("midnight");
export const SampleMemphis: Story = sampleWithProvider("memphis");
export const SampleOcean: Story = sampleWithProvider("ocean");
export const SampleDashboard: Story = sampleWithProvider("dashboard");
