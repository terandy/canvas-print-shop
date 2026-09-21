import type { Cart } from "../../src/types/cart";
export const hostedCart: Cart = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  totalQuantity: 5,
  items: [
    {
      id: "framed",
      variantId: "fixture-framed",
      productId: "fixture",
      productHandle: "canvas",
      productTitle: "UNPAID QA — framed canvas",
      variantTitle: "30x40",
      quantity: 2,
      priceCents: 10000,
      selectedOptions: { size: "30x40", frame: "black" },
      attributes: {},
    },
    {
      id: "rolled",
      variantId: "fixture-rolled",
      productId: "fixture",
      productHandle: "rolled-canvas-prints",
      productTitle: "UNPAID QA — rolled canvas",
      variantTitle: "16x24",
      quantity: 3,
      priceCents: 10000,
      selectedOptions: { size: "16x24", frame: "none" },
      attributes: {},
    },
  ],
  cost: {
    subtotalAmount: { amount: "500.00", currencyCode: "CAD" },
    taxAmount: { amount: "0.00", currencyCode: "CAD" },
    totalAmount: { amount: "500.00", currencyCode: "CAD" },
  },
};
