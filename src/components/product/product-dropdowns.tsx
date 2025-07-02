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

  // FAQ data
  const faqs = [
    {
      question: "How do I know if my image quality is good enough?",
      answer:
        "Our system automatically checks your image resolution and shows a quality indicator (Poor, Normal or Perfect) when you select a canvas size. We recommend 'Perfect' quality for the best results.",
    },
    {
      question: "What's the difference between Regular and Gallery depth?",
      answer:
        "Regular depth (0.75 inches) is our standard option, while Gallery depth (1.5 inches) creates a more dramatic, museum-like appearance with deeper sides.",
    },
    {
      question: "Do you offer local pickup?",
      answer:
        "Yes! We offer free local pickup at our Quebec City location during business hours (Monday-Friday, 9am-5pm EST). You'll receive an email when your order is ready.",
    },
    {
      question: "What if I'm not satisfied with my canvas?",
      answer:
        "We offer a 30-day satisfaction guarantee. If you're not completely happy with your canvas, we'll work with you to make it right or provide a full refund.",
    },
    {
      question: "How long will my canvas last?",
      answer:
        "Our canvases are printed with UVgel technology and guaranteed not to fade for over 30 years. They're also scratch and water-resistant for long-lasting beauty.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "We typically need 2 - 4 days to produce, package and dispatch your canvas. Please allow additional transit time based on the shipping option you choose.",
    },
    {
      question: "Can I order multiple canvases of the same image?",
      answer:
        "Absolutely! You can create multiple canvas designs with different sizes and framing options from the same image.",
    },
  ];

  return (
    <>
      {/* Delivery Details - Open by default */}
      <Dropdown title="Delivery Details" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Processing time:</span>
            <span className="font-medium">2-4 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Local pickup:</span>
            <span className="font-medium">Available after 4 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total delivery time:</span>
            <span className="font-medium">
              Approximately 5-10 business days
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping Cost:</span>
            <span className="font-medium">
              Available at checkout (FREE shipping on orders over $150)
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
      <Dropdown title="Frequently Asked Questions">
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
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
            🛡️ 30-Year Print Quality Guarantee
          </p>
          <p className="text-green-700 text-sm mt-1">
            We stand behind our premium UVgel printing technology with an
            industry-leading guarantee.
          </p>
        </div>
      </Dropdown>
    </>
  );
};

export default ProductDropdowns;
