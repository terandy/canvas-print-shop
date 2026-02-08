"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminUsers, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth/session";
import {
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  countSuperAdmins,
  getAdminByEmail,
} from "@/lib/db/queries/admin-users";

// ============================================
// ADMIN USER ACTIONS
// ============================================

export interface AdminUserFormState {
  error?: string;
  success?: boolean;
  userId?: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password: string): boolean {
  // Minimum 8 characters, must contain at least one letter and one number
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

// Create admin user action
export async function createAdminUserAction(
  prevState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Check if user is super_admin
  if (session.role !== "super_admin") {
    return { error: "Only super admins can create admin users" };
  }

  const email = (formData.get("email") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "admin";
  const isActive = formData.get("isActive") === "true";
  const receiveOrderEmails = formData.get("receiveOrderEmails") === "true";

  // Validation
  if (!email || !name || !password) {
    return { error: "Email, name, and password are required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Invalid email format" };
  }

  if (!isValidPassword(password)) {
    return {
      error: "Password must be at least 8 characters and contain a letter and number",
    };
  }

  if (role !== "admin" && role !== "super_admin") {
    return { error: "Invalid role" };
  }

  // Check if email already exists
  const existingUser = await getAdminByEmail(email);
  if (existingUser) {
    return { error: "An admin with this email already exists" };
  }

  try {
    const newUser = await createAdminUser(
      email,
      password,
      name,
      role as "admin" | "super_admin",
      receiveOrderEmails
    );

    // Set isActive if not default
    if (!isActive) {
      await updateAdminUser(newUser.id, { isActive });
    }

    // Log activity
    await db.insert(activityLog).values({
      adminUserId: session.userId,
      action: "create_admin_user",
      entityType: "admin_user",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    revalidatePath("/admin/users");
    return { success: true, userId: newUser.id };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return { error: "Failed to create admin user" };
  }
}

// Update admin user action
export async function updateAdminUserAction(
  prevState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Check if user is super_admin
  if (session.role !== "super_admin") {
    return { error: "Only super admins can update admin users" };
  }

  const userId = formData.get("userId") as string;
  const email = (formData.get("email") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const role = (formData.get("role") as string) || "admin";
  const isActive = formData.get("isActive") === "true";
  const receiveOrderEmails = formData.get("receiveOrderEmails") === "true";

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Validation
  if (!email || !name) {
    return { error: "Email and name are required" };
  }

  if (!isValidEmail(email)) {
    return { error: "Invalid email format" };
  }

  if (password && !isValidPassword(password)) {
    return {
      error: "Password must be at least 8 characters and contain a letter and number",
    };
  }

  if (role !== "admin" && role !== "super_admin") {
    return { error: "Invalid role" };
  }

  // Prevent self-role-demotion from super_admin
  if (userId === session.userId && session.role === "super_admin" && role !== "super_admin") {
    return { error: "You cannot change your own role" };
  }

  // Check if email is being changed and if new email already exists
  const existingUser = await getAdminByEmail(email);
  if (existingUser && existingUser.id !== userId) {
    return { error: "Another admin with this email already exists" };
  }

  try {
    const updateData: {
      email: string;
      name: string;
      role: "admin" | "super_admin";
      isActive: boolean;
      receiveOrderEmails: boolean;
      password?: string;
    } = {
      email,
      name,
      role: role as "admin" | "super_admin",
      isActive,
      receiveOrderEmails,
    };

    if (password) {
      updateData.password = password;
    }

    await updateAdminUser(userId, updateData);

    // Log activity
    await db.insert(activityLog).values({
      adminUserId: session.userId,
      action: "update_admin_user",
      entityType: "admin_user",
      entityId: userId,
      details: { email, role },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, userId };
  } catch (error: any) {
    console.error("Error updating admin user:", error);
    return { error: "Failed to update admin user" };
  }
}

// Delete admin user action
export async function deleteAdminUserAction(
  userId: string
): Promise<AdminUserFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Check if user is super_admin
  if (session.role !== "super_admin") {
    return { error: "Only super admins can delete admin users" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Prevent self-deletion
  if (userId === session.userId) {
    return { error: "You cannot delete your own account" };
  }

  // Check if this is the last super_admin
  const superAdminCount = await countSuperAdmins();
  const userToDelete = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);

  if (userToDelete[0]?.role === "super_admin" && superAdminCount <= 1) {
    return { error: "Cannot delete the last super admin" };
  }

  try {
    await deleteAdminUser(userId);

    // Log activity
    await db.insert(activityLog).values({
      adminUserId: session.userId,
      action: "delete_admin_user",
      entityType: "admin_user",
      entityId: userId,
      details: {},
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting admin user:", error);
    return { error: "Failed to delete admin user" };
  }
}

// Toggle admin active status
export async function toggleAdminActiveAction(
  userId: string,
  isActive: boolean
): Promise<AdminUserFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Check if user is super_admin
  if (session.role !== "super_admin") {
    return { error: "Only super admins can change admin status" };
  }

  if (!userId) {
    return { error: "User ID is required" };
  }

  // Prevent self-deactivation
  if (userId === session.userId && !isActive) {
    return { error: "You cannot deactivate your own account" };
  }

  try {
    await updateAdminUser(userId, { isActive });

    // Log activity
    await db.insert(activityLog).values({
      adminUserId: session.userId,
      action: isActive ? "activate_admin_user" : "deactivate_admin_user",
      entityType: "admin_user",
      entityId: userId,
      details: { isActive },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling admin status:", error);
    return { error: "Failed to update admin status" };
  }
}
