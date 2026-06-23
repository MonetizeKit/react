/**
 * Public types for @monetizekit/react. Kept self-contained so the package has
 * no cross-repo dependency; mirrors the canonical catalog/pricing contract.
 */

export interface PricingTier {
  /** Absolute quantity upper bound; `null` = open-ended ("and above"). */
  upTo: number | null;
  unitPrice: number;
}

export interface PricingTerm {
  type: "flat" | "per_seat" | "usage" | "credits" | "setup_fee";
  amount: number;
  currency: string;
  interval: "monthly" | "annually" | "one_time";
  meterId?: string;
  meterDisplayName?: string;
  includedUnits?: number;
  tierMode?: "graduated" | "volume";
  tieredPricing?: PricingTier[];
}

export interface PlanEntitlement {
  featureKey: string;
  featureDisplayName: string;
  type: "boolean" | "limit" | "enum" | "string";
  value: string | number | boolean;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  /** Marketing/grouping tags; `contact_sales` renders a Contact Sales CTA. */
  tags?: string[];
  entitlements?: PlanEntitlement[];
  pricing?: PricingTerm[];
}

export interface EntitlementResult {
  featureKey: string;
  value: string | number | boolean | null;
  allowed: boolean;
}

export interface UsageResult {
  meterId: string;
  current: number;
  limit: number | null;
}

export interface CreditBalance {
  balance: number;
  currency?: string;
}
