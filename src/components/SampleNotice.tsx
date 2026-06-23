import { type CSSProperties, type ReactNode } from "react";
import { SAMPLE_NOTICE_TEXT } from "../lib/sample-data";

export interface SampleNoticeProps {
  /** Override the default disclaimer copy. */
  children?: ReactNode;
}

const noticeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  border: "1px dashed var(--mk-warning)",
  borderRadius: "var(--mk-radius)",
  background: "color-mix(in srgb, var(--mk-warning) 12%, transparent)",
  color: "var(--mk-card-fg)",
  fontFamily: "var(--mk-font)",
  fontSize: "0.75rem",
  padding: "0.5rem 0.75rem",
};

/**
 * A clearly-styled disclaimer banner shown above illustrative sample content so
 * it is never mistaken for live data.
 */
export function SampleNotice({ children }: SampleNoticeProps) {
  return (
    <div role="note" data-mk-component="sample-notice" style={noticeStyle}>
      <span aria-hidden="true" style={{ color: "var(--mk-warning)", fontWeight: 700 }}>
        ●
      </span>
      <span>{children ?? SAMPLE_NOTICE_TEXT}</span>
    </div>
  );
}
