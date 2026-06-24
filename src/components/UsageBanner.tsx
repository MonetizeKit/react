import { type CSSProperties } from "react";
import { useUsage } from "../hooks";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { formatUnits } from "../lib/format";

export interface UsageBannerProps {
  /** Meter to display usage for. */
  meterId: string;
  label?: string;
  locale?: string;
  /** Fraction (0-1) at which the banner switches to a warning style. */
  warnAt?: number;
}

const bannerStyle: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "0.875rem 1rem",
  background: "var(--mk-bg)",
  color: "var(--mk-fg)",
  fontFamily: "var(--mk-font)",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

/** Show current usage vs allotment for a capacity meter, with overage hint. */
export function UsageBanner({
  meterId,
  label = "Usage",
  locale: localeProp,
  warnAt = 0.8,
}: UsageBannerProps) {
  const { current, limit, loading } = useUsage(meterId);
  const { tokens, locale: ctxLocale } = useMonetizeKit();
  const locale = localeProp ?? ctxLocale;

  if (loading) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Loading usage…</div>;
  }

  const hasLimit = typeof limit === "number" && limit > 0;
  const fraction = hasLimit ? Math.min(1, current / (limit as number)) : 0;
  const over = hasLimit && current > (limit as number);
  const warn = hasLimit && fraction >= warnAt;
  const barColor = over ? "var(--mk-danger)" : warn ? "var(--mk-warning)" : "var(--mk-accent)";

  return (
    <div style={{ ...tokensToStyle(tokens), ...bannerStyle }} data-mk-component="usage-banner">
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "var(--mk-muted)" }}>
          {formatUnits(current, locale)}
          {hasLimit ? ` / ${formatUnits(limit as number, locale)}` : ""}
        </span>
      </div>
      {hasLimit ? (
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "var(--mk-border)",
            overflow: "hidden",
          }}
          role="progressbar"
          aria-valuenow={Math.round(fraction * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${fraction * 100}%`, height: "100%", background: barColor }} />
        </div>
      ) : null}
      {over ? (
        <span style={{ color: "var(--mk-danger)", fontSize: "0.75rem" }}>
          Over included allotment — overage billed per usage pricing.
        </span>
      ) : null}
    </div>
  );
}
