import type { StorybookConfig } from "@storybook/react-vite";

/** Brand webfonts (Inter + JetBrains Mono, §type) for both the manager chrome and the preview. */
const BRAND_FONTS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />`;

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: { disableTelemetry: true },
  managerHead: (head) => `${head}${BRAND_FONTS}`,
  previewHead: (head) => `${head}${BRAND_FONTS}`,
};

export default config;
