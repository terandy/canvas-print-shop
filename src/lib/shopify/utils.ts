
import * as types from "./types";

/**
 * Converts a connection into an array of nodes
 */
export const toNodeArray = <T>(conn: types.Connection<T>): T[] => {
    return conn.edges.map((edge) => edge?.node);
}

/**
 * Flattens the image connection into an array
 */
export const parseImages = (images: types.Connection<types.Image>, productTitle: string): types.Image[] => {
    const flattened = toNodeArray(images);

    return flattened.map((image) => {
        const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
        return {
            ...image,
            altText: image.altText || `${productTitle} - ${filename}`,
        };
    });
}

/**
 * Converts a shopify product into a frontend product
 */
export const parseProduct = (product: types.ShopifyProduct): types.Product => {
    const { images, variants, ...rest } = product;

    return {
        ...rest,
        images: parseImages(images, product.title),
        variants: toNodeArray(variants),
    };
}

/**
* Converts a shopify product connection into a frontend product array
*/
export const parseProducts = (products: types.Connection<types.ShopifyProduct>): types.Product[] => {
    return toNodeArray(products).map(p => parseProduct(p))
}

/**
* Converts a shopify cart  into a frontend cart
*/
export const parseCart = (cart: types.ShopifyCart): types.Cart => {
    if (!cart.cost?.totalTaxAmount) {
        cart.cost.totalTaxAmount = {
            amount: "0.0",
            currencyCode: "USD",
        };
    }

    return {
        ...cart,
        lines: toNodeArray(cart.lines),
    };
}
