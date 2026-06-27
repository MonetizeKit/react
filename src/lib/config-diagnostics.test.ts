import { describe, it, expect } from "vitest";
import {
  inspectMonetizeKitConfig,
  redactPublishableKey,
  formatConfigDiagnosticForConsole,
  MONETIZEKIT_KEYS_DOCS_URL,
} from "./config-diagnostics";

describe("inspectMonetizeKitConfig", () => {
  const baseUrl = "https://app.monetizekit.app";

  it("flags a missing key as an error", () => {
    for (const key of [undefined, "", "   "]) {
      const d = inspectMonetizeKitConfig(key, baseUrl);
      expect(d.status).toBe("missing-key");
      expect(d.severity).toBe("error");
      expect(d.docsUrl).toBe(MONETIZEKIT_KEYS_DOCS_URL);
    }
  });

  it("flags a malformed (non-pk_) key as an error", () => {
    const d = inspectMonetizeKitConfig("mk_live_secret_value", baseUrl);
    expect(d.status).toBe("malformed-key");
    expect(d.severity).toBe("error");
  });

  it("flags a missing base URL as an error when the key is present", () => {
    const d = inspectMonetizeKitConfig("pk_live_abc123", "");
    expect(d.status).toBe("missing-base-url");
    expect(d.severity).toBe("error");
  });

  it("warns on a non-live (test) key", () => {
    const d = inspectMonetizeKitConfig("pk_test_abc123", baseUrl);
    expect(d.status).toBe("test-key");
    expect(d.severity).toBe("warning");
  });

  it("returns ok for a live key + base URL", () => {
    const d = inspectMonetizeKitConfig("pk_live_abc123", baseUrl);
    expect(d.status).toBe("ok");
    expect(d.severity).toBe("none");
  });
});

describe("redactPublishableKey", () => {
  it("keeps short values intact and truncates long ones", () => {
    expect(redactPublishableKey("pk_live_x")).toBe("pk_live_x");
    expect(redactPublishableKey("pk_live_abcdefghijklmnop")).toBe("pk_live_abcd…");
  });
});

describe("formatConfigDiagnosticForConsole", () => {
  it("includes the title, detail, and docs link", () => {
    const d = inspectMonetizeKitConfig(undefined, "");
    const msg = formatConfigDiagnosticForConsole(d);
    expect(msg).toContain("[MonetizeKit]");
    expect(msg).toContain(d.title);
    expect(msg).toContain(MONETIZEKIT_KEYS_DOCS_URL);
  });
});
