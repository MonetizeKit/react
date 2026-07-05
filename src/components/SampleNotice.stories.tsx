import type { Meta, StoryObj } from "@storybook/react";
import { SampleNotice } from "./SampleNotice";

const meta: Meta<typeof SampleNotice> = {
  title: "Components/SampleNotice",
  component: SampleNotice,
};
export default meta;

type Story = StoryObj<typeof SampleNotice>;

export const Default: Story = {};

export const CustomCopy: Story = {
  args: {
    children: "Demo data — connect your workspace to show live plans and usage.",
  },
};
