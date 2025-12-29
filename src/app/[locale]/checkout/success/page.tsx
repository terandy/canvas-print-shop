import { getOrderByStripeSession } from "@/lib/db/queries/orders";
import { CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const t = await getTranslations("Checkout.success");

  if (!session_id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("invalidSession")}</h1>
        <p className="mt-4 text-gray-600">{t("noSessionMessage")}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          {t("returnHome")}
        </Link>
      </div>
    );
  }

  // Get order details
  const order = await getOrderByStripeSession(session_id);

  if (!order) {
    // Order might not be created yet (webhook delay)
    // Show a generic success message
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-4 text-gray-600">{t("processing")}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-gray-600">
          {t("orderNumber", { orderNumber: order.orderNumber })}
        </p>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">{t("orderSummary")}</h2>

        <div className="mt-4 divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3">
              <div>
                <p className="font-medium">{item.productTitle}</p>
                <p className="text-sm text-gray-500">{item.variantTitle}</p>
                <p className="text-sm text-gray-500">
                  {t("quantity", { quantity: item.quantity })}
                </p>
              </div>
              <p className="font-medium">
                ${((item.priceCents * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span>${(order.subtotalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span>${(order.shippingCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("tax")}</span>
            <span>${(order.taxCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>{t("total")}</span>
            <span>
              ${(order.totalCents / 100).toFixed(2)} {order.currency}
            </span>
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">{t("shippingAddress")}</h2>
          <address className="mt-2 not-italic text-gray-600">
            {order.customerName && <p>{order.customerName}</p>}
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p>{order.shippingAddress.line2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </address>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          {t("confirmationSent", { email: order.customerEmail })}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
