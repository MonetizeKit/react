import { useEffect, useMemo, useState } from "react";
import { useMonetizeKit } from "./provider";
import { SAMPLE_PLANS } from "./lib/sample-data";
import { sortPlansForDisplay } from "./lib/format";
import type { ConfigDiagnostic } from "./lib/config-diagnostics";
import type {
  CreditBalance,
  EntitlementResult,
  Plan,
  PricingTemplateFeatureGroup,
  PricingTemplatePlansResponse,
  PricingTemplateSummary,
  UsageResult,
} from "./types";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(
  run: () => Promise<T> | null,
  deps: unknown[],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const promise = run();
    if (!promise) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    promise
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      active = false;
    };
  }, deps);

  return state;
}

export interface UsePlansOptions {
  /** Plans to expose directly; skips live fetching and preserves caller order. */
  plans?: Plan[];
  /**
   * When no plans are available, expose illustrative sample plans through
   * `plans`. Defaults to `true`.
   */
  sampleWhenEmpty?: boolean;
  /** Locale override for sample formatting consumers; defaults to provider locale. */
  locale?: string;
  /** Optional pricing presentation template key for live plan fetches. */
  template?: string;
  /** Live API page number. Defaults to 1. */
  page?: number;
  /** Live API page size. Defaults to 100. */
  pageSize?: number;
}

export interface UsePlansResult {
  /** Plans ready for display after sample fallback and live-only sorting. */
  plans: Plan[];
  /** Raw caller-provided or live-fetched plans, never sample data. */
  rawPlans: Plan[];
  isSample: boolean;
  loading: boolean;
  error: Error | null;
  config: ConfigDiagnostic;
  locale?: string;
  template?: PricingTemplateSummary;
  groups?: PricingTemplateFeatureGroup[];
}

type PlansResponse = PricingTemplatePlansResponse<Plan>;

/** Fetch and normalize pricing plans for headless consumers and SDK components. */
export function usePlans(options: UsePlansOptions = {}): UsePlansResult {
  const { client, config, locale: ctxLocale } = useMonetizeKit();
  const { plans: plansProp, sampleWhenEmpty = true, locale, page, pageSize } = options;
  const templateKey = options.template?.trim() || undefined;
  const hasPlansProp = plansProp !== undefined;
  const effectiveLocale = locale ?? ctxLocale;
  const configError = !hasPlansProp && config.severity === "error";
  const [state, setState] = useState<AsyncState<PlansResponse>>({
    data: null,
    loading: !hasPlansProp && !configError,
    error: null,
  });

  useEffect(() => {
    if (hasPlansProp) {
      return;
    }
    if (configError) {
      setState({ data: { data: [] }, loading: false, error: new Error(config.title) });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    client
      .listPlans<PlansResponse>({
        template: templateKey,
        locale: templateKey ? effectiveLocale : undefined,
        page,
        pageSize,
      })
      .then((res) => {
        if (active) setState({ data: res, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: { data: [] },
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [
    client,
    plansProp,
    hasPlansProp,
    configError,
    config.title,
    templateKey,
    effectiveLocale,
    page,
    pageSize,
  ]);

  return useMemo(() => {
    const response = state.data;
    const rawPlans = plansProp ?? response?.data ?? [];
    const loading = hasPlansProp || configError ? false : state.loading;
    const error = hasPlansProp ? null : state.error;
    const isSample = !loading && rawPlans.length === 0 && sampleWhenEmpty;
    const displayPlans = isSample
      ? SAMPLE_PLANS
      : hasPlansProp
        ? rawPlans
        : templateKey
          ? rawPlans
          : sortPlansForDisplay(rawPlans);

    return {
      plans: displayPlans,
      rawPlans,
      isSample,
      loading,
      error,
      config,
      locale: effectiveLocale,
      template: hasPlansProp ? undefined : response?.template,
      groups: hasPlansProp ? undefined : response?.groups,
    };
  }, [config, configError, effectiveLocale, hasPlansProp, plansProp, sampleWhenEmpty, state, templateKey]);
}

export interface UsePricingTemplateOptions {
  locale?: string;
  page?: number;
  pageSize?: number;
}

export interface UsePricingTemplateResult {
  plans: Plan[];
  template?: PricingTemplateSummary;
  groups: PricingTemplateFeatureGroup[];
  loading: boolean;
  error: Error | null;
  config: ConfigDiagnostic;
  locale?: string;
}

/** Fetch a pricing presentation template resolved against live published plans. */
export function usePricingTemplate(
  key: string,
  options: UsePricingTemplateOptions = {},
): UsePricingTemplateResult {
  const { client, config, locale: ctxLocale } = useMonetizeKit();
  const templateKey = key.trim();
  const effectiveLocale = options.locale ?? ctxLocale;
  const missingKey = templateKey.length === 0;
  const configError = config.severity === "error";
  const [state, setState] = useState<AsyncState<PlansResponse>>({
    data: null,
    loading: !missingKey && !configError,
    error: null,
  });

  useEffect(() => {
    if (missingKey) {
      setState({
        data: null,
        loading: false,
        error: new Error("pricing template key is required"),
      });
      return;
    }
    if (configError) {
      setState({ data: null, loading: false, error: new Error(config.title) });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    client
      .listPlans<PlansResponse>({
        template: templateKey,
        locale: effectiveLocale,
        page: options.page,
        pageSize: options.pageSize,
      })
      .then((res) => {
        if (active) setState({ data: res, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [
    client,
    templateKey,
    effectiveLocale,
    options.page,
    options.pageSize,
    missingKey,
    configError,
    config.title,
  ]);

  return useMemo(
    () => ({
      plans: state.data?.data ?? [],
      template: state.data?.template,
      groups: state.data?.groups ?? [],
      loading: missingKey || configError ? false : state.loading,
      error: state.error,
      config,
      locale: effectiveLocale,
    }),
    [config, configError, effectiveLocale, missingKey, state],
  );
}

/** Resolve a single feature entitlement for the provider's customer. */
export function useEntitlement(featureKey: string) {
  const { client, customerId } = useMonetizeKit();
  const state = useAsync<EntitlementResult>(
    () =>
      customerId
        ? client.getEntitlement<EntitlementResult>(customerId, featureKey)
        : null,
    [client, customerId, featureKey],
  );
  return {
    value: state.data?.value ?? null,
    allowed: state.data?.allowed ?? false,
    loading: state.loading,
    error: state.error,
  };
}

/** Resolve current usage for a meter. */
export function useUsage(meterId: string) {
  const { client, customerId } = useMonetizeKit();
  const state = useAsync<UsageResult>(
    () => (customerId ? client.getUsage<UsageResult>(customerId, meterId) : null),
    [client, customerId, meterId],
  );
  return {
    current: state.data?.current ?? 0,
    limit: state.data?.limit ?? null,
    loading: state.loading,
    error: state.error,
  };
}

/** Resolve the customer's credit balance. */
export function useCredits() {
  const { client, customerId } = useMonetizeKit();
  const state = useAsync<CreditBalance>(
    () => (customerId ? client.getCredits<CreditBalance>(customerId) : null),
    [client, customerId],
  );
  return {
    balance: state.data?.balance ?? 0,
    currency: state.data?.currency,
    loading: state.loading,
    error: state.error,
  };
}
