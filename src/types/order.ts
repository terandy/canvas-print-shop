import type { Address, Money } from "./common";
import type { CartItemAttributes } from "./cart";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface OrderItem {
  id: string;
  variantId: string | null;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  priceCents: number;
  price: Money; // Formatted for display
  selectedOptions: Record<string, string>;
  attributes: CartItemAttributes;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerId: string | null;

  // Stripe references
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;

  // Pricing
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;

  // Formatted pricing for display
  subtotal: Money;
  tax: Money;
  shipping: Money;
  total: Money;

  // Addresses
  shippingAddress: Address | null;
  billingAddress: Address | null;

  // Customer info
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;

  // Tracking
  trackingNumber: string | null;
  trackingUrl: string | null;
  notes: string | null;

  // Items
  items: OrderItem[];

  // Timestamps
  paidAt: Date | null;
  shippedAt: Date | null;
  fulfilledAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// For creating orders from Stripe webhook
export interface CreateOrderFromCheckout {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string;
  cartId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

// For creating orders from custom checkout (no cart)
export interface CreateOrderFromCustomCheckout {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  description: string;
  customSize?: string;
  imageUrl?: string;
}
