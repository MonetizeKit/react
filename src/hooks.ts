import { useEffect, useState } from "react";
import { useMonetizeKit } from "./provider";
import type { CreditBalance, EntitlementResult, UsageResult } from "./types";

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
