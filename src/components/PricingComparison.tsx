import { useEffect, useState, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { describePlanPrice, formatUnits, sortPlansForDisplay } from "../lib/format";
import { SAMPLE_PLANS } from "../lib/sample-data";
import { SampleNotice } from "./SampleNotice";
import { CheckCircleIcon, MinusCircleIcon } from "./icons";
import type { Plan, PlanEntitlement } from "../types";

/** A labelled group of feature keys to compare across plans. */
export interface ComparisonFeatureGroup {
  title: string;
  features: { key: string; label: string }[];
}

export interface PricingComparisonProps {
  /** Plans to compare; if omitted, fetched live from the publishable-key API. */
  plans?: Plan[];
  /**
   * Feature groups (rows) to show. When omitted, a single "Features" group is
   * derived from the union of the plans' entitlements.
   */
  groups?: ComparisonFeatureGroup[];
  highlightPlan?: string;
  billingCycle?: "monthly" | "annually";
  locale?: string;
  sampleWhenEmpty?: boolean;
  disclaimer?: ReactNode;
}

const UNLIMITED_THRESHOLD = 9999;

const STYLE_ID = "mk-pricing-comparison-styles";
const PRICING_COMPARISON_CSS = `
.mk-pricing-comparison{font-family:var(--mk-font);color:var(--mk-fg)}
.mk-pc-scroll{overflow-x:auto;border:1px solid var(--mk-border);border-radius:var(--mk-radius);background:var(--mk-card);box-shadow:var(--mk-shadow)}
.mk-pc-table{width:100%;border-collapse:collapse;color:var(--mk-card-fg);min-width:560px}
.mk-pc-th{padding:1.1rem 1rem .9rem;text-align:center;vertical-align:bottom}
.mk-pc-th--feature{text-align:left;font-size:.8125rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--mk-muted)}
.mk-pc-th-name{font-weight:700;font-size:1.0625rem;line-height:1.2}
.mk-pc-th-price{font-size:.8125rem;color:var(--mk-muted);font-weight:500;margin-top:.2rem}
.mk-pc-badge{display:inline-block;margin-top:.4rem;background:var(--mk-primary);color:var(--mk-primary-fg);border-radius:999px;padding:.12rem .55rem;font-size:.625rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.mk-pc-group td{padding:.65rem 1rem;font-size:.75rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--mk-muted);background:color-mix(in srgb,var(--mk-fg) 4%,transparent)}
.mk-pc-row{border-top:1px solid var(--mk-border)}
.mk-pc-row:hover td{background:color-mix(in srgb,var(--mk-fg) 3%,transparent)}
.mk-pc-cell{padding:.8rem 1rem;text-align:center;font-size:.875rem;vertical-align:middle;color:var(--mk-card-fg)}
.mk-pc-cell--feature{text-align:left;font-weight:500}
.mk-pc-col-hl{background:color-mix(in srgb,var(--mk-primary) 7%,transparent)}
.mk-pc-row:hover td.mk-pc-col-hl{background:color-mix(in srgb,var(--mk-primary) 12%,transparent)}
.mk-pc-check{width:1.2rem;height:1.2rem;color:var(--mk-success);display:inline-block;vertical-align:middle}
.mk-pc-col-hl .mk-pc-check{color:var(--mk-primary)}
.mk-pc-no{width:1.2rem;height:1.2rem;color:var(--mk-muted);opacity:.45;display:inline-block;vertical-align:middle}
`;

function PricingComparisonStyles() {
  return <style id={STYLE_ID} dangerouslySetInnerHTML={{ __html: PRICING_COMPARISON_CSS }} />;
}

function entitlementCell(ent: PlanEntitlement | undefined, locale?: string): ReactNode {
  if (!ent) return <MinusCircleIcon className="mk-pc-no" title="Not included" />;
  switch (ent.type) {
    case "boolean":
      return ent.value ? (
        <CheckCircleIcon className="mk-pc-check" title="Included" />
      ) : (
        <MinusCircleIcon className="mk-pc-no" title="Not included" />
      );
    case "limit": {
      const n = Number(ent.value);
      return <span>{n >= UNLIMITED_THRESHOLD ? "Unlimited" : formatUnits(n, locale)}</span>;
    }
    default:
      return <span>{String(ent.value)}</span>;
  }
}

/** Derive a single feature group from the union of all plans' entitlements. */
function deriveGroups(plans: Plan[]): ComparisonFeatureGroup[] {
  const seen = new Map<string, string>();
  for (const plan of plans) {
    for (const ent of plan.entitlements ?? []) {
      if (!seen.has(ent.featureKey)) seen.set(ent.featureKey, ent.featureDisplayName);
    }
  }
  return [
    {
      title: "Features",
      features: Array.from(seen, ([key, label]) => ({ key, label })),
    },
  ];
}

/**
 * A feature-comparison table across plans (à la a "Compare plans" section).
 * Reads live plans via the publishable key when `plans` is omitted, and falls
 * back to illustrative sample plans (behind a disclaimer) when empty.
 */
export function PricingComparison({
  plans: plansProp,
  groups,
  highlightPlan,
  billingCycle = "monthly",
  locale: localeProp,
  sampleWhenEmpty = true,
  disclaimer,
}: PricingComparisonProps) {
  const { client, tokens, locale: ctxLocale } = useMonetizeKit();
  const locale = localeProp ?? ctxLocale;
  const [plans, setPlans] = useState<Plan[] | null>(plansProp ?? null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (plansProp) {
      setPlans(plansProp);
      return;
    }
    let active = true;
    client
      .listPlans<{ data: Plan[] }>()
      .then((res) => {
        if (active) setPlans(res.data ?? []);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      active = false;
    };
  }, [client, plansProp]);

  if (error) {
    return <div role="alert" style={{ color: "var(--mk-muted)" }}>Unable to load plan comparison.</div>;
  }
  if (!plans) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Loading comparison…</div>;
  }

  const isSample = plans.length === 0 && sampleWhenEmpty;
  // Order live catalog data cheapest-first; respect a caller's explicit order.
  const effectivePlans = isSample
    ? SAMPLE_PLANS
    : plansProp
      ? plans
      : sortPlansForDisplay(plans);
  if (effectivePlans.length === 0) {
    return <div style={{ color: "var(--mk-muted)" }}>No plans to compare.</div>;
  }

  const effectiveGroups = groups ?? deriveGroups(effectivePlans);
  const entByPlan = effectivePlans.map(
    (plan) => new Map((plan.entitlements ?? []).map((e) => [e.featureKey, e])),
  );
  const highlightedIndex = effectivePlans.findIndex(
    (p) => highlightPlan != null && p.name.toLowerCase() === highlightPlan.toLowerCase(),
  );

  return (
    <div
      className="mk-pricing-comparison"
      style={{ ...tokensToStyle(tokens), display: "flex", flexDirection: "column", gap: "1rem" }}
      data-mk-component="pricing-comparison"
      data-mk-sample={isSample ? "true" : undefined}
    >
      <PricingComparisonStyles />
      {isSample ? <SampleNotice>{disclaimer}</SampleNotice> : null}
      <div className="mk-pc-scroll">
        <table className="mk-pc-table">
          <thead>
            <tr>
              <th className="mk-pc-th mk-pc-th--feature">Features</th>
              {effectivePlans.map((plan, i) => {
                const highlighted = i === highlightedIndex;
                const price = describePlanPrice(plan, locale, billingCycle);
                return (
                  <th
                    key={plan.id}
                    className={`mk-pc-th${highlighted ? " mk-pc-col-hl" : ""}`}
                    data-mk-plan={plan.name}
                    data-mk-highlighted={highlighted ? "true" : undefined}
                  >
                    <div className="mk-pc-th-name">{plan.name}</div>
                    <div className="mk-pc-th-price">
                      {price.contactSales ? "Custom" : price.headline}
                    </div>
                    {highlighted ? <span className="mk-pc-badge">Popular</span> : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {effectiveGroups.map((group) => (
              <FeatureGroupRows
                key={group.title}
                group={group}
                planCount={effectivePlans.length}
                entByPlan={entByPlan}
                highlightedIndex={highlightedIndex}
                locale={locale}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureGroupRows({
  group,
  planCount,
  entByPlan,
  highlightedIndex,
  locale,
}: {
  group: ComparisonFeatureGroup;
  planCount: number;
  entByPlan: Map<string, PlanEntitlement>[];
  highlightedIndex: number;
  locale?: string;
}) {
  return (
    <>
      <tr className="mk-pc-group">
        <td colSpan={planCount + 1}>{group.title}</td>
      </tr>
      {group.features.map((feature) => (
        <tr key={feature.key} className="mk-pc-row">
          <td className="mk-pc-cell mk-pc-cell--feature">{feature.label}</td>
          {entByPlan.map((map, i) => (
            <td
              key={i}
              className={`mk-pc-cell${i === highlightedIndex ? " mk-pc-col-hl" : ""}`}
            >
              {entitlementCell(map.get(feature.key), locale)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
