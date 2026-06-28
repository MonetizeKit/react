/**
 * Minimal fetch client for the MonetizeKit public API. Uses a publishable key
 * (pk_*) as a Bearer token; safe for browser use against allowlisted origins.
 */
export interface MonetizeKitClientConfig {
  publishableKey: string;
  baseUrl: string;
  customerToken?: string;
}

export interface ListPlansOptions {
  template?: string;
  locale?: string;
  page?: number;
  pageSize?: number;
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

  listPlans<T>(options: ListPlansOptions = {}): Promise<T> {
    const params = new URLSearchParams();
    params.set("page", String(options.page ?? 1));
    params.set("pageSize", String(options.pageSize ?? 100));
    if (options.template) params.set("template", options.template);
    if (options.locale) params.set("locale", options.locale);
    return this.get<T>(`/api/v1/plans?${params.toString()}`);
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
