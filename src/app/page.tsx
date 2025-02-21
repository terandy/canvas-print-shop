import { Metadata } from "next";
import { ButtonLink, ProductPreview, SectionContainer } from "@/components";
import { getProductList } from "@/lib/shopify";
import { ArrowRight, CircleCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Canvas Prints & Framing | Canvas Print Shop",
  description:
    "Transform your photos into high-quality canvas prints with our easy upload service and optional framing. Expert craftsmanship, made in Canada. Order now for fast delivery!",
  openGraph: {
    title: "Custom Canvas Prints & Framing | Canvas Print Shop",
    description:
      "Transform your photos into high-quality canvas prints with our easy upload service and optional framing. Expert craftsmanship, made in Canada.",
    url: "https://canvasprintshop.ca",
    siteName: "Canvas Print Shop",
    locale: "en_CA",
    type: "website",
  },
};

const benefits = [
  {
    title: "Premium Materials",
    description:
      "Premium cotton-blend canvas with 10x higher density and 75% opacity - far superior to competitors' lower quality materials.",
  },
  {
    title: "Expert Craftsmanship",
    description:
      "All canvas prints are expertly handcrafted in our Canadian studio, based in Quebec City.",
  },
  {
    title: "Easy Process",
    description:
      "Simply upload your image, choose your dimensions, preview your canvas print and then checkout.",
  },
  {
    title: "UVgel Technology",
    description:
      "Advanced Canon printing technology delivering exceptional color vibrancy and durability, backed by our 30-year print quality guarantee. Eco-friendly, no-odor prints perfect for indoor display.",
  },
];

const process = [
  {
    title: "Upload Your Photo",
    description: "Choose your favorite image from any device",
  },
  {
    title: "Select Your Style",
    description: "Pick your size and frame options",
  },
  {
    title: "We Create Your Masterpiece",
    description: "Expert printing and craftsmanship",
  },
  {
    title: "Enjoy Your Custom Art",
    description: "Ready-to-hang delivery to your door",
  },
];

const testimonials = [
  {
    quote:
      "The quality exceeded my expectations. The colors are vibrant, and the framing is absolutely perfect.",
    author: "Jennifer T., Toronto",
  },
  {
    quote:
      "From upload to delivery, the whole process was seamless. The finished piece looks amazing!",
    author: "Michel B., Montreal",
  },
];
const Home: React.FC = async () => {
  const products = await getProductList({});

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-gray-light/10">
        <div className="container mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary">
              Custom Canvas Prints Made to Order
            </h1>
            <p className="text-xl text-gray">
              Turn your cherished memories into beautiful canvas prints,
              expertly hand-crafted in Canada and ready to hang in your home.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {products.map((product) => (
                <ButtonLink
                  key={product.id}
                  href={`/product/${product.handle}`}
                  icon={ArrowRight}
                >
                  {product.title}
                </ButtonLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            Why Choose Canvas Print Shop?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <CircleCheck className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold text-secondary">
                  {benefit.title}
                </h3>
                <p className="text-gray">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="relative py-12 sm:py-24 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-3 sm:mb-4">
              Create Your Custom Canvas Print
            </h2>
            <p className="text-base sm:text-lg text-secondary/80 max-w-2xl mx-auto">
              Transform your favorite moments into stunning wall art with our
              premium canvas prints
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {process.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-secondary">
                  {step.title}
                </h3>
                <p className="text-gray">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-secondary">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <SectionContainer key={index} className="!bg-white">
                <p className="text-gray mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-secondary font-medium">
                  {testimonial.author}
                </p>
              </SectionContainer>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-t border-gray-light/10 bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-gray">
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
