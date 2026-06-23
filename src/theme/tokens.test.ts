import { describe, expect, it } from "vitest";
import { resolveTokens, tokensToStyle, THEME_PRESETS } from "./tokens";

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
});
