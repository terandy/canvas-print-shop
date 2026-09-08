"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useProduct } from "@/contexts";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";
import CanvasPreviewer from "./canvas-preview";

const gallery = [
  { src: "/canvas-in-living-room.jpeg", key: "room" },
  { src: "/canvas-hanging.jpeg", key: "hanging" },
  { src: "/canvas-stretching.jpeg", key: "workshop" },
] as const;

export default function CanvasStudioPreview() {
  const { state, imgFileUrl } = useProduct();
  const t = useTranslations("Product.studio");
  const [active, setActive] = useState(0);
  const hasImage = Boolean(
    imgFileUrl || (state.imgURL && state.imgURL !== DEFAULT_CANVAS_IMAGE)
  );

  return (
    <div className="lg:sticky lg:top-6">
      <div
        id="product-image-preview-container"
        className="relative aspect-[5/4] overflow-hidden bg-[#EDE9E1]"
      >
        {hasImage ? (
          <CanvasPreviewer
            src={imgFileUrl ?? state.imgURL}
            size={state.size}
            direction={state.direction}
            borderStyle={state.borderStyle}
            depth={state.depth}
            frame={state.frame}
            contained
            className="flex h-full w-full items-center justify-center"
          />
        ) : (
          <Image
            src={gallery[active].src}
            alt={t(`gallery.${gallery[active].key}`)}
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
              aria-label={t(`gallery.${image.key}`)}
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
          <span className="ml-auto hidden max-w-36 text-right font-serif text-base italic leading-5 text-gray sm:block">
            {t("gallery.caption")}
          </span>
        </div>
      )}
    </div>
  );
}
