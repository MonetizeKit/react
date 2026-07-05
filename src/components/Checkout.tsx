import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Appearance as StripeAppearance,
  type Stripe,
  type StripeError,
} from "@stripe/stripe-js";
import { useMonetizeKit } from "../provider";
import { tokensToStyle, type ThemeTokens } from "../theme/tokens";
import { SampleNotice } from "./SampleNotice";

/**
 * Memoize `loadStripe` per publishable key. Stripe strongly recommends calling
 * `loadStripe` once (module scope) rather than on every render.
 */
const stripeCache = new Map<string, Promise<Stripe | null>>();
function getStripe(publishableKey: string): Promise<Stripe | null> {
  let promise = stripeCache.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripeCache.set(publishableKey, promise);
  }
  return promise;
}

/** Map MonetizeKit theme tokens onto the Stripe Elements appearance API. */
function toStripeAppearance(tokens: ThemeTokens): StripeAppearance {
  return {
    variables: {
      colorPrimary: tokens.colorPrimary,
      colorBackground: tokens.colorCard,
      colorText: tokens.colorCardForeground,
      colorTextSecondary: tokens.colorMuted,
      colorDanger: tokens.colorDanger,
      fontFamily: tokens.fontFamily,
      borderRadius: tokens.radius,
    },
  };
}

export interface CheckoutClassNames {
  root?: string;
  summary?: string;
  payment?: string;
  submit?: string;
  error?: string;
  footer?: string;
}

export interface CheckoutSummaryLine {
  label: string;
  value: string;
}

export interface CheckoutSummary {
  /** Plan / product name shown at the top of the summary. */
  planName?: string;
  /** Headline amount, e.g. "$29 / mo". */
  amountLabel?: string;
  /** Secondary line under the amount, e.g. "Billed monthly · 14-day trial". */
  caption?: string;
  /** Additional summary rows (tax, credits, discounts…). */
  lines?: CheckoutSummaryLine[];
}

export interface CheckoutResult {
  /** Stripe intent status, e.g. `succeeded`, `processing`, `requires_action`. */
  status: string;
  /** The confirmed PaymentIntent / SetupIntent id, when available. */
  id?: string;
  mode: "payment" | "setup";
}

export interface CheckoutProps {
  /** Stripe publishable key (`pk_*`). Required to collect real payment. */
  stripePublishableKey?: string;
  /** Client secret of a PaymentIntent / SetupIntent created by your backend. */
  clientSecret?: string;
  /** `payment` confirms a charge; `setup` saves a payment method. Default `payment`. */
  mode?: "payment" | "setup";
  /** URL Stripe redirects to for redirect-based methods (3DS, wallets…). */
  returnUrl?: string;
  /** Order summary rendered above the payment fields. */
  summary?: CheckoutSummary;
  /** Submit button label. Defaults to "Pay now" / "Save card". */
  submitLabel?: string;
  /** Submit label while confirming. Defaults to "Processing…". */
  processingLabel?: string;
  onSuccess?: (result: CheckoutResult) => void;
  onError?: (error: { message: string }) => void;
  onProcessingChange?: (processing: boolean) => void;
  /**
   * When Stripe isn't configured (no key / client secret), render a clearly
   * labeled, non-interactive preview of the form so the layout is designable.
   * Defaults to `true`.
   */
  sampleWhenUnconfigured?: boolean;
  /** Override the preview disclaimer copy. */
  disclaimer?: ReactNode;
  className?: string;
  classNames?: CheckoutClassNames;
}

const STYLE_ID = "mk-checkout-styles";
const CHECKOUT_CSS = `
.mk-checkout{font-family:var(--mk-font);color:var(--mk-card-fg);background:var(--mk-card);border:1px solid var(--mk-border);border-radius:var(--mk-radius);box-shadow:var(--mk-shadow);padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;max-width:28rem}
.mk-checkout-summary{display:flex;flex-direction:column;gap:.5rem;padding-bottom:1.25rem;border-bottom:1px solid var(--mk-border)}
.mk-checkout-plan{font-size:.8125rem;font-weight:600;color:var(--mk-muted);text-transform:uppercase;letter-spacing:.04em}
.mk-checkout-amount{font-size:1.75rem;font-weight:800;letter-spacing:-.02em;line-height:1}
.mk-checkout-caption{font-size:.875rem;color:var(--mk-muted)}
.mk-checkout-lines{display:flex;flex-direction:column;gap:.35rem;margin-top:.35rem}
.mk-checkout-line{display:flex;justify-content:space-between;font-size:.875rem}
.mk-checkout-line span:last-child{font-weight:600}
.mk-checkout-form{display:flex;flex-direction:column;gap:1rem}
.mk-checkout-flabel{font-size:.8125rem;font-weight:600;color:var(--mk-fg)}
.mk-checkout-field{border:1px solid var(--mk-border);border-radius:var(--mk-radius);padding:.75rem;font-size:.9375rem;color:var(--mk-muted);background:var(--mk-bg);display:flex;justify-content:space-between;align-items:center}
.mk-checkout-row{display:flex;gap:.75rem}
.mk-checkout-row .mk-checkout-field{flex:1}
.mk-checkout-submit{width:100%;border:1px solid transparent;border-radius:var(--mk-radius);padding:.8125rem 1rem;font-weight:600;font-size:.9375rem;background:var(--mk-primary);color:var(--mk-primary-fg);cursor:pointer;transition:filter .15s ease,opacity .15s ease}
.mk-checkout-submit:hover:not(:disabled){filter:brightness(.94)}
.mk-checkout-submit:disabled{opacity:.6;cursor:default}
.mk-checkout-error{color:var(--mk-danger);font-size:.875rem;line-height:1.4}
.mk-checkout-secure{margin:0;font-size:.75rem;color:var(--mk-muted);text-align:center}
`;

function CheckoutStyles() {
  return <style id={STYLE_ID} dangerouslySetInnerHTML={{ __html: CHECKOUT_CSS }} />;
}

const wrapperStyle: CSSProperties = {};

function cx(...classes: Array<string | undefined | false>): string | undefined {
  const value = classes.filter(Boolean).join(" ");
  return value || undefined;
}

function OrderSummary({
  summary,
  classNames,
}: {
  summary: CheckoutSummary;
  classNames?: CheckoutClassNames;
}) {
  return (
    <div className={cx("mk-checkout-summary", classNames?.summary)} data-mk-part="summary">
      {summary.planName ? <div className="mk-checkout-plan">{summary.planName}</div> : null}
      {summary.amountLabel ? <div className="mk-checkout-amount">{summary.amountLabel}</div> : null}
      {summary.caption ? <div className="mk-checkout-caption">{summary.caption}</div> : null}
      {summary.lines && summary.lines.length > 0 ? (
        <div className="mk-checkout-lines">
          {summary.lines.map((line) => (
            <div key={line.label} className="mk-checkout-line">
              <span>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CheckoutForm({
  mode,
  returnUrl,
  submitLabel,
  processingLabel,
  onSuccess,
  onError,
  onProcessingChange,
  classNames,
}: {
  mode: "payment" | "setup";
  returnUrl?: string;
  submitLabel?: string;
  processingLabel: string;
  onSuccess?: (result: CheckoutResult) => void;
  onError?: (error: { message: string }) => void;
  onProcessingChange?: (processing: boolean) => void;
  classNames?: CheckoutClassNames;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabel = mode === "setup" ? "Save card" : "Pay now";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    onProcessingChange?.(true);
    try {
      const confirmParams = returnUrl ? { return_url: returnUrl } : {};
      // Branch on mode so each Stripe result type is concrete (the confirm
      // methods return distinct paymentIntent / setupIntent shapes).
      let confirmError: StripeError | undefined;
      let intentStatus: string | undefined;
      let intentId: string | undefined;
      if (mode === "setup") {
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams,
          redirect: "if_required",
        });
        confirmError = error;
        intentStatus = setupIntent?.status;
        intentId = setupIntent?.id;
      } else {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: "if_required",
        });
        confirmError = error;
        intentStatus = paymentIntent?.status;
        intentId = paymentIntent?.id;
      }

      if (confirmError) {
        const message = confirmError.message ?? "We couldn't confirm your payment. Please try again.";
        setError(message);
        onError?.({ message });
        return;
      }
      onSuccess?.({ status: intentStatus ?? "succeeded", id: intentId, mode });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error confirming payment.";
      setError(message);
      onError?.({ message });
    } finally {
      setProcessing(false);
      onProcessingChange?.(false);
    }
  }

  return (
    <form className={cx("mk-checkout-form", classNames?.payment)} onSubmit={handleSubmit} data-mk-part="payment">
      <PaymentElement />
      {error ? (
        <div role="alert" className={cx("mk-checkout-error", classNames?.error)}>
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        className={cx("mk-checkout-submit", classNames?.submit)}
        disabled={!stripe || processing}
        aria-busy={processing ? "true" : undefined}
      >
        {processing ? processingLabel : submitLabel ?? defaultLabel}
      </button>
    </form>
  );
}

function CheckoutPreview({
  submitLabel,
  disclaimer,
  classNames,
}: {
  submitLabel?: string;
  disclaimer?: ReactNode;
  classNames?: CheckoutClassNames;
}) {
  return (
    <div className={cx("mk-checkout-form", classNames?.payment)} data-mk-part="payment-preview">
      <div className="mk-checkout-flabel">Card information</div>
      <div className="mk-checkout-field" aria-hidden="true">
        <span>Card number</span>
        <span>•••• •••• •••• ••••</span>
      </div>
      <div className="mk-checkout-row" aria-hidden="true">
        <div className="mk-checkout-field">MM / YY</div>
        <div className="mk-checkout-field">CVC</div>
      </div>
      <button type="button" className={cx("mk-checkout-submit", classNames?.submit)} disabled>
        {submitLabel ?? "Pay now"}
      </button>
      <SampleNotice>
        {disclaimer ??
          "Preview only. Pass stripePublishableKey and a clientSecret to collect real payments."}
      </SampleNotice>
    </div>
  );
}

/**
 * Stripe-Elements checkout widget. When `stripePublishableKey` + `clientSecret`
 * are provided it renders a live Stripe Payment Element and confirms the
 * payment (or setup) inline; otherwise it renders a themed, clearly-labeled
 * preview so the layout is designable without Stripe configured.
 */
export function Checkout({
  stripePublishableKey,
  clientSecret,
  mode = "payment",
  returnUrl,
  summary,
  submitLabel,
  processingLabel = "Processing…",
  onSuccess,
  onError,
  onProcessingChange,
  sampleWhenUnconfigured = true,
  disclaimer,
  className,
  classNames,
}: CheckoutProps) {
  const { tokens } = useMonetizeKit();
  const configured = Boolean(stripePublishableKey && clientSecret);
  const stripePromise = useMemo(
    () => (stripePublishableKey ? getStripe(stripePublishableKey) : null),
    [stripePublishableKey],
  );
  const appearance = useMemo(() => toStripeAppearance(tokens), [tokens]);

  return (
    <div
      className={cx("mk-checkout", className, classNames?.root)}
      style={{ ...tokensToStyle(tokens), ...wrapperStyle }}
      data-mk-component="checkout"
      data-mk-mode={mode}
    >
      <CheckoutStyles />
      {summary ? <OrderSummary summary={summary} classNames={classNames} /> : null}
      {configured && stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <CheckoutForm
            mode={mode}
            returnUrl={returnUrl}
            submitLabel={submitLabel}
            processingLabel={processingLabel}
            onSuccess={onSuccess}
            onError={onError}
            onProcessingChange={onProcessingChange}
            classNames={classNames}
          />
        </Elements>
      ) : sampleWhenUnconfigured ? (
        <CheckoutPreview submitLabel={submitLabel} disclaimer={disclaimer} classNames={classNames} />
      ) : null}
      <p className={cx("mk-checkout-secure", classNames?.footer)}>Payments secured by Stripe</p>
    </div>
  );
}
