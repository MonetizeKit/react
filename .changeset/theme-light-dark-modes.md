---
"@monetizekit/react": minor
---

Themes now have light + dark (+ system) modes.

- Restructured theming into **brand themes** (`default`, `dashboard`, `memphis`, `slate`, `ocean`, `forest`, `sunset`, `grape`), each with a hand-tuned **light and dark** variant.
- `appearance` accepts `{ theme, mode }` where `mode` is `light` | `dark` | `system`; **system** follows the OS via `prefers-color-scheme` (the provider subscribes to changes). Token overrides still apply on top.
- New exports: `THEMES`, `THEME_NAMES`, `appearanceMode`, and `ThemeName` / `ThemeMode` / `ThemeVariants` types.
- Storybook gains a **Mode** toolbar (Light/Dark/System) alongside Theme.
- Backward compatible: the fixed preset names (`light`, `dark`, `memphis`, `console`, …) are still accepted by `appearance`.
