/**
 * Package-entry guard: assert the built package exports real components/hooks
 * (functions), never placeholder strings or undefined. Run after `pnpm build`.
 */
import * as mk from "../dist/index.js";

const expectedFunctions = [
  "MonetizeKitProvider",
  "useMonetizeKit",
  "usePlans",
  "useEntitlement",
  "useUsage",
  "useCredits",
  "PricingTable",
  "PricingComparison",
  "BillingCycleToggle",
  "Paywall",
  "UsageBanner",
  "AlertBanner",
  "CustomerPortal",
  "EntitlementGate",
  "SampleNotice",
  "ConfigNotice",
  "inspectMonetizeKitConfig",
  "formatConfigDiagnosticForConsole",
  "redactPublishableKey",
  "resolveTokens",
  "tokensToStyle",
  "describePlanPrice",
  "planSortValue",
  "sortPlansForDisplay",
  "includedFeatures",
  "MonetizeKitClient",
];

const problems = [];
for (const name of expectedFunctions) {
  const value = mk[name];
  if (typeof value !== "function") {
    problems.push(`${name}: expected function, got ${typeof value} (${String(value)})`);
  }
}

// THEME_PRESETS must be a real object with the memphis + dashboard presets.
if (typeof mk.THEME_PRESETS !== "object" || !mk.THEME_PRESETS?.memphis) {
  problems.push("THEME_PRESETS: missing or not an object with presets");
}

if (problems.length > 0) {
  console.error("Package entry guard failed:\n - " + problems.join("\n - "));
  process.exit(1);
}

console.log(`Package entry guard passed: ${expectedFunctions.length} exports resolve to real implementations.`);
