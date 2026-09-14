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
      className="border-b border-secondary/10 bg-[#FCFBF8]"
      aria-labelledby="rolled-buying-guide"
    >
      <div className="mx-auto max-w-[1360px] px-6 py-16 sm:px-10 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark">
              {t("eyebrow")}
            </p>
            <h2
              id="rolled-buying-guide"
              className="mt-4 max-w-xl font-serif text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl"
            >
              {t("title")}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-gray lg:justify-self-end">
            {t("description")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          {/* Image size and total sheet size stay separate because confusing
              them is the most consequential rolled-print ordering mistake. */}
          <div>
            <div className="overflow-x-auto border border-secondary/15 bg-white">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <caption className="sr-only">{t("table.caption")}</caption>
                <thead className="bg-secondary text-[10px] uppercase tracking-[0.15em] text-white/65">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">
                      {t("table.imageSize")}
                    </th>
                    <th
                      scope="col"
                      className="border-x border-white/15 px-5 py-4 font-medium"
                    >
                      {t("table.totalSize", {
                        margin: STRETCHING_MARGIN_INCHES,
                      })}
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-right font-medium"
                    >
                      {t("table.price")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10">
                  {rows.map((row) => (
                    <tr
                      key={row.size}
                      className="transition-colors hover:bg-[#F3F1EB]/65"
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 font-medium text-secondary"
                      >
                        {formatInches(row.image.width, row.image.height)}
                        <span className="ml-2 font-normal text-gray">
                          {formatCentimetres(row.image.width, row.image.height)}
                        </span>
                      </th>
                      <td className="border-x border-secondary/10 px-5 py-4 text-gray">
                        {formatInches(row.total.width, row.total.height)}
                      </td>
                      <td className="px-5 py-4 text-right font-serif text-lg text-secondary">
                        {money(row.priceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-6 text-gray">
              {t("table.footnote", { margin: STRETCHING_MARGIN_INCHES })}
            </p>
          </div>

          {/* This stays explicit: the print is deliberately unfinished and no
              ready-to-hang hardware is implied by the shared visual style. */}
          <aside className="bg-secondary p-6 text-[#FCFBF8] sm:p-8">
            <h3 className="font-serif text-2xl tracking-[-0.02em]">
              {t("contents.title")}
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {included.map((key) => (
                <li key={key} className="flex gap-3 text-white/85">
                  <Check
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AE87]"
                    strokeWidth={1.6}
                  />
                  {t(`contents.included.${key}`)}
                </li>
              ))}
              {notIncluded.map((key) => (
                <li key={key} className="flex gap-3 text-white/55">
                  <X
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-white/40"
                    strokeWidth={1.4}
                  />
                  {t(`contents.notIncluded.${key}`)}
                </li>
              ))}
            </ul>
            <p className="mt-7 flex gap-3 border-t border-white/15 pt-6 text-xs leading-6 text-white/70">
              <AlertTriangle
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AE87]"
                strokeWidth={1.5}
              />
              {t("contents.notReadyToHang")}
            </p>
          </aside>
        </div>

        <div className="mt-10 grid border-y border-secondary/15 md:grid-cols-2 md:divide-x md:divide-secondary/15">
          <div className="py-7 md:pr-8">
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

          <div className="border-t border-secondary/15 py-7 md:border-t-0 md:pl-8">
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
