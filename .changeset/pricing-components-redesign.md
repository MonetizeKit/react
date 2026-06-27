---
"@monetizekit/react": minor
---

Redesign `PricingTable` and `PricingComparison` for a polished, production-grade look:

- **Responsive grid** driven by plan count — 4 plans render as a 4-up row on desktop, a 2×2 grid on tablet, and a single column on mobile, so a 4th plan never orphans onto its own row.
- **Highlighted plan** gets an elevated card, accent ring, centered "Most Popular" badge, and accent-colored feature checks.
- **Feature lists** now use check-circle icons under a "What's included" label and only show *granted* features (boolean entitlements that are off are hidden, limits/values render inline) instead of a raw bullet list.
- **Comparison table** gains grouped section headers, check/minus icons, a tinted highlighted column, plan price sub-headers, and a card surface with hover affordances.
- New optional `PricingTable` props: `ctaLabel` and `maxFeatures`.

All styling remains token-driven (works across every theme + light/dark) and SSR-safe via a scoped stylesheet.
