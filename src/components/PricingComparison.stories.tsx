import type { Meta, StoryObj } from "@storybook/react";
import { PricingComparison } from "./PricingComparison";

// Theme / locale / currency come from the toolbar globals + provider decorator.
const meta: Meta<typeof PricingComparison> = {
  title: "Components/PricingComparison",
  component: PricingComparison,
  args: { highlightPlan: "Growth" },
};
export default meta;

type Story = StoryObj<typeof PricingComparison>;

/** Empty plans → illustrative sample comparison behind a disclaimer. */
export const Default: Story = { args: { plans: [] } };
