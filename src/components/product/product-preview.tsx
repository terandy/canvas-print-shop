import { Product } from "@/lib/shopify/types";
import Prose from "../prose";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Props {
    product: Product;
}

const ProductPreview: React.FC<Props> = ({ product }) => {
    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {product.title}
                    </h2>
                </div>

                {product.descriptionHtml && (
                    <Prose
                        className="mb-8 text-gray-600 dark:text-gray-300"
                        html={product.descriptionHtml}
                    />
                )}
            </div>

            <div className="relative bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 min-w-0 w-max pb-4">
                        {product.images.map((image, index) => (
                            <div
                                key={image.url}
                                className="relative w-80 h-80 flex-none rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700"
                            >
                                <Image
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    fill
                                    src={image.url}
                                    alt={image.altText ?? ""}
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={`/product/${product.handle}`}
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                    >
                        <span>Start Creating</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductPreview;