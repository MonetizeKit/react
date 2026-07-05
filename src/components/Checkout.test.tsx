import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MonetizeKitProvider } from "../provider";
import { Checkout } from "./Checkout";

// Mock Stripe so the widget's logic is testable without loading Stripe.js.
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

function renderCheckout(props: Partial<React.ComponentProps<typeof Checkout>> = {}) {
  return render(
    <MonetizeKitProvider publishableKey="pk_test" baseUrl="https://app.example.com" appearance="light">
      <Checkout {...props} />
    </MonetizeKitProvider>,
  );
}

describe("Checkout", () => {
  beforeEach(() => {
    stripeMock.confirmPayment.mockReset();
    stripeMock.confirmSetup.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a labeled preview (no Stripe Elements) when unconfigured", () => {
    renderCheckout({ summary: { planName: "Scale", amountLabel: "$299 / mo" } });
    expect(screen.getByText("Scale")).toBeInTheDocument();
    expect(screen.getByText("$299 / mo")).toBeInTheDocument();
    expect(screen.queryByTestId("payment-element")).not.toBeInTheDocument();
    expect(screen.getByText(/Preview only/i)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Pay now" });
    expect(button).toBeDisabled();
  });

  it("renders Stripe Elements and confirms a payment on submit", async () => {
    stripeMock.confirmPayment.mockResolvedValue({
      paymentIntent: { id: "pi_123", status: "succeeded" },
    });
    const onSuccess = vi.fn();
    renderCheckout({
      stripePublishableKey: "pk_test_stripe",
      clientSecret: "pi_secret_123",
      summary: { planName: "Scale", amountLabel: "$299 / mo" },
      onSuccess,
    });

    expect(screen.getByTestId("payment-element")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

    await waitFor(() => expect(stripeMock.confirmPayment).toHaveBeenCalledTimes(1));
    expect(stripeMock.confirmPayment).toHaveBeenCalledWith(
      expect.objectContaining({ redirect: "if_required" }),
    );
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({ status: "succeeded", id: "pi_123", mode: "payment" }),
    );
  });

  it("surfaces a Stripe error and calls onError without onSuccess", async () => {
    stripeMock.confirmPayment.mockResolvedValue({
      error: { message: "Your card was declined." },
    });
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderCheckout({
      stripePublishableKey: "pk_test_stripe",
      clientSecret: "pi_secret_123",
      onSuccess,
      onError,
    });

    fireEvent.click(screen.getByRole("button", { name: "Pay now" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Your card was declined."));
    expect(onError).toHaveBeenCalledWith({ message: "Your card was declined." });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("uses confirmSetup and a 'Save card' label in setup mode", async () => {
    stripeMock.confirmSetup.mockResolvedValue({
      setupIntent: { id: "seti_1", status: "succeeded" },
    });
    const onSuccess = vi.fn();
    renderCheckout({
      mode: "setup",
      stripePublishableKey: "pk_test_stripe",
      clientSecret: "seti_secret_1",
      onSuccess,
    });

    fireEvent.click(screen.getByRole("button", { name: "Save card" }));

    await waitFor(() => expect(stripeMock.confirmSetup).toHaveBeenCalledTimes(1));
    expect(stripeMock.confirmPayment).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith({ status: "succeeded", id: "seti_1", mode: "setup" }),
    );
  });
});
