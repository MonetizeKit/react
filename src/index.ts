// Provider + hooks
export {
  MonetizeKitProvider,
  useMonetizeKit,
  type MonetizeKitProviderProps,
  type MonetizeKitContextValue,
} from "./provider";
export {
  usePlans,
  usePricingTemplate,
  useEntitlement,
  useUsage,
  useCredits,
  type UsePlansOptions,
  type UsePlansResult,
  type UsePricingTemplateOptions,
  type UsePricingTemplateResult,
} from "./hooks";

// Components
export {
  PricingTable,
  type PricingTableProps,
  type PricingPlanCardRenderContext,
  type PricingTableClassNames,
} from "./components/PricingTable";
export {
  PricingComparison,
  type PricingComparisonProps,
  type ComparisonFeatureGroup,
} from "./components/PricingComparison";
export {
  BillingCycleToggle,
  type BillingCycleToggleProps,
} from "./components/BillingCycleToggle";
export { Paywall, type PaywallProps } from "./components/Paywall";
export { UsageBanner, type UsageBannerProps } from "./components/UsageBanner";
export {
  AlertBanner,
  type AlertBannerProps,
  type AlertBannerVariant,
  type BannerAction,
} from "./components/AlertBanner";
export {
  CustomerPortal,
  type CustomerPortalProps,
} from "./components/CustomerPortal";
export {
  EntitlementGate,
  type EntitlementGateProps,
} from "./components/EntitlementGate";
export { SampleNotice, type SampleNoticeProps } from "./components/SampleNotice";
export { ConfigNotice, type ConfigNoticeProps } from "./components/ConfigNotice";

// Configuration guardrails (Clerk-style): detect a missing / malformed / non-live
// publishable key and surface it in logs + UI.
export {
  inspectMonetizeKitConfig,
  formatConfigDiagnosticForConsole,
  redactPublishableKey,
  MONETIZEKIT_KEYS_DOCS_URL,
  type ConfigDiagnostic,
  type ConfigStatus,
  type ConfigSeverity,
} from "./lib/config-diagnostics";

// Theming
export {
  THEMES,
  THEME_NAMES,
  THEME_PRESETS,
  THEME_PRESET_NAMES,
  resolveTokens,
  tokensToStyle,
  appearanceMode,
  type Appearance,
  type ThemeTokens,
  type ThemeVariants,
  type ThemeName,
  type ThemeMode,
  type ThemePresetName,
} from "./theme/tokens";

// Illustrative sample data (paired with <SampleNotice/>)
export {
  SAMPLE_PLANS,
  SAMPLE_USAGE,
  SAMPLE_CREDITS,
  SAMPLE_TEAM,
  SAMPLE_INVOICES,
  SAMPLE_PORTAL,
  SAMPLE_NOTICE_TEXT,
} from "./lib/sample-data";

// Pricing formatting helpers
export {
  formatMoney,
  formatUnits,
  describePlanPrice,
  describeUsageTerm,
  planSortValue,
  sortPlansForDisplay,
  type PriceDisplay,
} from "./lib/format";
export {
  includedFeatures,
  type FeatureRow,
} from "./lib/pricing";

// Client + types
export {
  MonetizeKitClient,
  type ListPlansOptions,
  type MonetizeKitClientConfig,
} from "./lib/client";
export type {
  Plan,
  PlanEntitlement,
  PricingTemplateBilling,
  PricingTemplateFeature,
  PricingTemplateFeatureGroup,
  PricingTemplatePlansResponse,
  PricingTemplateSection,
  PricingTemplateSummary,
  PricingTerm,
  PricingTier,
  EntitlementResult,
  UsageResult,
  CreditBalance,
  TeamMember,
  Invoice,
} from "./types";
