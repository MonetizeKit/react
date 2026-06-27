/**
 * Developer-facing configuration guardrails for the MonetizeKit React SDK.
 *
 * Mirrors the Clerk pattern: when a consuming app is missing its publishable
 * key (or is using a non-live key), surface a clear, actionable message — both
 * in the console and in the UI — pointing back to the docs, instead of silently
 * rendering an empty/"unable to load" state. Publishable keys (`pk_…`) are
 * browser-safe, so it is fine to show a redacted prefix in diagnostics.
 */

/** Docs page covering SDK setup + how to create/use a publishable key. */
export const MONETIZEKIT_KEYS_DOCS_URL = "https://monetizekit.app/docs/tools/sdks";

export type ConfigStatus =
  | "ok"
  | "missing-key"
  | "malformed-key"
  | "missing-base-url"
  | "test-key";

export type ConfigSeverity = "error" | "warning" | "none";

export interface ConfigDiagnostic {
  status: ConfigStatus;
  severity: ConfigSeverity;
  /** Short, human-readable headline. */
  title: string;
  /** Actionable detail explaining how to fix it. */
  detail: string;
  /** Documentation link for generating + configuring the key. */
  docsUrl: string;
}

/** Redact all but the key prefix so logs/UI stay tidy (pk_ keys are public). */
export function redactPublishableKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 12) return trimmed;
  return `${trimmed.slice(0, 12)}…`;
}

/**
 * Inspect the provider configuration and return the most relevant diagnostic.
 * `error` severity means components cannot load live data (the SDK is
 * effectively unconfigured); `warning` means it works but is not production-ready.
 */
export function inspectMonetizeKitConfig(
  publishableKey: string | undefined,
  baseUrl: string | undefined,
): ConfigDiagnostic {
  const key = (publishableKey ?? "").trim();
  const url = (baseUrl ?? "").trim();

  if (!key) {
    return {
      status: "missing-key",
      severity: "error",
      title: "MonetizeKit publishable key is not set",
      detail:
        "No publishable key was provided to <MonetizeKitProvider>. Set it in your " +
        "environment (e.g. VITE_MONETIZEKIT_PUBLISHABLE_KEY, " +
        "NEXT_PUBLIC_MONETIZEKIT_PUBLISHABLE_KEY) and pass it as " +
        "`publishableKey`. Create a publishable (pk_live_…) key in the MonetizeKit " +
        "dashboard under Settings → API keys. Until then, components render " +
        "illustrative sample data.",
      docsUrl: MONETIZEKIT_KEYS_DOCS_URL,
    };
  }

  if (!/^pk_/.test(key)) {
    return {
      status: "malformed-key",
      severity: "error",
      title: "MonetizeKit publishable key looks malformed",
      detail:
        `Publishable keys start with "pk_live_" (or "pk_test_"), but received ` +
        `"${redactPublishableKey(key)}". Double-check the value copied into your ` +
        "environment — a secret key (mk_…) or a truncated value will not work in " +
        "the browser.",
      docsUrl: MONETIZEKIT_KEYS_DOCS_URL,
    };
  }

  if (!url) {
    return {
      status: "missing-base-url",
      severity: "error",
      title: "MonetizeKit API base URL is not set",
      detail:
        "A publishable key was provided but `baseUrl` is empty. Set it in your " +
        "environment (e.g. VITE_MONETIZEKIT_API_URL) and pass it as `baseUrl`, " +
        "e.g. https://app.monetizekit.app.",
      docsUrl: MONETIZEKIT_KEYS_DOCS_URL,
    };
  }

  if (/^pk_test_/.test(key)) {
    return {
      status: "test-key",
      severity: "warning",
      title: "Using a MonetizeKit test publishable key",
      detail:
        `This is a non-live key ("${redactPublishableKey(key)}"). Use a live key ` +
        "(pk_live_…) in production so real catalog data loads for your customers.",
      docsUrl: MONETIZEKIT_KEYS_DOCS_URL,
    };
  }

  return {
    status: "ok",
    severity: "none",
    title: "MonetizeKit configuration OK",
    detail: "",
    docsUrl: MONETIZEKIT_KEYS_DOCS_URL,
  };
}

/** Format the diagnostic for a single, readable console line block. */
export function formatConfigDiagnosticForConsole(d: ConfigDiagnostic): string {
  return `[MonetizeKit] ${d.title}.\n${d.detail}\nDocs: ${d.docsUrl}`;
}
