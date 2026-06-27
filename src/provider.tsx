import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MonetizeKitClient } from "./lib/client";
import {
  inspectMonetizeKitConfig,
  formatConfigDiagnosticForConsole,
  type ConfigDiagnostic,
} from "./lib/config-diagnostics";
import {
  resolveTokens,
  appearanceMode,
  type Appearance,
  type ThemeTokens,
} from "./theme/tokens";

/** Track the OS dark-mode preference (only when `system` mode is in use). */
function usePrefersDark(enabled: boolean): boolean {
  const [prefersDark, setPrefersDark] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [enabled]);
  return prefersDark;
}

export interface MonetizeKitContextValue {
  client: MonetizeKitClient;
  customerId?: string;
  appearance: Appearance;
  tokens: ThemeTokens;
  /** Default BCP-47 locale for number/currency/date formatting. */
  locale?: string;
  /** Default ISO-4217 currency for money formatting. */
  currency: string;
  /** Diagnostic for the provided publishable key / base URL (Clerk-style guardrail). */
  config: ConfigDiagnostic;
}

const MonetizeKitContext = createContext<MonetizeKitContextValue | null>(null);

export interface MonetizeKitProviderProps {
  /** Browser-safe publishable key (pk_*). */
  publishableKey: string;
  /** API origin, e.g. https://app.monetizekit.app. */
  baseUrl: string;
  /** Optional customer JWT for customer-scoped reads (entitlements/usage/credits). */
  customerToken?: string;
  /** Customer id for entitlement/usage/credit hooks. */
  customerId?: string;
  /** Theme preset name or token overrides. */
  appearance?: Appearance;
  /** Default BCP-47 locale applied to all components (override per-component via props). */
  locale?: string;
  /** Default ISO-4217 currency applied to all components (override per-component via props). */
  currency?: string;
  children: ReactNode;
}

export function MonetizeKitProvider({
  publishableKey,
  baseUrl,
  customerToken,
  customerId,
  appearance = "light",
  locale,
  currency = "USD",
  children,
}: MonetizeKitProviderProps) {
  const prefersDark = usePrefersDark(appearanceMode(appearance) === "system");
  const config = useMemo(
    () => inspectMonetizeKitConfig(publishableKey, baseUrl),
    [publishableKey, baseUrl],
  );

  // Surface configuration problems in the console once per config (Clerk-style),
  // so developers see the reminder even before any component renders.
  useEffect(() => {
    if (config.severity === "error") {
      console.error(formatConfigDiagnosticForConsole(config));
    } else if (config.severity === "warning") {
      console.warn(formatConfigDiagnosticForConsole(config));
    }
  }, [config]);

  const value = useMemo<MonetizeKitContextValue>(() => {
    return {
      client: new MonetizeKitClient({ publishableKey, baseUrl, customerToken }),
      customerId,
      appearance,
      tokens: resolveTokens(appearance, prefersDark),
      locale,
      currency,
      config,
    };
  }, [publishableKey, baseUrl, customerToken, customerId, appearance, prefersDark, locale, currency, config]);

  return (
    <MonetizeKitContext.Provider value={value}>
      {children}
    </MonetizeKitContext.Provider>
  );
}

export function useMonetizeKit(): MonetizeKitContextValue {
  const ctx = useContext(MonetizeKitContext);
  if (!ctx) {
    throw new Error("useMonetizeKit must be used within a <MonetizeKitProvider>.");
  }
  return ctx;
}
