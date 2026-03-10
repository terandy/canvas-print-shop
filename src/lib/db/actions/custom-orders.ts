"use server";

import { getAdminSession } from "@/lib/auth/session";
import { createCustomCheckoutSession } from "@/lib/stripe/checkout";

export interface CustomOrderFormState {
  error?: string;
  success?: boolean;
  paymentUrl?: string;
}

export async function createCustomOrderAction(
  prevState: CustomOrderFormState,
  formData: FormData
): Promise<CustomOrderFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const description = (formData.get("description") as string)?.trim();
  const customerEmail = (formData.get("customerEmail") as string)?.trim();
  const priceStr = formData.get("price") as string;
  const shippingStr = formData.get("shipping") as string;
  const customSize = (formData.get("customSize") as string)?.trim() || undefined;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || undefined;
  const locale = (formData.get("locale") as string) || "en";

  if (!description) {
    return { error: "Description is required" };
  }
  if (!customerEmail) {
    return { error: "Customer email is required" };
  }

  const price = parseFloat(priceStr);
  const shipping = parseFloat(shippingStr || "0");

  if (isNaN(price) || price <= 0) {
    return { error: "Price must be a positive number" };
  }
  if (isNaN(shipping) || shipping < 0) {
    return { error: "Shipping must be a non-negative number" };
  }

  try {
    const stripeSession = await createCustomCheckoutSession({
      description,
      priceCents: Math.round(price * 100),
      shippingCents: Math.round(shipping * 100),
      customerEmail,
      locale,
      customSize,
      imageUrl,
    });

    if (!stripeSession.url) {
      return { error: "Failed to create payment link" };
    }

    return { success: true, paymentUrl: stripeSession.url };
  } catch (error) {
    console.error("Failed to create custom order:", error);
    return { error: "Failed to create payment link. Please try again." };
  }
}
