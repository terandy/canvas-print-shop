import { getTranslations } from "next-intl/server";
import { getActiveCarts } from "@/lib/db/queries/admin-carts";

export default async function AdminCartsPage() {
  const t = await getTranslations("Admin");
  const carts = await getActiveCarts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("carts.title")}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.cartId")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.customer")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.items")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.total")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.created")}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("carts.updated")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {t("carts.noCarts")}
                  </td>
                </tr>
              ) : (
                carts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className="font-mono text-sm text-gray-900"
                        title={cart.id}
                      >
                        {cart.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {cart.customerEmail ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {cart.customerName || "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {cart.customerEmail}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          {t("carts.anonymous")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm text-gray-500">
                        {cart.itemCount}{" "}
                        {cart.itemCount !== 1
                          ? t("carts.itemPlural")
                          : t("carts.itemSingular")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {cart.items.map((item, i) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            {item.quantity}x {item.productTitle}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ${(cart.totalCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {cart.createdAt
                        ? new Date(cart.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {cart.updatedAt
                        ? new Date(cart.updatedAt).toLocaleDateString()
                        : "-"}
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
