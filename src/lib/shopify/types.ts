export type ExtractVariables<T> = T extends { variables: object }
    ? T["variables"]
    : never;

export type Menu = {
    title: string;
    path: string;
};

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
    altText: string;
    width: number;
    height: number;
};

export type SEO = {
    title: string;
    description: string;
};

export type ShopifyProduct = {
    id: string;
    handle: string;
    availableForSale: boolean;
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

export type CartProduct = {
    id: string;
    handle: string;
    title: string;
    featuredImage: Image;
};

export type CartItem = {
    id: string | undefined;
    quantity: number;
    cost: {
        totalAmount: Money;
    };
    merchandise: {
        id: string;
        title: string;
        selectedOptions: {
            name: string;
            value: string;
        }[];
        product: CartProduct;
    };
};

export type ShopifyCart = {
    id: string | undefined;
    checkoutUrl: string;
    cost: {
        subtotalAmount: Money;
        totalAmount: Money;
        totalTaxAmount: Money;
    };
    lines: Connection<CartItem>;
    totalQuantity: number;
};

export type Cart = Omit<ShopifyCart, "lines"> & {
    lines: CartItem[];
};

export type ShopifyCartOperation = {
    data: {
        cart: ShopifyCart;
    };
    variables: {
        cartId: string;
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
        }[];
    };
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
        }[];
    };
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
