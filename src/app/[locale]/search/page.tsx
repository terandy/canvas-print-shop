import { ProductGridItems, Grid } from "@/components";
import { getProductList } from "@/lib/shopify";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Search.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SearchPage: React.FC<Props> = async ({ searchParams }) => {
  // Get translations
  const t = await getTranslations("Search");

  const { q: searchValue } = (await searchParams) as { [key: string]: string };
  const products = await getProductList({ query: searchValue });

  // Get the appropriate results text based on count
  const resultsText =
    products.length === 1 ? t("singleResult") : t("multipleResults");

  return (
    <main className="p-6">
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? t("noResults")
            : t("showingResults", { count: products.length, resultsText })}
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
