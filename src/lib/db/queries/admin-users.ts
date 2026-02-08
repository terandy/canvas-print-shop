import { eq } from "drizzle-orm";
import { db } from "../index";
import { adminUsers } from "../schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import type { AdminUser } from "@/lib/auth";

// Get admin user by email
export async function getAdminByEmail(
  email: string
): Promise<(typeof adminUsers.$inferSelect) | undefined> {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()));

  return user;
}

// Get admin user by ID
export async function getAdminById(
  id: string
): Promise<AdminUser | undefined> {
  const [user] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id));

  if (!user) return undefined;

  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: user.role as "admin" | "super_admin",
  };
}

// Get admin user by ID with all fields (for editing)
export async function getAdminByIdWithDetails(id: string) {
  const [user] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      receiveOrderEmails: adminUsers.receiveOrderEmails,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id));

  return user;
}

// Get all admin users (excluding password hash)
export async function getAllAdminUsers() {
  const users = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      receiveOrderEmails: adminUsers.receiveOrderEmails,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(adminUsers.createdAt);

  return users;
}

// Get admins who should receive order notification emails
export async function getAdminUsersForOrderEmails(): Promise<
  Array<{ email: string; name: string | null }>
> {
  const users = await db
    .select({
      email: adminUsers.email,
      name: adminUsers.name,
    })
    .from(adminUsers)
    .where(eq(adminUsers.receiveOrderEmails, true));

  return users;
}

// Authenticate admin user
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const user = await getAdminByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: user.role as "admin" | "super_admin",
  };
}

// Create admin user (for initial setup)
export async function createAdminUser(
  email: string,
  password: string,
  name: string,
  role: "admin" | "super_admin" = "admin",
  receiveOrderEmails: boolean = false
): Promise<AdminUser> {
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(adminUsers)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      receiveOrderEmails,
    })
    .returning();

  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: user.role as "admin" | "super_admin",
  };
}

// Update admin password
export async function updateAdminPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const passwordHash = await hashPassword(newPassword);

  await db
    .update(adminUsers)
    .set({ passwordHash })
    .where(eq(adminUsers.id, userId));
}

// Update admin user details
export async function updateAdminUser(
  userId: string,
  data: {
    email?: string;
    name?: string;
    role?: "admin" | "super_admin";
    isActive?: boolean;
    receiveOrderEmails?: boolean;
    password?: string;
  }
): Promise<void> {
  const updateData: Record<string, unknown> = {};

  if (data.email !== undefined) {
    updateData.email = data.email.toLowerCase();
  }
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.role !== undefined) {
    updateData.role = data.role;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }
  if (data.receiveOrderEmails !== undefined) {
    updateData.receiveOrderEmails = data.receiveOrderEmails;
  }
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, userId));
}

// Delete admin user
export async function deleteAdminUser(userId: string): Promise<void> {
  await db.delete(adminUsers).where(eq(adminUsers.id, userId));
}

// Count super admin users
export async function countSuperAdmins(): Promise<number> {
  const result = await db
    .select({
      id: adminUsers.id,
    })
    .from(adminUsers)
    .where(eq(adminUsers.role, "super_admin"));

  return result.length;
}
