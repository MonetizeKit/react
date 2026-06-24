import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { describePlanPrice, formatUnits } from "../lib/format";
import { SAMPLE_PLANS } from "../lib/sample-data";
import { SampleNotice } from "./SampleNotice";
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

function entitlementCell(ent: PlanEntitlement | undefined, locale?: string): ReactNode {
  if (!ent) return <span style={{ color: "var(--mk-muted)" }}>—</span>;
  switch (ent.type) {
    case "boolean":
      return ent.value
        ? <span aria-label="Included" style={{ color: "var(--mk-success)", fontWeight: 700 }}>✓</span>
        : <span aria-label="Not included" style={{ color: "var(--mk-muted)" }}>—</span>;
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

const cellStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "center",
  fontSize: "0.875rem",
  borderTop: "1px solid var(--mk-border)",
};

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
  locale,
  sampleWhenEmpty = true,
  disclaimer,
}: PricingComparisonProps) {
  const { client, tokens } = useMonetizeKit();
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
  const effectivePlans = isSample ? SAMPLE_PLANS : plans;
  if (effectivePlans.length === 0) {
    return <div style={{ color: "var(--mk-muted)" }}>No plans to compare.</div>;
  }

  const effectiveGroups = groups ?? deriveGroups(effectivePlans);
  const entByPlan = effectivePlans.map(
    (plan) => new Map((plan.entitlements ?? []).map((e) => [e.featureKey, e])),
  );

  return (
    <div
      style={{ ...tokensToStyle(tokens), display: "flex", flexDirection: "column", gap: "1rem" }}
      data-mk-component="pricing-comparison"
      data-mk-sample={isSample ? "true" : undefined}
    >
      {isSample ? <SampleNotice>{disclaimer}</SampleNotice> : null}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--mk-bg)",
            color: "var(--mk-fg)",
            fontFamily: "var(--mk-font)",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...cellStyle, textAlign: "left", borderTop: "none" }}>Features</th>
              {effectivePlans.map((plan) => {
                const highlighted =
                  highlightPlan != null && plan.name.toLowerCase() === highlightPlan.toLowerCase();
                const price = describePlanPrice(plan, locale, billingCycle);
                return (
                  <th
                    key={plan.id}
                    style={{
                      ...cellStyle,
                      borderTop: "none",
                      color: highlighted ? "var(--mk-primary)" : "var(--mk-fg)",
                    }}
                    data-mk-plan={plan.name}
                    data-mk-highlighted={highlighted ? "true" : undefined}
                  >
                    <div style={{ fontWeight: 700 }}>{plan.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)", fontWeight: 400 }}>
                      {price.contactSales ? "Custom" : price.headline}
                    </div>
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
  locale,
}: {
  group: ComparisonFeatureGroup;
  planCount: number;
  entByPlan: Map<string, PlanEntitlement>[];
  locale?: string;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={planCount + 1}
          style={{
            padding: "0.625rem 1rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            background: "color-mix(in srgb, var(--mk-fg) 5%, transparent)",
            borderTop: "1px solid var(--mk-border)",
          }}
        >
          {group.title}
        </td>
      </tr>
      {group.features.map((feature) => (
        <tr key={feature.key}>
          <td style={{ ...cellStyle, textAlign: "left", color: "var(--mk-fg)" }}>{feature.label}</td>
          {entByPlan.map((map, i) => (
            <td key={i} style={cellStyle}>
              {entitlementCell(map.get(feature.key), locale)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
