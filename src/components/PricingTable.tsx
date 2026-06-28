import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { usePlans } from "../hooks";
import { tokensToStyle } from "../theme/tokens";
import { describePlanPrice, annualSavingsPercent, type PriceDisplay } from "../lib/format";
import { includedFeatures, type FeatureRow } from "../lib/pricing";
import { SampleNotice } from "./SampleNotice";
import { ConfigNotice } from "./ConfigNotice";
import { BillingCycleToggle } from "./BillingCycleToggle";
import { CheckCircleIcon } from "./icons";
import type { ConfigDiagnostic } from "../lib/config-diagnostics";
import type { Plan } from "../types";

export interface PricingTableClassNames {
  root?: string;
  grid?: string;
  card?: string;
  highlightedCard?: string;
  badge?: string;
  name?: string;
  description?: string;
  price?: string;
  amount?: string;
  caption?: string;
  cta?: string;
  primaryCta?: string;
  ghostCta?: string;
  featureLabel?: string;
  features?: string;
  feature?: string;
  check?: string;
}

export interface PricingPlanCardRenderContext {
  price: PriceDisplay;
  highlighted: boolean;
  features: FeatureRow[];
  cycle: "monthly" | "annually";
  locale?: string;
  ctaLabel: string;
  contactSalesLabel: string;
  selectPlan: () => void;
  contactSales: () => void;
  primaryAction: () => void;
  config: ConfigDiagnostic;
  classNames?: PricingTableClassNames;
}

export interface PricingTableProps {
  /** Plans to render; if omitted, fetched live from the publishable-key API. */
  plans?: Plan[];
  /** Optional pricing presentation template key for live plan fetches. */
  template?: string;
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
  /** Additional class name for the outer wrapper. */
  className?: string;
  /** Slot-level class names appended to the default MonetizeKit classes. */
  classNames?: PricingTableClassNames;
  /** Fully customize each plan card while reusing PricingTable data/context. */
  renderPlanCard?: (plan: Plan, ctx: PricingPlanCardRenderContext) => ReactNode;
  /** Customize the highlighted plan badge. */
  renderBadge?: (plan: Plan, ctx: PricingPlanCardRenderContext) => ReactNode;
}

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

function cx(...classes: Array<string | undefined | false>): string | undefined {
  const value = classes.filter(Boolean).join(" ");
  return value || undefined;
}

export function PricingTable({
  plans: plansProp,
  template: templateKey,
  highlightPlan,
  billingCycle,
  showBillingToggle = false,
  locale,
  onSelectPlan,
  onContactSales,
  ctaLabel,
  maxFeatures = 8,
  sampleWhenEmpty = true,
  disclaimer,
  className,
  classNames,
  renderPlanCard,
  renderBadge,
}: PricingTableProps) {
  const { tokens } = useMonetizeKit();
  const {
    plans,
    template,
    isSample,
    loading,
    error,
    config,
    locale: effectiveLocale,
  } = usePlans({
    plans: plansProp,
    sampleWhenEmpty,
    locale,
    template: templateKey,
  });
  const defaultCycle = billingCycle ?? template?.billing?.defaultCycle ?? "monthly";
  const effectiveCtaLabel = ctaLabel ?? template?.section?.ctaLabel ?? "Get started";
  const contactSalesLabel = template?.section?.contactSalesLabel ?? "Contact Sales";
  const [cycle, setCycle] = useState<"monthly" | "annually">(defaultCycle);

  useEffect(() => {
    setCycle(defaultCycle);
  }, [defaultCycle]);

  // Missing/malformed key (or base URL): show the developer reminder, plus
  // sample plans so the layout is still previewable.
  if (!plansProp && config.severity === "error") {
    return (
      <div
        className={cx("mk-pricing-table", className, classNames?.root)}
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
              plans={plans}
              cycle={cycle}
              locale={effectiveLocale}
              highlightPlan={highlightPlan}
              maxFeatures={maxFeatures}
              ctaLabel={effectiveCtaLabel}
              contactSalesLabel={contactSalesLabel}
              onSelectPlan={onSelectPlan}
              onContactSales={onContactSales}
              renderPlanCard={renderPlanCard}
              renderBadge={renderBadge}
              classNames={classNames}
              config={config}
            />
          </>
        ) : null}
      </div>
    );
  }

  if (error) {
    return <div role="alert" style={{ color: "var(--mk-muted)" }}>Unable to load pricing.</div>;
  }
  if (loading) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Loading pricing…</div>;
  }

  if (plans.length === 0) {
    return <div style={{ color: "var(--mk-muted)" }}>No plans available.</div>;
  }

  return (
    <div
      className={cx("mk-pricing-table", className, classNames?.root)}
      style={{ ...tokensToStyle(tokens), ...wrapperStyle }}
      data-mk-component="pricing-table"
      data-mk-template={template?.key}
      data-mk-sample={isSample ? "true" : undefined}
    >
      <PricingTableStyles />
      {config.severity === "warning" ? <ConfigNotice diagnostic={config} /> : null}
      {isSample ? <SampleNotice>{disclaimer}</SampleNotice> : null}
      {showBillingToggle || template?.billing?.showToggle ? (
        <BillingCycleToggle
          value={cycle}
          onChange={setCycle}
          savingsPercent={Math.max(0, ...plans.map((p) => annualSavingsPercent(p) ?? 0))}
        />
      ) : null}
      <PricingGrid
        plans={plans}
        cycle={cycle}
        locale={effectiveLocale}
        highlightPlan={highlightPlan}
        maxFeatures={maxFeatures}
        ctaLabel={effectiveCtaLabel}
        contactSalesLabel={contactSalesLabel}
        onSelectPlan={onSelectPlan}
        onContactSales={onContactSales}
        renderPlanCard={renderPlanCard}
        renderBadge={renderBadge}
        classNames={classNames}
        config={config}
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
  contactSalesLabel,
  onSelectPlan,
  onContactSales,
  renderPlanCard,
  renderBadge,
  classNames,
  config,
}: {
  plans: Plan[];
  cycle: "monthly" | "annually";
  locale?: string;
  highlightPlan?: string;
  maxFeatures: number;
  ctaLabel: string;
  contactSalesLabel: string;
  onSelectPlan?: (planId: string) => void;
  onContactSales?: (planId: string) => void;
  renderPlanCard?: (plan: Plan, ctx: PricingPlanCardRenderContext) => ReactNode;
  renderBadge?: (plan: Plan, ctx: PricingPlanCardRenderContext) => ReactNode;
  classNames?: PricingTableClassNames;
  config: ConfigDiagnostic;
}) {
  // Cap desktop columns so many plans still wrap into balanced rows.
  const cols = Math.min(plans.length, 4);
  return (
    <div
      className={cx("mk-pt-grid", classNames?.grid)}
      style={{ ["--mk-pt-cols" as string]: String(cols) } as CSSProperties}
    >
      {plans.map((plan) => {
        const price = describePlanPrice(plan, locale, cycle);
        const highlighted =
          highlightPlan != null && plan.name.toLowerCase() === highlightPlan.toLowerCase();
        const features = includedFeatures(plan, locale, maxFeatures);
        const selectPlan = () => onSelectPlan?.(plan.id);
        const contactSales = () => onContactSales?.(plan.id);
        const ctx: PricingPlanCardRenderContext = {
          price,
          highlighted,
          features,
          cycle,
          locale,
          ctaLabel,
          contactSalesLabel,
          selectPlan,
          contactSales,
          primaryAction: price.contactSales ? contactSales : selectPlan,
          config,
          classNames,
        };
        if (renderPlanCard) {
          return <div key={plan.id}>{renderPlanCard(plan, ctx)}</div>;
        }
        return (
          <div
            key={plan.id}
            className={cx("mk-pt-card", classNames?.card, highlighted && classNames?.highlightedCard)}
            data-mk-plan={plan.name}
            data-mk-highlighted={highlighted ? "true" : undefined}
          >
            {highlighted ? (
              renderBadge ? (
                renderBadge(plan, ctx)
              ) : (
                <span className={cx("mk-pt-badge", classNames?.badge)}>Most Popular</span>
              )
            ) : null}
            <h3 className={cx("mk-pt-name", classNames?.name)}>{plan.name}</h3>
            {plan.description ? (
              <p className={cx("mk-pt-desc", classNames?.description)}>{plan.description}</p>
            ) : null}
            <div className={cx("mk-pt-price", classNames?.price)}>
              <span className={cx("mk-pt-amount", classNames?.amount)}>
                {price.contactSales ? "Custom" : price.headline}
              </span>
              {price.caption ? (
                <span className={cx("mk-pt-caption", classNames?.caption)}>{price.caption}</span>
              ) : null}
            </div>
            <button
              type="button"
              className={cx(
                "mk-pt-cta",
                highlighted ? "mk-pt-cta--primary" : "mk-pt-cta--ghost",
                classNames?.cta,
                highlighted ? classNames?.primaryCta : classNames?.ghostCta,
              )}
              onClick={ctx.primaryAction}
            >
              {price.contactSales ? contactSalesLabel : ctaLabel}
            </button>
            {features.length > 0 ? (
              <>
                <div className={cx("mk-pt-flabel", classNames?.featureLabel)}>What's included:</div>
                <ul className={cx("mk-pt-features", classNames?.features)}>
                  {features.map((f) => (
                    <li key={f.key} className={cx("mk-pt-feature", classNames?.feature)}>
                      <CheckCircleIcon className={cx("mk-pt-check", classNames?.check)} />
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
