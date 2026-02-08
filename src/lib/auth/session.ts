import { cookies } from "next/headers";
import { verifyToken, type JWTPayload } from "./index";

const ADMIN_TOKEN_COOKIE = "admin_token";

// Get the current admin session from cookies
export async function getAdminSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Set the admin session cookie
export async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Clear the admin session cookie
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_COOKIE);
}

// Check if user is authenticated (for use in server components)
export async function requireAdmin(): Promise<JWTPayload> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
