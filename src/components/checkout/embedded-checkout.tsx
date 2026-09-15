"use client";

import {
  loadStripe,
  type StripeCheckoutForm,
  type StripeCheckoutFormChangeEvent,
  type StripeCheckoutFormConfirmEvent,
} from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createEmbeddedCheckoutSession,
  updateEmbeddedCheckoutShipping,
} from "@/lib/utils/cart-actions";
import { createShippingCoordinator } from "@/lib/shipping/checkout-coordinator";
import {
  mountCheckoutForm,
  type CheckoutFormActions,
  type CheckoutLoadFailure,
} from "@/lib/stripe/checkout-form-client";

type ShippingAddress = NonNullable<
  StripeCheckoutFormChangeEvent["value"]["shippingAddress"]
>;

const stripePromises = new Map<string, ReturnType<typeof loadStripe>>();

// Keep one Stripe instance across StrictMode renders and checkout remounts.
function getStripe(publishableKey: string) {
  let promise = stripePromises.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripePromises.set(publishableKey, promise);
  }
  return promise;
}

function ShippingCheckoutForm({
  stripePromise,
  clientSecret,
}: {
  stripePromise: ReturnType<typeof loadStripe>;
  clientSecret: Promise<string>;
}) {
  const t = useTranslations("Checkout.page");
  const [state, setState] = useState<
    | { type: "loading" | "error" }
    | { type: "success"; checkout: CheckoutFormActions }
  >({ type: "loading" });
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadMs, setLoadMs] = useState<number>();
  const [loadFailure, setLoadFailure] = useState<CheckoutLoadFailure>();
  const stateRef = useRef(state);
  stateRef.current = state;
  const formRef = useRef<StripeCheckoutForm | null>(null);
  const confirming = useRef(false);
  const pendingUpdates = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [pickupOnly, setPickupOnly] = useState(false);
  const coordinator = useMemo(
    () =>
      createShippingCoordinator<ShippingAddress>(async (address) => {
        const current = stateRef.current;
        if (current.type !== "success") throw new Error("checkout-unavailable");
        const result = await current.checkout.runServerUpdate(async () => {
          const response = await updateEmbeddedCheckoutShipping({
            checkoutSessionId: current.checkout.getSession().id,
            shippingDetails: address,
          });
          if (!response.ok) throw new Error(response.code);
          setPickupOnly(!response.automaticDelivery);
          return response;
        });
        if (result.type !== "success") throw new Error("checkout-unavailable");
      }),
    []
  );

  const showError = (cause: unknown) => {
    const code =
      cause instanceof Error ? cause.message : "checkout-unavailable";
    setError(
      code === "invalid-address"
        ? t("errors.invalidAddress")
        : code === "invalid-cart" || code === "empty-cart"
          ? t("errors.invalidCart")
          : t("errors.unavailable")
    );
  };

  const onChange = async (event: StripeCheckoutFormChangeEvent) => {
    const address = event.value.shippingAddress;
    if (!event.status.shippingAddress?.complete || !address) {
      coordinator.invalidate();
      setError(null);
      return;
    }
    const key = JSON.stringify(address);
    if (coordinator.isReady(key)) return;
    pendingUpdates.current += 1;
    setUpdating(true);
    setError(null);
    try {
      if (await coordinator.update(key, address)) setError(null);
    } catch (cause) {
      if (coordinator.isCurrent(key)) showError(cause);
    } finally {
      pendingUpdates.current -= 1;
      if (pendingUpdates.current === 0) setUpdating(false);
    }
  };

  const onConfirm = async (event: StripeCheckoutFormConfirmEvent) => {
    if (confirming.current || state.type !== "success") return;
    confirming.current = true;
    try {
      const value = await formRef.current?.getValue();
      const address = value?.value.shippingAddress;
      if (!value?.status.shippingAddress?.complete || !address) {
        setError(t("errors.invalidAddress"));
        return;
      }
      const key = JSON.stringify(address);
      if (!coordinator.isReady(key)) {
        await coordinator.update(key, address);
        setError(t("errors.reviewShipping"));
        return;
      }
      // No wallet shortcuts: addresses must pass the same rate-update flow.
      const result = await state.checkout.confirm({ formConfirmEvent: event });
      if (result.type === "error") setError(t("errors.payment"));
    } catch (cause) {
      showError(cause);
    } finally {
      confirming.current = false;
    }
  };

  const handlers = useRef({ onChange, onConfirm });
  handlers.current = { onChange, onConfirm };
  useEffect(() => {
    if (!containerRef.current) return;
    return mountCheckoutForm({
      stripePromise,
      clientSecret,
      container: containerRef.current,
      onReady: (form, actions, ms) => {
        formRef.current = form;
        setLoadMs(ms);
        setState({ type: "success", checkout: actions });
      },
      onChange: (event) => {
        void handlers.current.onChange(event);
      },
      onConfirm: (event) => {
        void handlers.current.onConfirm(event);
      },
      onError: (reason) => {
        setLoadFailure(reason);
        formRef.current = null;
        setState({ type: "error" });
      },
    });
  }, [stripePromise, clientSecret]);

  return (
    <>
      {state.type === "error" && (
        <div className="px-5 py-12 text-center">
          <p role="alert">{t("unavailable")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-primary px-6 py-3 font-medium text-white"
          >
            {t("retry")}
          </button>
        </div>
      )}
      {state.type === "loading" && (
        <p role="status" className="px-5 py-3 text-center">
          {t("loading")}
        </p>
      )}
      {pickupOnly && (
        <p
          role="status"
          className="m-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          {t("territoryUnavailable")}
        </p>
      )}
      {updating && (
        <p role="status" className="m-3 text-sm text-secondary">
          {t("updatingShipping")}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="m-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <div
        ref={containerRef}
        data-checkout-state={state.type}
        data-checkout-load-ms={loadMs}
        data-checkout-error={loadFailure}
      />
    </>
  );
}

export default function CanvasEmbeddedCheckout({
  publishableKey,
}: {
  publishableKey: string;
}) {
  const t = useTranslations("Checkout.page");
  const started = useRef(false);
  const [clientSecret, setClientSecret] = useState<Promise<string> | null>(
    null
  );
  const [loadError, setLoadError] = useState(false);
  const stripePromise = getStripe(publishableKey);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const secret = createEmbeddedCheckoutSession().then((result) => {
      if (!result.ok) throw new Error(result.code);
      return result.clientSecret;
    });
    setClientSecret(secret);
    void secret.catch(() => setLoadError(true));
  }, []);
  if (loadError)
    return (
      <div className="px-5 py-12 text-center">
        <p className="font-medium text-secondary" role="alert">
          {t("unavailable")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-primary px-6 py-3 font-medium text-white"
        >
          {t("retry")}
        </button>
      </div>
    );
  if (!clientSecret)
    return (
      <p className="px-5 py-12 text-center" role="status">
        {t("loading")}
      </p>
    );
  return (
    <ShippingCheckoutForm
      stripePromise={stripePromise}
      clientSecret={clientSecret}
    />
  );
}
