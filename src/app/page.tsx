import { Metadata } from 'next'
import ProductPreview from "@/components/product/product-preview";
import { getProductList } from "@/lib/shopify";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: 'Custom Canvas Prints & Framing | Canvas Print Shop',
  description: 'Transform your photos into high-quality canvas prints with our easy upload service and optional framing. Expert craftsmanship, made in Canada. Order now for fast delivery!',
  openGraph: {
    title: 'Custom Canvas Prints & Framing | Canvas Print Shop',
    description: 'Transform your photos into high-quality canvas prints with our easy upload service and optional framing. Expert craftsmanship, made in Canada.',
    url: 'https://canvasprintshop.ca',
    siteName: 'Canvas Print Shop',
    locale: 'en_CA',
    type: 'website',
  },
}

const benefits = [
  { title: "Premium Materials", description: "Premium cotton-blend canvas with 10x higher density and 75% opacity - far superior to competitors' lower quality materials." },
  { title: "Expert Craftsmanship", description: "All canvas prints are expertly handcrafted in our Canadian studio, based in Quebec City." },
  { title: "Easy Process", description: "Simply upload your image, choose your dimensions, preview your canvas print and then checkout." },
  { title: "UVgel Technology", description: "Advanced Canon printing technology delivering exceptional color vibrancy and durability, backed by our 30-year print quality guarantee. Eco-friendly, no-odor prints perfect for indoor display." },
];

const process = [
  { title: "Upload Your Photo", description: "Choose your favorite image from any device" },
  { title: "Select Your Style", description: "Pick your size and frame options" },
  { title: "We Create Your Masterpiece", description: "Expert printing and craftsmanship" },
  { title: "Enjoy Your Custom Art", description: "Ready-to-hang delivery to your door" },
];

const testimonials = [
  {
    quote: "The quality exceeded my expectations. The colors are vibrant, and the framing is absolutely perfect.",
    author: "Jennifer T., Toronto"
  },
  {
    quote: "From upload to delivery, the whole process was seamless. The finished piece looks amazing!",
    author: "Michel B., Montreal"
  }
];

const Home: React.FC = async () => {
  const products = await getProductList({});

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Custom Canvas Prints Made to Order
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              Turn your cherished memories into beautiful canvas prints, expertly hand-crafted in Canada and ready to hang in your home.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.handle}`}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
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

      {/* Benefits Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Canvas Print Shop?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <CheckCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Create Your Custom Canvas Print
        </h2>
        {products.map(product => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </section>

      {/* Process Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-gray-900 dark:text-white font-medium">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-gray-600 dark:text-gray-300">
            <div>✓ Secure checkout</div>
            <div>✓ SSL encrypted</div>
            <div>✓ Fast, reliable shipping</div>
            <div>✓ Made in Canada</div>
            <div>✓ 100% satisfaction guaranteed</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;