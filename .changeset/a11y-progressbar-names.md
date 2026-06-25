---
"@monetizekit/react": patch
---

a11y: add accessible names to the `AlertBanner` and `UsageBanner` progress bars
(`aria-label`), resolving the `aria-progressbar-name` axe violation. Adds a
Storybook test-runner CI step (interaction + axe accessibility) to guard
structural accessibility going forward.
