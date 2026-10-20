import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getRecoveryCart } from "@/lib/db/queries/cart-recovery";
import { recoveryBlock, recoveryFingerprint } from "@/lib/cart-recovery/shared";
import { renderCartRecoveryEmail } from "@/lib/email/cart-recovery";
import CartRecoveryForm from "@/components/admin/cart-recovery-form";

export default async function AdminCartPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  if (!(await getAdminSession())) {
    redirect(
      `/${locale}/admin/login?redirectTo=${encodeURIComponent(`/admin/carts/${id}`)}`
    );
  }
  const t = await getTranslations("Admin.cartRecovery");
  const borderText = await getTranslations("Product.borderStyle");
  const cart = await getRecoveryCart(id);
  if (!cart) notFound();
  const blocked = recoveryBlock(cart);
  const preview = renderCartRecoveryEmail(cart, "#", "#");
  const date = (value: Date) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Toronto",
    }).format(value);
  return (
    <div className="max-w-5xl space-y-6">
      <Link
        href={`/${locale}/admin/carts`}
        className="text-sm text-primary-dark underline"
      >
        {t("back")}
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 font-mono text-sm text-gray-500">{cart.id}</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">{t("items")}</h2>
          <ul className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                {item.attributes.imageUrl?.startsWith("https://") && (
                  // The original saved upload is shown without transforming it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.attributes.imageUrl}
                    alt={t("image")}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded object-contain bg-gray-50"
                  />
                )}
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">
                    {locale === "fr"
                      ? item.productTitleFr || item.productTitle
                      : item.productTitle}
                  </p>
                  <p>{item.variantTitle}</p>
                  {item.attributes.borderStyle && (
                    <p>
                      {t("border")}:{" "}
                      {borderText.has(item.attributes.borderStyle)
                        ? borderText(item.attributes.borderStyle)
                        : item.attributes.borderStyle}
                    </p>
                  )}
                  {item.attributes.orientation && (
                    <p>{t(item.attributes.orientation)}</p>
                  )}
                  <p>
                    {item.quantity} × ${(item.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="font-semibold">
            {t("subtotal")}: $
            {(
              cart.items.reduce(
                (sum, item) => sum + item.quantity * item.priceCents,
                0
              ) / 100
            ).toFixed(2)}{" "}
            CAD
          </p>
          {cart.updatedAt && (
            <p className="text-sm text-gray-600">
              {t("updated", { date: date(cart.updatedAt) })}
            </p>
          )}
        </section>
        <section className="space-y-4 rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">{t("preview")}</h2>
          {cart.contact ? (
            <>
              <dl className="text-sm">
                <dt className="text-gray-500">{t("to")}</dt>
                <dd>{cart.contact.email}</dd>
                <dt className="mt-2 text-gray-500">{t("language")}</dt>
                <dd>{t(cart.contact.locale)}</dd>
                <dt className="mt-2 text-gray-500">{t("consent")}</dt>
                <dd>{date(cart.contact.consentedAt)}</dd>
              </dl>
              {cart.contact.lastSentAt && (
                <p className="text-sm">
                  {t("lastSent", { date: date(cart.contact.lastSentAt) })}
                </p>
              )}
              {cart.contact.lastAttemptAt &&
                (!cart.contact.lastSentAt ||
                  cart.contact.lastAttemptAt > cart.contact.lastSentAt) && (
                  <p className="text-sm text-amber-800">
                    {t("lastAttempt", {
                      date: date(cart.contact.lastAttemptAt),
                    })}
                  </p>
                )}
              <p className="text-sm font-semibold">{preview.subject}</p>
              {blocked ? (
                <p className="text-sm text-gray-600">{t(blocked)}</p>
              ) : (
                <CartRecoveryForm
                  cartId={cart.id}
                  fingerprint={recoveryFingerprint(cart)}
                />
              )}
              <iframe
                title={t("preview")}
                srcDoc={preview.html}
                sandbox=""
                className="h-[620px] w-full rounded border border-gray-200"
              />
            </>
          ) : (
            <p className="text-sm text-gray-600">{t("noEmail")}</p>
          )}
        </section>
      </div>
    </div>
  );
}
