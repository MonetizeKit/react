import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonetizeKitProvider } from "../provider";
import { PricingComparison } from "./PricingComparison";
import { PricingTable } from "./PricingTable";
import { AlertBanner } from "./AlertBanner";
import { annualSavingsPercent } from "../lib/format";
import type { Plan } from "../types";

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    pricing: [{ type: "flat", amount: 0, currency: "USD", interval: "monthly" }],
    entitlements: [
      { featureKey: "seats", featureDisplayName: "Seats", type: "limit", value: 1 },
      { featureKey: "api", featureDisplayName: "API access", type: "boolean", value: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricing: [
      { type: "flat", amount: 49, currency: "USD", interval: "monthly" },
      { type: "flat", amount: 470, currency: "USD", interval: "annually" },
    ],
    entitlements: [
      { featureKey: "seats", featureDisplayName: "Seats", type: "limit", value: 10000 },
      { featureKey: "api", featureDisplayName: "API access", type: "boolean", value: true },
    ],
  },
];

function withProvider(node: React.ReactNode) {
  return render(
    <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" appearance="console">
      {node}
    </MonetizeKitProvider>,
  );
}

describe("PricingComparison", () => {
  it("renders plan headers and feature rows with semantic cells", () => {
    withProvider(<PricingComparison plans={plans} highlightPlan="Pro" />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
    // limit >= 9999 renders as Unlimited
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
    // boolean true renders a check
    expect(screen.getAllByLabelText("Included").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("Not included").length).toBeGreaterThanOrEqual(1);
  });

  it("respects explicit feature groups", () => {
    withProvider(
      <PricingComparison
        plans={plans}
        groups={[{ title: "Core", features: [{ key: "api", label: "Developer API" }] }]}
      />,
    );
    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Developer API")).toBeInTheDocument();
  });
});

describe("PricingTable billing toggle", () => {
  it("switches headline price between monthly and yearly", () => {
    withProvider(<PricingTable plans={plans} showBillingToggle highlightPlan="Pro" />);
    expect(screen.getByText("$49/mo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /yearly/i }));
    expect(screen.getByText("$470/yr")).toBeInTheDocument();
  });
});

describe("annualSavingsPercent", () => {
  it("computes savings vs 12x monthly", () => {
    expect(annualSavingsPercent(plans[1]!)).toBe(20); // 470 vs 588 ≈ 20%
    expect(annualSavingsPercent(plans[0]!)).toBeNull(); // free, no annual term
  });
});

describe("AlertBanner", () => {
  it("renders variant, progress, and fires actions", () => {
    const onClick = vi.fn();
    withProvider(
      <AlertBanner
        variant="warning"
        title="You are at 80% of your API limit"
        description="Upgrade to avoid overage."
        progress={0.8}
        actions={[{ label: "Upgrade", onClick }]}
      />,
    );
    expect(screen.getByText("You are at 80% of your API limit")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
