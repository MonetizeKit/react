import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { Checkout } from "./Checkout";

// Rendered in preview mode (no Stripe key) so the layout is designable without
// loading Stripe.js. Pass stripePublishableKey + clientSecret to go live.
const meta: Meta<typeof Checkout> = {
  title: "Components/Checkout",
  component: Checkout,
  args: {
    summary: {
      planName: "Scale",
      amountLabel: "$999 / mo",
      caption: "Billed monthly · cancel anytime",
      lines: [
        { label: "Scale plan", value: "$999.00" },
        { label: "Tax", value: "$0.00" },
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkout>;

/** Payment-mode preview (Stripe not configured). */
export const Preview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Preview only/i)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Pay now" })).toBeDisabled();
  },
};

/** Setup-mode preview (save a card / update a payment method). */
export const SetupPreview: Story = {
  args: {
    mode: "setup",
    summary: { planName: "Update payment method" },
    submitLabel: "Save card",
  },
};
