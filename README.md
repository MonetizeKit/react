# @monetizekit/react

Themeable React components and hooks for [MonetizeKit](https://monetizekit.app) —
the canonical UI library that MonetizeKit's own marketing site and dashboard
dogfood, and that customers embed in their SaaS apps.

## Install

```bash
pnpm add @monetizekit/react
```

## Quick start

```tsx
import { MonetizeKitProvider, PricingTable } from "@monetizekit/react";

export function Pricing() {
  return (
    <MonetizeKitProvider
      publishableKey="pk_live_xxx"
      baseUrl="https://app.monetizekit.app"
      appearance="memphis"
    >
      <PricingTable highlightPlan="Pro" />
    </MonetizeKitProvider>
  );
}
```

The `publishableKey` is a browser-safe `pk_*` key restricted to read-only public
catalog reads and to the origins you allowlist (CORS) in MonetizeKit.

## Components

- `PricingTable` — live plans incl. graduated/volume metered pricing + Contact Sales
- `Paywall` — gate content behind an entitlement with an upgrade prompt
- `EntitlementGate` — conditionally render on a live entitlement check
- `UsageBanner` — current usage vs allotment with overage hint
- `CustomerPortal` — plan, usage meters, and credit balance

## Hooks

`useEntitlement(feature)`, `useUsage(meterId)`, `useCredits()`.

## Theming

Pass an `appearance` to the provider: a preset name (`light`, `dark`, `memphis`,
`dashboard`) or `{ preset, tokens }` to override design tokens. Components render
via `--mk-*` CSS custom properties so they adapt to the host design system.

## Development

```bash
pnpm install
pnpm test          # vitest + RTL
pnpm build         # tsup (ESM + CJS + d.ts)
pnpm storybook     # local component gallery
pnpm build-storybook
```

The Storybook is deployed as the living component gallery at
`ui.monetizekit.{dev,delivery,app}`.
