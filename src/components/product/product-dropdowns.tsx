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
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="text-secondary font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600 prose prose-sm border-t border-gray-100">
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
          <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
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

const ProductDropdowns = () => {
  const t = useTranslations("Product");

  return (
    <>
      {/* Delivery Details - Open by default */}
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

      {/* Product Details */}
      <Dropdown title={t("details.title")}>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("details.premiumCanvas")}</li>
          <li>{t("details.fadeResistant")}</li>
          <li>{t("details.handStretched")}</li>
          <li>{t("details.readyToHang")}</li>
          <li>{t("details.madeInQuebec")}</li>
        </ul>
      </Dropdown>

      {/* FAQs */}
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

      {/* Quality Assurance */}
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
    </>
  );
};

export default ProductDropdowns;
