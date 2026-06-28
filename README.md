# @monetizekit/react

Drop‑in, themeable React components and hooks for adding **pricing, paywalls,
usage, and self‑service billing** to your product — powered by your
[MonetizeKit](https://monetizekit.app) catalog and entitlements.

[![npm](https://img.shields.io/npm/v/@monetizekit/react.svg)](https://www.npmjs.com/package/@monetizekit/react)

- **Live component gallery (Storybook):** https://ui.monetizekit.app
- **npm:** https://www.npmjs.com/package/@monetizekit/react
- **MonetizeKit:** https://monetizekit.app

Everything reads live data from your catalog through a browser‑safe publishable
key, renders through CSS variables so it matches your brand, and ships full
TypeScript types.

## Install

```bash
npm install @monetizekit/react
# or: pnpm add @monetizekit/react   /   yarn add @monetizekit/react
```

Requires React 18 or 19 (peer dependency).

## Quick start

Wrap your app (or a section of it) in `MonetizeKitProvider` with your
**publishable key**, then drop in any component:

```tsx
import { MonetizeKitProvider, PricingTable } from "@monetizekit/react";

export function Pricing() {
  return (
    <MonetizeKitProvider
      publishableKey="pk_live_xxx"
      baseUrl="https://app.monetizekit.app"
      appearance="light"
    >
      <PricingTable
        highlightPlan="Pro"
        onSelectPlan={(planId) => router.push(`/checkout?plan=${planId}`)}
      />
    </MonetizeKitProvider>
  );
}
```

### Publishable keys are browser‑safe

The `publishableKey` (`pk_…`) is **read‑only**, scoped to your public catalog,
and restricted to the web origins you allowlist in MonetizeKit. It’s designed to
ship in client‑side bundles — never use a secret (`mk_…`) key in the browser.
Create and manage keys (and their allowed origins) in **Settings → API keys**.

## Components

| Component | What it does |
| --- | --- |
| `PricingTable` | Live plan cards incl. metered/graduated pricing, optional Monthly/Yearly toggle |
| `PricingComparison` | Feature‑by‑feature “compare plans” table across your tiers |
| `Paywall` | Gate content behind an entitlement with an upgrade prompt |
| `EntitlementGate` | Conditionally render based on a live entitlement check |
| `UsageBanner` | Current usage vs. allotment for a meter, with an overage hint |
| `CustomerPortal` | Self‑service plan, usage, credits, team, and invoices |
| `AlertBanner` | In‑app notices (usage warnings, low credits, trial ending, …) |
| `BillingCycleToggle` | Standalone Monthly/Yearly switch |

```tsx
import { Paywall, useEntitlement } from "@monetizekit/react";

// Declarative gating
<Paywall feature="advanced_analytics" onUpgrade={() => router.push("/billing")}>
  <AdvancedAnalytics />
</Paywall>;

// …or imperative
function ExportButton() {
  const { allowed } = useEntitlement("advanced_analytics");
  return <button disabled={!allowed}>Export</button>;
}
```

## Hooks

Scoped to the customer you pass to the provider (`customerId` / `customerToken`):

- `usePlans(options?)` → `{ plans, rawPlans, isSample, loading, error, config, locale }`
- `useEntitlement(featureKey)` → `{ allowed, value, loading, error }`
- `useUsage(meterId)` → `{ current, limit, loading, error }`
- `useCredits()` → `{ balance, currency, loading, error }`
- `useMonetizeKit()` → the configured client + resolved theme tokens

`usePlans()` is the headless pricing-table data layer. `plans` is display-ready:
live catalogs are sorted low-to-high, empty catalogs can fall back to
`SAMPLE_PLANS`, and an explicit `plans` option preserves your caller-provided
order. Use `rawPlans` only when you need the unmodified fetched/provided array.

```tsx
const { plans, rawPlans, isSample, loading, error } = usePlans();
```

## Pricing table customization

Use `renderPlanCard` to replace the card markup while keeping MonetizeKit's
fetching, sample fallback, sorting, pricing display, CTA helpers, and feature
extraction:

```tsx
import { PricingTable } from "@monetizekit/react";

<PricingTable
  highlightPlan="Pro"
  classNames={{ root: "pricing", card: "pricing-card", cta: "pricing-cta" }}
  renderPlanCard={(plan, ctx) => (
    <article>
      <h3>{plan.name}</h3>
      <p>{ctx.price.contactSales ? "Custom" : ctx.price.headline}</p>
      <button onClick={ctx.primaryAction}>{ctx.ctaLabel}</button>
    </article>
  )}
/>;
```

`classNames` appends slot-level classes to the built-in pricing table classes.
`includedFeatures(plan, locale, max)` is exported for custom layouts that want
the same localized entitlement rows used by the default cards.

## Theming

Pick a **theme** (brand identity) and a **mode** (`light` / `dark` / `system`):

```tsx
// Theme + mode (system follows the OS via prefers-color-scheme)
<MonetizeKitProvider appearance={{ theme: "ocean", mode: "system" }} /* … */ />

// Override specific design tokens on top of the resolved variant
<MonetizeKitProvider
  appearance={{ theme: "default", mode: "dark", tokens: { colorPrimary: "#7c3aed", radius: "1rem" } }}
/>
```

Built‑in themes — each with a hand‑tuned **light + dark** variant: `default`,
`dashboard`, `memphis`, `slate`, `ocean`, `forest`, `sunset`, `grape`
(switch theme + mode in the [live gallery](https://ui.monetizekit.app)).
Components render via `--mk-*` CSS custom properties, so they inherit your
typography and adapt to your design system. Import `THEMES` / `THEME_NAMES` to
build a theme picker.

> Fixed preset names (`light`, `dark`, `memphis`, `console`, …) are still
> accepted by `appearance` for backward compatibility.

## Preview & empty states

Building a page before your catalog is set up? Components show **clearly‑labeled
sample data** instead of an empty shell:

```tsx
<PricingTable plans={[]} />          {/* sample plans behind a “Sample data” notice */}
<CustomerPortal sample />            {/* a representative portal with the disclaimer */}
<PricingTable plans={[]} sampleWhenEmpty={false} />  {/* opt out → plain empty state */}
```

## Storybook

The local gallery reads `STORYBOOK_MONETIZEKIT_BASE_URL` and
`STORYBOOK_MONETIZEKIT_PUBLISHABLE_KEY`; when unset it uses
`https://app.monetizekit.app` and `pk_demo`. The toolbar also includes a
Publishable Key field, which overrides the env/default key for live stories.

## TypeScript

Fully typed. Import the public contract types as needed:

```ts
import type { Plan, PricingTerm, EntitlementResult, Invoice } from "@monetizekit/react";
```

## Live examples

- **Component gallery / Storybook:** https://ui.monetizekit.app — every component across every theme, with interactive controls.
- **In production:** the MonetizeKit [pricing page](https://monetizekit.app/pricing) is built with this library.

## License

MIT
