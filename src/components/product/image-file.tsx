"use client";
import { useProduct, useUpdateURL } from "@/contexts/product-context";
import { deleteImage } from "@/lib/s3/actions/image";
import { X } from "lucide-react";
import Image from "next/image";
import { startTransition } from "react";

interface Props {
  imgURL: string;
}

const ImageFile: React.FC<Props> = ({ imgURL }) => {
  const { deleteOption } = useProduct();
  const updateURL = useUpdateURL();

  const removeImage = () => {
    startTransition(() => {
      const newState = deleteOption("imgURL");
      deleteImage(imgURL);
      updateURL(newState);
    });
  };

  return (
    <div className="flex gap-2 mt-2 mb-2">
      <Image
        src={imgURL}
        alt="Preview"
        width={25}
        height={25}
        className="object-contain rounded-lg border-2 border-gray-200"
      />
      <span>Image</span>
      <button
        onClick={removeImage}
        className="w-6 h-6 text-gray-600 hover:text-red-500"
        title="remove image"
        onMouseOver={(e) => e.stopPropagation()}
      >
        <X />
      </button>
    </div>
  );
};

export default ImageFile;
