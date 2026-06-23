import type { ReactNode } from "react";
import { useEntitlement } from "../hooks";

export interface EntitlementGateProps {
  /** Feature key to check for the provider's customer. */
  feature: string;
  /** Rendered when the customer is entitled. */
  children: ReactNode;
  /** Rendered when not entitled (defaults to nothing). */
  fallback?: ReactNode;
  /** Rendered while the entitlement check is loading. */
  loadingFallback?: ReactNode;
}

/** Conditionally render children based on a live entitlement check. */
export function EntitlementGate({
  feature,
  children,
  fallback = null,
  loadingFallback = null,
}: EntitlementGateProps) {
  const { allowed, loading } = useEntitlement(feature);
  if (loading) return <>{loadingFallback}</>;
  return <>{allowed ? children : fallback}</>;
}
