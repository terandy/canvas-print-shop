"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  GALLERY_DEPTH_INCHES,
  inchesToMetres,
  placement,
  printCrop,
  ROOM,
  type CropPosition,
  type Dimensions,
  type EdgeStyle,
} from "@/lib/room-visualiser/geometry";
import { loadImage } from "@/lib/room-visualiser/local-image";

export type ViewerProps = {
  imageUrl: string;
  dimensions: Dimensions;
  crop: CropPosition;
  edge: EdgeStyle;
  reference: boolean;
  label: string;
  onReady: (canvas: HTMLCanvasElement | null) => void;
  onError: () => void;
};

type Runtime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  artwork: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial[]>;
  shadow: THREE.Mesh;
  guides: THREE.LineSegments;
  render: (changedAt?: number) => void;
};

function disposeScene(scene: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
      material.dispose();
    });
  });
  textures.forEach((texture) => texture.dispose());
}

export default function RoomViewer({
  imageUrl,
  dimensions,
  crop,
  edge,
  reference,
  label,
  onReady,
  onError,
}: ViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const [version, setVersion] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const callbacks = useRef({ onReady, onError, label });
  callbacks.current = { onReady, onError, label };

  useEffect(() => {
    let cancelled = false;
    setImage(null);
    callbacks.current.onReady(null);
    loadImage(imageUrl)
      .then((value) => {
        if (!cancelled) setImage(value);
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError();
      });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    const container = host.current!;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene | undefined;
    const fail = () => {
      if (!cancelled) callbacks.current.onError();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    const start = async () => {
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.setPixelRatio(
          Math.min(
            window.devicePixelRatio,
            window.innerWidth < 768 ? 1.25 : 1.75
          )
        );
        renderer.setClearColor("#e3ded3");
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute("aria-label", callbacks.current.label);
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-2.9, 2.9, 2, -2, 0.1, 30);
        camera.position.set(...ROOM.cameraPosition);
        camera.lookAt(...ROOM.cameraTarget);
        const material = () =>
          new THREE.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 1,
            metalness: 0,
          });
        const artwork = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 0.0381),
          Array.from({ length: 6 }, material)
        );
        artwork.name = "CustomerCanvas";
        artwork.visible = false;
        scene.add(artwork);
        scene.add(new THREE.HemisphereLight(0xffffff, 0xb8afa1, 2.3));
        const light = new THREE.DirectionalLight(0xfff2df, 1.3);
        light.position.set(-3, 4, 5);
        scene.add(light);
        // Soft contact shadow, separate from the immutable baked room lighting.
        const shadowImage = document.createElement("canvas");
        shadowImage.width = shadowImage.height = 64;
        const ctx = shadowImage.getContext("2d")!;
        const gradient = ctx.createRadialGradient(32, 32, 10, 32, 32, 32);
        gradient.addColorStop(0, "rgba(40,30,20,.32)");
        gradient.addColorStop(0.7, "rgba(40,30,20,.20)");
        gradient.addColorStop(1, "rgba(40,30,20,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(shadowImage),
            transparent: true,
            depthWrite: false,
          })
        );
        shadow.position.z = 0.003;
        scene.add(shadow);
        const guides = new THREE.LineSegments(
          new THREE.BufferGeometry(),
          new THREE.LineBasicMaterial({ color: 0x615347, depthTest: false })
        );
        guides.renderOrder = 10;
        scene.add(guides);
        const currentRenderer = renderer,
          currentScene = scene;
        const render = (changedAt = performance.now()) => {
          if (frame || cancelled) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            if (!cancelled) {
              const started = performance.now();
              currentRenderer.render(currentScene, camera);
              currentRenderer.domElement.dataset.updateMs = String(
                performance.now() - changedAt
              );
              currentRenderer.domElement.dataset.renderMs = String(
                performance.now() - started
              );
              currentRenderer.domElement.dataset.drawCalls = String(
                currentRenderer.info.render.calls
              );
              currentRenderer.domElement.dataset.triangles = String(
                currentRenderer.info.render.triangles
              );
              currentRenderer.domElement.dispatchEvent(
                new CustomEvent("room-render")
              );
            }
          });
        };
        // Synchronous render hook lets downloads capture without a persistent buffer.
        const capture = () => currentRenderer.render(currentScene, camera);
        renderer.domElement.addEventListener("room-capture", capture);
        runtime.current = {
          renderer,
          scene,
          camera,
          artwork,
          shadow,
          guides,
          render,
        };
        observer = new ResizeObserver(() => {
          const { width, height } = container.getBoundingClientRect();
          const halfWidth = ROOM.cameraWidth / 2;
          camera.left = -halfWidth;
          camera.right = halfWidth;
          camera.top = (halfWidth * height) / width;
          camera.bottom = -camera.top;
          camera.updateProjectionMatrix();
          currentRenderer.setSize(width, height);
          render();
        });
        observer.observe(container);
        const gltf = await new GLTFLoader().loadAsync(
          "/room-visualiser/living-room.glb"
        );
        if (cancelled) {
          disposeScene(gltf.scene);
          return;
        }
        scene.add(gltf.scene);
        setVersion((value) => value + 1);
      } catch {
        fail();
      }
    };
    void start();
    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(frame);
      runtime.current = null;
      if (scene) disposeScene(scene);
      if (renderer) {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost
        );
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      callbacks.current.onReady(null);
    };
  }, []);

  useEffect(() => {
    runtime.current?.renderer.domElement.setAttribute("aria-label", label);
  }, [label]);

  useEffect(() => {
    const state = runtime.current;
    if (!state || !image || !version) return;
    const changedAt = performance.now();
    const { artwork, shadow, guides, renderer, render } = state;
    const p = placement(dimensions);
    artwork.visible = shadow.visible = p.fits;
    guides.visible = reference && p.fits;
    if (p.fits) {
      const depth = inchesToMetres(GALLERY_DEPTH_INCHES);
      const geometry = new THREE.BoxGeometry(p.width, p.height, depth);
      const { face, bleed } = printCrop(
        image.naturalWidth,
        image.naturalHeight,
        dimensions,
        crop,
        edge
      );
      // BoxGeometry order: right, left, top, bottom, front, back.
      // Each surface samples its own contiguous strip of the same cover crop.
      const rects = [
        {
          x: face.x + face.width,
          y: face.y,
          width: bleed,
          height: face.height,
        },
        { x: face.x - bleed, y: face.y, width: bleed, height: face.height },
        { x: face.x, y: face.y - bleed, width: face.width, height: bleed },
        {
          x: face.x,
          y: face.y + face.height,
          width: face.width,
          height: bleed,
        },
        face,
        face,
      ];
      const uv = geometry.attributes.uv;
      rects.forEach((rect, index) => {
        for (let corner = 0; corner < 4; corner++) {
          const u = corner % 2;
          const v = corner < 2 ? 0 : 1;
          uv.setXY(
            index * 4 + corner,
            (rect.x + u * rect.width) / image.naturalWidth,
            1 - (rect.y + v * rect.height) / image.naturalHeight
          );
        }
      });
      artwork.geometry.dispose();
      artwork.geometry = geometry;
      artwork.position.set(0, p.centreY, 0.012 + depth / 2);
      const oldTextures = new Set(
        artwork.material.map((m) => m.map).filter(Boolean)
      );
      const texture =
        artwork.material[4].map?.image === image
          ? artwork.material[4].map
          : new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy()
      );
      if (!oldTextures.has(texture)) texture.needsUpdate = true;
      artwork.material.forEach((m, index) => {
        m.map = index === 4 || edge === "wrapped" ? texture : null;
        m.color.set(
          index === 4 || edge === "wrapped"
            ? "#fff"
            : edge === "black"
              ? "#282522"
              : "#f7f5ed"
        );
        m.needsUpdate = true;
      });
      oldTextures.forEach((t) => {
        if (t !== texture) t?.dispose();
      });
      shadow.scale.set(p.width + 0.16, p.height + 0.14, 1);
      shadow.position.set(0.018, p.centreY - 0.025, 0.003);
      const x = p.width / 2,
        y = p.centreY + p.height / 2 + 0.1;
      const verts: number[] = [];
      const segment = (a: number[], b: number[]) => verts.push(...a, ...b);
      segment([-x, y, 0.07], [x, y, 0.07]);
      for (const xx of [-x, x])
        segment([xx, y - 0.035, 0.07], [xx, y + 0.035, 0.07]);
      const sx = ROOM.sofaWidth / 2;
      segment([-sx, 0.2, 1.19], [sx, 0.2, 1.19]);
      for (const xx of [-sx, sx]) segment([xx, 0.16, 1.19], [xx, 0.24, 1.19]);
      const hx = x + 0.1;
      segment(
        [hx, p.centreY - p.height / 2, 0.07],
        [hx, p.centreY + p.height / 2, 0.07]
      );
      for (const yy of [p.centreY - p.height / 2, p.centreY + p.height / 2])
        segment([hx - 0.035, yy, 0.07], [hx + 0.035, yy, 0.07]);
      guides.geometry.dispose();
      guides.geometry = new THREE.BufferGeometry();
      guides.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(verts, 3)
      );
    }
    render(changedAt);
    const readyFrame = requestAnimationFrame(() => {
      renderer.domElement.dataset.pixelRatio = String(renderer.getPixelRatio());
      renderer.domElement.dataset.imageWidth = String(image.naturalWidth);
      renderer.domElement.dataset.imageHeight = String(image.naturalHeight);
      renderer.domElement.dataset.canvasWidthMetres = String(p.width);
      renderer.domElement.dataset.canvasHeightMetres = String(p.height);
      renderer.domElement.dataset.cameraPosition = state.camera.position
        .toArray()
        .join(",");
      if (!renderer.domElement.dataset.readyMs)
        renderer.domElement.dataset.readyMs = String(performance.now());
      callbacks.current.onReady(renderer.domElement);
      if (!performance.getEntriesByName("room-visualiser-ready").length)
        performance.mark("room-visualiser-ready");
    });
    return () => cancelAnimationFrame(readyFrame);
  }, [image, dimensions, crop, edge, reference, version]);

  return (
    <div
      ref={host}
      className="absolute inset-0 overflow-hidden [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      data-testid="room-webgl"
    />
  );
}
