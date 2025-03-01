import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components";
import { getLocale, getTranslations } from "next-intl/server";

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

export async function generateMetadata() {
  const t = await getTranslations("CanvasProcess.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

const CanvasProcessPage = async () => {
  // Get translations
  const t = await getTranslations("CanvasProcess");
  const locale = await getLocale();

  const steps: ProcessStep[] = [
    {
      title: t("steps.materials.title"),
      description: t("steps.materials.description"),
      imageUrl: "/Canvas Cotton.png",
    },
    {
      title: t("steps.printing.title"),
      description: t("steps.printing.description"),
      videoUrl: "/UV Curing.mp4",
    },
    {
      title: t("steps.frame.title"),
      description: t("steps.frame.description"),
      imageUrl: "/stretcher frame example.jpeg",
    },
    {
      title: t("steps.stretching.title"),
      description: t("steps.stretching.description"),
      imageUrl: "/canvas stretching.jpeg",
    },
    {
      title: t("steps.quality.title"),
      description: t("steps.quality.description"),
      imageUrl: "/quality control.jpeg",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {t("hero.title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t("hero.description")}
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
          {t("cta.title")}
        </h2>
        <p className="text-gray-600 mb-8">{t("cta.description")}</p>
        <ButtonLink href={`/${locale}/product/canvas`}>
          {t("cta.button")}
        </ButtonLink>
      </div>
    </div>
  );
};

export default CanvasProcessPage;
