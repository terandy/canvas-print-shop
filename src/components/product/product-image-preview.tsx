"use client";

import React from "react";
import { useProduct } from "@/contexts";
import CanvasPreviewer from "./canvas-preview";
import ImageUploader from "./image-uploader";
import { DEFAULT_CANVAS_IMAGE } from "@/lib/constants";

interface Props {
  className?: string;
}

const ProductImagePreview: React.FC<Props> = ({ className }) => {
  const {
    state,
    imgFileUrl,
    product: { handle },
  } = useProduct();
  return (
    <div className={className}>
      {(imgFileUrl || state.imgURL !== DEFAULT_CANVAS_IMAGE) && (
        <CanvasPreviewer
          className={className}
          src={imgFileUrl ?? state.imgURL}
          size={state.size}
          direction={state.direction}
          borderStyle={state.borderStyle}
          depth={state.depth}
          frame={state.frame}
        />
      )}
      <ImageUploader className="max-w-full" />
    </div>
  );
};

export default ProductImagePreview;
