import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MonetizeKitProvider } from "./provider";
import { SAMPLE_PLANS } from "./lib/sample-data";
import { usePlans } from "./hooks";
import type { Plan } from "./types";
import type { ReactNode } from "react";

const expensivePlan: Plan = {
  id: "plan_expensive",
  name: "Expensive",
  pricing: [{ type: "flat", amount: 900, currency: "USD", interval: "monthly" }],
};

const cheapPlan: Plan = {
  id: "plan_cheap",
  name: "Cheap",
  pricing: [{ type: "flat", amount: 100, currency: "USD", interval: "monthly" }],
};

function wrapper(config: { publishableKey?: string; baseUrl?: string; locale?: string } = {}) {
  return function HookWrapper({ children }: { children: ReactNode }) {
    return (
      <MonetizeKitProvider
        publishableKey={config.publishableKey ?? "pk_live_test"}
        baseUrl={config.baseUrl ?? "https://app.example.com"}
        locale={config.locale}
      >
        {children}
      </MonetizeKitProvider>
    );
  };
}

function mockPlansResponse(plans: Plan[]) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: plans }),
  } satisfies Partial<Response>);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("usePlans", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses explicit plans in caller-provided order without fetching", () => {
    const fetchMock = mockPlansResponse([]);
    const { result } = renderHook(
      () => usePlans({ plans: [expensivePlan, cheapPlan] }),
      { wrapper: wrapper() },
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.isSample).toBe(false);
    expect(result.current.plans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
    expect(result.current.rawPlans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
  });

  it("returns live plans sorted for display while preserving raw fetched order", async () => {
    mockPlansResponse([expensivePlan, cheapPlan]);

    const { result } = renderHook(() => usePlans(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.plans.map((plan) => plan.id)).toEqual(["plan_cheap", "plan_expensive"]);
    expect(result.current.rawPlans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
  });

  it("falls back to sample plans when the live catalog is empty", async () => {
    mockPlansResponse([]);

    const { result } = renderHook(() => usePlans(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isSample).toBe(true);
    expect(result.current.plans).toEqual(SAMPLE_PLANS);
    expect(result.current.rawPlans).toEqual([]);
  });

  it("can disable sample fallback for empty catalogs", async () => {
    mockPlansResponse([]);

    const { result } = renderHook(() => usePlans({ sampleWhenEmpty: false }), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isSample).toBe(false);
    expect(result.current.plans).toEqual([]);
    expect(result.current.rawPlans).toEqual([]);
  });

  it("skips live fetch and exposes config error state when provider config is invalid", () => {
    const fetchMock = mockPlansResponse([cheapPlan]);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePlans(), {
      wrapper: wrapper({ publishableKey: "", baseUrl: "https://app.example.com" }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toContain("publishable key is not set");
    expect(result.current.config.status).toBe("missing-key");
    expect(result.current.isSample).toBe(true);
    expect(result.current.plans).toEqual(SAMPLE_PLANS);
    expect(result.current.rawPlans).toEqual([]);
  });
});
