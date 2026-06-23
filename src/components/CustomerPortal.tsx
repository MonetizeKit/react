import { type CSSProperties, type ReactNode } from "react";
import { useCredits } from "../hooks";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { formatMoney, formatUnits } from "../lib/format";
import { UsageBanner } from "./UsageBanner";
import { SampleNotice } from "./SampleNotice";
import { SAMPLE_CREDITS, SAMPLE_PORTAL, SAMPLE_USAGE } from "../lib/sample-data";

export interface CustomerPortalProps {
  /** Current plan name to display. */
  planName?: string;
  /** Meters to surface usage for. */
  meterIds?: string[];
  /** Whether to show the credit balance card. */
  showCredits?: boolean;
  /**
   * Render illustrative sample plan/usage/credit data behind a clear disclaimer.
   * Use for previews or a fresh workspace with no plans/products defined yet.
   */
  sample?: boolean;
  /** Override the sample-data disclaimer copy. */
  disclaimer?: ReactNode;
  /** Show the "Powered by MonetizeKit" footer. */
  showBranding?: boolean;
  locale?: string;
  currency?: string;
  onManageBilling?: () => void;
}

const containerStyle: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "1.25rem",
  background: "var(--mk-card)",
  color: "var(--mk-card-fg)",
  boxShadow: "var(--mk-shadow)",
  fontFamily: "var(--mk-font)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 480,
};

const cardStyle: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "0.875rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

/** A static usage row for sample mode (no live `useUsage` fetch). */
function SampleUsageRow({
  label,
  current,
  limit,
  locale,
}: {
  label: string;
  current: number;
  limit: number | null;
  locale?: string;
}) {
  const hasLimit = typeof limit === "number" && limit > 0;
  const fraction = hasLimit ? Math.min(1, current / (limit as number)) : 0;
  const barColor = fraction >= 0.8 ? "var(--mk-warning)" : "var(--mk-accent)";
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "var(--mk-muted)" }}>
          {formatUnits(current, locale)}
          {hasLimit ? ` / ${formatUnits(limit as number, locale)}` : ""}
        </span>
      </div>
      {hasLimit ? (
        <div style={{ height: 6, borderRadius: 999, background: "var(--mk-border)", overflow: "hidden" }}>
          <div style={{ width: `${fraction * 100}%`, height: "100%", background: barColor }} />
        </div>
      ) : null}
    </div>
  );
}

/** A self-service portal: current plan, usage meters, and credit balance. */
export function CustomerPortal({
  planName,
  meterIds,
  showCredits = true,
  sample = false,
  disclaimer,
  showBranding = false,
  locale,
  currency = "USD",
  onManageBilling,
}: CustomerPortalProps) {
  const { tokens } = useMonetizeKit();
  const credits = useCredits();

  const resolvedPlanName = planName ?? (sample ? SAMPLE_PORTAL.planName : "Current plan");
  const resolvedMeterIds = meterIds ?? (sample ? [...SAMPLE_PORTAL.meterIds] : []);
  const creditBalance = sample ? SAMPLE_CREDITS.balance : credits.balance;
  const creditCurrency = sample ? SAMPLE_CREDITS.currency : credits.currency;
  const creditLoading = sample ? false : credits.loading;

  return (
    <div
      style={{ ...tokensToStyle(tokens), ...containerStyle }}
      data-mk-component="customer-portal"
      data-mk-sample={sample ? "true" : undefined}
    >
      {sample ? <SampleNotice>{disclaimer}</SampleNotice> : null}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)" }}>Plan</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
            <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>{resolvedPlanName}</span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--mk-success)",
                border: "1px solid var(--mk-success)",
                borderRadius: 999,
                padding: "0.0625rem 0.5rem",
              }}
            >
              Active
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onManageBilling}
          style={{
            background: "var(--mk-primary)",
            color: "var(--mk-primary-fg)",
            border: "none",
            borderRadius: "var(--mk-radius)",
            padding: "0.5rem 0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Manage billing
        </button>
      </div>

      {sample
        ? resolvedMeterIds.map((meterId) => {
            const usage = SAMPLE_USAGE[meterId];
            if (!usage) return null;
            return (
              <SampleUsageRow
                key={meterId}
                label={meterId}
                current={usage.current}
                limit={usage.limit}
                locale={locale}
              />
            );
          })
        : resolvedMeterIds.map((meterId) => (
            <UsageBanner key={meterId} meterId={meterId} label={meterId} locale={locale} />
          ))}

      {showCredits ? (
        <div style={{ ...cardStyle, flexDirection: "row", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Credits</span>
          <span style={{ color: "var(--mk-muted)" }}>
            {creditLoading ? "…" : formatMoney(creditBalance, creditCurrency ?? currency, locale)}
          </span>
        </div>
      ) : null}

      {showBranding ? (
        <div style={{ textAlign: "center", fontSize: "0.625rem", color: "var(--mk-muted)" }}>
          Powered by MonetizeKit
        </div>
      ) : null}
    </div>
  );
}
