---
"@monetizekit/react": minor
---

Make the MonetizeKit **brand** theme the default appearance and finish the Surface C convergence.

- `MonetizeKitProvider` now defaults to `appearance={{ theme: "brand" }}` (new exported
  `DEFAULT_APPEARANCE`) — SDK components look on-brand out of the box (cream ground, orange primary,
  Inter type, hard offset shadow). Every other theme/preset, the `theme × palette × mode` API,
  partial-`tokens` overrides, and the `--mk-*` contract are unchanged and still selectable.
- Realign the drifted `memphis` preset to the canonical brand cream (`#FFFEF3`) + cyan (`#62D6FA`);
  the preset name and all other values are unchanged.
- Storybook: default the Theme toolbar to `brand`, give the decorator a cream dot-textured ground
  in Inter, and refresh the manager badge to the enlarged-MK brand mark.
- `PricingTable` hover elevation now derives from `--mk-fg` (token-driven) instead of a hardcoded
  black shadow, so every theme honors tokens.

No customer capability is removed; existing explicit `appearance` values remain byte-stable
(locked by the back-compat snapshot suite; only `memphis` was intentionally realigned).
