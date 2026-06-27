---
"@monetizekit/react": patch
---

`PricingTable` and `PricingComparison` now order live-fetched plans
cheapest-first (with contact-sales / unpriced plans last) instead of relying on
the API's return order, so a catalog returned high→low no longer renders
Enterprise before Free. An explicit `plans` prop keeps the caller's order. New
helper `sortPlansForDisplay` is exported.
