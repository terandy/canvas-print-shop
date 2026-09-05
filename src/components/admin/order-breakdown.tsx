import { getTranslations } from "next-intl/server";
import type { Order } from "@/types/order";

/**
 * What is actually in an order, for the orders table: the line items, plus
 * pickup and tracking when they apply. Deliberately carries no money — the
 * table's own Total column is the single place amounts are shown.
 *
 * Orders still moving through the shop render flat, so their contents can be
 * read by scanning the column. A fulfilled order needs no attention, so it
 * collapses behind a disclosure and keeps the table short. Either way this
 * ships no client JavaScript.
 */
export default async function OrderBreakdown({ order }: { order: Order }) {
  const t = await getTranslations("Admin");

  const pickup =
    order.fulfilmentMethod === "pickup"
      ? t(
          order.pickupLocation === "montreal"
            ? "orders.pickupMontreal"
            : "orders.pickupQuebecCity"
        )
      : null;

  const details = (
    <>
      <ul className="space-y-1.5">
        {order.items.map((item) => (
          <li key={item.id}>
            <p className="font-medium text-gray-900">
              {item.quantity} × {item.productTitle}
            </p>
            <p className="text-gray-500">{item.variantTitle}</p>
          </li>
        ))}
      </ul>

      {pickup && (
        <p className="mt-1.5 text-gray-500">
          {t("orders.pickupLabel")}: {pickup}
        </p>
      )}

      {order.trackingNumber && (
        <p className="mt-1.5 text-gray-500">
          {t("orders.trackingNumber")}: {order.trackingNumber}
        </p>
      )}
    </>
  );

  if (order.status !== "fulfilled") {
    return <div className="max-w-xs text-xs">{details}</div>;
  }

  return (
    <details className="group max-w-xs text-xs">
      <summary className="cursor-pointer list-none text-sm text-primary marker:hidden hover:underline">
        <span className="group-open:hidden">{t("orders.showDetails")}</span>
        <span className="hidden group-open:inline">
          {t("orders.hideDetails")}
        </span>
      </summary>
      <div className="mt-2">{details}</div>
    </details>
  );
}
