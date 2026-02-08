import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOrder } from "@/lib/db/queries/orders";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import OrderStatusForm from "@/components/admin/order-status-form";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const t = await getTranslations("Admin");
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("orders.backToOrders")}
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("orders.order")} #{order.orderNumber}
            </h1>
            <p className="text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {t(`status.${order.status}`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("orders.items")}
              </h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => {
                // Parse variant title for options (e.g., "20x30 / none / regular")
                const variantParts = item.variantTitle?.split(" / ") || [];
                const dimensions = variantParts[0] || item.selectedOptions?.size;
                const frame = variantParts[1] || item.selectedOptions?.frame;
                const depth = variantParts[2] || item.selectedOptions?.depth;

                return (
                  <div key={item.id} className="px-6 py-4 flex gap-4">
                    {item.attributes?.imageUrl && (
                      <Image
                        src={item.attributes.imageUrl}
                        alt={item.productTitle}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.productTitle}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        {dimensions && (
                          <p>
                            <span className="text-gray-500">Dimensions:</span>{" "}
                            {dimensions}
                          </p>
                        )}
                        {frame && (
                          <p>
                            <span className="text-gray-500">Frame:</span> {frame}
                          </p>
                        )}
                        {depth && (
                          <p>
                            <span className="text-gray-500">Depth:</span> {depth}
                          </p>
                        )}
                        {item.attributes?.borderStyle && (
                          <p>
                            <span className="text-gray-500">Border:</span>{" "}
                            {item.attributes.borderStyle}
                          </p>
                        )}
                        {item.attributes?.orientation && (
                          <p>
                            <span className="text-gray-500">Orientation:</span>{" "}
                            {item.attributes.orientation}
                          </p>
                        )}
                        <p>
                          <span className="text-gray-500">Qty:</span>{" "}
                          {item.quantity}
                        </p>
                        {item.attributes?.imageUrl && (
                          <p>
                            <span className="text-gray-500">Image:</span>{" "}
                            <a
                              href={item.attributes.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              View Full Image
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t flex justify-end">
                        <span className="font-medium">
                          ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("orders.orderDetails")}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${(order.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>${(order.shippingCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>${(order.taxCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>{t("orders.total")}</span>
                <span>
                  ${(order.totalCents / 100).toFixed(2)} {order.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("orders.updateStatus")}
            </h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("orders.customer")}
            </h2>
            <div className="space-y-2 text-sm">
              {order.customerName && (
                <p className="font-medium">{order.customerName}</p>
              )}
              <p className="text-gray-600">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-gray-600">{order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("orders.shippingAddress")}
              </h2>
              <address className="text-sm text-gray-600 not-italic">
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
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("orders.shippingAddress")}
              </h2>
              <p className="text-sm text-gray-500">{t("orders.noAddress")}</p>
            </div>
          )}

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("orders.tracking")}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("orders.trackingNumber")}</span>
                  <span className="font-mono">{order.trackingNumber}</span>
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline block text-right"
                  >
                    {t("orders.trackPackage")}
                  </a>
                )}
                {order.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("orders.shippedAt")}</span>
                    <span>{new Date(order.shippedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t("orders.status")}</span>
                <span className="capitalize">{order.paymentStatus}</span>
              </div>
              {order.stripePaymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Stripe ID</span>
                  <span className="font-mono text-xs truncate max-w-[150px]">
                    {order.stripePaymentIntentId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
