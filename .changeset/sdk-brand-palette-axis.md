---
"@monetizekit/react": minor
---

Add the canonical `brand` theme and an optional 9-palette axis, sourced from
`@monetizekit/design-tokens`.

- New `brand` theme (`appearance={{ theme: "brand" }}`) backed by the shared design tokens, with
  light/dark variants and full `theme × palette × mode` support.
- New optional `palette` on the theme-object appearance (`{ theme: "brand", palette, mode }`) —
  `default` plus 8 experimentation palettes (`nord`/`solarized`/`dracula`/`github`/`rose-pine`/
  `blue`/`green`/`unicorn`). Palette applies only to the `brand` theme; hand-tuned themes ignore it.
- Exports `PALETTE_NAMES`, `PaletteName`, and `ThemeAppearance`.
- Storybook gains a **Palette** toolbar (active for the brand theme).

Fully additive and capability-preserving: all 8 existing themes, 10 flat presets, the `theme × mode`
API (incl. `system`), partial-`tokens` overrides, and the exact `--mk-*` variable contract are
unchanged. A back-compat snapshot suite locks every pre-brand appearance to byte-exact output.
