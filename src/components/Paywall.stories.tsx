import type { Meta, StoryObj } from "@storybook/react";
import { within, expect } from "@storybook/test";
import { Paywall } from "./Paywall";

const meta: Meta<typeof Paywall> = {
  title: "Components/Paywall",
  component: Paywall,
};
export default meta;

type Story = StoryObj<typeof Paywall>;

/** Locked state (sample mode renders the upgrade prompt without a live customer). */
export const Locked: Story = {
  args: {
    feature: "advanced_analytics",
    sample: true,
    title: "Unlock advanced analytics",
    description: "Cohort retention and revenue breakdowns are part of the Growth plan.",
    ctaLabel: "Upgrade to Growth",
    children: <div>Secret premium dashboard</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Unlock advanced analytics")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Upgrade to Growth" })).toBeInTheDocument();
  },
};
