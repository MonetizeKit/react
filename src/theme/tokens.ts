/**
 * Appearance/theme token contract for MonetizeKit components. Components consume
 * CSS custom properties derived from these tokens, so a host app can pass a
 * preset name, a partial token override, or both.
 *
 * Presets:
 *  - `memphis`   — the marketing site identity (coral/yellow/cyan, sharp corners)
 *  - `dashboard` — the app's neutral palette (rounded, muted)
 *  - `light` / `dark` — neutral defaults
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
  radius: string;
  fontFamily: string;
}

export type ThemePresetName = "light" | "dark" | "memphis" | "dashboard";

export const THEME_PRESETS: Record<ThemePresetName, ThemeTokens> = {
  light: {
    colorBackground: "#ffffff",
    colorForeground: "#0a0a0a",
    colorMuted: "#71717a",
    colorPrimary: "#4f46e5",
    colorPrimaryForeground: "#ffffff",
    colorAccent: "#10b981",
    colorBorder: "#e4e4e7",
    radius: "0.5rem",
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
    radius: "0.5rem",
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
    radius: "0",
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
    radius: "0.625rem",
    fontFamily: "Geist, system-ui, sans-serif",
  },
};

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
  radius: "--mk-radius",
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

