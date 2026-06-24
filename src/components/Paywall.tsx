import { type CSSProperties, type ReactNode } from "react";
import { useEntitlement } from "../hooks";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";

export interface PaywallProps {
  /** Feature key gating the content. */
  feature: string;
  /** Protected content, shown when entitled. */
  children: ReactNode;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onUpgrade?: () => void;
  /** Always render the locked upgrade prompt (for previews, no live customer). */
  sample?: boolean;
}

const overlayStyle: CSSProperties = {
  border: "1px solid var(--mk-border)",
  borderRadius: "var(--mk-radius)",
  padding: "2rem",
  textAlign: "center",
  background: "var(--mk-bg)",
  color: "var(--mk-fg)",
  fontFamily: "var(--mk-font)",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  alignItems: "center",
};

/** Gate content behind an entitlement, showing an upgrade prompt when locked. */
export function Paywall({
  feature,
  children,
  title = "Upgrade to unlock this feature",
  description = "This feature isn't included in your current plan.",
  ctaLabel = "Upgrade",
  onUpgrade,
  sample = false,
}: PaywallProps) {
  const { allowed, loading } = useEntitlement(feature);
  const { tokens } = useMonetizeKit();

  if (!sample && loading) {
    return <div aria-busy="true" style={{ color: "var(--mk-muted)" }}>Checking access…</div>;
  }
  if (!sample && allowed) {
    return <>{children}</>;
  }

  return (
    <div style={{ ...tokensToStyle(tokens), ...overlayStyle }} data-mk-component="paywall">
      <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--mk-muted)", fontSize: "0.875rem" }}>{description}</p>
      <button
        type="button"
        onClick={onUpgrade}
        style={{
          background: "var(--mk-primary)",
          color: "var(--mk-primary-fg)",
          border: "none",
          borderRadius: "var(--mk-radius)",
          padding: "0.625rem 1.25rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
