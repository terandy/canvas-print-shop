import Link from "next/link";
import { getOrders } from "@/lib/db/queries/orders";
import { getTranslations } from "next-intl/server";
import { Package, DollarSign, ShoppingCart, TrendingUp, Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin");

  // Get recent orders for stats
  const recentOrders = await getOrders({ limit: 100 });

  // Calculate stats
  const totalOrders = recentOrders.length;
  const totalRevenue = recentOrders.reduce(
    (sum, order) => sum + order.totalCents,
    0
  );
  const pendingOrders = recentOrders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const completedOrders = recentOrders.filter(
    (o) => o.status === "fulfilled" || o.status === "shipped"
  ).length;

  // Get last 5 orders for display
  const latestOrders = recentOrders.slice(0, 5);

  const stats = [
    {
      name: t("dashboard.totalOrders"),
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      name: t("dashboard.totalRevenue"),
      value: `$${(totalRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: t("dashboard.pendingOrders"),
      value: pendingOrders.toString(),
      icon: Package,
      color: "bg-yellow-500",
    },
    {
      name: t("dashboard.completed"),
      value: completedOrders.toString(),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t("dashboard.title")}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("dashboard.recentOrders")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.order")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.customer")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.total")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.date")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("orders.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {latestOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {t("dashboard.noOrders")}
                  </td>
                </tr>
              ) : (
                latestOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {order.customerName || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          STATUS_COLORS[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {t(`status.${order.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(order.totalCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
      </div>
    </div>
  );
}
