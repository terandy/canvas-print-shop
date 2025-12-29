import type { Money } from "./common";

// Non-price attributes for canvas products
export interface CartItemAttributes {
  borderStyle?: string;
  imageUrl?: string;
  orientation?: "landscape" | "portrait";
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  priceCents: number;
  // Price-affecting options (from variant)
  selectedOptions: Record<string, string>;
  // Non-price attributes
  attributes: CartItemAttributes;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    taxAmount: Money;
    totalAmount: Money;
  };
}

// Payload for adding to cart
export interface AddToCartPayload {
  variantId: string;
  attributes: CartItemAttributes;
}

// Payload for updating cart item
export interface UpdateCartItemPayload {
  cartItemId: string;
  variantId: string;
  quantity: number;
  attributes: CartItemAttributes;
}
