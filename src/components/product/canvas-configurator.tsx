"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, MoveUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useProduct } from "@/contexts";
import { depthForFrame } from "@/contexts/product-context/data";
import { getSelectedVariant } from "@/contexts/product-context/utils";
import { DEFAULT_CANVAS_IMAGE, EMAIL } from "@/lib/constants";
import AddToCart from "./add-to-cart";
import SaveCartItem from "./save-cart-item";
import ProductTotal from "./product-total";
import ImageUploader from "./image-uploader";
import ImageFile from "./image-file";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-dark";
const label =
  "text-[11px] font-medium uppercase tracking-[0.15em] text-secondary";

export default function CanvasConfigurator() {
  const { product, state, updateField, cartItemID, imgFileUrl } = useProduct();
  const t = useTranslations("Product.studio");
  const p = useTranslations("Product");
  const locale = useLocale();
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const hasImage = Boolean(
    state.imgURL && state.imgURL !== DEFAULT_CANVAS_IMAGE
  );
  const sizes =
    product.options.find((option) => option.name === "size")?.values ?? [];
  const frames =
    product.options.find((option) => option.name === "frame")?.values ?? [];
  const [shortSide, longSide] = state.size.split("x").map(Number);
  const [width, height] =
    state.direction === "landscape"
      ? [longSide, shortSide]
      : [shortSide, longSide];
  const money = (amount: string, currency = "CAD") =>
    new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency,
    }).format(Number(amount));
  const cm = (inches: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
      inches * 2.54
    );

  useEffect(() => {
    setResolution(null);
    if (!hasImage) return;
    const image = new window.Image();
    image.onload = () =>
      setResolution({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = state.imgURL;
    return () => {
      image.onload = null;
    };
  }, [state.imgURL, hasImage]);

  const lowResolution =
    resolution &&
    Math.min(resolution.width / width, resolution.height / height) < 50;
  const unframed = getSelectedVariant(product, {
    ...state,
    frame: "none",
    depth: depthForFrame("none"),
  });

  return (
    <div className="mt-8 border-t border-secondary/15">
      <section
        id="canvas-upload"
        aria-labelledby="canvas-upload-title"
        className="scroll-mt-6 border-b border-secondary/15 py-6"
      >
        <h2
          id="canvas-upload-title"
          className={`mb-3 flex items-center gap-3 ${label}`}
        >
          <span className="text-primary-dark" aria-hidden="true">
            01
          </span>
          {t("photoTitle")}
        </h2>
        <ImageUploader appearance="editorial" />
        {hasImage && !imgFileUrl && (
          <div className="border border-secondary/15 bg-[#F3F1EB] px-4 py-3">
            <p className="mb-2 flex items-center gap-2 text-xs text-primary-dark">
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("photoAdded")}
            </p>
            <ImageFile imgURL={state.imgURL} />
          </div>
        )}
      </section>
      <fieldset className="min-w-0 border-b border-secondary/15 py-6">
        <legend className="sr-only">{t("sizeTitle")}</legend>
        <label
          htmlFor="canvas-size"
          className={`mb-3 flex items-center gap-3 ${label}`}
        >
          <span className="text-primary-dark" aria-hidden="true">
            02
          </span>
          {t("sizeTitle")}
        </label>
        <div className="relative">
          <select
            id="canvas-size"
            value={state.size}
            onChange={(event) => updateField("size", event.target.value)}
            className={`min-h-12 w-full appearance-none rounded-sm border border-secondary/25 bg-white px-4 py-3 pr-10 text-sm text-secondary ${focus}`}
          >
            {!sizes.includes(state.size) && (
              <option value={state.size} disabled>
                {p("size.select")}
              </option>
            )}
            {sizes.map((size) => {
              const variant = getSelectedVariant(product, { ...state, size });
              return (
                <option key={size} value={size} disabled={!variant}>
                  {size.replace("x", "″ × ")}″
                  {variant
                    ? ` — ${money(variant.price.amount, variant.price.currencyCode)}`
                    : ` — ${p("selectionUnavailable")}`}
                </option>
              );
            })}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-gray"
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-gray">
          {cm(width)} × {cm(height)} cm
        </p>
        <div
          className="mt-4 grid grid-cols-2 gap-3"
          role="group"
          aria-label={p("direction.title")}
        >
          {["landscape", "portrait"].map((direction) => (
            <button
              type="button"
              key={direction}
              aria-pressed={state.direction === direction}
              onClick={() => updateField("direction", direction)}
              className={`flex min-h-11 items-center justify-center gap-3 rounded-sm border px-3 py-2 text-xs transition-colors ${focus} ${state.direction === direction ? "border-primary-dark bg-[#F2EDE5] text-primary-dark" : "border-secondary/15 hover:border-secondary/40"}`}
            >
              <span
                aria-hidden="true"
                className={`border border-current ${direction === "landscape" ? "h-3 w-5" : "h-5 w-3"}`}
              />
              {p(`direction.${direction}`)}
            </button>
          ))}
        </div>
        {resolution && (
          <p
            role="status"
            className={`mt-3 text-xs leading-5 ${lowResolution ? "text-amber-800" : "text-gray"}`}
          >
            {lowResolution
              ? p("size.quality.poorDescription")
              : t("resolutionGood")}
          </p>
        )}
      </fieldset>

      <fieldset className="min-w-0 border-b border-secondary/15 py-6">
        <legend className="sr-only">{p("frame.title")}</legend>
        <p
          className={`mb-3 flex items-center gap-3 ${label}`}
          aria-hidden="true"
        >
          <span className="text-primary-dark">03</span>
          {p("frame.title")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {frames.map((frame) => {
            const selected = state.frame === frame;
            const variant = getSelectedVariant(product, {
              ...state,
              frame,
              depth: depthForFrame(frame),
            });
            const difference =
              variant && unframed
                ? Number(variant.price.amount) - Number(unframed.price.amount)
                : undefined;
            return (
              <button
                type="button"
                key={frame}
                aria-pressed={selected}
                disabled={!variant}
                onClick={() => updateField("frame", frame)}
                className={`relative flex flex-col items-stretch overflow-hidden rounded-sm border text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focus} ${selected ? "border-primary-dark bg-[#F2EDE5]" : "border-secondary/15 hover:border-secondary/40"}`}
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#EDE9E1]">
                  <Image
                    src={
                      frame === "black"
                        ? "/frame/black-frame.png"
                        : "/frame/no-frame.jpeg"
                    }
                    alt=""
                    fill
                    sizes="(min-width: 1440px) 270px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 50vw"
                    className={`object-cover ${frame === "black" ? "object-[50%_67%]" : "object-[50%_70%]"}`}
                  />
                </div>
                <span className="px-3 pt-3 text-xs font-medium leading-5">
                  {frame === "none" ? t("canvasOnly") : t("blackFrame")}
                </span>
                <span className="mt-1 px-3 pb-3 text-[11px] text-gray">
                  {difference === 0
                    ? t("included")
                    : difference !== undefined
                      ? `+${money(String(difference))}`
                      : p("selectionUnavailable")}
                </span>
                {selected && (
                  <Check
                    aria-hidden="true"
                    className="absolute right-2 top-2 h-5 w-5 rounded-full bg-[#FCFBF8] p-0.5 text-primary-dark"
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-5 text-gray">
          {state.frame === "black" ? t("framedHelp") : t("canvasHelp")}
        </p>
      </fieldset>

      <fieldset className="min-w-0 border-b border-secondary/15 py-6">
        <legend className="sr-only">{t("edgeTitle")}</legend>
        <p
          className={`mb-3 flex items-center gap-3 ${label}`}
          aria-hidden="true"
        >
          <span className="text-primary-dark">04</span>
          {t("edgeTitle")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {["wrapped", "fill"].map((edge) => (
            <button
              type="button"
              key={edge}
              aria-pressed={state.borderStyle === edge}
              onClick={() => updateField("borderStyle", edge)}
              className={`flex min-h-14 items-center gap-3 rounded-sm border p-2.5 text-left text-xs transition-colors ${focus} ${state.borderStyle === edge ? "border-primary-dark bg-[#F2EDE5] text-primary-dark" : "border-secondary/15 hover:border-secondary/40"}`}
            >
              <Image
                src={`/border/${edge === "wrapped" ? "wrapped" : "fill"}-border.png`}
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 shrink-0 object-cover"
              />
              {p(`borderStyle.${edge}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="py-6">
        <ProductTotal appearance="editorial" />
        {!cartItemID ? (
          <AddToCart appearance="editorial" />
        ) : (
          <SaveCartItem cartItemID={cartItemID} appearance="editorial" />
        )}
        {!hasImage && (
          <a
            href="#canvas-upload"
            className={`mt-3 flex min-h-10 items-center justify-center gap-2 text-xs text-primary-dark underline underline-offset-4 ${focus}`}
          >
            {t("uploadToStart")}
            <MoveUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        <p className="mt-4 text-center text-[11px] leading-5 text-gray">
          {t("checkoutNote")}
        </p>
      </div>
      <p className="border-t border-secondary/15 pt-5 text-xs leading-6 text-gray">
        {t("customSize")}{" "}
        <a
          href={`mailto:${EMAIL.label}`}
          className={`text-secondary underline underline-offset-4 ${focus}`}
        >
          {t("customSizeLink")}
        </a>
      </p>
    </div>
  );
}
