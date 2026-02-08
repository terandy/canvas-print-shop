import crypto from "crypto";
import { eq, and, isNull, lt } from "drizzle-orm";
import { db } from "../index";
import { passwordResetTokens } from "../schema";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function createPasswordResetToken(
  adminUserId: string
): Promise<string> {
  // Delete any existing unused tokens for this user
  await db
    .delete(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.adminUserId, adminUserId),
        isNull(passwordResetTokens.usedAt)
      )
    );

  // Also clean up expired tokens
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await db.insert(passwordResetTokens).values({
    adminUserId,
    token,
    expiresAt,
  });

  return token;
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ id: string; adminUserId: string } | null> {
  const [result] = await db
    .select({
      id: passwordResetTokens.id,
      adminUserId: passwordResetTokens.adminUserId,
      expiresAt: passwordResetTokens.expiresAt,
    })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt)
      )
    );

  if (!result) return null;

  if (result.expiresAt < new Date()) return null;

  return { id: result.id, adminUserId: result.adminUserId };
}

export async function markTokenUsed(tokenId: string): Promise<void> {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));
}
