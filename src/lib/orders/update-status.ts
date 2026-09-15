import {
  addTrackingInfo,
  getOrder,
  updateOrderStatus,
} from "@/lib/db/queries/orders";
import { sendPickupReady, sendShippingUpdate } from "@/lib/email/send";
import { canSendPickupReady, isOrderStatus } from "./status";
import type { OrderStatus } from "@/types/order";

export type OrderUpdateError =
  | "unauthorized"
  | "missingFields"
  | "unknownStatus"
  | "notFound"
  | "invalidPickup"
  | "invalidResend"
  | "pickupEmailFailed"
  | "updateFailed";

export type OrderUpdateResult = {
  success: boolean;
  error?: OrderUpdateError;
  /** Present when the status was saved, including a subsequent email failure. */
  status?: OrderStatus;
  pickupEmailSent?: boolean;
};

/** Shared by the authenticated server action and admin API. */
export async function updateStatusWithNotification(input: {
  orderId: string;
  status: unknown;
  trackingNumber?: string;
  trackingUrl?: string;
  resendPickupEmail?: boolean;
}): Promise<OrderUpdateResult> {
  const { orderId, status, trackingNumber, trackingUrl, resendPickupEmail } =
    input;
  if (!orderId || !status) return { success: false, error: "missingFields" };
  if (typeof status !== "string" || !isOrderStatus(status)) {
    return { success: false, error: "unknownStatus" };
  }

  try {
    const order = await getOrder(orderId);
    if (!order) return { success: false, error: "notFound" };

    if (
      (status === "ready_for_pickup" || resendPickupEmail) &&
      !canSendPickupReady(order)
    ) {
      return { success: false, error: "invalidPickup" };
    }
    if (
      resendPickupEmail &&
      (order.status !== "ready_for_pickup" || status !== "ready_for_pickup")
    ) {
      return { success: false, error: "invalidResend" };
    }

    if (!resendPickupEmail) {
      // Repeated form/API submissions must not send another pickup email.
      // Resending is an explicit operation and never rewrites the order.
      if (
        status === order.status &&
        !(status === "shipped" && trackingNumber)
      ) {
        return { success: true, status };
      }
      if (status === "shipped" && trackingNumber) {
        await addTrackingInfo(
          orderId,
          trackingNumber,
          trackingUrl || undefined
        );
      } else {
        await updateOrderStatus(orderId, status);
      }
    }

    const locale = order.locale === "fr" ? "fr" : "en";
    if (status === "ready_for_pickup") {
      try {
        await sendPickupReady(order, locale);
      } catch (error) {
        console.error("Failed to send pickup ready email:", error);
        return { success: false, status, error: "pickupEmailFailed" };
      }
      return { success: true, status, pickupEmailSent: true };
    }

    if (status === "shipped" && trackingNumber) {
      try {
        await sendShippingUpdate(
          order,
          trackingNumber,
          trackingUrl || undefined,
          locale
        );
      } catch (error) {
        console.error("Failed to send shipping update email:", error);
      }
    }
    return { success: true, status };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "updateFailed" };
  }
}
