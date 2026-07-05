import type { Meta, StoryObj } from "@storybook/react";
import { ConfigNotice } from "./ConfigNotice";
import { inspectMonetizeKitConfig } from "../lib/config-diagnostics";

const meta: Meta<typeof ConfigNotice> = {
  title: "Components/ConfigNotice",
  component: ConfigNotice,
};
export default meta;

type Story = StoryObj<typeof ConfigNotice>;

/** Error: no publishable key was provided to the provider. */
export const MissingKey: Story = {
  args: { diagnostic: inspectMonetizeKitConfig("", "https://app.monetizekit.app") },
};

/** Warning: a test key works but isn't production-ready. */
export const TestKey: Story = {
  args: { diagnostic: inspectMonetizeKitConfig("pk_test_123456789", "https://app.monetizekit.app") },
};
