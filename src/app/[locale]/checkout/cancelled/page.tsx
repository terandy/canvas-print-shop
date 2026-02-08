import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CheckoutCancelledPage() {
  const t = await getTranslations("Checkout.cancelled");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <XCircle className="h-10 w-10 text-gray-600" />
      </div>

      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <p className="mt-4 text-gray-600">{t("message")}</p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/cart"
          className="inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          {t("returnToCart")}
        </Link>
        <Link
          href="/"
          className="inline-block rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
