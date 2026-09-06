import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";
import type { Product } from "@/types/product";
import {
  formatCentimetres,
  formatInches,
  getRolledSizeRows,
  STRETCHING_MARGIN_INCHES,
} from "@/lib/rolled-canvas";
import { BUSINESS_DATA } from "@/lib/business-data";

/**
 * The buying information a rolled print needs and a stretched one does not:
 * what the price is at each size before you open the configurator, how much
 * canvas actually arrives once the stretching margin is added, and what is
 * plainly not in the tube.
 *
 * Rendered on the server so the prices are in the initial HTML rather than
 * only reachable by working the configurator.
 */
export default async function RolledBuyingGuide({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const t = await getTranslations("Product.rollsPage.buyingGuide");
  const rows = getRolledSizeRows(product);
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const { max } =
    BUSINESS_DATA.productionAndDelivery.orderToDeliveryBusinessDays;

  const included = ["print", "margin", "prepress"] as const;
  const notIncluded = ["bars", "hardware", "assembly"] as const;

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20"
      aria-labelledby="rolled-buying-guide"
    >
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
          {t("eyebrow")}
        </p>
        <h2
          id="rolled-buying-guide"
          className="mb-3 text-2xl font-bold text-secondary sm:text-3xl"
        >
          {t("title")}
        </h2>
        <p className="text-gray">{t("description")}</p>
      </div>

      {/* Size and price table. Image size and total sheet size are separate
          columns because confusing the two is the single most common way a
          rolled canvas order goes wrong. */}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">{t("table.caption")}</caption>
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-gray">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                {t("table.imageSize")}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                {t("table.totalSize", { margin: STRETCHING_MARGIN_INCHES })}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                {t("table.price")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {rows.map((row) => (
              <tr key={row.size}>
                <th
                  scope="row"
                  className="px-4 py-3 font-medium text-secondary"
                >
                  {formatInches(row.image.width, row.image.height)}
                  <span className="ml-2 font-normal text-gray">
                    {formatCentimetres(row.image.width, row.image.height)}
                  </span>
                </th>
                <td className="px-4 py-3 text-gray">
                  {formatInches(row.total.width, row.total.height)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-secondary">
                  {money(row.priceCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray">
        {t("table.footnote", { margin: STRETCHING_MARGIN_INCHES })}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* What is and is not in the tube. Stated plainly because a rolled
            print is not ready to hang and that must not be a surprise. */}
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h3 className="mb-4 font-semibold text-secondary">
            {t("contents.title")}
          </h3>
          <ul className="space-y-2 text-sm">
            {included.map((key) => (
              <li key={key} className="flex gap-2.5 text-secondary">
                <Check
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                />
                {t(`contents.included.${key}`)}
              </li>
            ))}
            {notIncluded.map((key) => (
              <li key={key} className="flex gap-2.5 text-gray">
                <X
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                />
                {t(`contents.notIncluded.${key}`)}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm leading-relaxed text-secondary">
            <AlertTriangle
              aria-hidden
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            />
            {t("contents.notReadyToHang")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="mb-3 font-semibold text-secondary">
              {t("upload.title")}
            </h3>
            <p className="text-sm leading-relaxed text-gray">
              {t("upload.body")}
            </p>
            <Link
              href={`/${locale}/blog/what-resolution-do-i-need-for-a-canvas-print`}
              className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              {t("upload.link")}
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-6">
            <h3 className="mb-3 font-semibold text-secondary">
              {t("delivery.title")}
            </h3>
            <p className="text-sm leading-relaxed text-gray">
              {t("delivery.body", { max })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray">
              {t("delivery.pickup")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
