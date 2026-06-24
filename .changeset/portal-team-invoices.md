---
"@monetizekit/react": minor
---

CustomerPortal: fold in Team + Invoices sections, and fix sample price units.

- `CustomerPortal` gains optional **Team** (`teamMembers`, `seats`, `showTeam`) and **Invoices** (`invoices`, `showInvoices`) sections, themed with the semantic tokens (paid/pending/overdue → success/warning/danger). Both default on in `sample` mode and render `SAMPLE_TEAM` / `SAMPLE_INVOICES`. New exported types `TeamMember` and `Invoice`, plus `SAMPLE_TEAM` / `SAMPLE_INVOICES` fixtures.
- Fix: sample plan/credit amounts were in cents (e.g. `49900`) but `formatMoney` treats amounts as major units, so they rendered as "$49,900". Corrected to dollars (`499` / `999` / credits `1200`).

This makes the package `CustomerPortal` a superset of the previous dashboard-local portal cards, enabling those to be removed.
