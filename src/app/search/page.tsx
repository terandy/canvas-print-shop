import { ProductGridItems, Grid } from "@/components";
import { getProductList } from "@/lib/shopify";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};
type Props = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SearchPage: React.FC<Props> = async ({ searchParams }) => {
  const { q: searchValue } = (await searchParams) as { [key: string]: string };
  const products = await getProductList({ query: searchValue });
  const resultsText = products.length > 1 ? "results" : "result";
  return (
    <main className="p-6">
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? "There are no products that match"
            : `Showing ${products.length} ${resultsText} for `}
          <span>&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
    </main>
  );
};

export default SearchPage;
