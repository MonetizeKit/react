---
"@monetizekit/react": minor
---

Provider locale/currency, richer CustomerPortal, and toolbar-driven Storybook.

- **`MonetizeKitProvider`** gains `locale` and `currency` props that components use as defaults (override per-component via props) — set i18n once at the macro level.
- **`CustomerPortal`** now matches the full self-service design: optional **tabbed** layout (Plan/Usage/Credits/Team/Invoices), monthly/annual **billing amount** in the plan header, a **next-invoice** summary, and **Upgrade / View invoices / Cancel / Manage billing** actions. Sample mode shows representative data for all of it (incl. a storage meter).
- **Storybook** switches **theme, locale, and currency from the toolbar** (globals + a provider decorator), so each component has a single story instead of one per permutation. `AlertBanner` now has its own component entry (no longer nested under PricingComparison).
