import { productFragment } from "./fragments/product";

export const getProductQuery = (languageCode: string) => `
  query getProduct($handle: String!) @inContext(language: ${languageCode}){
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getProductListQuery = (languageCode: string) => `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) @inContext(language: ${languageCode}) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;
