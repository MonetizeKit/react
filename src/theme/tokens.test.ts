import { describe, expect, it } from "vitest";
import {
  resolveTokens,
  tokensToStyle,
  appearanceMode,
  THEME_PRESETS,
  THEME_PRESET_NAMES,
  THEMES,
  THEME_NAMES,
  PALETTE_NAMES,
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
  it("exposes the brand theme plus 8 hand-tuned themes, each with a light + dark variant", () => {
    expect(THEME_NAMES).toEqual([
      "brand", "default", "dashboard", "memphis", "slate", "ocean", "forest", "sunset", "grape",
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

// ---------------------------------------------------------------------------
// C6 back-compat guard: every pre-brand appearance must resolve to a byte-exact
// token set. These snapshots lock the existing contract so future changes
// (e.g. sourcing brand from design-tokens) can never silently drift a preset,
// legacy theme, or the emitted --mk-* custom properties.
// ---------------------------------------------------------------------------
describe("back-compat: existing appearances are byte-stable", () => {
  it("every flat preset resolves to its locked token set", () => {
    for (const name of THEME_PRESET_NAMES) {
      expect(resolveTokens(name)).toMatchSnapshot(`preset:${name}`);
    }
  });

  it("every hand-tuned theme resolves to its locked light + dark token set", () => {
    const legacy = THEME_NAMES.filter((t) => t !== "brand");
    for (const theme of legacy) {
      expect(resolveTokens({ theme, mode: "light" })).toMatchSnapshot(`theme:${theme}:light`);
      expect(resolveTokens({ theme, mode: "dark" })).toMatchSnapshot(`theme:${theme}:dark`);
    }
  });

  it("emits a byte-stable --mk-* custom-property set per preset", () => {
    for (const name of THEME_PRESET_NAMES) {
      expect(tokensToStyle(resolveTokens(name))).toMatchSnapshot(`mkvars:${name}`);
    }
  });

  it("resolves legacy themes identically to their static THEMES entries", () => {
    const legacy = THEME_NAMES.filter((t) => t !== "brand");
    for (const theme of legacy) {
      expect(resolveTokens({ theme, mode: "light" })).toEqual(THEMES[theme].light);
      expect(resolveTokens({ theme, mode: "dark" })).toEqual(THEMES[theme].dark);
    }
  });
});

// ---------------------------------------------------------------------------
// Additive brand theme + palette axis (Surface C), sourced from design-tokens.
// ---------------------------------------------------------------------------
describe("brand theme + palette axis", () => {
  it("exposes the 9-palette axis", () => {
    expect(PALETTE_NAMES).toEqual([
      "default", "nord", "solarized", "dracula", "github", "rose-pine", "blue", "green", "unicorn",
    ]);
  });

  it("brand default palette resolves the on-brand look (orange primary, cream ground)", () => {
    const light = resolveTokens({ theme: "brand" });
    expect(light.colorPrimary).toBe("#FF6B35");
    expect(light.colorBackground).toBe("#FFFEF3");
    const dark = resolveTokens({ theme: "brand", mode: "dark" });
    expect(dark.colorBackground).toBe("#1A1A1A");
    expect(dark.colorForeground).toBe("#FFFEF3");
  });

  it("a non-default palette overrides semantic colors over the brand base", () => {
    const base = resolveTokens({ theme: "brand", palette: "default" });
    const blue = resolveTokens({ theme: "brand", palette: "blue" });
    expect(blue.colorPrimary).not.toBe(base.colorPrimary);
  });

  it("resolves every palette in both modes to a full token set", () => {
    for (const palette of PALETTE_NAMES) {
      for (const mode of ["light", "dark"] as const) {
        const t = resolveTokens({ theme: "brand", palette, mode });
        expect(t.colorBackground, `${palette}:${mode}`).toBeTruthy();
        expect(t.colorPrimary, `${palette}:${mode}`).toBeTruthy();
        expect(t.colorSuccess, `${palette}:${mode}`).toBeTruthy();
      }
    }
  });

  it("brand honors system mode via the prefersDark flag", () => {
    expect(resolveTokens({ theme: "brand", mode: "system" }, true).colorBackground).toBe("#1A1A1A");
    expect(resolveTokens({ theme: "brand", mode: "system" }, false).colorBackground).toBe("#FFFEF3");
  });

  it("merges token overrides onto the resolved brand+palette set", () => {
    const t = resolveTokens({ theme: "brand", palette: "green", tokens: { radius: "0" } });
    expect(t.radius).toBe("0");
    expect(t.colorPrimary).toBe(resolveTokens({ theme: "brand", palette: "green" }).colorPrimary);
  });

  it("palette is ignored for hand-tuned (non-brand) themes", () => {
    expect(resolveTokens({ theme: "ocean", palette: "blue" })).toEqual(THEMES.ocean.light);
  });

  it("emits the full --mk-* contract for the brand theme", () => {
    const style = tokensToStyle(resolveTokens({ theme: "brand" })) as Record<string, string>;
    expect(style["--mk-primary"]).toBe("#FF6B35");
    expect(style["--mk-bg"]).toBe("#FFFEF3");
    expect(Object.keys(style)).toHaveLength(15);
  });
});
