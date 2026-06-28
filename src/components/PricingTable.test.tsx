import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MonetizeKitProvider } from "../provider";
import { PricingTable } from "./PricingTable";
import type { Plan } from "../types";

const plans: Plan[] = [
  {
    id: "plan_free",
    name: "Free",
    pricing: [{ type: "flat", amount: 0, currency: "USD", interval: "monthly" }],
  },
  {
    id: "plan_scale",
    name: "Scale",
    pricing: [
      { type: "flat", amount: 299, currency: "USD", interval: "monthly" },
      { type: "usage", amount: 0, currency: "USD", interval: "monthly", meterId: "m" },
    ],
  },
  {
    id: "plan_ent",
    name: "Enterprise",
    tags: ["contact_sales"],
    pricing: [],
  },
];

function renderTable(props: Partial<React.ComponentProps<typeof PricingTable>> = {}) {
  return render(
    <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" appearance="memphis">
      <PricingTable plans={plans} highlightPlan="Scale" {...props} />
    </MonetizeKitProvider>,
  );
}

describe("PricingTable", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders all plans with the controlled plans prop (no fetch)", () => {
    renderTable();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Scale")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders a Contact Sales CTA for a contact_sales plan and Get started for priced plans", () => {
    renderTable();
    expect(screen.getByText("Contact Sales")).toBeInTheDocument();
    expect(screen.getAllByText("Get started").length).toBeGreaterThanOrEqual(1);
  });

  it("highlights the requested plan", () => {
    renderTable();
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("allows custom plan card rendering with pricing context and selection helpers", () => {
    const onSelectPlan = vi.fn();

    renderTable({
      locale: "en-US",
      onSelectPlan,
      className: "outer-shell",
      classNames: { root: "custom-root", grid: "custom-grid" },
      renderPlanCard: (plan, ctx) => (
        <article data-testid={`custom-${plan.id}`} data-highlighted={String(ctx.highlighted)}>
          <strong>{plan.name}</strong>
          <span>{ctx.price.contactSales ? "Custom" : ctx.price.headline}</span>
          <span>{ctx.features.map((feature) => feature.label).join(", ")}</span>
          <span>{ctx.cycle}</span>
          <span>{ctx.locale}</span>
          <button type="button" onClick={ctx.selectPlan}>
            Choose {plan.name}
          </button>
        </article>
      ),
    });

    expect(screen.getByTestId("custom-plan_scale")).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByText("$299/mo")).toBeInTheDocument();
    expect(screen.getAllByText("monthly")).toHaveLength(3);
    expect(screen.getAllByText("en-US")).toHaveLength(3);

    fireEvent.click(screen.getByText("Choose Scale"));
    expect(onSelectPlan).toHaveBeenCalledWith("plan_scale");
    expect(document.querySelector(".outer-shell.custom-root")).toBeInTheDocument();
    expect(document.querySelector(".custom-grid")).toBeInTheDocument();
  });

  it("fetches and renders templated plans when the template prop is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "plan_template",
            name: "Homepage Plan",
            pricing: [{ type: "flat", amount: 199, currency: "USD", interval: "monthly" }],
          },
        ],
        template: {
          key: "homepage",
          name: "Homepage",
          skin: "default",
          locale: "en-US",
          availableLocales: ["en-US"],
        },
        groups: [],
      }),
    } satisfies Partial<Response>);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" locale="en-US">
        <PricingTable template="homepage" />
      </MonetizeKitProvider>,
    );

    await waitFor(() => expect(screen.getByText("Homepage Plan")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.example.com/api/v1/plans?page=1&pageSize=100&template=homepage&locale=en-US",
      { headers: { Authorization: "Bearer pk_test" } },
    );
  });
});
