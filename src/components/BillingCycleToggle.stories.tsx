import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { within, userEvent, expect } from "@storybook/test";
import { BillingCycleToggle } from "./BillingCycleToggle";

const meta: Meta<typeof BillingCycleToggle> = {
  title: "Components/BillingCycleToggle",
  component: BillingCycleToggle,
};
export default meta;

type Story = StoryObj<typeof BillingCycleToggle>;

function Controlled({ savingsPercent }: { savingsPercent?: number }) {
  const [value, setValue] = useState<"monthly" | "annually">("monthly");
  return <BillingCycleToggle value={value} onChange={setValue} savingsPercent={savingsPercent} />;
}

export const Default: Story = {
  render: () => <Controlled savingsPercent={20} />,
};

/** Interaction test: clicking Yearly selects it and reveals the savings hint. */
export const Interaction: Story = {
  render: () => <Controlled savingsPercent={17} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const yearly = canvas.getByRole("button", { name: /Yearly/ });
    await userEvent.click(yearly);
    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("Save 17%")).toBeInTheDocument();
  },
};
