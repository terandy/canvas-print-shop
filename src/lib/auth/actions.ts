"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticateAdmin } from "@/lib/db/queries/admin-users";
import { getOrder, updateOrderStatus, addTrackingInfo } from "@/lib/db/queries/orders";
import { sendShippingUpdate } from "@/lib/email/send";
import { generateToken } from "./index";
import { setAdminSession, clearAdminSession, getAdminSession } from "./session";

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await authenticateAdmin(email, password);

    if (!user) {
      return { error: "Invalid credentials" };
    }

    const token = generateToken(user);
    await setAdminSession(token);

    return { success: true };
  } catch {
    return { error: "An error occurred. Please try again." };
  }
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

// Order Status Update Action
export interface OrderStatusState {
  error?: string;
  success?: boolean;
}

export async function updateOrderStatusAction(
  prevState: OrderStatusState,
  formData: FormData
): Promise<OrderStatusState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const trackingUrl = formData.get("trackingUrl") as string;

  if (!orderId || !status) {
    return { error: "Order ID and status are required" };
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { error: "Order not found" };
    }

    // Update order status (use addTrackingInfo if shipping with tracking number)
    if (status === "shipped" && trackingNumber) {
      await addTrackingInfo(orderId, trackingNumber, trackingUrl || undefined);
    } else {
      await updateOrderStatus(orderId, status as any);
    }

    // If status is "shipped" and we have a tracking number, send shipping email
    if (status === "shipped" && trackingNumber) {
      try {
        const locale = "en";
        await sendShippingUpdate(order, trackingNumber, trackingUrl || undefined, locale);
      } catch {
        // Don't fail the request if email fails
      }
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true };
  } catch {
    return { error: "Failed to update order status" };
  }
}
