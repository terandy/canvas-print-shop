import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getActiveCarts, parseCartPage } from "@/lib/db/queries/admin-carts";

export default async function AdminCartsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Admin");
  const currentPage = parseCartPage((await searchParams).page);
  const { carts, hasNextPage } = await getActiveCarts(currentPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("carts.title")}</h1>
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

      {(currentPage > 1 || hasNextPage) && (
        <nav
          aria-label={t("carts.pagination")}
          className="mt-6 flex items-center justify-between"
        >
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
            >
              {t("carts.previous")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-600">
            {t("carts.pageNumber", { page: currentPage })}
          </span>
          {hasNextPage ? (
            <Link
              href={`?page=${currentPage + 1}`}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
            >
              {t("carts.next")}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
