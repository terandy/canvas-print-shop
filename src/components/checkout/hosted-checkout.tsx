"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LockKeyhole, Truck, MapPin } from "lucide-react";
import { startHostedCheckout } from "@/lib/utils/hosted-checkout-actions";
import {
  hostedCheckoutSchema,
  type HostedCheckoutSummary,
} from "@/lib/shipping/hosted-checkout";
import { BUSINESS_DATA } from "@/lib/business-data";

const inputClass =
  "mt-2 block w-full rounded-xl border border-secondary/20 bg-white px-3 py-3 text-base text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function HostedCheckout({
  summary,
}: {
  summary: HostedCheckoutSummary;
}) {
  const t = useTranslations("Checkout.hosted");
  const f = useTranslations("Checkout.fulfilment");
  const locale = useLocale();
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [province, setProvince] = useState("");
  const [location, setLocation] = useState<"montreal" | "quebec-city">(
    "montreal"
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const money = (cents: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  const shippingCents = method === "pickup" ? 0 : summary.rates[province];
  const total =
    shippingCents === undefined ? null : summary.subtotalCents + shippingCents;

  useEffect(() => {
    const restore = () => {
      inFlight.current = false;
      setPending(false);
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    const input =
      method === "pickup"
        ? { method, location }
        : {
            method,
            shipping: {
              name: form.get("name"),
              line1: form.get("line1"),
              line2: form.get("line2"),
              city: form.get("city"),
              state: province,
              postalCode: form.get("postalCode"),
            },
          };
    if (!hostedCheckoutSchema.safeParse(input).success) {
      setError("invalid-address");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError(null);
    let navigating = false;
    try {
      const result = await startHostedCheckout(input, summary.fingerprint);
      if (!result.ok) {
        setError(result.code);
        return;
      }
      window.location.assign(result.url);
      navigating = true;
    } catch {
      setError("unavailable");
    } finally {
      if (!navigating) {
        inFlight.current = false;
        setPending(false);
      }
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <fieldset
        disabled={pending}
        className="min-w-0 space-y-7 rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm sm:p-8"
      >
        <legend className="sr-only">{t("fulfilment")}</legend>
        <div>
          <h2 className="text-xl font-semibold text-secondary">
            {t("fulfilment")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["delivery", "pickup"] as const).map((choice) => (
              <label
                key={choice}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${method === choice ? "border-primary bg-primary/5" : "border-secondary/15"}`}
              >
                <input
                  type="radio"
                  name="method"
                  value={choice}
                  checked={method === choice}
                  onChange={() => {
                    setMethod(choice);
                    setError(null);
                  }}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-secondary">
                    {choice === "delivery" ? (
                      <Truck aria-hidden="true" size={18} />
                    ) : (
                      <MapPin aria-hidden="true" size={18} />
                    )}
                    {t(choice)}
                  </span>
                  <span className="mt-1 block text-sm text-gray">
                    {t(`${choice}Help`)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
        {method === "delivery" ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary">
              {t("province")}
              <select
                name="state"
                value={province}
                onChange={(event) => {
                  setProvince(event.target.value);
                  setError(null);
                }}
                required
                autoComplete="shipping address-level1"
                className={inputClass}
              >
                <option value="">{t("selectProvince")}</option>
                {Object.keys(summary.rates).map((code) => (
                  <option key={code} value={code}>
                    {t(`provinces.${code}`)}
                  </option>
                ))}
              </select>
            </label>
            <p
              className="rounded-xl bg-secondary/5 p-3 text-sm text-secondary"
              aria-live="polite"
            >
              {shippingCents === undefined
                ? t("chooseProvince")
                : t("deliveryPrice", { price: money(shippingCents) })}
            </p>
            <label className="block text-sm font-medium text-secondary">
              {t("name")}
              <input
                name="name"
                autoComplete="shipping name"
                required
                maxLength={150}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-secondary">
              {t("line1")}
              <input
                name="line1"
                autoComplete="shipping address-line1"
                required
                maxLength={150}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-secondary">
              {t("line2")}
              <input
                name="line2"
                autoComplete="shipping address-line2"
                maxLength={150}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-secondary">
                {t("city")}
                <input
                  name="city"
                  autoComplete="shipping address-level2"
                  required
                  maxLength={150}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-medium text-secondary">
                {t("postalCode")}
                <input
                  name="postalCode"
                  autoComplete="shipping postal-code"
                  autoCapitalize="characters"
                  required
                  maxLength={12}
                  className={inputClass}
                />
              </label>
            </div>
            <p className="text-sm text-gray">{t("country")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-secondary">
              {t("pickupLocation")}
            </h3>
            {(["montreal", "quebec-city"] as const).map((key) => {
              const place =
                BUSINESS_DATA.locations[
                  key === "montreal" ? "montrealBranch" : "quebecCityWorkshop"
                ];
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${location === key ? "border-primary bg-primary/5" : "border-secondary/15"}`}
                >
                  <input
                    type="radio"
                    name="pickup"
                    value={key}
                    checked={location === key}
                    onChange={() => setLocation(key)}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-secondary">
                      {f(`pickup.${key}`)}
                    </span>
                    <span className="mt-1 block text-sm text-gray">
                      {place.address.streetAddress},{" "}
                      {place.address.addressLocality},{" "}
                      {place.address.postalCode}
                    </span>
                  </span>
                </label>
              );
            })}
            <p className="text-sm text-gray">{t("pickupReady")}</p>
          </div>
        )}
      </fieldset>
      <div className="self-start rounded-3xl border border-secondary/10 bg-white p-5 shadow-sm sm:p-8 lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold text-secondary">{t("summary")}</h2>
        <ul className="mt-5 divide-y divide-secondary/10">
          {summary.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-secondary">{item.title}</p>
                <p className="text-sm text-gray">{item.variant}</p>
                <p className="text-sm text-gray">
                  {t("quantity", { count: item.quantity })}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm text-secondary">
                {money(item.totalCents)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3 border-t border-secondary/10 pt-5 text-sm text-secondary">
          <div className="flex justify-between gap-4">
            <dt>{t("subtotal")}</dt>
            <dd>{money(summary.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{method === "delivery" ? t("delivery") : t("pickup")}</dt>
            <dd>
              {shippingCents === undefined
                ? t("selectProvince")
                : money(shippingCents)}
            </dd>
          </div>
          <div
            className="flex justify-between gap-4 border-t border-secondary/10 pt-4 text-lg font-semibold"
            aria-live="polite"
          >
            <dt>{t("total")}</dt>
            <dd>{total === null ? "—" : money(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-gray">{t("currency")}</p>
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            {t(`errors.${error}`)}
            {error === "cart-changed" && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 block font-medium underline"
              >
                {t("refresh")}
              </button>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={pending || total === null}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LockKeyhole size={18} aria-hidden="true" />
          {pending ? t("opening") : t("continue")}
        </button>
        <p className="mt-4 text-center text-sm text-gray">{t("secure")}</p>
        <a
          href="mailto:info@canvasprintshop.ca"
          className="mt-4 block text-center text-sm text-secondary underline underline-offset-4"
        >
          {t("help")}
        </a>
      </div>
    </form>
  );
}
