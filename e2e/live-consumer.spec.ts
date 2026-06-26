import { expect, test } from "@playwright/test";

/**
 * Live external-consumer E2E: the published PricingTable renders REAL catalog
 * data when an external site embeds it with a browser-safe publishable key.
 *
 * Loads the deployed Storybook's `PricingTable / Live` story, injecting the
 * publishable key + app base URL via Storybook URL args (so no secret is baked
 * into the Storybook build). The story mounts a MonetizeKitProvider that fetches
 * live plans cross-origin from the app API — the customer's experience.
 *
 * Skips unless the live targets are configured (deployed Storybook + app +
 * key), so default CI without secrets stays green; runs in the nightly /
 * workflow_dispatch live-e2e job.
 */
const STORYBOOK_URL = process.env.E2E_STORYBOOK_URL?.trim();
const APP_URL = process.env.E2E_APP_URL?.trim();
const PUBLISHABLE_KEY = process.env.MK_PUBLISHABLE_KEY?.trim();

const ready = Boolean(STORYBOOK_URL && APP_URL && PUBLISHABLE_KEY);

test.describe("Live external-consumer (PricingTable against the real API)", () => {
  test.skip(
    !ready,
    "Set E2E_STORYBOOK_URL, E2E_APP_URL, and MK_PUBLISHABLE_KEY to run the live consumer E2E.",
  );

  test("renders live catalog plans via a publishable key", async ({ page }) => {
    // Storybook URL args: key:value pairs separated by ';'. Encode the values
    // (the key and URL contain reserved characters).
    const args = [
      `publishableKey:${encodeURIComponent(PUBLISHABLE_KEY!)}`,
      `baseUrl:${encodeURIComponent(APP_URL!)}`,
    ].join(";");
    const url = `${STORYBOOK_URL}/iframe.html?id=components-pricingtable--live&viewMode=story&args=${args}`;

    await page.goto(url);

    // The live PricingTable renders plan cards from the real catalog. Assert a
    // known platform plan name appears (the catalog ships Free/Pro/Scale/Enterprise).
    await expect(
      page.getByText(/\bPro\b/).first(),
      "live PricingTable should render catalog plans (Pro tier)",
    ).toBeVisible({ timeout: 30_000 });
    // And that we are NOT showing the "needs args" hint (i.e. live mode engaged).
    await expect(page.getByTestId("live-needs-args")).toHaveCount(0);
  });
});
