// src/components/product/product-dropdowns.tsx
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left px-5 py-4 md:px-6 md:py-5 text-[#0F172A] hover:bg-[#FFF7ED] transition-colors"
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#FF9933] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#FF9933] flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-gray-600 prose prose-sm border-t border-slate-100 bg-[#FFF7ED]/40 md:px-6">
          {children}
        </div>
      )}
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-start w-full text-left py-3 hover:text-primary transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
        )}
      </button>
      {isOpen && (
        <div className="pb-3 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

type ProductDropdownsProps = {
  hideFaq?: boolean;
  hideDelivery?: boolean;
  hideDetails?: boolean;
  hideQuality?: boolean;
};

const ProductDropdowns = ({
  hideFaq = false,
  hideDelivery = false,
  hideDetails = false,
  hideQuality = false,
}: ProductDropdownsProps = {}) => {
  const t = useTranslations("Product");

  return (
    <>
      {/* Delivery Details - Open by default */}
      {!hideDelivery && (
        <Dropdown title={t("deliveryDetails.title")} defaultOpen={true}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("deliveryDetails.processingTime")}
              </span>
              <span className="font-medium">
                {t("deliveryDetails.processingTimeValue")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("deliveryDetails.localPickup")}
              </span>
              <span className="font-medium">
                {t("deliveryDetails.localPickupValue")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("deliveryDetails.totalDeliveryTime")}
              </span>
              <span className="font-medium">
                {t("deliveryDetails.totalDeliveryTimeValue")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("deliveryDetails.shippingCost")}
              </span>
              <span className="font-medium">
                {t("deliveryDetails.shippingCostValue")}
              </span>
            </div>
          </div>
        </Dropdown>
      )}

      {/* Product Details */}
      {!hideDetails && (
        <Dropdown title={t("details.title")}>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t("details.premiumCanvas")}</li>
            <li>{t("details.fadeResistant")}</li>
            <li>{t("details.handStretched")}</li>
            <li>{t("details.readyToHang")}</li>
            <li>{t("details.madeInQuebec")}</li>
          </ul>
        </Dropdown>
      )}

      {/* FAQs */}
      {!hideFaq && (
        <Dropdown title={t("faq.title")}>
          <div className="space-y-0">
            <FAQItem
              question={t("faq.questions.imageQuality.question")}
              answer={t("faq.questions.imageQuality.answer")}
            />
            <FAQItem
              question={t("faq.questions.depthDifference.question")}
              answer={t("faq.questions.depthDifference.answer")}
            />
            <FAQItem
              question={t("faq.questions.localPickupAvailable.question")}
              answer={t("faq.questions.localPickupAvailable.answer")}
            />
            <FAQItem
              question={t("faq.questions.satisfaction.question")}
              answer={t("faq.questions.satisfaction.answer")}
            />
            <FAQItem
              question={t("faq.questions.durability.question")}
              answer={t("faq.questions.durability.answer")}
            />
            <FAQItem
              question={t("faq.questions.deliveryTime.question")}
              answer={t("faq.questions.deliveryTime.answer")}
            />
            <FAQItem
              question={t("faq.questions.multipleCanvases.question")}
              answer={t("faq.questions.multipleCanvases.answer")}
            />
          </div>
        </Dropdown>
      )}

      {/* Quality Assurance */}
      {!hideQuality && (
        <Dropdown title={t("qualityAssurance.title")}>
          <p className="mb-3">{t("qualityAssurance.description")}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t("qualityAssurance.satisfaction")}</li>
            <li>{t("qualityAssurance.replacement")}</li>
            <li>{t("qualityAssurance.expertSupport")}</li>
          </ul>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium text-sm">
              🛡️ {t("guarantee.title")}
            </p>
            <p className="text-green-700 text-sm mt-1">
              {t("guarantee.description")}
            </p>
          </div>
        </Dropdown>
      )}
    </>
  );
};

export default ProductDropdowns;
