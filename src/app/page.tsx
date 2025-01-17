import Grid from "@/components/grid/grid";
import ProductGridItems from "@/components/product/product-grid-items";
import { getProductList } from "@/lib/shopify";
import React from "react";

const Home: React.FC = async () => {
  const products = await getProductList({
    query: "*"
  });
  return <main className="flex-1">
    <section className="w-full pt-12 md:pt-24 lg:pt-32 border-bottom-b">
      <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
        <div className="grid max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
          <div>
            <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
              Decorate your home with personalised art
            </h1>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Explore our curated collections of images for every occasion.
            </p>
          </div>
        </div>
        {products.length > 0 ? <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid> : null}
      </div>
    </section>
  </main>;
};
export default Home;