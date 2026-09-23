"use server";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { hostedCheckoutSchema } from "@/lib/shipping/hosted-checkout";
import { createHostedCheckoutSession } from "@/lib/stripe/hosted-checkout";
import { checkoutErrorDetails } from "@/lib/stripe/errors";

export async function startHostedCheckout(
  input: unknown,
  fingerprint: string
): Promise<
  | { ok: true; url: string }
  | {
      ok: false;
      code:
        | "invalid-cart"
        | "invalid-address"
        | "invalid-code"
        | "cart-changed"
        | "unavailable";
    }
> {
  const cartId = (await cookies()).get("cartId")?.value;
  if (
    !cartId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      cartId
    )
  )
    return { ok: false, code: "invalid-cart" };
  if (!hostedCheckoutSchema.safeParse(input).success)
    return { ok: false, code: "invalid-address" };
  if (typeof fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(fingerprint))
    return { ok: false, code: "cart-changed" };
  try {
    const locale = (await getLocale()) === "fr" ? "fr" : "en";
    const session = await createHostedCheckoutSession(
      cartId,
      locale,
      input,
      fingerprint
    );
    if (!session.url || new URL(session.url).hostname !== "checkout.stripe.com")
      throw new Error("Missing hosted checkout URL");
    return { ok: true, url: session.url };
  } catch (error) {
    if (error instanceof Error && error.message === "cart-changed")
      return { ok: false, code: "cart-changed" };
    if (error instanceof Error && error.message === "empty-cart")
      return { ok: false, code: "invalid-cart" };
    if (error instanceof Error && error.message === "invalid-code")
      return { ok: false, code: "invalid-code" };
    console.error(
      "Unable to create hosted checkout",
      checkoutErrorDetails(error)
    );
    return { ok: false, code: "unavailable" };
  }
}
