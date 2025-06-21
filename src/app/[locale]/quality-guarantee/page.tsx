/* app/our-quality/page.tsx   (or pages/our-quality.tsx if you are using the pages router) */

import React from "react";
import Image from "next/image";

// --- Reusable Feature Card Component --- //
interface QualityFeatureProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const QualityFeature: React.FC<QualityFeatureProps> = ({
  title,
  description,
  children,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
        {children}
      </div>
      <div className="pt-1">
        <h3 className="text-xl font-bold text-secondary">{title}</h3>
        <p className="mt-2 text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

// --- Main Component --- //
const OurQualityPage = () => (
  <div className="bg-gray-50 text-secondary font-sans">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* --- Header --- */}
      <header className="text-center py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold text-secondary tracking-tighter">
          The Canvas Print Shop Quality Promise
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-8">
          Not all canvas prints are created equal. In a market flooded with
          low-cost options, we focus on one thing:{" "}
          <strong>uncompromising quality</strong>.
        </p>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
          Your photos deserve to be transformed into true works of art. Here is
          how we make that happen in our Quebec City workshop.
        </p>
      </header>

      {/* --- Features Grid --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 -mt-16 mb-24">
        <QualityFeature
          title="1. Our Canvas"
          description="The story of a great canvas begins with the canvas itself. We use a premium 35% cotton-blend fabric built for fine art, providing a rich texture and exceptional 75% opacity so the frame never shows through."
        >
          <Image
            src="/canvas-cotton.jpeg"
            alt="Premium cotton canvas texture"
            width={64}
            height={64}
            className="object-cover h-full w-full"
          />
        </QualityFeature>

        <QualityFeature
          title="2. Our Technology"
          description="We use state-of-the-art Canon Colorado printers with our signature Printed From The Sun™ UVgel ink. It is scratch-resistant, water-resistant, and guaranteed not to fade for over thirty years."
        >
          <Image
            src="/canon-colorado.jpeg"
            alt="A beautiful canvas print in a living room"
            width={64}
            height={64}
            className="object-cover h-full w-full"
          />
        </QualityFeature>

        <QualityFeature
          title="3. Our Craftsmanship"
          description="Proudly made in Quebec City. Every canvas is expertly hand-stretched over a solid wood frame, ensuring drum-tight tension and immaculate, gallery-ready corners."
        >
          <Image
            src="/canvas-making.jpeg"
            alt="A canvas being expertly hand-stretched"
            width={64}
            height={64}
            className="object-cover h-full w-full"
          />
        </QualityFeature>
      </section>

      {/* --- Comparison Table --- */}
      <section className="mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-12">
          The Difference is Clear
        </h2>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-2 md:p-4">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr>
                <th className="p-4 text-sm font-semibold uppercase text-gray-500">
                  Feature
                </th>
                <th className="p-4 w-2/5 text-sm font-semibold uppercase text-center bg-primary/10 rounded-t-lg text-primary-dark">
                  Canvas Print Shop
                </th>
                <th className="p-4 w-2/5 text-sm font-semibold uppercase text-center text-gray-500">
                  Standard Budget Printers
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Canvas Material</td>
                <td className="p-4 text-center bg-primary/5 font-semibold">
                  Premium 35% Cotton-Blend
                </td>
                <td className="p-4 text-center text-gray-500">
                  100% Polyester
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Ink Technology</td>
                <td className="p-4 text-center bg-primary/5 font-semibold">
                  Advanced UVgel (30-Year Guarantee)
                </td>
                <td className="p-4 text-center text-gray-500">
                  Basic Liquid Ink (Fades over time)
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Print Opacity</td>
                <td className="p-4 text-center bg-primary/5 font-semibold">
                  High (75%)
                </td>
                <td className="p-4 text-center text-gray-500">Low (&lt;10%)</td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Frame Material</td>
                <td className="p-4 text-center bg-primary/5 font-semibold">
                  Solid Wood Stretcher Bars
                </td>
                <td className="p-4 text-center text-gray-500">
                  Cheap MDF or plastic
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Craftsmanship</td>
                <td className="p-4 text-center bg-primary/5 font-semibold">
                  Hand-Stretched in Quebec, Canada
                </td>
                <td className="p-4 text-center text-gray-500">
                  Mass-produced overseas
                </td>
              </tr>
              <tr className="border-t border-gray-100">
                <td className="p-4 font-medium">Ready to Hang</td>
                <td className="p-4 text-center bg-primary/5 rounded-b-lg font-semibold">
                  Yes, hardware installed
                </td>
                <td className="p-4 text-center text-gray-500">
                  Often requires self-assembly
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Workshop Photos --- */}
      <section className="text-center bg-white py-16 md:py-24 rounded-2xl shadow-xl mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
          From Our Workshop to Your Wall
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-12">
          We believe in transparency. When you order from us, you are supporting
          a dedicated local team of craftspeople who care deeply about quality.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {[
            {
              src: "https://placehold.co/600x400/E2E8F0/334155?text=Canon+Printer",
              alt: "The Canon Colorado Printer in action",
              caption: "Canon Colorado Printer",
            },
            {
              src: "https://placehold.co/600x400/E2E8F0/334155?text=Canvas+Texture",
              alt: "A close-up of the premium canvas texture",
              caption: "Rich Canvas Texture",
            },
            {
              src: "https://placehold.co/600x400/E2E8F0/334155?text=Hand-Stretching",
              alt: "A team member carefully stretching a canvas",
              caption: "Expert Hand-Stretching",
            },
            {
              src: "https://placehold.co/600x400/E2E8F0/334155?text=Solid+Wood+Frames",
              alt: "A stack of solid wood framing bars",
              caption: "Solid Wood Frames",
            },
          ].map(({ src, alt, caption }) => (
            <figure
              key={caption}
              className="group relative overflow-hidden rounded-xl shadow-md"
            >
              <Image
                src={src}
                alt={alt}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized /* remove if you configure the domain in next.config.js */
              />
              <figcaption className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-4 left-4 text-white text-lg font-bold">
                {caption}
              </p>
            </figure>
          ))}
        </div>
      </section>

      {/* --- Final Call to Action --- */}
      <section className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary">
          Experience the Difference
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Your memories deserve to be preserved with clarity, vibrancy and
          craftsmanship.
        </p>
        <div className="mt-8">
          <a
            href="/en/product/canvas"
            className="inline-block bg-primary text-white font-bold text-lg py-4 px-12 rounded-full hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Create Your Custom Canvas Now
          </a>
        </div>
      </section>
    </div>
  </div>
);

export default OurQualityPage;
