"use client";
import { useEffect, useRef } from "react";
import { loadImage } from "@/lib/room-visualiser/local-image";
import { placement, printCrop, ROOM } from "@/lib/room-visualiser/geometry";
import type { ViewerProps } from "./room-viewer";

/** Orthographic projection of the SAME fixed camera; no Three.js/WebGL required. */
function project(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number
) {
  const p = ROOM.cameraPosition,
    t = ROOM.cameraTarget;
  const dx = t[0] - p[0],
    dy = t[1] - p[1],
    dz = t[2] - p[2];
  const length = Math.hypot(dx, dy, dz),
    flat = Math.hypot(dx, dz);
  const rx = -dz / flat,
    rz = dx / flat;
  const ux = (-dy * rz) / length,
    uy = (dx * rz - dz * rx) / length,
    uz = (dy * rx) / length;
  const scale = width / ROOM.cameraWidth;
  return {
    x: width / 2 + ((x - t[0]) * rx + (z - t[2]) * rz) * scale,
    y:
      height / 2 -
      ((x - t[0]) * ux + (y - t[1]) * uy + (z - t[2]) * uz) * scale,
  };
}

export default function FlatFallback({
  imageUrl,
  dimensions,
  crop,
  edge,
  label,
  onReady,
}: ViewerProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current!;
    const draw = async () => {
      try {
        const [room, image] = await Promise.all([
          loadImage("/room-visualiser/room-poster.jpg").catch(() => null),
          loadImage(imageUrl),
        ]);
        if (cancelled) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 1200;
        canvas.height = 800;
        ctx.fillStyle = "#e3ded3";
        ctx.fillRect(0, 0, 1200, 800);
        if (room) ctx.drawImage(room, 0, 0, 1200, 800);
        const p = placement(dimensions);
        if (p.fits) {
          const { face } = printCrop(
            image.naturalWidth,
            image.naturalHeight,
            dimensions,
            crop,
            edge
          );
          const a = project(
            -p.width / 2,
            p.centreY + p.height / 2,
            0.0501,
            1200,
            800
          );
          const b = project(
            p.width / 2,
            p.centreY + p.height / 2,
            0.0501,
            1200,
            800
          );
          const c = project(
            -p.width / 2,
            p.centreY - p.height / 2,
            0.0501,
            1200,
            800
          );
          ctx.save();
          ctx.transform(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y, a.x, a.y);
          ctx.shadowColor = "rgba(20,15,10,.22)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#ddd";
          ctx.fillRect(0, 0, 1, 1);
          ctx.shadowBlur = 0;
          ctx.drawImage(
            image,
            face.x,
            face.y,
            face.width,
            face.height,
            0,
            0,
            1,
            1
          );
          ctx.restore();
        }
        ready.current(canvas);
      } catch {
        ready.current(null);
      }
    };
    void draw();
    return () => {
      cancelled = true;
      ready.current(null);
    };
  }, [imageUrl, dimensions, crop, edge]);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
      data-testid="room-fallback"
    />
  );
}
