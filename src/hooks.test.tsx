import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MonetizeKitProvider } from "./provider";
import { SAMPLE_PLANS } from "./lib/sample-data";
import { usePlans, usePricingTemplate } from "./hooks";
import type { Plan, PricingTemplatePlansResponse } from "./types";
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

const templateResponse: PricingTemplatePlansResponse = {
  data: [expensivePlan, cheapPlan],
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  template: {
    key: "homepage",
    name: "Homepage",
    skin: "memphis",
    locale: "en-US",
    availableLocales: ["en-US", "es-ES"],
    section: {
      heading: "Pricing that scales",
      subheading: "Choose your tier",
      ctaLabel: "Start now",
      contactSalesLabel: "Talk to sales",
    },
    billing: {
      defaultCycle: "monthly",
      showToggle: true,
    },
  },
  groups: [
    {
      id: "platform",
      label: "Platform",
      order: 1,
      features: [
        {
          featureKey: "api",
          label: "API access",
          visible: true,
          order: 1,
        },
      ],
    },
  ],
};

function mockTemplateResponse(response: PricingTemplatePlansResponse = templateResponse) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
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

  it("fetches templated plans and exposes template metadata", async () => {
    const fetchMock = mockTemplateResponse();

    const { result } = renderHook(() => usePlans({ template: "homepage", locale: "en-US" }), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.example.com/api/v1/plans?page=1&pageSize=100&template=homepage&locale=en-US",
      { headers: { Authorization: "Bearer pk_live_test" } },
    );
    expect(result.current.error).toBeNull();
    expect(result.current.plans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
    expect(result.current.rawPlans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
    expect(result.current.template?.key).toBe("homepage");
    expect(result.current.groups?.[0]?.label).toBe("Platform");
  });
});

describe("usePricingTemplate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the provider locale by default and returns template data", async () => {
    const fetchMock = mockTemplateResponse();

    const { result } = renderHook(() => usePricingTemplate("homepage"), {
      wrapper: wrapper({ locale: "en-US" }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.example.com/api/v1/plans?page=1&pageSize=100&template=homepage&locale=en-US",
      { headers: { Authorization: "Bearer pk_live_test" } },
    );
    expect(result.current.plans.map((plan) => plan.id)).toEqual(["plan_expensive", "plan_cheap"]);
    expect(result.current.template?.skin).toBe("memphis");
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(result.current.config.severity).toBe("none");
  });

  it("returns a safe error state without fetching when the key is empty", () => {
    const fetchMock = mockTemplateResponse();

    const { result } = renderHook(() => usePricingTemplate(""), {
      wrapper: wrapper({ locale: "en-US" }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.plans).toEqual([]);
    expect(result.current.template).toBeUndefined();
    expect(result.current.groups).toEqual([]);
    expect(result.current.error?.message).toContain("template key is required");
  });

  it("skips fetching when provider configuration has an error", () => {
    const fetchMock = mockTemplateResponse();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => usePricingTemplate("homepage"), {
      wrapper: wrapper({ publishableKey: "", baseUrl: "https://app.example.com" }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.plans).toEqual([]);
    expect(result.current.error?.message).toContain("publishable key is not set");
    expect(result.current.config.status).toBe("missing-key");
  });
});
