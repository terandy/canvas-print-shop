"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  authenticateAdmin,
  getAdminByEmail,
  updateAdminPassword,
} from "@/lib/db/queries/admin-users";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenUsed,
} from "@/lib/db/queries/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { generateToken } from "./index";
import { setAdminSession, clearAdminSession, getAdminSession } from "./session";
import {
  updateStatusWithNotification,
  type OrderUpdateResult,
} from "@/lib/orders/update-status";

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

// Password Reset Actions
export interface PasswordResetRequestState {
  error?: string;
  success?: boolean;
}

export async function requestPasswordResetAction(
  prevState: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const user = await getAdminByEmail(email);

    if (user) {
      const token = await createPasswordResetToken(user.id);
      try {
        await sendPasswordResetEmail(user.email, user.name, token);
      } catch {
        // Don't fail if email fails to send
      }
    }

    // Always return success to prevent email enumeration
    return { success: true };
  } catch {
    return { success: true };
  }
}

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

export async function resetPasswordAction(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "passwordMismatch" };
  }

  if (!isValidPassword(password)) {
    return { error: "passwordRequirements" };
  }

  try {
    const result = await verifyPasswordResetToken(token);

    if (!result) {
      return { error: "invalidToken" };
    }

    await updateAdminPassword(result.adminUserId, password);
    await markTokenUsed(result.id);

    return { success: true };
  } catch {
    return { error: "An error occurred. Please try again." };
  }
}

// Order Status Update Action
export type OrderStatusState = Partial<OrderUpdateResult>;

export async function updateOrderStatusAction(
  prevState: OrderStatusState,
  formData: FormData
): Promise<OrderStatusState> {
  if (!(await getAdminSession())) {
    return { success: false, error: "unauthorized" };
  }
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const orderId = field("orderId");
  const result = await updateStatusWithNotification({
    orderId,
    status: field("status"),
    trackingNumber: field("trackingNumber"),
    trackingUrl: field("trackingUrl"),
    resendPickupEmail: field("intent") === "resendPickupEmail",
  });
  if (result.status) {
    for (const locale of ["en", "fr"]) {
      revalidatePath(`/${locale}/admin/orders/${orderId}`);
      revalidatePath(`/${locale}/admin/orders`);
      revalidatePath(`/${locale}/admin`);
    }
  }
  return result;
}
