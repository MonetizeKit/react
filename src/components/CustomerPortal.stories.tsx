import type { Meta, StoryObj } from "@storybook/react";
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

/** Tabbed layout (Plan / Usage / Credits / Team / Invoices). */
export const Tabbed: Story = { args: { tabbed: true } };

/** Stacked layout — all sections at once. */
export const Stacked: Story = { args: { tabbed: false } };
