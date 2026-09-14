"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, MoveUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useProduct } from "@/contexts";
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

export default function RolledCanvasConfigurator() {
  const { product, state, updateField, cartItemID, imgFileUrl } = useProduct();
  const t = useTranslations("Product.studio");
  const p = useTranslations("Product");
  const locale = useLocale();
  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const imageSource = imgFileUrl ?? state.imgURL;
  const hasImage = Boolean(imageSource && imageSource !== DEFAULT_CANVAS_IMAGE);
  const sizes =
    product.options.find((option) => option.name === "size")?.values ?? [];
  const margins =
    product.options.find((option) => option.name === "margin")?.values ?? [];
  const [shortSide = 0, longSide = 0] = state.size.split("x").map(Number);
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
    image.src = imageSource;
    return () => {
      image.onload = null;
    };
  }, [imageSource, hasImage]);

  const lowResolution =
    resolution &&
    width > 0 &&
    height > 0 &&
    Math.min(resolution.width / width, resolution.height / height) < 50;

  return (
    <div className="mt-8 border-t border-secondary/15">
      <section
        id="rolled-canvas-upload"
        aria-labelledby="rolled-canvas-upload-title"
        className="scroll-mt-6 border-b border-secondary/15 py-6"
      >
        <h2
          id="rolled-canvas-upload-title"
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
          htmlFor="rolled-canvas-size"
          className={`mb-3 flex items-center gap-3 ${label}`}
        >
          <span className="text-primary-dark" aria-hidden="true">
            02
          </span>
          {t("sizeTitle")}
        </label>
        <div className="relative">
          <select
            id="rolled-canvas-size"
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
        {width > 0 && height > 0 && (
          <p className="mt-2 text-xs leading-5 text-gray">
            {cm(width)} × {cm(height)} cm
          </p>
        )}
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

      <fieldset
        className="min-w-0 border-b border-secondary/15 py-6"
        aria-describedby="rolled-margin-help"
      >
        <legend className="sr-only">{p("margin.title")}</legend>
        <p className={`mb-3 ${label}`} aria-hidden="true">
          {p("margin.title")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {margins.map((margin) => {
            const selected = state.margin === margin;
            const variant = getSelectedVariant(product, { ...state, margin });
            return (
              <button
                type="button"
                key={margin}
                aria-pressed={selected}
                disabled={!variant}
                onClick={() => updateField("margin", margin)}
                className={`relative flex min-h-20 items-center gap-4 rounded-sm border p-3 text-left text-xs leading-5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focus} ${selected ? "border-primary-dark bg-[#F2EDE5] text-primary-dark" : "border-secondary/15 hover:border-secondary/40"}`}
              >
                <span
                  aria-hidden="true"
                  className="relative h-12 w-12 shrink-0 border border-secondary/30 bg-[#FCFBF8] shadow-sm"
                >
                  <span
                    className={`absolute border border-secondary/20 bg-secondary/15 ${margin === "with" ? "inset-2" : "inset-0.5"}`}
                  />
                </span>
                <span>{p(`margin.${margin}`)}</span>
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
        <p id="rolled-margin-help" className="mt-3 text-xs leading-5 text-gray">
          {p("margin.help")}
        </p>
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
            href="#rolled-canvas-upload"
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
