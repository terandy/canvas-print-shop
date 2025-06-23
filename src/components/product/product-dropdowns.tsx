"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

// Dropdown Component
const Dropdown = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-secondary font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 prose prose-sm">{children}</div>
      )}
    </div>
  );
};

const ProductDropdowns = () => {
  const t = useTranslations("Product");

  return (
    <>
      <Dropdown title={t("details.title")} defaultOpen={true}>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("details.premiumCanvas")}</li>
          <li>{t("details.fadeResistant")}</li>
          <li>{t("details.handStretched")}</li>
          <li>{t("details.readyToHang")}</li>
          <li>{t("details.madeInQuebec")}</li>
        </ul>
      </Dropdown>

      <Dropdown title={t("shippingTime.title")}>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("shippingTime.production")}</li>
          <li>{t("shippingTime.localPickup")}</li>
          <li>{t("shippingTime.canadaPost")}</li>
          <li>{t("shippingTime.expressAvailable")}</li>
        </ul>
      </Dropdown>

      <Dropdown title={t("qualityAssurance.title")}>
        <p>{t("qualityAssurance.description")}</p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>{t("qualityAssurance.satisfaction")}</li>
          <li>{t("qualityAssurance.replacement")}</li>
          <li>{t("qualityAssurance.expertSupport")}</li>
        </ul>
      </Dropdown>
    </>
  );
};

export default ProductDropdowns;
