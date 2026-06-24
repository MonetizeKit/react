# @monetizekit/react

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
