import type { StorybookConfig } from "@storybook/react-vite";

/** Production home of the customer showcase (absolute URLs for share cards). */
const SITE_URL = "https://ui.monetizekit.app";
const OG_IMAGE = `${SITE_URL}/brand/og/og-default.png`;

/** Brand webfonts (Inter + JetBrains Mono, §type) for both the manager chrome and the preview. */
const BRAND_FONTS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />`;

/**
 * On-brand tab/PWA identity (§media-readiness): favicon, apple-touch, maskable, and manifest served
 * from `@monetizekit/brand` (mapped to `/brand` via `staticDirs`), so the showcase never shows an
 * unbranded default. Applied to both the manager and the story iframe.
 */
const BRAND_ICONS = `
    <link rel="icon" type="image/svg+xml" href="/brand/logo/icon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/brand/icons/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/brand/icons/favicon-16.png" />
    <link rel="apple-touch-icon" href="/brand/icons/apple-touch-icon.png" />
    <link rel="mask-icon" href="/brand/icons/mask-icon.svg" color="#ED7445" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#FFFEF3" />`;

/** On-brand share cards (§media-readiness) so `ui.monetizekit.app` links render the brand OG image. */
const BRAND_SOCIAL = `
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="MonetizeKit UI" />
    <meta property="og:title" content="MonetizeKit UI — SDK component gallery" />
    <meta property="og:description" content="Explore and integrate MonetizeKit's SDK components — themes, palettes, light/dark, keys, and copy-paste snippets." />
    <meta property="og:url" content="${SITE_URL}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="MonetizeKit UI — SDK component gallery" />
    <meta name="twitter:description" content="Explore and integrate MonetizeKit's SDK components — themes, palettes, light/dark, keys, and copy-paste snippets." />
    <meta name="twitter:image" content="${OG_IMAGE}" />`;

function removeDefaultFavicon(head: string): string {
  return head.replace(
    /\s*<link rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg" \/>\s*/,
    "\n",
  );
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: { disableTelemetry: true },
  // `./public` ships the webmanifest; the canonical brand asset bundle is mapped to `/brand`.
  staticDirs: [
    "./public",
    { from: "../node_modules/@monetizekit/brand/dist/assets", to: "/brand" },
  ],
  managerHead: (head) =>
    `${removeDefaultFavicon(head)}${BRAND_FONTS}${BRAND_ICONS}${BRAND_SOCIAL}`,
  previewHead: (head) => `${head}${BRAND_FONTS}${BRAND_ICONS}`,
};

export default config;
