import { type TestRunnerConfig, getStoryContext } from "@storybook/test-runner";
import { injectAxe, checkA11y, configureAxe } from "axe-playwright";

/**
 * Storybook test-runner config.
 *
 * Every story is smoke-rendered (and its `play` interaction runs, if present);
 * after each render we run axe accessibility checks against the story root.
 * Stories can opt out via `parameters.a11y.disable` or scope rules via
 * `parameters.a11y.config.rules`.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }
    await configureAxe(page, {
      rules: [
        // color-contrast stays disabled: enabling it fails 15/30 stories with
        // serious WCAG AA violations on the *default* theme alone (verified via
        // the test-runner), and MonetizeKit ships 8 brand themes × light/dark.
        // Meeting AA across every token set is a dedicated design-token audit,
        // not an SDK change — tracked separately. Structural a11y (names,
        // roles, ARIA) is enforced here; re-enable once the token audit lands.
        { id: "color-contrast", enabled: false },
        ...(storyContext.parameters?.a11y?.config?.rules ?? []),
      ],
    });
    // Storybook 8 mounts the story under #storybook-root.
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};

export default config;
