import { type CSSProperties } from "react";
import { useCredits } from "../hooks";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { formatMoney } from "../lib/format";
import { UsageBanner } from "./UsageBanner";

export interface CustomerPortalProps {
  /** Current plan name to display. */
  planName?: string;
  /** Meters to surface usage for. */
  meterIds?: string[];
  /** Whether to show the credit balance card. */
  showCredits?: boolean;
  locale?: string;
  currency?: string;
  onManageBilling?: () => void;
}

const containerStyle: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "1.25rem",
  background: "var(--mk-bg)",
  color: "var(--mk-fg)",
  fontFamily: "var(--mk-font)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: 480,
};

/** A self-service portal: current plan, usage meters, and credit balance. */
export function CustomerPortal({
  planName = "Current plan",
  meterIds = [],
  showCredits = true,
  locale,
  currency = "USD",
  onManageBilling,
}: CustomerPortalProps) {
  const { tokens } = useMonetizeKit();
  const credits = useCredits();

  return (
    <div style={{ ...tokensToStyle(tokens), ...containerStyle }} data-mk-component="customer-portal">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)" }}>Plan</div>
          <div style={{ fontSize: "1.125rem", fontWeight: 700 }}>{planName}</div>
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
          }}
        >
          Manage billing
        </button>
      </div>

      {meterIds.map((meterId) => (
        <UsageBanner key={meterId} meterId={meterId} label={meterId} locale={locale} />
      ))}

      {showCredits ? (
        <div
          style={{
            border: "1px solid var(--mk-border)",
            borderRadius: "var(--mk-radius)",
            padding: "0.875rem 1rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Credits</span>
          <span style={{ color: "var(--mk-muted)" }}>
            {credits.loading
              ? "…"
              : formatMoney(credits.balance, credits.currency ?? currency, locale)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
