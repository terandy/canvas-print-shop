import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HostedCheckout from "@/components/checkout/hosted-checkout";
import { getHostedCheckoutSummary } from "@/lib/stripe/hosted-checkout";
import * as cartDb from "@/lib/db/queries/carts";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { locale: requestedLocale } = await params;
  const locale = requestedLocale === "fr" ? "fr" : "en";
  const t = await getTranslations({ locale, namespace: "Checkout.page" });
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const validCartId =
    cartId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      cartId
    );
  const cart = validCartId ? await cartDb.getCart(cartId) : undefined;

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-secondary">{t("title")}</h1>
        <p className="mt-4 text-gray">{t("emptyCart")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
        >
          {t("returnHome")}
        </Link>
      </main>
    );
  }

  let summary;
  try {
    summary = getHostedCheckoutSummary(cart);
  } catch {
    /* Show the saved-cart recovery path below. */
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-dark">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-secondary sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray">{t("intro")}</p>
      </div>

      <div>
        {summary ? (
          <HostedCheckout summary={summary} />
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="font-medium text-secondary">{t("unavailable")}</p>
            <a
              href="mailto:info@canvasprintshop.ca"
              className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
            >
              {t("contactUs")}
            </a>
          </div>
        )}
      </div>

      <div className="mt-7 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-secondary underline underline-offset-4 hover:text-primary-dark"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </main>
  );
}
