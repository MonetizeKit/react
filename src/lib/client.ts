/**
 * Minimal fetch client for the MonetizeKit public API. Uses a publishable key
 * (pk_*) as a Bearer token; safe for browser use against allowlisted origins.
 */
export interface MonetizeKitClientConfig {
  publishableKey: string;
  baseUrl: string;
  customerToken?: string;
}

export class MonetizeKitClient {
  constructor(private readonly config: MonetizeKitClientConfig) {}

  private async get<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.publishableKey}`,
    };
    if (this.config.customerToken) {
      headers["X-Customer-Token"] = this.config.customerToken;
    }
    const res = await fetch(`${this.config.baseUrl}${path}`, { headers });
    if (!res.ok) {
      throw new Error(`MonetizeKit API ${res.status} for ${path}`);
    }
    return (await res.json()) as T;
  }

  listPlans<T>(): Promise<T> {
    return this.get<T>("/api/v1/plans?page=1&pageSize=100");
  }

  getEntitlement<T>(customerId: string, featureKey: string): Promise<T> {
    return this.get<T>(`/api/v1/entitlements/${customerId}/${encodeURIComponent(featureKey)}`);
  }

  getUsage<T>(customerId: string, meterId: string): Promise<T> {
    return this.get<T>(`/api/v1/usage/${customerId}/${encodeURIComponent(meterId)}`);
  }

  getCredits<T>(customerId: string): Promise<T> {
    return this.get<T>(`/api/v1/credits/${customerId}`);
  }
}
