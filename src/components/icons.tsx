import type { CSSProperties } from "react";

interface IconProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** A filled check inside a circle — used for "included" feature rows. */
export function CheckCircleIcon({ className, style, title }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** A minus/dash inside a circle — used for "not included" feature rows. */
export function MinusCircleIcon({ className, style, title }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
