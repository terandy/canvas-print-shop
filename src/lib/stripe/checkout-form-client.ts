import type {
  Stripe,
  StripeCheckoutForm,
  StripeCheckoutFormChangeEvent,
  StripeCheckoutFormConfirmEvent,
  StripeCheckoutFormLoadActionsSuccess,
} from "@stripe/stripe-js";

export type CheckoutFormActions = StripeCheckoutFormLoadActionsSuccess;
export type CheckoutLoadFailure =
  | "session"
  | "stripe"
  | "sdk"
  | "frame"
  | "timeout-frame"
  | "timeout-actions";

/** Own one form per committed mount. Async setup lets React discard a
 * development mount before any Stripe iframe is created or destroyed. */
export function mountCheckoutForm({
  stripePromise,
  clientSecret,
  container,
  onReady,
  onChange,
  onConfirm,
  onError,
  timeoutMs = 15000,
}: {
  stripePromise: PromiseLike<Stripe | null>;
  clientSecret: Promise<string>;
  container: HTMLElement;
  onReady: (
    form: StripeCheckoutForm,
    actions: CheckoutFormActions,
    ms: number
  ) => void;
  onChange: (event: StripeCheckoutFormChangeEvent) => void;
  onConfirm: (event: StripeCheckoutFormConfirmEvent) => void;
  onError: (reason: CheckoutLoadFailure) => void;
  timeoutMs?: number;
}) {
  let active = true;
  let form: StripeCheckoutForm | undefined;
  let actions: CheckoutFormActions | undefined;
  let rendered = false;
  let ready = false;
  const startedAt = Date.now();
  const dispose = () => {
    active = false;
    clearTimeout(timer);
    form?.destroy();
    form = undefined;
  };
  const fail = (reason: CheckoutLoadFailure) => {
    if (!active) return;
    dispose();
    onError(reason);
  };
  const timer = setTimeout(
    () => fail(rendered ? "timeout-actions" : "timeout-frame"),
    timeoutMs
  );
  const checkReady = () => {
    if (!active || ready || !rendered || !actions || !form) return;
    ready = true;
    clearTimeout(timer);
    onReady(form, actions, Date.now() - startedAt);
  };

  // Start the iframe with the pending secret: Stripe assets and the server
  // session load in parallel, rather than one waiting for the other.
  void clientSecret.catch(() => fail("session"));
  void Promise.resolve(stripePromise)
    .then((stripe) => {
      if (!active) return;
      if (!stripe) return fail("stripe");
      const sdk = stripe.initCheckoutFormSdk({ clientSecret });
      form = sdk.createForm({
        layout: "expanded",
        expressCheckout: {
          paymentMethods: {
            applePay: "never",
            googlePay: "never",
            link: "never",
            paypal: "never",
            amazonPay: "never",
            klarna: "never",
          },
        },
      });
      form.on("ready", () => {
        rendered = true;
        checkReady();
      });
      form.on("loaderror", () => fail("frame"));
      form.on("change", (event) => {
        if (active) onChange(event);
      });
      form.on("confirm", (event) => {
        if (active && ready) onConfirm(event);
      });
      form.mount(container);
      return sdk.loadActions().then((result) => {
        if (!active) return;
        if (result.type === "error") return fail("sdk");
        actions = result.actions;
        checkReady();
      });
    })
    .catch(() => fail("sdk"));

  return dispose;
}
