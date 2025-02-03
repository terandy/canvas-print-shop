import ProductPreview from "@/components/product/product-preview";
import { getProductList } from "@/lib/shopify";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

const Home: React.FC = async () => {
  const products = await getProductList({});

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900">
      <section className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Decorate your home with personalised art
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              Explore our curated collections of images for every occasion.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.handle}`}
                  className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-full font-medium border border-gray-200 transition-colors"
                >
                  <span>{product.title}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 opacity-90" />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Featured Collections
        </h2>
        {products.map(product => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
};

export default Home;