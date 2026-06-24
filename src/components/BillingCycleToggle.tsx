import { type CSSProperties } from "react";

export interface BillingCycleToggleProps {
  value: "monthly" | "annually";
  onChange: (value: "monthly" | "annually") => void;
  /** When > 0, shows a "Save N%" hint on the Yearly option. */
  savingsPercent?: number;
  monthlyLabel?: string;
  annuallyLabel?: string;
}

const trackStyle: CSSProperties = {
  display: "inline-flex",
  alignSelf: "center",
  gap: "0.125rem",
  padding: "0.25rem",
  borderRadius: "var(--mk-radius)",
  background: "color-mix(in srgb, var(--mk-fg) 6%, transparent)",
  fontFamily: "var(--mk-font)",
};

function optionStyle(active: boolean): CSSProperties {
  return {
    border: "none",
    cursor: "pointer",
    borderRadius: "var(--mk-radius)",
    padding: "0.375rem 0.875rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    background: active ? "var(--mk-card)" : "transparent",
    color: active ? "var(--mk-card-fg)" : "var(--mk-muted)",
    boxShadow: active ? "var(--mk-shadow)" : "none",
  };
}

/** Monthly/Yearly billing switch used above pricing cards. */
export function BillingCycleToggle({
  value,
  onChange,
  savingsPercent = 0,
  monthlyLabel = "Monthly",
  annuallyLabel = "Yearly",
}: BillingCycleToggleProps) {
  return (
    <div style={trackStyle} role="group" aria-label="Billing cycle" data-mk-component="billing-toggle">
      <button
        type="button"
        style={optionStyle(value === "monthly")}
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
      >
        {monthlyLabel}
      </button>
      <button
        type="button"
        style={optionStyle(value === "annually")}
        aria-pressed={value === "annually"}
        onClick={() => onChange("annually")}
      >
        {annuallyLabel}
        {savingsPercent > 0 ? (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--mk-success)",
            }}
          >
            Save {savingsPercent}%
          </span>
        ) : null}
      </button>
    </div>
  );
}
