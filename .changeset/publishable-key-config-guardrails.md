---
"@monetizekit/react": minor
---

Add Clerk-style configuration guardrails for the publishable key. When a
consuming app is missing its publishable key, passes a malformed key (not
`pk_…`), omits the API base URL, or uses a non-live `pk_test_` key, the SDK now
surfaces a clear, actionable message in **both the console and the UI** (with a
link to the setup docs) instead of silently rendering an empty/"unable to load"
state. `MonetizeKitProvider` exposes the diagnostic via context (`config`), and
new exports `inspectMonetizeKitConfig`, `ConfigNotice`,
`formatConfigDiagnosticForConsole`, and `redactPublishableKey` are available for
custom handling. `PricingTable` renders the notice (plus sample plans) on a
config error and a warning banner for non-live keys.
