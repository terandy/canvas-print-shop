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
  role: "admin" | "super_admin" = "admin"
): Promise<AdminUser> {
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(adminUsers)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
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
