import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonetizeKitProvider } from "../provider";
import { PricingTable } from "./PricingTable";
import { CustomerPortal } from "./CustomerPortal";
import { SAMPLE_NOTICE_TEXT, SAMPLE_PLANS } from "../lib/sample-data";

function withProvider(node: React.ReactNode) {
  return render(
    <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" appearance="console">
      {node}
    </MonetizeKitProvider>,
  );
}

describe("sample fallback (no plans / products defined)", () => {
  it("PricingTable renders illustrative sample plans + a disclaimer when empty", () => {
    withProvider(<PricingTable plans={[]} />);
    expect(screen.getByText(SAMPLE_NOTICE_TEXT)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_PLANS[0]!.name)).toBeInTheDocument();
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("PricingTable shows an empty state (no sample) when sampleWhenEmpty is false", () => {
    withProvider(<PricingTable plans={[]} sampleWhenEmpty={false} />);
    expect(screen.getByText("No plans available.")).toBeInTheDocument();
    expect(screen.queryByText(SAMPLE_NOTICE_TEXT)).not.toBeInTheDocument();
  });

  it("PricingTable supports a custom disclaimer", () => {
    withProvider(<PricingTable plans={[]} disclaimer="Demo catalog — not for sale" />);
    expect(screen.getByText("Demo catalog — not for sale")).toBeInTheDocument();
  });

  it("CustomerPortal in sample mode shows the disclaimer + sample plan name", () => {
    withProvider(<CustomerPortal sample />);
    expect(screen.getByText(SAMPLE_NOTICE_TEXT)).toBeInTheDocument();
    expect(screen.getByText("Growth")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("CustomerPortal in sample mode renders Team + Invoices sections", () => {
    withProvider(<CustomerPortal sample />);
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("3/10 seats")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getAllByText("paid").length).toBeGreaterThanOrEqual(1);
  });

  it("CustomerPortal renders provided team + invoices and can hide them", () => {
    withProvider(
      <CustomerPortal
        planName="Pro"
        showCredits={false}
        showTeam
        teamMembers={[{ name: "Ada", email: "ada@x.test", role: "owner" }]}
        seats={{ used: 1, max: 5 }}
        showInvoices={false}
      />,
    );
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("1/5 seats")).toBeInTheDocument();
    expect(screen.queryByText("Invoices")).not.toBeInTheDocument();
  });
});
