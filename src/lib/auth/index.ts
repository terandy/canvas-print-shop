import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "super_admin";
}

// Generate a JWT token for an admin user
export function generateToken(user: AdminUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify and decode a JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify a password against a hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
