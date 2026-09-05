import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  coverCrop,
  inchesToMetres,
  placement,
  printCrop,
  ROOM,
} from "../src/lib/room-visualiser/geometry";
import { STANDARD_SIZES } from "../src/lib/room-visualiser/catalogue";

test("72 × 48 inches is exactly 1.8288 × 1.2192 metres within float precision", () => {
  assert.ok(Math.abs(inchesToMetres(72) - 1.8288) < 1e-12);
  assert.ok(Math.abs(inchesToMetres(48) - 1.2192) < 1e-12);
  assert.ok(Math.abs(inchesToMetres(1.5) - 0.0381) < 1e-12);
  assert.equal(placement({ width: 72, height: 48 }).fits, true);
});
test("real-world placement respects sofa clearance and ceiling without auto-scaling", () => {
  for (const size of [
    { width: 48, height: 36 },
    { width: 72, height: 48 },
    { width: 40, height: 60 },
  ]) {
    const p = placement(size);
    assert.equal(p.fits, true);
    assert.ok(p.centreY - p.height / 2 >= ROOM.usableBottom - 1e-12);
    assert.ok(p.centreY + p.height / 2 <= ROOM.usableTop + 1e-12);
    assert.equal(p.width, inchesToMetres(size.width));
  }
  for (const size of [
    { width: 160, height: 48 },
    { width: 48, height: 80 },
    { width: 0, height: 48 },
    { width: NaN, height: 48 },
    { width: 48, height: Infinity },
  ])
    assert.equal(placement(size).fits, false);
});
test("cover crop preserves scale in both axes and honours image extremes", () => {
  const left = coverCrop(2400, 1200, 1, { x: 0, y: 0.5 });
  const right = coverCrop(2400, 1200, 1, { x: 1, y: 0.5 });
  assert.deepEqual(left, { x: 0, y: 0, width: 1200, height: 1200 });
  assert.deepEqual(right, { x: 1200, y: 0, width: 1200, height: 1200 });
  const bottom = coverCrop(1200, 2400, 1.5, { x: 0.5, y: 1 });
  assert.equal(bottom.y, 1600);
  assert.equal(bottom.width / bottom.height, 1.5);
});
test("gallery wrap reserves the correct bleed, solid edges preserve face", () => {
  const size = { width: 72, height: 48 };
  const wrapped = printCrop(1500, 1020, size, { x: 0.5, y: 0.5 }, "wrapped");
  assert.equal(wrapped.bleed, 30);
  for (const [key, expected] of Object.entries({
    x: 30,
    y: 30,
    width: 1440,
    height: 960,
  })) {
    assert.ok(
      Math.abs(wrapped.face[key as keyof typeof wrapped.face] - expected) <
        1e-10
    );
  }
  assert.equal(
    wrapped.face.width / size.width,
    wrapped.face.height / size.height
  );
  const solid = printCrop(1500, 1020, size, { x: 0.5, y: 0.5 }, "white");
  assert.equal(solid.bleed, 0);
  assert.deepEqual(solid.face, solid.full);
});
test("preset snapshot matches sellable unframed gallery variants and excludes demo", () => {
  const snapshot = JSON.parse(
    fs.readFileSync(
      "assets-source/room-visualiser/catalogue-snapshot.json",
      "utf8"
    )
  );
  const values = new Set(
    snapshot.variants
      .filter(
        (v: { options: Record<string, string> }) =>
          v.options.frame === "none" && v.options.depth === "gallery"
      )
      .map((v: { options: Record<string, string> }) => v.options.size)
  );
  assert.deepEqual(new Set(STANDARD_SIZES), values);
  assert.equal(values.has("48x72"), false);
});
test("room web constants match Blender measurements", () => {
  const source = JSON.parse(
    fs.readFileSync("assets-source/room-visualiser/measurements.json", "utf8")
  );
  for (const key of [
    "sofaWidth",
    "sofaTop",
    "usableWidth",
    "usableBottom",
    "usableTop",
  ] as const)
    assert.equal(ROOM[key], source[key]);
  assert.deepEqual(ROOM.cameraPosition, source.camera.position);
  assert.deepEqual(ROOM.cameraTarget, source.camera.target);
  assert.equal(ROOM.cameraWidth, source.camera.width);
});
test("English and French prototype keys stay aligned", () => {
  const keys = (value: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(value)
      .flatMap(([key, v]) =>
        typeof v === "object" && v !== null
          ? keys(v as Record<string, unknown>, `${prefix}${key}.`)
          : [`${prefix}${key}`]
      )
      .sort();
  const en = JSON.parse(
    fs.readFileSync("messages/en.json", "utf8")
  ).RoomVisualiser;
  const fr = JSON.parse(
    fs.readFileSync("messages/fr.json", "utf8")
  ).RoomVisualiser;
  assert.deepEqual(keys(en), keys(fr));
});
