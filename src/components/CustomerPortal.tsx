import { useState, type CSSProperties, type ReactNode } from "react";
import { useCredits } from "../hooks";
import { useMonetizeKit } from "../provider";
import { tokensToStyle } from "../theme/tokens";
import { formatMoney, formatUnits } from "../lib/format";
import { UsageBanner } from "./UsageBanner";
import { SampleNotice } from "./SampleNotice";
import {
  SAMPLE_CREDITS,
  SAMPLE_INVOICES,
  SAMPLE_PORTAL,
  SAMPLE_TEAM,
  SAMPLE_USAGE,
} from "../lib/sample-data";
import type { Invoice, TeamMember } from "../types";

type Interval = "monthly" | "annually" | "one_time";

export interface CustomerPortalProps {
  /** Current plan name to display. */
  planName?: string;
  /** Recurring price shown in the plan header (e.g. { amount: 499, interval: "monthly" }). */
  price?: { amount: number; interval?: Interval };
  /** Meters to surface usage for. */
  meterIds?: string[];
  /** Whether to show the credit balance card. */
  showCredits?: boolean;
  /** Show a team/seats section. Defaults to on in `sample` mode. */
  showTeam?: boolean;
  teamMembers?: TeamMember[];
  seats?: { used: number; max: number };
  /** Show a billing-history (invoices) section. Defaults to on in `sample` mode. */
  showInvoices?: boolean;
  invoices?: Invoice[];
  /** Upcoming invoice summary. */
  nextInvoice?: { date: string; amount: number; currency?: string };
  /** Render the sections as a tab bar (Plan/Usage/Credits/Team/Invoices) instead of stacked. */
  tabbed?: boolean;
  /** Self-serve actions in the Plan section. */
  allowUpgrade?: boolean;
  allowCancel?: boolean;
  onUpgrade?: () => void;
  onCancel?: () => void;
  onViewInvoices?: () => void;
  /**
   * Render illustrative sample plan/usage/credit/team/invoice data behind a clear
   * disclaimer. Use for previews or a fresh workspace with no plans/products yet.
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

const INTERVAL_SUFFIX: Record<Interval, string> = { monthly: "/mo", annually: "/yr", one_time: "" };

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

const ROW_DIVIDER: CSSProperties = { borderTop: "1px solid var(--mk-border)" };

const INVOICE_STATUS_COLOR: Record<Invoice["status"], string> = {
  paid: "var(--mk-success)",
  pending: "var(--mk-warning)",
  overdue: "var(--mk-danger)",
};

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "capitalize",
        color,
        border: `1px solid ${color}`,
        borderRadius: 999,
        padding: "0.0625rem 0.5rem",
      }}
    >
      {label}
    </span>
  );
}

function actionButton(variant: "primary" | "outline" | "ghost"): CSSProperties {
  const base: CSSProperties = {
    borderRadius: "var(--mk-radius)",
    padding: "0.5rem 0.875rem",
    fontWeight: 600,
    fontSize: "0.8125rem",
    cursor: "pointer",
  };
  if (variant === "primary") return { ...base, background: "var(--mk-primary)", color: "var(--mk-primary-fg)", border: "none" };
  if (variant === "outline") return { ...base, background: "transparent", color: "var(--mk-card-fg)", border: "1px solid var(--mk-border)" };
  return { ...base, background: "transparent", color: "var(--mk-muted)", border: "none" };
}

/** A static usage row (sample mode / no live `useUsage` fetch). */
function SampleUsageRow({ label, current, limit, locale }: { label: string; current: number; limit: number | null; locale?: string }) {
  const hasLimit = typeof limit === "number" && limit > 0;
  const fraction = hasLimit ? Math.min(1, current / (limit as number)) : 0;
  const barColor = fraction >= 0.9 ? "var(--mk-danger)" : fraction >= 0.7 ? "var(--mk-warning)" : "var(--mk-accent)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
        <span style={{ color: "var(--mk-muted)" }}>{label}</span>
        <span style={{ fontWeight: 500 }}>
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

type SectionId = "plan" | "usage" | "credits" | "team" | "invoices";

/** A self-service portal: plan, usage, credits, team, and invoices. */
export function CustomerPortal({
  planName,
  price,
  meterIds,
  showCredits = true,
  showTeam,
  teamMembers,
  seats,
  showInvoices,
  invoices,
  nextInvoice,
  tabbed = false,
  allowUpgrade = false,
  allowCancel = false,
  onUpgrade,
  onCancel,
  onViewInvoices,
  sample = false,
  disclaimer,
  showBranding = false,
  locale: localeProp,
  currency: currencyProp,
  onManageBilling,
}: CustomerPortalProps) {
  const { tokens, locale: ctxLocale, currency: ctxCurrency } = useMonetizeKit();
  const locale = localeProp ?? ctxLocale;
  const currency = currencyProp ?? ctxCurrency;
  const credits = useCredits();

  const resolvedPlanName = planName ?? (sample ? SAMPLE_PORTAL.planName : "Current plan");
  const resolvedPrice = price ?? (sample ? SAMPLE_PORTAL.price : undefined);
  const resolvedMeterIds = meterIds ?? (sample ? [...SAMPLE_PORTAL.meterIds] : []);
  const resolvedNextInvoice = nextInvoice ?? (sample ? SAMPLE_PORTAL.nextInvoice : undefined);
  const creditBalance = sample ? SAMPLE_CREDITS.balance : credits.balance;
  const creditCurrency = sample ? SAMPLE_CREDITS.currency : credits.currency;
  const creditLoading = sample ? false : credits.loading;

  const teamEnabled = showTeam ?? sample;
  const resolvedTeam = teamMembers ?? (sample ? SAMPLE_TEAM.members : []);
  const resolvedSeats = seats ?? (sample ? { used: SAMPLE_TEAM.seats, max: SAMPLE_TEAM.maxSeats } : undefined);
  const invoicesEnabled = showInvoices ?? sample;
  const resolvedInvoices = invoices ?? (sample ? SAMPLE_INVOICES : []);
  const upgradeEnabled = allowUpgrade || sample;

  const planSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)" }}>Current plan</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>{resolvedPlanName}</span>
            <StatusBadge label="Active" color="var(--mk-success)" />
          </div>
        </div>
        {resolvedPrice ? (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)" }}>Billing</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {formatMoney(resolvedPrice.amount, currency, locale)}
              <span style={{ fontSize: "0.75rem", color: "var(--mk-muted)", fontWeight: 400 }}>
                {INTERVAL_SUFFIX[resolvedPrice.interval ?? "monthly"]}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {invoicesEnabled ? (
          <button type="button" style={actionButton("outline")} onClick={onViewInvoices}>
            View invoices
          </button>
        ) : null}
        {upgradeEnabled ? (
          <button type="button" style={actionButton("primary")} onClick={onUpgrade}>
            Upgrade plan
          </button>
        ) : null}
        <button type="button" style={actionButton("outline")} onClick={onManageBilling}>
          Manage billing
        </button>
      </div>

      {allowCancel ? (
        <button type="button" style={{ ...actionButton("ghost"), alignSelf: "flex-start" }} onClick={onCancel}>
          Cancel subscription
        </button>
      ) : null}

      {resolvedNextInvoice ? (
        <div style={{ ...cardStyle, flexDirection: "row", justifyContent: "space-between", alignItems: "center", background: "color-mix(in srgb, var(--mk-fg) 4%, transparent)" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--mk-muted)" }}>Next invoice</div>
            <div style={{ fontWeight: 500 }}>{new Date(resolvedNextInvoice.date).toLocaleDateString(locale)}</div>
          </div>
          <span style={{ fontWeight: 700 }}>
            {formatMoney(resolvedNextInvoice.amount, resolvedNextInvoice.currency ?? currency, locale)}
          </span>
        </div>
      ) : null}
    </div>
  );

  const usageSection = resolvedMeterIds.length > 0 ? (
    <div style={cardStyle}>
      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Usage this period</span>
      {sample
        ? resolvedMeterIds.map((meterId) => {
            const usage = SAMPLE_USAGE[meterId];
            if (!usage) return null;
            return <SampleUsageRow key={meterId} label={meterId} current={usage.current} limit={usage.limit} locale={locale} />;
          })
        : resolvedMeterIds.map((meterId) => <UsageBanner key={meterId} meterId={meterId} label={meterId} locale={locale} />)}
    </div>
  ) : null;

  const creditsSection = showCredits ? (
    <div style={{ ...cardStyle, flexDirection: "row", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Credits</span>
      <span style={{ color: "var(--mk-muted)" }}>
        {creditLoading ? "…" : formatMoney(creditBalance, creditCurrency ?? currency, locale)}
      </span>
    </div>
  ) : null;

  const teamSection = teamEnabled ? (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Team</span>
        {resolvedSeats ? (
          <span style={{ color: "var(--mk-muted)", fontSize: "0.75rem" }}>
            {resolvedSeats.used}/{resolvedSeats.max >= 9999 ? "Unlimited" : resolvedSeats.max} seats
          </span>
        ) : null}
      </div>
      {resolvedTeam.length === 0 ? (
        <span style={{ color: "var(--mk-muted)", fontSize: "0.8125rem" }}>No team members.</span>
      ) : (
        resolvedTeam.map((member, i) => (
          <div
            key={member.email}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", fontSize: "0.8125rem", paddingTop: i === 0 ? 0 : "0.5rem", ...(i === 0 ? {} : ROW_DIVIDER) }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{member.name}</div>
              <div style={{ color: "var(--mk-muted)", fontSize: "0.75rem" }}>{member.email}</div>
            </div>
            <StatusBadge label={member.role} color="var(--mk-muted)" />
          </div>
        ))
      )}
    </div>
  ) : null;

  const invoicesSection = invoicesEnabled ? (
    <div style={cardStyle}>
      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Invoices</span>
      {resolvedInvoices.length === 0 ? (
        <span style={{ color: "var(--mk-muted)", fontSize: "0.8125rem" }}>No invoices yet.</span>
      ) : (
        resolvedInvoices.map((invoice, i) => (
          <div
            key={invoice.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", fontSize: "0.8125rem", paddingTop: i === 0 ? 0 : "0.5rem", ...(i === 0 ? {} : ROW_DIVIDER) }}
          >
            <span style={{ fontWeight: 500 }}>{new Date(invoice.date).toLocaleDateString(locale)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 600 }}>{formatMoney(invoice.amount, invoice.currency, locale)}</span>
              <StatusBadge label={invoice.status} color={INVOICE_STATUS_COLOR[invoice.status]} />
            </div>
          </div>
        ))
      )}
    </div>
  ) : null;

  const sections: { id: SectionId; label: string; node: ReactNode }[] = [
    { id: "plan", label: "Plan", node: planSection },
    ...(usageSection ? [{ id: "usage" as const, label: "Usage", node: usageSection }] : []),
    ...(creditsSection ? [{ id: "credits" as const, label: "Credits", node: creditsSection }] : []),
    ...(teamSection ? [{ id: "team" as const, label: "Team", node: teamSection }] : []),
    ...(invoicesSection ? [{ id: "invoices" as const, label: "Invoices", node: invoicesSection }] : []),
  ];

  const [activeTab, setActiveTab] = useState<SectionId>("plan");
  const active = sections.find((s) => s.id === activeTab) ?? sections[0]!;

  return (
    <div style={{ ...tokensToStyle(tokens), ...containerStyle }} data-mk-component="customer-portal" data-mk-sample={sample ? "true" : undefined}>
      {sample ? <SampleNotice>{disclaimer}</SampleNotice> : null}

      {tabbed ? (
        <>
          <div style={{ display: "flex", gap: "0.125rem", padding: "0.25rem", borderRadius: "var(--mk-radius)", background: "color-mix(in srgb, var(--mk-fg) 6%, transparent)", overflowX: "auto" }} role="tablist">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === active.id}
                onClick={() => setActiveTab(s.id)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "var(--mk-radius)",
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  background: s.id === active.id ? "var(--mk-card)" : "transparent",
                  color: s.id === active.id ? "var(--mk-card-fg)" : "var(--mk-muted)",
                  boxShadow: s.id === active.id ? "var(--mk-shadow)" : "none",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div role="tabpanel">{active.node}</div>
        </>
      ) : (
        sections.map((s) => <div key={s.id}>{s.node}</div>)
      )}

      {showBranding ? (
        <div style={{ textAlign: "center", fontSize: "0.625rem", color: "var(--mk-muted)" }}>Powered by MonetizeKit</div>
      ) : null}
    </div>
  );
}
