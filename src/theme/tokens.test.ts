import { describe, expect, it } from "vitest";
import {
  resolveTokens,
  tokensToStyle,
  THEME_PRESETS,
  THEME_PRESET_NAMES,
  type ThemeTokens,
} from "./tokens";

describe("resolveTokens", () => {
  it("returns a preset by name", () => {
    expect(resolveTokens("memphis").colorPrimary).toBe("#FF6B35");
    expect(resolveTokens("dashboard").radius).toBe("0.625rem");
  });

  it("merges token overrides onto a preset", () => {
    const t = resolveTokens({ preset: "memphis", tokens: { colorPrimary: "#000000" } });
    expect(t.colorPrimary).toBe("#000000");
    expect(t.colorAccent).toBe(THEME_PRESETS.memphis.colorAccent);
  });
});

describe("tokensToStyle", () => {
  it("emits mk-prefixed CSS custom properties", () => {
    const style = tokensToStyle(resolveTokens("light")) as Record<string, string>;
    expect(style["--mk-primary"]).toBe(THEME_PRESETS.light.colorPrimary);
    expect(style["--mk-radius"]).toBe(THEME_PRESETS.light.radius);
  });

  it("emits the new card + semantic custom properties", () => {
    const style = tokensToStyle(resolveTokens("console")) as Record<string, string>;
    expect(style["--mk-card"]).toBe(THEME_PRESETS.console.colorCard);
    expect(style["--mk-success"]).toBe(THEME_PRESETS.console.colorSuccess);
    expect(style["--mk-warning"]).toBe(THEME_PRESETS.console.colorWarning);
    expect(style["--mk-danger"]).toBe(THEME_PRESETS.console.colorDanger);
    expect(style["--mk-shadow"]).toBe(THEME_PRESETS.console.shadow);
  });
});

describe("theme presets (multitude)", () => {
  const REQUIRED_KEYS: (keyof ThemeTokens)[] = [
    "colorBackground",
    "colorForeground",
    "colorMuted",
    "colorPrimary",
    "colorPrimaryForeground",
    "colorAccent",
    "colorBorder",
    "colorCard",
    "colorCardForeground",
    "colorSuccess",
    "colorWarning",
    "colorDanger",
    "radius",
    "shadow",
    "fontFamily",
  ];

  it("exposes the full multitude of presets", () => {
    expect(THEME_PRESET_NAMES).toEqual([
      "light",
      "dark",
      "memphis",
      "dashboard",
      "console",
      "midnight",
      "ocean",
      "forest",
      "sunset",
      "grape",
    ]);
  });

  it("every preset defines every token (no missing values)", () => {
    for (const name of THEME_PRESET_NAMES) {
      const tokens = THEME_PRESETS[name];
      for (const key of REQUIRED_KEYS) {
        expect(tokens[key], `${name}.${key}`).toBeTruthy();
      }
    }
  });

  it("captures the dashboard-mock look in the console preset (dark card + emerald/amber/red)", () => {
    const c = THEME_PRESETS.console;
    expect(c.colorCard).toBe("#11161d");
    expect(c.colorSuccess).toBe("#34d399");
    expect(c.colorWarning).toBe("#fbbf24");
    expect(c.colorDanger).toBe("#f87171");
  });
});
