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
): PriceDisplay {
  const pricing = plan.pricing ?? [];
  const contactSales =
    (plan.tags ?? []).includes("contact_sales") || pricing.length === 0;
  if (contactSales) {
    return { headline: null, contactSales: true };
  }

  const base = pricing.find((t) => t.type === "flat");
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
