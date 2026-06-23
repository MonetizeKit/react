// Provider + hooks
export {
  MonetizeKitProvider,
  useMonetizeKit,
  type MonetizeKitProviderProps,
  type MonetizeKitContextValue,
} from "./provider";
export { useEntitlement, useUsage, useCredits } from "./hooks";

// Components
export { PricingTable, type PricingTableProps } from "./components/PricingTable";
export { Paywall, type PaywallProps } from "./components/Paywall";
export { UsageBanner, type UsageBannerProps } from "./components/UsageBanner";
export {
  CustomerPortal,
  type CustomerPortalProps,
} from "./components/CustomerPortal";
export {
  EntitlementGate,
  type EntitlementGateProps,
} from "./components/EntitlementGate";

// Theming
export {
  THEME_PRESETS,
  resolveTokens,
  tokensToStyle,
  type Appearance,
  type ThemeTokens,
  type ThemePresetName,
} from "./theme/tokens";

// Pricing formatting helpers
export {
  formatMoney,
  formatUnits,
  describePlanPrice,
  describeUsageTerm,
  type PriceDisplay,
} from "./lib/format";

// Client + types
export { MonetizeKitClient, type MonetizeKitClientConfig } from "./lib/client";
export type {
  Plan,
  PlanEntitlement,
  PricingTerm,
  PricingTier,
  EntitlementResult,
  UsageResult,
  CreditBalance,
} from "./types";
