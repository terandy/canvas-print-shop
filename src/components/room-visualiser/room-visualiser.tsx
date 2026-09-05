"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Download,
  ImagePlus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import Button from "@/components/buttons/button";
import { IMAGE_ACCEPT_ATTRIBUTE } from "@/lib/images/formats";
import { prepareLocalPreview } from "@/lib/room-visualiser/local-image";
import { STANDARD_SIZES } from "@/lib/room-visualiser/catalogue";
import {
  GALLERY_DEPTH_INCHES,
  placement,
  ROOM,
  type CropPosition,
  type EdgeStyle,
} from "@/lib/room-visualiser/geometry";
import FlatFallback from "./flat-fallback";

const Viewer = dynamic(() => import("./room-viewer"), { ssr: false });
const SAMPLE = "/room-visualiser/sample-art.jpg";
const inputStyle =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

export default function RoomVisualiser() {
  const t = useTranslations("RoomVisualiser");
  const locale = useLocale();
  const [imageUrl, setImageUrl] = useState(SAMPLE);
  const [fileName, setFileName] = useState("");
  const [width, setWidth] = useState("48");
  const [height, setHeight] = useState("36");
  const [crop, setCrop] = useState<CropPosition>({ x: 0.5, y: 0.5 });
  const [edge, setEdge] = useState<EdgeStyle>("wrapped");
  const [reference, setReference] = useState(false);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const output = useRef<HTMLCanvasElement | null>(null);
  const downloadRef = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const dimensions = { width: Number(width), height: Number(height) };
  const p = placement(dimensions);
  const sizeLabel = t("sizeLabel", { width, height });
  const number = (value: number, max = 2) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: max }).format(value);
  const key = [Number(width), Number(height)].sort((a, b) => a - b).join("x");
  const standard = STANDARD_SIZES.some((size) => size === key);
  const receiveCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    output.current = canvas;
    setReady(Boolean(canvas));
  }, []);
  const fail = useCallback(() => {
    setFallback(true);
    setReady(false);
  }, []);

  useEffect(
    () => () => {
      if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl]
  );
  useEffect(
    () => () => {
      request.current++;
    },
    []
  );
  // Slow or unavailable GPU/asset load always gets a usable 2D route out.
  useEffect(() => {
    if (ready || fallback) return;
    const timeout = setTimeout(fail, 12000);
    return () => clearTimeout(timeout);
  }, [ready, fallback, fail]);

  // A stale preview URL is revoked as soon as any control changes it, and on
  // unmount, so a session of resizing never accumulates multi-megabyte blobs.
  useEffect(
    () => () => {
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
      downloadRef.current = null;
      setDownloadUrl(null);
    },
    [imageUrl, width, height, crop.x, crop.y, edge, reference, fallback]
  );

  const selectFile = async (file: File) => {
    const id = ++request.current;
    setBusy(true);
    setError("");
    try {
      const url = await prepareLocalPreview(file);
      if (id !== request.current) {
        URL.revokeObjectURL(url);
        return;
      }
      setImageUrl(url);
      setFileName(file.name);
      setCrop({ x: 0.5, y: 0.5 });
      setReady(false);
    } catch (e) {
      if (id === request.current)
        setError(
          t(
            `errors.${e instanceof Error && ["tooLarge", "unsupportedType", "conversionFailed"].includes(e.message) ? e.message : "decodeFailed"}`
          )
        );
    } finally {
      if (id === request.current) setBusy(false);
    }
  };
  const useSample = () => {
    request.current++;
    setBusy(false);
    setError("");
    setImageUrl(SAMPLE);
    setFileName("");
    setCrop({ x: 0.5, y: 0.5 });
    if (fileInput.current) fileInput.current.value = "";
  };
  const chooseSize = (value: string) => {
    if (!value) return;
    const [w, h] = value.split("x").map(Number);
    setWidth(String(Math.max(w, h)));
    setHeight(String(Math.min(w, h)));
  };
  const reset = () => {
    setWidth("48");
    setHeight("36");
    setCrop({ x: 0.5, y: 0.5 });
    setEdge("wrapped");
    setReference(false);
    setError("");
  };
  const download = async () => {
    if (!output.current || !p.fits) return;
    setDownloading(true);
    setError("");
    try {
      const source = output.current;
      source.dispatchEvent(new Event("room-capture"));
      const result = document.createElement("canvas");
      result.width = source.width;
      result.height = source.height + 96;
      const ctx = result.getContext("2d");
      if (!ctx) throw new Error();
      ctx.fillStyle = "#f7f6f4";
      ctx.fillRect(0, 0, result.width, result.height);
      ctx.drawImage(source, 0, 0);
      ctx.fillStyle = "#352e2a";
      ctx.font = `600 ${Math.max(16, Math.min(22, result.width / 35))}px sans-serif`;
      ctx.fillText(
        `${sizeLabel} · ${t("sofaLabel", { width: number(ROOM.sofaWidth) })}`,
        24,
        source.height + 34,
        result.width - 48
      );
      ctx.font = `${Math.max(13, Math.min(16, result.width / 45))}px sans-serif`;
      ctx.fillText(
        t("downloadDisclaimer"),
        24,
        source.height + 64,
        result.width - 48
      );
      // A blob URL keeps the preview out of React state as a multi-megabyte
      // base64 string; the visible save link below covers any browser that
      // suppresses a download started after the await.
      const blob = await new Promise<Blob>((resolve, reject) =>
        result.toBlob(
          (value) => (value ? resolve(value) : reject(new Error())),
          "image/png"
        )
      );
      const url = URL.createObjectURL(blob);
      downloadRef.current = url;
      setDownloadUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canvas-room-${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError(t("errors.download"));
    } finally {
      setDownloading(false);
    }
  };
  const viewerProps = {
    imageUrl,
    dimensions,
    crop,
    edge,
    reference,
    label: t("viewerLabel", { size: sizeLabel }),
    onReady: receiveCanvas,
    onError: fail,
  };
  return (
    <div className="flex flex-col items-stretch gap-6 lg:grid lg:items-start lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
      <section
        aria-label={t("preview")}
        className={`${fallback ? "static" : "sticky"} top-0 z-10 min-w-0 bg-background lg:top-5 [@media(max-height:700px)]:static`}
      >
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[#e3ded3]">
          <div className="hidden flex-wrap items-center justify-between gap-2 border-b border-black/5 bg-white/85 sm:flex px-4 py-3 text-xs sm:px-5">
            <span className="font-medium text-secondary">{t("roomName")}</span>
            <span className="text-gray">{t("fixedCamera")}</span>
          </div>
          <div
            className="relative aspect-[3/2]"
            aria-busy={!ready}
            data-testid="viewer-stage"
          >
            {/* Plain poster is also visible while the route-specific 3D chunk loads. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/room-visualiser/room-poster.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {fallback ? (
              <FlatFallback {...viewerProps} />
            ) : (
              <Viewer {...viewerProps} />
            )}
            {!ready && (
              <div
                role="status"
                className="absolute inset-0 flex items-center justify-center bg-background/60"
              >
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm shadow-sm">
                  <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
                  {t("loading")}
                </span>
              </div>
            )}
            {!p.fits && (
              <div
                role="alert"
                className="absolute inset-x-4 top-4 rounded-xl border border-amber-200 bg-white/95 p-4 text-sm text-secondary shadow-sm"
              >
                {p.valid
                  ? t("wallLimit", {
                      width: number(ROOM.usableWidth),
                      height: number(ROOM.usableTop - ROOM.usableBottom),
                    })
                  : t("invalidSize")}
              </div>
            )}
            {reference && p.fits && (
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-2 text-[11px] sm:text-xs">
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-secondary shadow-sm">
                  {sizeLabel} · {number(p.width, 4)} × {number(p.height, 4)} m
                </span>
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-secondary shadow-sm">
                  {t("sofaLabel", { width: number(ROOM.sofaWidth) })}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 bg-white px-4 py-3 sm:px-5">
            <div>
              <p
                className="text-sm font-semibold text-secondary"
                data-testid="selected-size"
              >
                {sizeLabel}
              </p>
              <p className="text-xs text-gray">
                {number(p.width * 100)} × {number(p.height * 100)} cm
              </p>
            </div>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={reset}
              title={t("resetHelp")}
              className="!text-xs"
            >
              {t("reset")}
            </Button>
          </div>
        </div>
        {fallback && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-secondary"
          >
            {t("fallback")}{" "}
            <button
              type="button"
              onClick={() => {
                setFallback(false);
                setReady(false);
              }}
              className="font-medium text-primary underline"
            >
              {t("retry")}
            </button>
          </p>
        )}
        <p className="mt-4 hidden text-xs leading-relaxed text-gray sm:block">
          {t("disclaimer")}
        </p>
        <p className="mt-2 text-[11px] text-gray sm:hidden">
          {t("mobileRoom")}
        </p>
      </section>

      <aside
        aria-label={t("controls")}
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
      >
        <section aria-labelledby="image-heading">
          <h2
            id="image-heading"
            className="mb-3 text-sm font-semibold text-secondary"
          >
            {t("yourImage")}
          </h2>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t("sourceImage")}
              className="h-16 w-16 rounded-lg border border-neutral-200 object-contain bg-background"
            />
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm text-secondary"
                title={fileName || t("sampleName")}
              >
                {fileName || t("sampleName")}
              </p>
              <button
                onClick={useSample}
                type="button"
                className="mt-1 text-xs text-primary underline underline-offset-4"
              >
                {t("useSample")}
              </button>
            </div>
          </div>
          <div className="relative mt-3 rounded-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
            <label
              htmlFor="room-image"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-primary py-2.5 text-sm font-medium text-primary"
            >
              <ImagePlus aria-hidden className="h-4 w-4" />
              {busy ? t("preparing") : t("chooseImage")}
            </label>
            <input
              ref={fileInput}
              id="room-image"
              type="file"
              accept={IMAGE_ACCEPT_ATTRIBUTE}
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) void selectFile(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
          <p className="mt-2 flex gap-1.5 text-[11px] leading-relaxed text-gray">
            <ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("privacy")}
          </p>
        </section>

        <section
          aria-labelledby="size-heading"
          className="border-t border-neutral-100 pt-5"
        >
          <h2
            id="size-heading"
            className="mb-3 text-sm font-semibold text-secondary"
          >
            {t("canvasSize")}
          </h2>
          <label
            htmlFor="room-preset"
            className="mb-1.5 block text-xs text-gray"
          >
            {t("standardSizes")}
          </label>
          <select
            id="room-preset"
            value={standard ? key : ""}
            onChange={(e) => chooseSize(e.target.value)}
            className={`${inputStyle} mb-3 text-sm`}
          >
            <option value="">{t("customSize")}</option>
            {STANDARD_SIZES.map((size) => {
              const [w, h] = size.split("x").map(Number);
              return (
                <option key={size} value={size}>
                  {t("sizeLabel", {
                    width: Math.max(w, h),
                    height: Math.min(w, h),
                  })}
                </option>
              );
            })}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="room-width"
                className="mb-1.5 block text-xs text-gray"
              >
                {t("width")}
              </label>
              <input
                id="room-width"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={inputStyle}
                aria-describedby="room-size-help"
                aria-invalid={!p.fits}
              />
            </div>
            <div>
              <label
                htmlFor="room-height"
                className="mb-1.5 block text-xs text-gray"
              >
                {t("height")}
              </label>
              <input
                id="room-height"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className={inputStyle}
                aria-describedby="room-size-help"
                aria-invalid={!p.fits}
              />
            </div>
          </div>
          <p
            id="room-size-help"
            className="mt-2 text-xs leading-relaxed text-gray"
          >
            {standard ? t("standardHint") : t("customHint")}
          </p>
          <button
            type="button"
            onClick={() => {
              setWidth("72");
              setHeight("48");
            }}
            className="mt-3 w-full rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-primary"
          >
            {t("demo")}
          </button>
        </section>

        <section
          aria-labelledby="finish-heading"
          className="border-t border-neutral-100 pt-5"
        >
          <h2
            id="finish-heading"
            className="mb-1 text-sm font-semibold text-secondary"
          >
            {t("finish")}
          </h2>
          <p className="mb-3 text-xs text-gray">
            {t("depth", {
              depth: number(GALLERY_DEPTH_INCHES),
              cm: number(GALLERY_DEPTH_INCHES * 2.54),
            })}
          </p>
          <label htmlFor="room-edge" className="sr-only">
            {t("edge")}
          </label>
          <select
            id="room-edge"
            value={edge}
            onChange={(e) => setEdge(e.target.value as EdgeStyle)}
            className={`${inputStyle} text-sm`}
          >
            {(["wrapped", "white", "black"] as const).map((value) => (
              <option key={value} value={value}>
                {t(`edges.${value}`)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-gray">
            {edge === "wrapped" ? t("wrapHint") : t("solidHint")}
          </p>
        </section>

        <section
          aria-labelledby="crop-heading"
          className="border-t border-neutral-100 pt-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2
              id="crop-heading"
              className="text-sm font-semibold text-secondary"
            >
              {t("cropTitle")}
            </h2>
            <button
              type="button"
              onClick={() => setCrop({ x: 0.5, y: 0.5 })}
              className="text-xs text-primary underline"
            >
              {t("centreCrop")}
            </button>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-gray">
            {t("cropHint")}
          </p>
          {(["x", "y"] as const).map((axis) => (
            <div key={axis} className="mt-2">
              <label
                className="mb-1 flex justify-between text-xs text-gray"
                htmlFor={`crop-${axis}`}
              >
                {t(axis === "x" ? "horizontal" : "vertical")}
                <span>{Math.round(crop[axis] * 100)}%</span>
              </label>
              <input
                id={`crop-${axis}`}
                type="range"
                min="0"
                max="100"
                value={Math.round(crop[axis] * 100)}
                onChange={(e) =>
                  setCrop((value) => ({
                    ...value,
                    [axis]: Number(e.target.value) / 100,
                  }))
                }
                className="h-6 w-full accent-primary"
              />
            </div>
          ))}
        </section>
        <div className="border-t border-neutral-100 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary">
            <input
              type="checkbox"
              checked={reference}
              onChange={(e) => setReference(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <Ruler aria-hidden className="h-4 w-4" />
            {t("showMeasurements")}
          </label>
          <Button
            icon={Download}
            onClick={download}
            disabled={!ready || !p.fits || busy}
            loading={downloading}
            className="mt-4 w-full !py-3 text-sm"
          >
            {t("download")}
          </Button>
          <p className="mt-2 text-center text-[11px] text-gray">
            {t("downloadHint")}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-gray sm:hidden">
          {t("disclaimer")}
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={`canvas-room-${width}x${height}.png`}
            className="block rounded-lg bg-green-50 p-3 text-center text-sm text-primary underline"
            data-testid="save-preview"
          >
            {t("savePng")}
          </a>
        )}
        <div role="status" aria-live="polite" className="text-xs text-gray">
          {busy ? t("preparing") : ready ? t("ready") : t("loading")}
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </aside>
    </div>
  );
}
