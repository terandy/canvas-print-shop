import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./helpers/load-module";

test("an upload finishing after a size change keeps the customer's latest choices", () => {
  const values: unknown[] = [];
  let hook = 0;
  let provided: any;
  const react = {
    createContext: () => ({
      Provider: ({ value, children }: any) => {
        provided = value;
        return children;
      },
    }),
    useContext: () => provided,
    useState: (initial: unknown) => {
      const index = hook++;
      if (!(index in values)) values[index] = initial;
      return [
        values[index],
        (update: unknown) => {
          values[index] =
            typeof update === "function"
              ? (update as (value: unknown) => unknown)(values[index])
              : update;
        },
      ];
    },
    useMemo: (compute: () => unknown) => compute(),
    useEffect: () => undefined,
  };
  const context = loadModule<
    typeof import("../src/contexts/product-context/context")
  >("src/contexts/product-context/context.tsx", {
    react: { __esModule: true, default: react, ...react },
    "react/jsx-runtime": {
      jsx: (Component: any, props: any) => Component(props),
    },
    "./utils": {
      getInitialFormState: () => ({
        size: "8x10",
        imgURL: "placeholder",
        frame: "none",
        depth: "gallery",
      }),
      getSelectedVariant: () => undefined,
    },
    "./data": {
      depthForFrame: (frame: string) =>
        frame === "none" ? "gallery" : "regular",
    },
    "@/lib/constants": { DEFAULT_CANVAS_IMAGE: "placeholder" },
  });
  context.ProductProvider({
    children: null,
    product: { handle: "canvas" } as any,
    cartItemID: null,
  });
  const staleUpdateField = context.useProduct().updateField;
  staleUpdateField("size", "12x18");
  staleUpdateField("imgURL", "https://example.test/uploaded.jpg");
  staleUpdateField("frame", "black");
  assert.deepEqual(values[1], {
    size: "12x18",
    imgURL: "https://example.test/uploaded.jpg",
    frame: "black",
    depth: "regular",
  });
});
