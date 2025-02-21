import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import ButtonLink from "@/components/buttons/button-link";

interface ProcessStep {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface ProcessStepProps extends ProcessStep {
  isLeft: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  title,
  description,
  imageUrl,
  videoUrl,
  isLeft,
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-8 py-12 ${!isLeft && "md:flex-row-reverse"}`}
    >
      <div className="w-full md:w-1/2 space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="w-full md:w-1/2 relative">
        {videoUrl ? (
          <video
            className="w-full rounded-lg shadow-lg"
            controls
            poster="/api/placeholder/640/360"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="relative aspect-video w-full">
            <Image
              src={imageUrl || "/api/placeholder/640/360"}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-lg shadow-lg object-cover"
              priority={isLeft} // Prioritise loading first image
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CanvasProcessPage: React.FC = () => {
  const steps: ProcessStep[] = [
    {
      title: "Selecting Premium Materials",
      description:
        "We start with carefully selected, high-grade cotton blend canvas. Each roll is inspected for quality and consistency, ensuring that only the finest materials make it to our production floor. Our canvas has an opacity of up to 75%, over 7x higher than Best Canvas.",
      imageUrl: "/Canvas Cotton.png",
    },
    {
      title: "High Quality Printing Process",
      description:
        "We utilise advanced Canon printing technology to deliver exceptional colour vibrancy and durability. After printing your image using UVgel ink, the print undergoes UV LED curing. The result? A durable, flexible finish that needs no further protection. It's so durable, our canvases are backed by our 30-year print quality guarantee!",
      videoUrl: "/UV Curing.mp4",
    },
    {
      title: "Custom Stretcher Frame Assembly",
      description:
        "Our skilled craftsmen construct sturdy stretcher frames from premium wood, precisely cut and joined to create the foundation of your canvas. Each corner is reinforced for lasting durability.",
      imageUrl: "/stretcher frame example.jpeg",
    },
    {
      title: "Professional Stretching Process",
      description:
        "Using specialised equipment and techniques, we stretch the canvas over the frame with perfect tension. This critical step ensures your canvas will maintain its shape and stability over time.",
      imageUrl: "/canvas stretching.jpeg",
    },
    {
      title: "Quality Control",
      description:
        "Every canvas undergoes rigorous quality checks throughout the production process. We examine tension, corner folds, and overall construction to ensure each piece meets our exacting standards.",
      imageUrl: "/quality control.jpeg",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          How We Make Our Canvases
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the craftsmanship and attention to detail that goes into
          every canvas we produce.
        </p>
        <ChevronDown
          className="mx-auto mt-8 text-gray-400 animate-bounce"
          size={32}
        />
      </div>

      {/* Process Steps */}
      <div className="divide-y divide-gray-200">
        {steps.map((step, index) => (
          <ProcessStep key={index} {...step} isLeft={index % 2 === 0} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Ready to Experience Our Quality?
        </h2>
        <p className="text-gray-600 mb-8">
          Each canvas is crafted with care and backed by our satisfaction
          guarantee.
        </p>
        <ButtonLink href="/product/canvas">Shop Our Canvases</ButtonLink>
      </div>
    </div>
  );
};

export default CanvasProcessPage;
