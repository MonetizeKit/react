import type { Meta, StoryObj } from "@storybook/react";
import { AlertBanner } from "./AlertBanner";

// Theme / locale / currency come from the toolbar globals + provider decorator.
const meta: Meta<typeof AlertBanner> = {
  title: "Components/AlertBanner",
  component: AlertBanner,
};
export default meta;

type Story = StoryObj<typeof AlertBanner>;

export const UsageWarning: Story = {
  args: {
    variant: "warning",
    icon: "⚠",
    title: "You are at 80% of your API call limit",
    description: "Your plan includes 100,000 API calls per month. You have used 80,000.",
    progress: 0.8,
    actions: [{ label: "Upgrade Plan" }, { label: "Dismiss", variant: "ghost" }],
  },
};

export const BudgetReached: Story = {
  args: {
    variant: "danger",
    icon: "●",
    title: "Monthly budget reached",
    description: "You have reached your monthly budget of $500. Top up credits or wait until your next billing cycle.",
    progress: 1,
    actions: [{ label: "Top Up Credits" }, { label: "Contact Admin", variant: "ghost" }],
  },
};

export const LowCredits: Story = {
  args: {
    variant: "info",
    icon: "◆",
    title: "Credits running low",
    description: "You have 1,200 credits remaining (~3 days at your current rate).",
    actions: [{ label: "Buy More Credits" }, { label: "Dismiss", variant: "ghost" }],
  },
};

export const TrialEnding: Story = {
  args: {
    variant: "neutral",
    icon: "▣",
    title: "Trial ends in 3 days",
    description: "Add a payment method to keep your Pro features.",
    actions: [{ label: "Add Payment" }, { label: "See Pro plan", variant: "ghost" }],
  },
};
