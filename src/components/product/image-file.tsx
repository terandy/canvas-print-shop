"use client";
import { useProduct } from "@/contexts/product-context";
import { deleteImage } from "@/lib/s3/actions/image";
import { X } from "lucide-react";
import Image from "next/image";
import { startTransition } from "react";
import Button from "../buttons/button";
import { useTranslations } from "next-intl";

interface Props {
  imgURL: string;
}

const ImageFile: React.FC<Props> = ({ imgURL }) => {
  const { deleteImgURL } = useProduct();
  const t = useTranslations("common");

  const removeImage = () => {
    startTransition(() => {
      deleteImgURL();
      deleteImage(imgURL);
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
      <span>{t("image")}</span>
      <Button
        onClick={removeImage}
        title={t("removeImage")}
        onMouseOver={(e) => e.stopPropagation()}
        icon={X}
        variant="ghost"
        size="sm"
        className="hover:text-red-700"
      />
    </div>
  );
};

export default ImageFile;
