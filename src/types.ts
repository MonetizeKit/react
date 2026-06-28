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

export interface PricingTemplateSection {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  contactSalesLabel?: string;
}

export interface PricingTemplateBilling {
  defaultCycle?: "monthly" | "annually";
  showToggle?: boolean;
}

export interface PricingTemplateFeature {
  featureKey: string;
  label?: string;
  visible?: boolean;
  order?: number;
}

export interface PricingTemplateFeatureGroup {
  id: string;
  label: string;
  order?: number;
  features: PricingTemplateFeature[];
}

export interface PricingTemplateSummary {
  key: string;
  name: string;
  description?: string;
  skin: string;
  locale: string;
  availableLocales: string[];
  section?: PricingTemplateSection;
  billing?: PricingTemplateBilling;
}

export interface PricingTemplatePlansResponse<TPlan extends Plan = Plan> {
  data: TPlan[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  template?: PricingTemplateSummary;
  groups?: PricingTemplateFeatureGroup[];
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

export interface TeamMember {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Invoice {
  id: string;
  /** ISO date string. */
  date: string;
  /** Amount in major currency units (e.g. dollars). */
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
}
