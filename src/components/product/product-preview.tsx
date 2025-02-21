// ProductPreview component
import { Product } from "@/lib/shopify/types";
import Prose from "../prose";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ButtonLink from "../buttons/button-link";

interface Props {
  product: Product;
}

const ProductPreview: React.FC<Props> = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        {/* Content Section */}
        <div className="order-2 md:order-1 px-4 pb-6 sm:p-8 md:p-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-3 sm:mb-4">
            {product.title}
          </h2>

          {product.descriptionHtml && (
            <Prose
              className="text-secondary/80 prose-sm sm:prose-base line-clamp-3 sm:line-clamp-none"
              html={product.descriptionHtml}
            />
          )}

          <div className="mt-6 sm:mt-8">
            <ButtonLink
              href={`/product/${product.handle}`}
              icon={ArrowRight}
              className="w-full sm:w-auto text-center bg-primary hover:bg-primary/90 text-white"
            >
              Start Creating
            </ButtonLink>
          </div>
        </div>

        {/* Image Gallery Section */}
        <div className="order-1 md:order-2 relative bg-secondary/5 md:col-span-2 w-full overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="relative">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
                {product.images.map((image, index) => (
                  <div
                    key={image.url}
                    className="relative w-[calc(100vw-32px)] sm:w-[320px] md:w-[400px] aspect-[4/3] flex-none rounded-xl sm:rounded-2xl overflow-hidden snap-center bg-secondary/5"
                  >
                    <Image
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      fill
                      src={image.url}
                      alt={image.altText ?? ""}
                      priority={index === 0}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 320px, 400px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="flex gap-1.5 sm:gap-2">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary/30"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
