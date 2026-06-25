import { defineConfig, devices } from "@playwright/test";

/**
 * Live external-consumer E2E for @monetizekit/react.
 *
 * Runs the published components against a REAL catalog API (the app origin)
 * through the deployed Storybook, exactly as an external customer embeds them.
 * Requires a deployed Storybook + app + a publishable key, so it is driven
 * entirely by env and skips when those are absent (see live-consumer.spec.ts):
 *
 *   E2E_STORYBOOK_URL   deployed Storybook base (e.g. https://ui.monetizekit.dev)
 *   E2E_APP_URL         app origin the components fetch from (e.g. https://app.monetizekit.dev)
 *   MK_PUBLISHABLE_KEY  System Workspace pk_* key (its allowlist must include the Storybook origin)
 */
const STORYBOOK_URL = process.env.E2E_STORYBOOK_URL ?? "";

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: STORYBOOK_URL || undefined,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
