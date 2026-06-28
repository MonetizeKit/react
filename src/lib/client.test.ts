import { afterEach, describe, expect, it, vi } from "vitest";
import { MonetizeKitClient } from "./client";

describe("MonetizeKitClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists plans with the default pagination query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } satisfies Partial<Response>);
    vi.stubGlobal("fetch", fetchMock);
    const client = new MonetizeKitClient({
      publishableKey: "pk_live_test",
      baseUrl: "https://app.example.com",
    });

    await client.listPlans();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.example.com/api/v1/plans?page=1&pageSize=100",
      { headers: { Authorization: "Bearer pk_live_test" } },
    );
  });

  it("lists plans with encoded template, locale, and pagination params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } satisfies Partial<Response>);
    vi.stubGlobal("fetch", fetchMock);
    const client = new MonetizeKitClient({
      publishableKey: "pk_live_test",
      baseUrl: "https://app.example.com",
    });

    await client.listPlans({
      template: "homepage/summer",
      locale: "en-US",
      page: 2,
      pageSize: 25,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.example.com/api/v1/plans?page=2&pageSize=25&template=homepage%2Fsummer&locale=en-US",
      { headers: { Authorization: "Bearer pk_live_test" } },
    );
  });
});
