import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MonetizeKitProvider } from "../provider";
import { CustomerPortal } from "./CustomerPortal";

// The portal can host an inline Checkout; mock Stripe so it renders deterministically.
const { stripeMock, elementsMock } = vi.hoisted(() => ({
  stripeMock: { confirmPayment: vi.fn(), confirmSetup: vi.fn() },
  elementsMock: {},
}));

vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-elements">{children}</div>
  ),
  PaymentElement: () => <div data-testid="payment-element" />,
  useStripe: () => stripeMock,
  useElements: () => elementsMock,
}));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve({})),
}));

function renderPortal(props: Partial<React.ComponentProps<typeof CustomerPortal>> = {}) {
  return render(
    <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" appearance="light">
      <CustomerPortal {...props} />
    </MonetizeKitProvider>,
  );
}

describe("CustomerPortal payment method + inline change", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the card on file in sample mode", () => {
    renderPortal({ sample: true });
    expect(screen.getByText("Payment method")).toBeInTheDocument();
    expect(screen.getByText("visa")).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
  });

  it("renders a provided payment method and its Update action", () => {
    renderPortal({ paymentMethod: { brand: "mastercard", last4: "4444", expMonth: 4, expYear: 2030 } });
    expect(screen.getByText("mastercard")).toBeInTheDocument();
    expect(screen.getByText(/4444/)).toBeInTheDocument();
    expect(screen.getByText(/Exp 04\/30/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("reveals an inline setup Checkout when Update is clicked with config", () => {
    renderPortal({
      paymentMethod: { brand: "visa", last4: "4242" },
      updatePaymentMethod: { stripePublishableKey: "pk_test_stripe", clientSecret: "seti_secret" },
    });
    expect(screen.queryByRole("button", { name: "Save payment method" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(screen.getByTestId("payment-element")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save payment method" })).toBeInTheDocument();
  });

  it("reveals an inline plan-change Checkout when Change plan is clicked with config", () => {
    renderPortal({
      planName: "Growth",
      changePlanCheckout: {
        stripePublishableKey: "pk_test_stripe",
        clientSecret: "pi_secret",
        summary: { planName: "Scale", amountLabel: "$999 / mo" },
      },
    });
    const changeButton = screen.getByRole("button", { name: "Change plan" });
    expect(screen.queryByRole("button", { name: "Confirm plan change" })).not.toBeInTheDocument();
    fireEvent.click(changeButton);
    expect(screen.getByRole("button", { name: "Confirm plan change" })).toBeInTheDocument();
    expect(screen.getByText("$999 / mo")).toBeInTheDocument();
  });
});
