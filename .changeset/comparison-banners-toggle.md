---
"@monetizekit/react": minor
---

Add PricingComparison, AlertBanner, BillingCycleToggle; PricingTable billing toggle; Paywall sample mode.

- **`PricingComparison`**: a grouped feature-comparison table across plans (à la a "Compare plans" section). Accepts explicit `groups` or derives them from plan entitlements; renders boolean/limit/enum cells (✓ / "Unlimited" / value / —); live-fetches plans and falls back to sample data behind a disclaimer.
- **`PricingTable`**: optional `showBillingToggle` renders an interactive Monthly/Yearly switch and selects the matching pricing term; a "Save X%" badge is derived from monthly vs annual terms. New `annualSavingsPercent` + cycle-aware `describePlanPrice`.
- **`BillingCycleToggle`**: standalone Monthly/Yearly switch.
- **`AlertBanner`**: flexible in-app banner (info/warning/danger/neutral) with title, description, optional progress bar, and actions — covers usage/budget/credits/trial banners.
- **`Paywall`**: new `sample` prop forces the locked upgrade prompt for previews without a live customer.
