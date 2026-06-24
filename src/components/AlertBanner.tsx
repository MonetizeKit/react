import { type CSSProperties, type ReactNode } from "react";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";

export type AlertBannerVariant = "info" | "warning" | "danger" | "neutral";

export interface BannerAction {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}

export interface AlertBannerProps {
  variant?: AlertBannerVariant;
  title: string;
  description?: ReactNode;
  /** Optional progress fraction (0–1) rendered as a colored bar. */
  progress?: number;
  actions?: BannerAction[];
  /** Optional leading icon/emoji. */
  icon?: ReactNode;
}

const VARIANT_COLOR: Record<AlertBannerVariant, string> = {
  info: "var(--mk-accent)",
  warning: "var(--mk-warning)",
  danger: "var(--mk-danger)",
  neutral: "var(--mk-muted)",
};

function actionStyle(variant: BannerAction["variant"], accent: string): CSSProperties {
  if (variant === "ghost") {
    return {
      background: "transparent",
      color: "var(--mk-muted)",
      border: "none",
      cursor: "pointer",
      fontSize: "0.8125rem",
      fontWeight: 600,
      padding: "0.375rem 0.5rem",
    };
  }
  return {
    background: accent,
    color: "var(--mk-card)",
    border: "none",
    borderRadius: "var(--mk-radius)",
    cursor: "pointer",
    fontSize: "0.8125rem",
    fontWeight: 600,
    padding: "0.375rem 0.75rem",
  };
}

/**
 * A flexible in-app notification banner (usage warnings, budget reached, low
 * credits, trial ending, …). Presentational + fully themeable via tokens.
 */
export function AlertBanner({
  variant = "info",
  title,
  description,
  progress,
  actions = [],
  icon,
}: AlertBannerProps) {
  const { tokens } = useMonetizeKit();
  const accent = VARIANT_COLOR[variant];

  return (
    <div
      role="status"
      data-mk-component="alert-banner"
      data-mk-variant={variant}
      style={{
        ...tokensToStyle(tokens),
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
        border: `1px solid color-mix(in srgb, ${accent} 35%, var(--mk-border))`,
        background: `color-mix(in srgb, ${accent} 8%, var(--mk-card))`,
        color: "var(--mk-card-fg)",
        borderRadius: "var(--mk-radius)",
        padding: "0.875rem 1rem",
        fontFamily: "var(--mk-font)",
      }}
    >
      {icon ? <span aria-hidden="true" style={{ color: accent, fontSize: "1.1rem", lineHeight: 1 }}>{icon}</span> : null}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{title}</div>
        {description ? (
          <div style={{ fontSize: "0.8125rem", color: "var(--mk-muted)" }}>{description}</div>
        ) : null}
        {typeof progress === "number" ? (
          <div
            style={{ height: 6, borderRadius: 999, background: "var(--mk-border)", overflow: "hidden" }}
            role="progressbar"
            aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%`, height: "100%", background: accent }} />
          </div>
        ) : null}
        {actions.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                style={actionStyle(action.variant, accent)}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
