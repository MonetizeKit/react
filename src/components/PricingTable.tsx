import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { describePlanPrice, annualSavingsPercent } from "../lib/format";
import { SAMPLE_PLANS } from "../lib/sample-data";
import { SampleNotice } from "./SampleNotice";
import { BillingCycleToggle } from "./BillingCycleToggle";
import type { Plan } from "../types";

export interface PricingTableProps {
  /** Plans to render; if omitted, fetched live from the publishable-key API. */
  plans?: Plan[];
  /** Plan name to highlight as "Most Popular". */
  highlightPlan?: string;
  /** Active billing cycle (controlled). With `showBillingToggle`, also the initial value. */
  billingCycle?: "monthly" | "annually";
  /** Render an interactive Monthly/Yearly toggle above the cards. */
  showBillingToggle?: boolean;
  locale?: string;
  onSelectPlan?: (planId: string) => void;
  /** Where the Contact Sales CTA links (defaults to no-op). */
  onContactSales?: (planId: string) => void;
  /**
   * When there are no plans to show, render illustrative sample plans behind a
   * clear disclaimer instead of an empty table. Defaults to `true`.
   */
  sampleWhenEmpty?: boolean;
  /** Override the sample-data disclaimer copy. */
  disclaimer?: ReactNode;
}

const wrapperStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1.5rem",
  background: "var(--mk-bg)",
  color: "var(--mk-fg)",
  fontFamily: "var(--mk-font)",
};

const cardBase: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

export function PricingTable({
  plans: plansProp,
  highlightPlan,
  billingCycle,
  showBillingToggle = false,
  locale,
  onSelectPlan,
  onContactSales,
  sampleWhenEmpty = true,
  disclaimer,
}: PricingTableProps) {
  const { client, tokens } = useMonetizeKit();
  const [plans, setPlans] = useState<Plan[] | null>(plansProp ?? null);
  const [error, setError] = useState<Error | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "annually">(billingCycle ?? "monthly");

  useEffect(() => {
    if (billingCycle) setCycle(billingCycle);
  }, [billingCycle]);

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
    return <div role="alert" style={{ color: "var(--mk-muted)" }}>Unable to load pricing.</div>;
  }
  if (!plans) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Loading pricing…</div>;
  }

  const isSample = plans.length === 0 && sampleWhenEmpty;
  const effectivePlans = isSample ? SAMPLE_PLANS : plans;

  if (effectivePlans.length === 0) {
    return <div style={{ color: "var(--mk-muted)" }}>No plans available.</div>;
  }

  return (
    <div
      style={{ ...tokensToStyle(tokens), display: "flex", flexDirection: "column", gap: "1rem" }}
      data-mk-component="pricing-table"
      data-mk-sample={isSample ? "true" : undefined}
    >
      {isSample ? <SampleNotice>{disclaimer}</SampleNotice> : null}
      {showBillingToggle ? (
        <BillingCycleToggle
          value={cycle}
          onChange={setCycle}
          savingsPercent={Math.max(
            0,
            ...effectivePlans.map((p) => annualSavingsPercent(p) ?? 0),
          )}
        />
      ) : null}
      <div style={wrapperStyle}>
      {effectivePlans.map((plan) => {
        const price = describePlanPrice(plan, locale, cycle);
        const highlighted =
          highlightPlan != null &&
          plan.name.toLowerCase() === highlightPlan.toLowerCase();
        return (
          <div
            key={plan.id}
            style={{
              ...cardBase,
              borderColor: highlighted ? "var(--mk-primary)" : "var(--mk-border)",
              borderWidth: highlighted ? 2 : 1,
            }}
            data-mk-plan={plan.name}
            data-mk-highlighted={highlighted ? "true" : undefined}
          >
            {highlighted ? (
              <span
                style={{
                  alignSelf: "flex-start",
                  background: "var(--mk-primary)",
                  color: "var(--mk-primary-fg)",
                  borderRadius: "var(--mk-radius)",
                  padding: "0.125rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Most Popular
              </span>
            ) : null}
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{plan.name}</h3>
            {plan.description ? (
              <p style={{ margin: 0, color: "var(--mk-muted)", fontSize: "0.875rem" }}>
                {plan.description}
              </p>
            ) : null}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700 }}>
                {price.contactSales ? "Custom" : price.headline}
              </span>
              {price.caption ? (
                <span style={{ color: "var(--mk-muted)", fontSize: "0.875rem" }}>
                  {price.caption}
                </span>
              ) : null}
            </div>
            {plan.entitlements && plan.entitlements.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--mk-fg)", fontSize: "0.875rem" }}>
                {plan.entitlements.slice(0, 6).map((e) => (
                  <li key={e.featureKey}>
                    {e.featureDisplayName}
                    {e.type !== "boolean" ? `: ${String(e.value)}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={() =>
                price.contactSales
                  ? onContactSales?.(plan.id)
                  : onSelectPlan?.(plan.id)
              }
              style={{
                marginTop: "auto",
                background: "var(--mk-primary)",
                color: "var(--mk-primary-fg)",
                border: "none",
                borderRadius: "var(--mk-radius)",
                padding: "0.625rem 1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {price.contactSales ? "Contact Sales" : "Get started"}
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
