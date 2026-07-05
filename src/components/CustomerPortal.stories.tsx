import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { CustomerPortal } from "./CustomerPortal";

// Theme / locale / currency come from the toolbar globals + provider decorator.
const meta: Meta<typeof CustomerPortal> = {
  title: "Components/CustomerPortal",
  component: CustomerPortal,
  parameters: { layout: "centered" },
  args: { sample: true, showBranding: true, allowUpgrade: true, allowCancel: true },
};
export default meta;

type Story = StoryObj<typeof CustomerPortal>;

/** Tabbed layout (Plan / Payment / Usage / Credits / Team / Invoices). */
export const Tabbed: Story = { args: { tabbed: true } };

/** Stacked layout — all sections at once. */
export const Stacked: Story = { args: { tabbed: false } };

/**
 * Payment section with an explicit card on file (non-sample). The Update button
 * opens an inline Checkout when given Stripe config; here it uses a callback.
 */
export const WithPaymentMethod: Story = {
  args: {
    sample: false,
    planName: "Growth",
    price: { amount: 499, interval: "monthly" },
    paymentMethod: { brand: "visa", last4: "4242", expMonth: 12, expYear: 2028 },
    showCredits: false,
    allowUpgrade: false,
    allowCancel: false,
    tabbed: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Payment method")).toBeInTheDocument();
    await expect(canvas.getByText("visa")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Update" }));
  },
};
