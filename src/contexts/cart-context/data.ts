import { CartState } from "./types";

export const EMPTY_CART_STATE: CartState = {
  id: undefined,
  totalQuantity: 0,
  items: {},
  cost: {
    subtotalAmount: {
      amount: "0",
      currencyCode: "USD",
    },
    totalAmount: {
      amount: "0",
      currencyCode: "USD",
    },
    totalTaxAmount: {
      amount: "0",
      currencyCode: "USD",
    },
  },
};
