import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const RECOVERY_IDLE_MS = 60 * 60 * 1000;
export const RECOVERY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const RECOVERY_LINK_MS = 7 * 24 * 60 * 60 * 1000;
export const recoveryEmailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .toLowerCase();
export const cartIdSchema = z.string().uuid();
export const recoveryTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function createRecoveryToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashRecoveryToken(token) };
}

export function hashRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export type RecoveryItem = {
  id: string;
  productTitle: string;
  productTitleFr: string | null;
  variantTitle: string;
  quantity: number;
  priceCents: number;
  available: boolean;
  attributes: {
    imageUrl?: string;
    borderStyle?: string;
    orientation?: "landscape" | "portrait";
  };
};

export type RecoveryCart = {
  id: string;
  status: string | null;
  updatedAt: Date | null;
  expiresAt: Date | null;
  hasOrder: boolean;
  items: RecoveryItem[];
  contact: {
    email: string;
    locale: "en" | "fr";
    consentedAt: Date;
    lastAttemptAt: Date | null;
    lastSentAt: Date | null;
    suppressed: boolean;
  } | null;
};

export type RecoveryBlock =
  | "unavailable"
  | "noEmail"
  | "unsubscribed"
  | "recentActivity"
  | "recentAttempt";

export function recoveryBlock(
  cart: RecoveryCart,
  now = new Date()
): RecoveryBlock | null {
  if (
    cart.status !== "active" ||
    cart.hasOrder ||
    !cart.items.length ||
    cart.items.some((item) => !item.available || item.quantity < 1) ||
    (cart.expiresAt && cart.expiresAt <= now)
  )
    return "unavailable";
  if (!cart.contact) return "noEmail";
  if (cart.contact.suppressed) return "unsubscribed";
  if (
    !cart.updatedAt ||
    now.getTime() - cart.updatedAt.getTime() < RECOVERY_IDLE_MS
  )
    return "recentActivity";
  if (
    cart.contact.lastAttemptAt &&
    now.getTime() - cart.contact.lastAttemptAt.getTime() < RECOVERY_COOLDOWN_MS
  )
    return "recentAttempt";
  return null;
}

// Bind the admin's preview to the recipient, consent and exact saved design.
export function recoveryFingerprint(cart: RecoveryCart) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        id: cart.id,
        updatedAt: cart.updatedAt,
        contact: cart.contact && {
          email: cart.contact.email,
          locale: cart.contact.locale,
          consentedAt: cart.contact.consentedAt,
        },
        items: [...cart.items].sort((a, b) => a.id.localeCompare(b.id)),
      })
    )
    .digest("hex");
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]!;
  });
}
