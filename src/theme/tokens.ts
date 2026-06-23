/**
 * Appearance/theme token contract for MonetizeKit components. Components consume
 * CSS custom properties derived from these tokens, so a host app can pass a
 * preset name, a partial token override, or both.
 *
 * Presets:
 *  - `light` / `dark`   — neutral defaults
 *  - `memphis`          — the marketing site identity (coral/yellow/cyan, hard edges + hard shadow)
 *  - `dashboard`        — the app's neutral palette (rounded, muted)
 *  - `console`          — the dashboard "widgets" mock look: dark cards, emerald/amber/red
 *                         semantics, soft elevation. Lets you reproduce the in-app preview style.
 *  - `midnight`         — deep slate/indigo dark
 *  - `ocean` / `forest` / `sunset` / `grape` — light brand palettes for variety
 */
import type { CSSProperties } from "react";

export interface ThemeTokens {
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  colorPrimary: string;
  colorPrimaryForeground: string;
  colorAccent: string;
  colorBorder: string;
  /** Surface color for cards/panels layered on the background. */
  colorCard: string;
  /** Foreground used on top of `colorCard`. */
  colorCardForeground: string;
  /** Semantic colors for status (healthy / approaching limit / over limit). */
  colorSuccess: string;
  colorWarning: string;
  colorDanger: string;
  radius: string;
  /** Box-shadow applied to elevated surfaces (cards/portals). */
  shadow: string;
  fontFamily: string;
}

export type ThemePresetName =
  | "light"
  | "dark"
  | "memphis"
  | "dashboard"
  | "console"
  | "midnight"
  | "ocean"
  | "forest"
  | "sunset"
  | "grape";

export const THEME_PRESETS: Record<ThemePresetName, ThemeTokens> = {
  light: {
    colorBackground: "#ffffff",
    colorForeground: "#0a0a0a",
    colorMuted: "#71717a",
    colorPrimary: "#4f46e5",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#10b981",
    colorBorder: "#e4e4e7",
    colorCard: "#ffffff",
    colorCardForeground: "#0a0a0a",
    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorDanger: "#dc2626",
    radius: "0.5rem",
    shadow: "0 1px 3px rgba(0,0,0,0.1)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  dark: {
    colorBackground: "#0a0a0a",
    colorForeground: "#fafafa",
    colorMuted: "#a1a1aa",
    colorPrimary: "#6366f1",
    colorPrimaryForeground: "#0a0a0a",
    colorAccent: "#10b981",
    colorBorder: "#27272a",
    colorCard: "#18181b",
    colorCardForeground: "#fafafa",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorDanger: "#ef4444",
    radius: "0.5rem",
    shadow: "0 1px 3px rgba(0,0,0,0.4)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  memphis: {
    colorBackground: "#FFFEF2",
    colorForeground: "#1a1a1a",
    colorMuted: "#5b5b52",
    colorPrimary: "#FF6B35",
    colorPrimaryForeground: "#1a1a1a",
    colorAccent: "#00D9FF",
    colorBorder: "#1a1a1a",
    colorCard: "#ffffff",
    colorCardForeground: "#1a1a1a",
    colorSuccess: "#00C853",
    colorWarning: "#FFB400",
    colorDanger: "#FF3B30",
    radius: "0",
    shadow: "4px 4px 0 #1a1a1a",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  dashboard: {
    colorBackground: "oklch(1 0 0)",
    colorForeground: "oklch(0.145 0 0)",
    colorMuted: "oklch(0.556 0 0)",
    colorPrimary: "oklch(0.205 0 0)",
    colorPrimaryForeground: "oklch(0.985 0 0)",
    colorAccent: "oklch(0.97 0 0)",
    colorBorder: "oklch(0.922 0 0)",
    colorCard: "oklch(1 0 0)",
    colorCardForeground: "oklch(0.145 0 0)",
    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorDanger: "#dc2626",
    radius: "0.625rem",
    shadow: "0 1px 2px rgba(0,0,0,0.06)",
    fontFamily: "Geist, system-ui, sans-serif",
  },
  console: {
    colorBackground: "#0b0f14",
    colorForeground: "#e6edf3",
    colorMuted: "#8b949e",
    colorPrimary: "#6366f1",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#00D9FF",
    colorBorder: "#1f2630",
    colorCard: "#11161d",
    colorCardForeground: "#e6edf3",
    colorSuccess: "#34d399",
    colorWarning: "#fbbf24",
    colorDanger: "#f87171",
    radius: "0.625rem",
    shadow: "0 8px 24px rgba(0,0,0,0.5)",
    fontFamily: "Geist, system-ui, sans-serif",
  },
  midnight: {
    colorBackground: "#0f172a",
    colorForeground: "#e2e8f0",
    colorMuted: "#94a3b8",
    colorPrimary: "#818cf8",
    colorPrimaryForeground: "#0f172a",
    colorAccent: "#38bdf8",
    colorBorder: "#1e293b",
    colorCard: "#1e293b",
    colorCardForeground: "#e2e8f0",
    colorSuccess: "#4ade80",
    colorWarning: "#facc15",
    colorDanger: "#fb7185",
    radius: "0.75rem",
    shadow: "0 10px 30px rgba(2,6,23,0.6)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  ocean: {
    colorBackground: "#f0fdfa",
    colorForeground: "#0f3d3e",
    colorMuted: "#5b7c7d",
    colorPrimary: "#0d9488",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#06b6d4",
    colorBorder: "#99f6e4",
    colorCard: "#ffffff",
    colorCardForeground: "#0f3d3e",
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorDanger: "#e11d48",
    radius: "0.75rem",
    shadow: "0 4px 14px rgba(13,148,136,0.15)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  forest: {
    colorBackground: "#f7fee7",
    colorForeground: "#1a2e05",
    colorMuted: "#5c6b47",
    colorPrimary: "#4d7c0f",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#65a30d",
    colorBorder: "#d9f99d",
    colorCard: "#ffffff",
    colorCardForeground: "#1a2e05",
    colorSuccess: "#16a34a",
    colorWarning: "#ca8a04",
    colorDanger: "#dc2626",
    radius: "0.5rem",
    shadow: "0 4px 14px rgba(77,124,15,0.12)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  sunset: {
    colorBackground: "#fff7ed",
    colorForeground: "#431407",
    colorMuted: "#9a6b4f",
    colorPrimary: "#ea580c",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#f43f5e",
    colorBorder: "#fed7aa",
    colorCard: "#ffffff",
    colorCardForeground: "#431407",
    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorDanger: "#e11d48",
    radius: "1rem",
    shadow: "0 6px 20px rgba(234,88,12,0.15)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  grape: {
    colorBackground: "#faf5ff",
    colorForeground: "#2e1065",
    colorMuted: "#7c6f93",
    colorPrimary: "#7c3aed",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#d946ef",
    colorBorder: "#e9d5ff",
    colorCard: "#ffffff",
    colorCardForeground: "#2e1065",
    colorSuccess: "#16a34a",
    colorWarning: "#d97706",
    colorDanger: "#dc2626",
    radius: "0.875rem",
    shadow: "0 6px 20px rgba(124,58,237,0.15)",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
};

/** All preset names, useful for theme pickers / story matrices. */
export const THEME_PRESET_NAMES = Object.keys(THEME_PRESETS) as ThemePresetName[];

export type Appearance =
  | ThemePresetName
  | { preset?: ThemePresetName; tokens?: Partial<ThemeTokens> };

/** Resolve an appearance prop into a concrete token set. */
export function resolveTokens(appearance: Appearance = "light"): ThemeTokens {
  if (typeof appearance === "string") {
    return THEME_PRESETS[appearance];
  }
  const base = THEME_PRESETS[appearance.preset ?? "light"];
  return { ...base, ...appearance.tokens };
}

const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  colorBackground: "--mk-bg",
  colorForeground: "--mk-fg",
  colorMuted: "--mk-muted",
  colorPrimary: "--mk-primary",
  colorPrimaryForeground: "--mk-primary-fg",
  colorAccent: "--mk-accent",
  colorBorder: "--mk-border",
  colorCard: "--mk-card",
  colorCardForeground: "--mk-card-fg",
  colorSuccess: "--mk-success",
  colorWarning: "--mk-warning",
  colorDanger: "--mk-danger",
  radius: "--mk-radius",
  shadow: "--mk-shadow",
  fontFamily: "--mk-font",
};

/** Convert tokens into a CSS custom-property style object for a wrapper element. */
export function tokensToStyle(tokens: ThemeTokens): CSSProperties {
  const style: Record<string, string> = {};
  (Object.keys(tokens) as (keyof ThemeTokens)[]).forEach((key) => {
    style[TOKEN_TO_CSS_VAR[key]] = String(tokens[key]);
  });
  return style as CSSProperties;
}
