"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useProduct } from "@/contexts";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";

type FeaturedImage = {
  url: string;
  altText?: string;
};

function FlatRolledPreview({ src }: { src: string }) {
  const { state } = useProduct();
  const t = useTranslations("Product.rollsPage.studio");
  const parsed = state.size.split("x").map(Number);
  const [shortSide, longSide] =
    parsed.length === 2 && parsed.every((value) => Number.isFinite(value))
      ? parsed
      : [8, 10];
  const [imageWidth, imageHeight] =
    state.direction === "landscape"
      ? [longSide, shortSide]
      : [shortSide, longSide];
  const margin = state.margin === "with" ? 2 : 0;
  const sheetWidth = imageWidth + margin * 2;
  const sheetHeight = imageHeight + margin * 2;
  const landscape = sheetWidth >= sheetHeight;
  const horizontalInset = (margin / sheetWidth) * 100;
  const verticalInset = (margin / sheetHeight) * 100;

  return (
    <div className="relative flex h-full w-full items-center justify-center p-10 sm:p-14">
      <div
        className="relative max-h-[82%] max-w-[84%] bg-[#FFFEFA] shadow-[0_28px_70px_rgba(41,31,23,0.24)] ring-1 ring-secondary/15"
        style={{
          aspectRatio: `${sheetWidth} / ${sheetHeight}`,
          ...(landscape ? { width: "84%" } : { height: "82%" }),
        }}
      >
        <div
          className="absolute overflow-hidden bg-secondary/10"
          style={{
            left: `${horizontalInset}%`,
            right: `${horizontalInset}%`,
            top: `${verticalInset}%`,
            bottom: `${verticalInset}%`,
          }}
        >
          <Image
            src={src}
            alt={t("customPreviewAlt")}
            fill
            sizes="(min-width: 1440px) 620px, (min-width: 1024px) 50vw, 80vw"
            className="object-cover"
            unoptimized={src.startsWith("blob:")}
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-5 w-5 bg-gradient-to-tl from-secondary/15 via-white to-white shadow-[-2px_-2px_5px_rgba(41,31,23,0.08)]"
        />
        <span
          aria-hidden="true"
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray"
        >
          {imageWidth}&quot;
        </span>
        <span
          aria-hidden="true"
          className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] text-gray"
        >
          {imageHeight}&quot;
        </span>
      </div>
    </div>
  );
}

export default function RolledCanvasStudioPreview({
  featuredImage,
}: {
  featuredImage: FeaturedImage;
}) {
  const { state, imgFileUrl } = useProduct();
  const t = useTranslations("Product.rollsPage.studio");
  const [active, setActive] = useState(0);
  const hasImage = Boolean(
    imgFileUrl || (state.imgURL && state.imgURL !== DEFAULT_CANVAS_IMAGE)
  );
  const gallery = [
    ...(featuredImage.url
      ? [
          {
            src: featuredImage.url,
            alt: featuredImage.altText || t("gallery.product"),
            key: "product",
          },
        ]
      : []),
    {
      src: "/canvas-cotton.jpeg",
      alt: t("gallery.material"),
      key: "material",
    },
    {
      src: "/canon-colorado.jpeg",
      alt: t("gallery.press"),
      key: "press",
    },
  ];
  const current = gallery[active] ?? gallery[0];

  return (
    <div className="lg:sticky lg:top-6">
      <div
        id="product-image-preview-container"
        className="relative aspect-[5/4] overflow-hidden bg-[#EDE9E1]"
      >
        {hasImage ? (
          <FlatRolledPreview src={imgFileUrl ?? state.imgURL} />
        ) : (
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority={active === 0}
            sizes="(min-width: 1440px) 700px, (min-width: 1024px) 54vw, 100vw"
            className="object-cover"
            quality={80}
          />
        )}
        {!hasImage && (
          <span className="absolute bottom-5 left-5 bg-[#FCFBF8]/95 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-secondary">
            {t("gallery.sample")}
          </span>
        )}
      </div>
      {hasImage ? (
        <div className="border-b border-secondary/15 py-3">
          <p className="text-xs leading-5 text-gray">{t("previewHelp")}</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          {gallery.map((image, index) => (
            <button
              key={image.key}
              type="button"
              aria-label={image.alt}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden border-2 p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark ${index === active ? "border-primary-dark" : "border-transparent opacity-65 transition-opacity hover:opacity-100"}`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
          <span className="ml-auto hidden max-w-40 text-right font-serif text-base italic leading-5 text-gray sm:block">
            {t("gallery.caption")}
          </span>
        </div>
      )}
    </div>
  );
}
