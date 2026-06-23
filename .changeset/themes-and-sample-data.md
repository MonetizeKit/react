---
"@monetizekit/react": minor
---

Add a multitude of theme presets, sample/empty-state data, and richer themeable tokens.

- **Themes**: new presets `console` (captures the in-app dashboard "widgets" mock look — dark cards, emerald/amber/red semantics, soft elevation), plus `midnight`, `ocean`, `forest`, `sunset`, and `grape`. Exported `THEME_PRESET_NAMES` for building theme pickers.
- **Tokens**: `ThemeTokens` gains `colorCard`, `colorCardForeground`, `colorSuccess`, `colorWarning`, `colorDanger`, and `shadow` (CSS vars `--mk-card`, `--mk-card-fg`, `--mk-success`, `--mk-warning`, `--mk-danger`, `--mk-shadow`). `UsageBanner` now uses warning/danger semantics; `CustomerPortal` renders as an elevated card with a status badge.
- **Sample data**: exported `SAMPLE_PLANS`, `SAMPLE_USAGE`, `SAMPLE_CREDITS`, `SAMPLE_PORTAL`, and a `SampleNotice` disclaimer. `PricingTable` falls back to illustrative sample plans behind a clear disclaimer when there are no plans (toggle with `sampleWhenEmpty`, customize via `disclaimer`); `CustomerPortal` supports a `sample` mode for previews and fresh workspaces with no plans/products defined.
