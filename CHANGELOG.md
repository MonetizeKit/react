# @monetizekit/react

## 0.8.0

### Minor Changes

- 808fe1a: Add the headless `usePlans` hook, export the reusable `includedFeatures` helper, and let `PricingTable` accept custom plan card rendering plus slot class names.

  Storybook now reads optional MonetizeKit live configuration from `STORYBOOK_MONETIZEKIT_BASE_URL` and `STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY`, surfaces a publishable-key global, and displays the package version in the UI.

## 0.7.1

### Patch Changes

- 83c384f: `PricingTable` and `PricingComparison` now order live-fetched plans
  cheapest-first (with contact-sales / unpriced plans last) instead of relying on
  the API's return order, so a catalog returned high→low no longer renders
  Enterprise before Free. An explicit `plans` prop keeps the caller's order. New
  helper `sortPlansForDisplay` is exported.

## 0.7.0

### Minor Changes

- c9c7d36: Redesign `PricingTable` and `PricingComparison` for a polished, production-grade look:

  - **Responsive grid** driven by plan count — 4 plans render as a 4-up row on desktop, a 2×2 grid on tablet, and a single column on mobile, so a 4th plan never orphans onto its own row.
  - **Highlighted plan** gets an elevated card, accent ring, centered "Most Popular" badge, and accent-colored feature checks.
  - **Feature lists** now use check-circle icons under a "What's included" label and only show _granted_ features (boolean entitlements that are off are hidden, limits/values render inline) instead of a raw bullet list.
  - **Comparison table** gains grouped section headers, check/minus icons, a tinted highlighted column, plan price sub-headers, and a card surface with hover affordances.
  - New optional `PricingTable` props: `ctaLabel` and `maxFeatures`.

  All styling remains token-driven (works across every theme + light/dark) and SSR-safe via a scoped stylesheet.

- fbfa9fc: Add Clerk-style configuration guardrails for the publishable key. When a
  consuming app is missing its publishable key, passes a malformed key (not
  `pk_…`), omits the API base URL, or uses a non-live `pk_test_` key, the SDK now
  surfaces a clear, actionable message in **both the console and the UI** (with a
  link to the setup docs) instead of silently rendering an empty/"unable to load"
  state. `MonetizeKitProvider` exposes the diagnostic via context (`config`), and
  new exports `inspectMonetizeKitConfig`, `ConfigNotice`,
  `formatConfigDiagnosticForConsole`, and `redactPublishableKey` are available for
  custom handling. `PricingTable` renders the notice (plus sample plans) on a
  config error and a warning banner for non-live keys.

## 0.6.1

### Patch Changes

- d44bca7: a11y: add accessible names to the `AlertBanner` and `UsageBanner` progress bars
  (`aria-label`), resolving the `aria-progressbar-name` axe violation. Adds a
  Storybook test-runner CI step (interaction + axe accessibility) to guard
  structural accessibility going forward.

## 0.6.0

### Minor Changes

- 04a2e0f: Themes now have light + dark (+ system) modes.

  - Restructured theming into **brand themes** (`default`, `dashboard`, `memphis`, `slate`, `ocean`, `forest`, `sunset`, `grape`), each with a hand-tuned **light and dark** variant.
  - `appearance` accepts `{ theme, mode }` where `mode` is `light` | `dark` | `system`; **system** follows the OS via `prefers-color-scheme` (the provider subscribes to changes). Token overrides still apply on top.
  - New exports: `THEMES`, `THEME_NAMES`, `appearanceMode`, and `ThemeName` / `ThemeMode` / `ThemeVariants` types.
  - Storybook gains a **Mode** toolbar (Light/Dark/System) alongside Theme.
  - Backward compatible: the fixed preset names (`light`, `dark`, `memphis`, `console`, …) are still accepted by `appearance`.

## 0.5.0

### Minor Changes

- 89d48a3: Provider locale/currency, richer CustomerPortal, and toolbar-driven Storybook.

  - **`MonetizeKitProvider`** gains `locale` and `currency` props that components use as defaults (override per-component via props) — set i18n once at the macro level.
  - **`CustomerPortal`** now matches the full self-service design: optional **tabbed** layout (Plan/Usage/Credits/Team/Invoices), monthly/annual **billing amount** in the plan header, a **next-invoice** summary, and **Upgrade / View invoices / Cancel / Manage billing** actions. Sample mode shows representative data for all of it (incl. a storage meter).
  - **Storybook** switches **theme, locale, and currency from the toolbar** (globals + a provider decorator), so each component has a single story instead of one per permutation. `AlertBanner` now has its own component entry (no longer nested under PricingComparison).

## 0.4.1

### Patch Changes

- cc5105a: Docs: customer-facing README (install, quick start, publishable-key guidance, full component/hook catalog, all theme presets, preview/sample mode, live gallery + npm links) and a Storybook Introduction landing page.

## 0.4.0

### Minor Changes

- 9246a0f: Add PricingComparison, AlertBanner, BillingCycleToggle; PricingTable billing toggle; Paywall sample mode.

  - **`PricingComparison`**: a grouped feature-comparison table across plans (à la a "Compare plans" section). Accepts explicit `groups` or derives them from plan entitlements; renders boolean/limit/enum cells (✓ / "Unlimited" / value / —); live-fetches plans and falls back to sample data behind a disclaimer.
  - **`PricingTable`**: optional `showBillingToggle` renders an interactive Monthly/Yearly switch and selects the matching pricing term; a "Save X%" badge is derived from monthly vs annual terms. New `annualSavingsPercent` + cycle-aware `describePlanPrice`.
  - **`BillingCycleToggle`**: standalone Monthly/Yearly switch.
  - **`AlertBanner`**: flexible in-app banner (info/warning/danger/neutral) with title, description, optional progress bar, and actions — covers usage/budget/credits/trial banners.
  - **`Paywall`**: new `sample` prop forces the locked upgrade prompt for previews without a live customer.

## 0.3.0

### Minor Changes

- 7d5e970: CustomerPortal: fold in Team + Invoices sections, and fix sample price units.

  - `CustomerPortal` gains optional **Team** (`teamMembers`, `seats`, `showTeam`) and **Invoices** (`invoices`, `showInvoices`) sections, themed with the semantic tokens (paid/pending/overdue → success/warning/danger). Both default on in `sample` mode and render `SAMPLE_TEAM` / `SAMPLE_INVOICES`. New exported types `TeamMember` and `Invoice`, plus `SAMPLE_TEAM` / `SAMPLE_INVOICES` fixtures.
  - Fix: sample plan/credit amounts were in cents (e.g. `49900`) but `formatMoney` treats amounts as major units, so they rendered as "$49,900". Corrected to dollars (`499` / `999` / credits `1200`).

  This makes the package `CustomerPortal` a superset of the previous dashboard-local portal cards, enabling those to be removed.

## 0.2.0

### Minor Changes

- a2a2ffc: Add a multitude of theme presets, sample/empty-state data, and richer themeable tokens.

  - **Themes**: new presets `console` (captures the in-app dashboard "widgets" mock look — dark cards, emerald/amber/red semantics, soft elevation), plus `midnight`, `ocean`, `forest`, `sunset`, and `grape`. Exported `THEME_PRESET_NAMES` for building theme pickers.
  - **Tokens**: `ThemeTokens` gains `colorCard`, `colorCardForeground`, `colorSuccess`, `colorWarning`, `colorDanger`, and `shadow` (CSS vars `--mk-card`, `--mk-card-fg`, `--mk-success`, `--mk-warning`, `--mk-danger`, `--mk-shadow`). `UsageBanner` now uses warning/danger semantics; `CustomerPortal` renders as an elevated card with a status badge.
  - **Sample data**: exported `SAMPLE_PLANS`, `SAMPLE_USAGE`, `SAMPLE_CREDITS`, `SAMPLE_PORTAL`, and a `SampleNotice` disclaimer. `PricingTable` falls back to illustrative sample plans behind a clear disclaimer when there are no plans (toggle with `sampleWhenEmpty`, customize via `disclaimer`); `CustomerPortal` supports a `sample` mode for previews and fresh workspaces with no plans/products defined.
