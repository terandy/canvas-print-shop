"use server";

import { getAdminSession } from "@/lib/auth/session";
import { createCustomCheckoutSession } from "@/lib/stripe/checkout";
import { getTranslations } from "next-intl/server";

export interface CustomOrderFormState {
  error?: string;
  success?: boolean;
  paymentUrl?: string;
  fulfilment?: "delivery" | "montreal" | "quebec-city";
}

export async function createCustomOrderAction(
  prevState: CustomOrderFormState,
  formData: FormData
): Promise<CustomOrderFormState> {
  const getText = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const locale = getText("locale") === "fr" ? "fr" : "en";
  const t = await getTranslations({
    locale,
    namespace: "Admin.customOrder.errors",
  });
  const session = await getAdminSession();
  if (!session) {
    return { error: t("unauthorized") };
  }

  const description = getText("description");
  const customerEmail = getText("customerEmail");
  const customSize = getText("customSize") || undefined;
  const imageUrl = getText("imageUrl") || undefined;
  const fulfilment = getText("fulfilment");

  if (
    formData.getAll("fulfilment").length !== 1 ||
    (fulfilment !== "delivery" &&
      fulfilment !== "montreal" &&
      fulfilment !== "quebec-city")
  ) {
    return { error: t("fulfilmentRequired") };
  }

  if (!description) {
    return { error: t("descriptionRequired") };
  }
  if (!customerEmail) {
    return { error: t("emailRequired") };
  }

  const price = Number(getText("price"));
  const shipping =
    fulfilment === "delivery" ? Number(getText("shipping") || "0") : 0;

  if (!Number.isFinite(price) || price <= 0) {
    return { error: t("invalidPrice") };
  }
  if (!Number.isFinite(shipping) || shipping < 0) {
    return { error: t("invalidShipping") };
  }

  try {
    const stripeSession = await createCustomCheckoutSession({
      description,
      priceCents: Math.round(price * 100),
      shippingCents: Math.round(shipping * 100),
      fulfilmentMethod: fulfilment === "delivery" ? "delivery" : "pickup",
      pickupLocation: fulfilment === "delivery" ? undefined : fulfilment,
      customerEmail,
      locale,
      customSize,
      imageUrl,
    });

    if (!stripeSession.url) {
      return { error: t("createFailed") };
    }

    return { success: true, paymentUrl: stripeSession.url, fulfilment };
  } catch (error) {
    console.error("Failed to create custom order:", error);
    return { error: t("createFailed") };
  }
}
