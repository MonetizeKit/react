import { describe, expect, it } from "vitest";
import {
  resolveTokens,
  tokensToStyle,
  appearanceMode,
  THEME_PRESETS,
  THEME_PRESET_NAMES,
  THEMES,
  THEME_NAMES,
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

describe("theme light/dark modes", () => {
  it("exposes 8 brand themes, each with a light + dark variant", () => {
    expect(THEME_NAMES).toEqual([
      "default", "dashboard", "memphis", "slate", "ocean", "forest", "sunset", "grape",
    ]);
    for (const name of THEME_NAMES) {
      expect(THEMES[name].light).toBeTruthy();
      expect(THEMES[name].dark).toBeTruthy();
      // light and dark differ (different backgrounds)
      expect(THEMES[name].light.colorBackground).not.toBe(THEMES[name].dark.colorBackground);
    }
  });

  it("resolveTokens picks the variant by mode", () => {
    expect(resolveTokens({ theme: "memphis", mode: "light" })).toEqual(THEMES.memphis.light);
    expect(resolveTokens({ theme: "memphis", mode: "dark" })).toEqual(THEMES.memphis.dark);
    // mode defaults to light
    expect(resolveTokens({ theme: "ocean" })).toEqual(THEMES.ocean.light);
  });

  it("system mode follows the OS preference flag", () => {
    expect(resolveTokens({ theme: "slate", mode: "system" }, true)).toEqual(THEMES.slate.dark);
    expect(resolveTokens({ theme: "slate", mode: "system" }, false)).toEqual(THEMES.slate.light);
  });

  it("merges token overrides onto the resolved variant", () => {
    const t = resolveTokens({ theme: "grape", mode: "dark", tokens: { radius: "0" } });
    expect(t.radius).toBe("0");
    expect(t.colorPrimary).toBe(THEMES.grape.dark.colorPrimary);
  });

  it("appearanceMode reports mode for theme forms, undefined for fixed presets", () => {
    expect(appearanceMode({ theme: "ocean", mode: "system" })).toBe("system");
    expect(appearanceMode({ theme: "ocean" })).toBe("light");
    expect(appearanceMode("memphis")).toBeUndefined();
  });
});
