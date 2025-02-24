export type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export type Menu = {
  title: string;
  path: string;
};

export type Attribute =
  | {
      key: string;
      value: string;
    }
  | { key: "imgURL"; value: string };

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

//--- Data structure returned by shopify ---
export type Edge<T> = {
  node: T;
};

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type SEO = {
  title: string | null;
  description: string | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type BorderStyle = "black" | "white" | "wrapped";

export type Product = Omit<ShopifyProduct, "variants" | "images"> & {
  variants: ProductVariant[];
  images: Image[];
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

// ----- CART -------

/**
 * Product information
 *
 * The cart item has a full product object.
 * Not all fields were listed here for simplicity and readability.
 */
export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

/**
 * The line item in the cart
 */
interface AbstractLineItem<
  S extends { name: string; value: string }[] = {
    name: string;
    value: string;
  }[],
  A extends Attribute[] = Attribute[],
> {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    /**
     * Options defined on shopify
     *
     * These options affect pricing:
     */
    selectedOptions: S;
    product: Product;
  };
  /**
   * Options defined in the code
   *
   * These options don't affect pricing:
   */
  attributes: A;
}

export type CanvasLineItem = AbstractLineItem<
  [
    { name: "size"; value: string /*8x10*/ },
    { name: "frame"; value: "black" | "none" },
  ],
  [
    { key: "imgURL"; value: string },
    { key: "direction"; value: "portrait" | "landscape" },
    { key: "borderStyle"; value: "black" | "white" | "wrapped" | "fill" },
  ]
>;

export type CanvasRollLineItem = AbstractLineItem<
  [{ name: "size"; value: string /*8x10*/ }],
  [
    { key: "imgURL"; value: string },
    { key: "direction"; value: "portrait" | "landscape" },
  ]
>;

export type LineItem = AbstractLineItem;

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<LineItem>;
  totalQuantity: number;
};

export type Cart = Omit<ShopifyCart, "lines"> & {
  lines: LineItem[];
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};
export type ShopifyAbandonedCartOperation = {
  data: {
    carts: ShopifyCart[];
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
      attributes: Attribute[];
    }[];
  };
};

export type UpdateCartItemOperation = {
  cartItemId: string;
  merchandiseId: string;
  quantity: number;
  attributes: Attribute[];
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
      attributes: Attribute[];
    }[];
  };
};

export type AddToCartOperation = {
  selectedVariantId: string | undefined;
  imgURL?: string;
  borderStyle: string;
  direction: string;
};

// ---- PAGE ------

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};
