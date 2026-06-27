import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { describePlanPrice, annualSavingsPercent, formatUnits, sortPlansForDisplay } from "../lib/format";
import { SAMPLE_PLANS } from "../lib/sample-data";
import { SampleNotice } from "./SampleNotice";
import { ConfigNotice } from "./ConfigNotice";
import { BillingCycleToggle } from "./BillingCycleToggle";
import { CheckCircleIcon } from "./icons";
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
  /** CTA label for purchasable plans. Defaults to "Get started". */
  ctaLabel?: string;
  /** Max number of feature rows to show per card. Defaults to 8. */
  maxFeatures?: number;
  /**
   * When there are no plans to show, render illustrative sample plans behind a
   * clear disclaimer instead of an empty table. Defaults to `true`.
   */
  sampleWhenEmpty?: boolean;
  /** Override the sample-data disclaimer copy. */
  disclaimer?: ReactNode;
}

const UNLIMITED_THRESHOLD = 9999;

/**
 * Scoped, token-driven stylesheet for the pricing grid. Inline styles can't
 * express media queries, hover, or the highlighted-card lift, so we render a
 * small `<style>` element (SSR-safe) scoped to `.mk-pricing-table`.
 *
 * Desktop column count is driven by `--mk-pt-cols` (set inline to the plan
 * count, capped) so 4 plans render as a 4-up row — never an orphaned 4th card —
 * collapsing to 2-up on tablet and a single column on mobile.
 */
const STYLE_ID = "mk-pricing-table-styles";
const PRICING_TABLE_CSS = `
.mk-pricing-table{font-family:var(--mk-font);color:var(--mk-fg)}
.mk-pt-grid{display:grid;gap:1.5rem;grid-template-columns:1fr;align-items:stretch;padding-top:.75rem}
@media(min-width:640px){.mk-pt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.mk-pt-grid{grid-template-columns:repeat(var(--mk-pt-cols,3),minmax(0,1fr))}}
.mk-pt-card{position:relative;display:flex;flex-direction:column;gap:1rem;background:var(--mk-card);color:var(--mk-card-fg);border:1px solid var(--mk-border);border-radius:var(--mk-radius);padding:1.75rem;box-shadow:var(--mk-shadow);transition:transform .15s ease,box-shadow .15s ease}
.mk-pt-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.12)}
.mk-pt-card[data-mk-highlighted="true"]{border-color:var(--mk-primary);border-width:2px;box-shadow:0 16px 40px color-mix(in srgb,var(--mk-primary) 22%,transparent)}
@media(min-width:1024px){.mk-pt-card[data-mk-highlighted="true"]{transform:translateY(-8px)}.mk-pt-card[data-mk-highlighted="true"]:hover{transform:translateY(-10px)}}
.mk-pt-badge{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);background:var(--mk-primary);color:var(--mk-primary-fg);border-radius:999px;padding:.25rem .85rem;font-size:.75rem;font-weight:600;letter-spacing:.02em;white-space:nowrap;box-shadow:var(--mk-shadow)}
.mk-pt-name{margin:0;font-size:1.25rem;font-weight:700;line-height:1.2}
.mk-pt-desc{margin:0;color:var(--mk-muted);font-size:.875rem;line-height:1.45;min-height:2.5em}
.mk-pt-price{display:flex;align-items:baseline;gap:.4rem;flex-wrap:wrap}
.mk-pt-amount{font-size:2.25rem;font-weight:800;letter-spacing:-.02em;line-height:1}
.mk-pt-caption{color:var(--mk-muted);font-size:.875rem}
.mk-pt-cta{margin-top:auto;width:100%;border-radius:var(--mk-radius);padding:.75rem 1rem;font-weight:600;font-size:.9375rem;cursor:pointer;transition:filter .15s ease,opacity .15s ease;border:1px solid transparent}
.mk-pt-cta:hover{filter:brightness(.94)}
.mk-pt-cta--primary{background:var(--mk-primary);color:var(--mk-primary-fg)}
.mk-pt-cta--ghost{background:color-mix(in srgb,var(--mk-fg) 8%,transparent);color:var(--mk-fg)}
.mk-pt-cta--ghost:hover{background:color-mix(in srgb,var(--mk-fg) 14%,transparent);filter:none}
.mk-pt-flabel{font-size:.8125rem;font-weight:600;color:var(--mk-fg);margin:.25rem 0 -.25rem}
.mk-pt-features{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6rem}
.mk-pt-feature{display:flex;align-items:flex-start;gap:.55rem;font-size:.875rem;line-height:1.4;color:var(--mk-card-fg)}
.mk-pt-check{flex:0 0 auto;width:1.15rem;height:1.15rem;margin-top:.05rem;color:var(--mk-success)}
.mk-pt-card[data-mk-highlighted="true"] .mk-pt-check{color:var(--mk-primary)}
`;

function PricingTableStyles() {
  return <style id={STYLE_ID} dangerouslySetInnerHTML={{ __html: PRICING_TABLE_CSS }} />;
}

/** Plain inline styles (theme tokens) for the outer wrapper, SSR-safe. */
const wrapperStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

interface FeatureRow {
  key: string;
  label: string;
}

/**
 * Derive a clean "what's included" list from a plan's entitlements: include
 * boolean entitlements only when granted, render limits/values inline, and skip
 * features the plan does not have so cards never advertise absent capabilities.
 */
function includedFeatures(plan: Plan, locale: string | undefined, max: number): FeatureRow[] {
  const rows: FeatureRow[] = [];
  for (const ent of plan.entitlements ?? []) {
    if (ent.type === "boolean") {
      if (ent.value === true) rows.push({ key: ent.featureKey, label: ent.featureDisplayName });
    } else if (ent.type === "limit") {
      const n = Number(ent.value);
      rows.push({
        key: ent.featureKey,
        label: `${ent.featureDisplayName}: ${n >= UNLIMITED_THRESHOLD ? "Unlimited" : formatUnits(n, locale)}`,
      });
    } else {
      rows.push({ key: ent.featureKey, label: `${ent.featureDisplayName}: ${String(ent.value)}` });
    }
    if (rows.length >= max) break;
  }
  return rows;
}

export function PricingTable({
  plans: plansProp,
  highlightPlan,
  billingCycle,
  showBillingToggle = false,
  locale,
  onSelectPlan,
  onContactSales,
  ctaLabel = "Get started",
  maxFeatures = 8,
  sampleWhenEmpty = true,
  disclaimer,
}: PricingTableProps) {
  const { client, tokens, locale: ctxLocale, config } = useMonetizeKit();
  const effectiveLocale = locale ?? ctxLocale;
  // A config error (e.g. missing publishable key) means a live fetch can't
  // succeed — skip it and show an actionable notice instead of a doomed request.
  const configError = !plansProp && config.severity === "error";
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
    if (configError) return;
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
  }, [client, plansProp, configError]);

  // Missing/malformed key (or base URL): show the developer reminder, plus
  // sample plans so the layout is still previewable.
  if (configError) {
    return (
      <div
        className="mk-pricing-table"
        style={{ ...tokensToStyle(tokens), ...wrapperStyle }}
        data-mk-component="pricing-table"
        data-mk-config-error="true"
      >
        <PricingTableStyles />
        <ConfigNotice diagnostic={config} />
        {sampleWhenEmpty ? (
          <>
            <SampleNotice>{disclaimer}</SampleNotice>
            <PricingGrid
              plans={SAMPLE_PLANS}
              cycle={cycle}
              locale={effectiveLocale}
              highlightPlan={highlightPlan}
              maxFeatures={maxFeatures}
              ctaLabel={ctaLabel}
              onSelectPlan={onSelectPlan}
              onContactSales={onContactSales}
            />
          </>
        ) : null}
      </div>
    );
  }

  if (error) {
    return <div role="alert" style={{ color: "var(--mk-muted)" }}>Unable to load pricing.</div>;
  }
  if (!plans) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Loading pricing…</div>;
  }

  const isSample = plans.length === 0 && sampleWhenEmpty;
  // Order live catalog data cheapest-first; respect a caller's explicit order.
  const effectivePlans = isSample
    ? SAMPLE_PLANS
    : plansProp
      ? plans
      : sortPlansForDisplay(plans);

  if (effectivePlans.length === 0) {
    return <div style={{ color: "var(--mk-muted)" }}>No plans available.</div>;
  }

  return (
    <div
      className="mk-pricing-table"
      style={{ ...tokensToStyle(tokens), ...wrapperStyle }}
      data-mk-component="pricing-table"
      data-mk-sample={isSample ? "true" : undefined}
    >
      <PricingTableStyles />
      {config.severity === "warning" ? <ConfigNotice diagnostic={config} /> : null}
      {isSample ? <SampleNotice>{disclaimer}</SampleNotice> : null}
      {showBillingToggle ? (
        <BillingCycleToggle
          value={cycle}
          onChange={setCycle}
          savingsPercent={Math.max(0, ...effectivePlans.map((p) => annualSavingsPercent(p) ?? 0))}
        />
      ) : null}
      <PricingGrid
        plans={effectivePlans}
        cycle={cycle}
        locale={effectiveLocale}
        highlightPlan={highlightPlan}
        maxFeatures={maxFeatures}
        ctaLabel={ctaLabel}
        onSelectPlan={onSelectPlan}
        onContactSales={onContactSales}
      />
    </div>
  );
}

function PricingGrid({
  plans,
  cycle,
  locale,
  highlightPlan,
  maxFeatures,
  ctaLabel,
  onSelectPlan,
  onContactSales,
}: {
  plans: Plan[];
  cycle: "monthly" | "annually";
  locale?: string;
  highlightPlan?: string;
  maxFeatures: number;
  ctaLabel: string;
  onSelectPlan?: (planId: string) => void;
  onContactSales?: (planId: string) => void;
}) {
  // Cap desktop columns so many plans still wrap into balanced rows.
  const cols = Math.min(plans.length, 4);
  return (
    <div className="mk-pt-grid" style={{ ["--mk-pt-cols" as string]: String(cols) } as CSSProperties}>
      {plans.map((plan) => {
        const price = describePlanPrice(plan, locale, cycle);
        const highlighted =
          highlightPlan != null && plan.name.toLowerCase() === highlightPlan.toLowerCase();
        const features = includedFeatures(plan, locale, maxFeatures);
        return (
          <div
            key={plan.id}
            className="mk-pt-card"
            data-mk-plan={plan.name}
            data-mk-highlighted={highlighted ? "true" : undefined}
          >
            {highlighted ? <span className="mk-pt-badge">Most Popular</span> : null}
            <h3 className="mk-pt-name">{plan.name}</h3>
            {plan.description ? <p className="mk-pt-desc">{plan.description}</p> : null}
            <div className="mk-pt-price">
              <span className="mk-pt-amount">{price.contactSales ? "Custom" : price.headline}</span>
              {price.caption ? <span className="mk-pt-caption">{price.caption}</span> : null}
            </div>
            <button
              type="button"
              className={`mk-pt-cta ${highlighted ? "mk-pt-cta--primary" : "mk-pt-cta--ghost"}`}
              onClick={() =>
                price.contactSales ? onContactSales?.(plan.id) : onSelectPlan?.(plan.id)
              }
            >
              {price.contactSales ? "Contact Sales" : ctaLabel}
            </button>
            {features.length > 0 ? (
              <>
                <div className="mk-pt-flabel">What's included:</div>
                <ul className="mk-pt-features">
                  {features.map((f) => (
                    <li key={f.key} className="mk-pt-feature">
                      <CheckCircleIcon className="mk-pt-check" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
