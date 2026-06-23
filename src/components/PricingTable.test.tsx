import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
