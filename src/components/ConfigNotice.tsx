import { type CSSProperties } from "react";
import type { ConfigDiagnostic } from "../lib/config-diagnostics";

export interface ConfigNoticeProps {
  diagnostic: ConfigDiagnostic;
}

/**
 * A clearly-styled developer notice shown when the MonetizeKit SDK is missing
 * (or has a non-production) configuration — e.g. the publishable key env var was
 * never set. Renders inline where a component would have appeared so the gap is
 * obvious during development, with a link back to the docs.
 */
export function ConfigNotice({ diagnostic }: ConfigNoticeProps) {
  if (diagnostic.severity === "none") return null;

  const accent =
    diagnostic.severity === "error" ? "var(--mk-danger)" : "var(--mk-warning)";

  const style: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
    border: `1px solid ${accent}`,
    borderLeft: `4px solid ${accent}`,
    borderRadius: "var(--mk-radius)",
    background: `color-mix(in srgb, ${accent} 10%, transparent)`,
    color: "var(--mk-card-fg)",
    fontFamily: "var(--mk-font)",
    fontSize: "0.8125rem",
    lineHeight: 1.5,
    padding: "0.75rem 1rem",
  };

  return (
    <div
      role={diagnostic.severity === "error" ? "alert" : "note"}
      data-mk-component="config-notice"
      data-mk-config-status={diagnostic.status}
      style={style}
    >
      <strong style={{ color: accent }}>MonetizeKit: {diagnostic.title}</strong>
      <span>{diagnostic.detail}</span>
      <a
        href={diagnostic.docsUrl}
        target="_blank"
        rel="noreferrer"
        style={{ color: "var(--mk-primary)", fontWeight: 600 }}
      >
        View setup docs →
      </a>
    </div>
  );
}
