"use client";

import React from "react";
import { useProduct } from "@/contexts";
import CanvasPreviewer from "./canvas-preview";
import { UnderConstruction } from "../alerts";

interface Props {
  className?: string;
}

const ProductImagePreview: React.FC<Props> = ({ className }) => {
  const {
    state,
    imgFileUrl,
    product: { handle },
  } = useProduct();

  switch (handle) {
    case "canvas":
      return (
        <CanvasPreviewer
          className={className}
          src={imgFileUrl ?? state.imgURL}
          size={state.size}
          direction={state.direction}
          borderStyle={state.borderStyle}
        />
      );
    default:
      return <UnderConstruction />;
  }
};

export default ProductImagePreview;
