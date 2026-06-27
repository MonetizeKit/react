import type { Plan, PricingTerm } from "../types";

/** Format a monetary amount with Intl, honoring locale + currency. */
export function formatMoney(
  amount: number,
  currency = "USD",
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: amount < 1 ? 3 : 2,
  }).format(amount);
}

/** Format a large unit count compactly (e.g. 5,000 / 1M). */
export function formatUnits(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export interface PriceDisplay {
  /** Headline price string, or null for contact-sales. */
  headline: string | null;
  /** Secondary line (e.g. "+ usage" or billing interval). */
  caption?: string;
  contactSales: boolean;
}

const INTERVAL_SUFFIX: Record<PricingTerm["interval"], string> = {
  monthly: "/mo",
  annually: "/yr",
  one_time: "",
};

/**
 * Derive a display from a plan's pricing terms. Returns a contact-sales display
 * when the plan is tagged `contact_sales` or has no public price; renders a
 * "from $base + usage" headline when metered usage terms are present.
 */
export function describePlanPrice(
  plan: Plan,
  locale?: string,
  billingCycle: "monthly" | "annually" = "monthly",
): PriceDisplay {
  const pricing = plan.pricing ?? [];
  const contactSales =
    (plan.tags ?? []).includes("contact_sales") || pricing.length === 0;
  if (contactSales) {
    return { headline: null, contactSales: true };
  }

  const flats = pricing.filter((t) => t.type === "flat");
  // Prefer the flat term matching the requested cycle; fall back to monthly,
  // then to whatever flat term exists.
  const base =
    flats.find((t) => t.interval === billingCycle) ??
    flats.find((t) => t.interval === "monthly") ??
    flats[0];
  const hasUsage = pricing.some((t) => t.type === "usage");
  const currency = base?.currency ?? pricing[0]?.currency ?? "USD";
  const interval = base?.interval ?? pricing[0]?.interval ?? "monthly";
  const baseAmount = base?.amount ?? 0;

  const headline = `${formatMoney(baseAmount, currency, locale)}${INTERVAL_SUFFIX[interval]}`;
  return {
    headline,
    caption: hasUsage ? "+ usage" : undefined,
    contactSales: false,
  };
}

/**
 * Percentage saved by paying annually vs 12× the monthly price, or null when a
 * plan lacks both terms or has no real saving. Used for the "Save X%" badge.
 */
export function annualSavingsPercent(plan: Plan): number | null {
  const flats = (plan.pricing ?? []).filter((t) => t.type === "flat");
  const monthly = flats.find((t) => t.interval === "monthly");
  const annual = flats.find((t) => t.interval === "annually");
  if (!monthly || !annual || monthly.amount <= 0) return null;
  const pct = Math.round((1 - annual.amount / (monthly.amount * 12)) * 100);
  return pct > 0 ? pct : null;
}

/**
 * Sort key for displaying plans cheapest-first: the effective monthly flat
 * price, with contact-sales / unpriced plans sorted last. Used to give live
 * catalog data a conventional low→high ordering regardless of API order.
 */
export function planSortValue(plan: Plan): number {
  const pricing = plan.pricing ?? [];
  const contactSales = (plan.tags ?? []).includes("contact_sales") || pricing.length === 0;
  if (contactSales) return Number.POSITIVE_INFINITY;
  const flats = pricing.filter((t) => t.type === "flat");
  const monthly = flats.find((t) => t.interval === "monthly") ?? flats[0];
  return monthly?.amount ?? 0;
}

/** Return a copy of `plans` ordered cheapest-first (contact-sales last), stable. */
export function sortPlansForDisplay(plans: Plan[]): Plan[] {
  return plans
    .map((plan, index) => ({ plan, index }))
    .sort((a, b) => planSortValue(a.plan) - planSortValue(b.plan) || a.index - b.index)
    .map(({ plan }) => plan);
}

/** Human-readable description of a usage term's metered tiers. */
export function describeUsageTerm(term: PricingTerm, locale?: string): string {
  const parts: string[] = [];
  if (term.includedUnits && term.includedUnits > 0) {
    parts.push(`${formatUnits(term.includedUnits, locale)} ${term.meterDisplayName ?? "units"} included`);
  }
  const tiers = term.tieredPricing ?? [];
  if (tiers.length > 0) {
    const first = tiers[0]!;
    parts.push(
      `then ${formatMoney(first.unitPrice, term.currency, locale)}/unit${
        term.tierMode === "volume" ? " (volume)" : ""
      }`,
    );
  }
  return parts.join(", ");
}
