"use client";

import React from "react";
import { useProduct } from "@/contexts";
import CanvasPreviewer from "./canvas-preview";

interface Props {
  className?: string;
}

const ProductImagePreview: React.FC<Props> = ({ className }) => {
  const { state } = useProduct();

  return (
    <CanvasPreviewer
      className={className}
      src={state.imgURL}
      size={state.size}
      direction={state.direction}
      borderStyle={state.borderStyle}
    />
  );
};

export default ProductImagePreview;
