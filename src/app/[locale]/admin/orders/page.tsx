import Link from "next/link";
import { getOrders } from "@/lib/db/queries/orders";
import { getTranslations } from "next-intl/server";
import { Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const STATUS_VALUES = [
  "",
  "pending",
  "paid",
  "processing",
  "shipped",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

interface Props {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const t = await getTranslations("Admin");
  const { status, page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const orders = await getOrders({
    status: status as any,
    limit,
    offset,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("orders.title")}</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_VALUES.map((s) => (
            <Link
              key={s}
              href={s ? `?status=${s}` : "?"}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (status || "") === s
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s === "" ? t("orders.allOrders") : t(`status.${s}`)}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.order")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.customer")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.items")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.status")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.total")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.date")}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {t("orders.noOrders")}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {order.customerName || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {order.items.length}{" "}
                      {order.items.length !== 1
                        ? t("orders.itemPlural")
                        : t("orders.itemSingular")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          STATUS_COLORS[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(`status.${order.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${(order.totalCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center text-primary hover:text-primary/80"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("orders.view")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders.length >= limit && (
          <div className="px-4 py-3 border-t flex justify-between items-center">
            <Link
              href={`?${status ? `status=${status}&` : ""}page=${currentPage - 1}`}
              className={`px-3 py-1 rounded border ${
                currentPage <= 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              aria-disabled={currentPage <= 1}
            >
              {t("orders.previous")}
            </Link>
            <span className="text-sm text-gray-500">
              {t("orders.pageNumber", { page: currentPage })}
            </span>
            <Link
              href={`?${status ? `status=${status}&` : ""}page=${currentPage + 1}`}
              className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
            >
              {t("orders.next")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
