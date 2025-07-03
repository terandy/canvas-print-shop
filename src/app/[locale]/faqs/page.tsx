import { Metadata } from "next";
import { HelpCircle, Image, Package, Clock, Shield, Truck } from "lucide-react";
import {
  SectionHeader,
  SectionContainer,
  PageHeader,
  ContactSection,
} from "@/components";
import { getTranslations } from "next-intl/server";

// FAQ Item Component (reused from product-dropdowns)
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  return (
    <div className="border-b border-gray-100 last:border-0 py-4 sm:py-6">
      <h3 className="text-lg sm:text-xl font-semibold text-secondary mb-2 sm:mb-3 leading-tight">
        {question}
      </h3>
      <div className="text-gray-600 leading-relaxed text-sm sm:text-base">
        {answer}
      </div>
    </div>
  );
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "FAQ.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function FAQ() {
  // Get translations using the existing Product namespace
  const t = await getTranslations("Product");

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl">
        <PageHeader>{t("faq.title")}</PageHeader>

        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Image & Quality Questions */}
          <section>
            <SectionHeader icon={Image}>
              <span className="text-lg sm:text-xl">
                {t("faq.sections.imageQualityProduct")}
              </span>
            </SectionHeader>
            <SectionContainer>
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
                  question={t("faq.questions.durability.question")}
                  answer={t("faq.questions.durability.answer")}
                />
                <FAQItem
                  question={t("faq.questions.multipleCanvases.question")}
                  answer={t("faq.questions.multipleCanvases.answer")}
                />
              </div>
            </SectionContainer>
          </section>

          {/* Delivery & Pickup Questions */}
          <section>
            <SectionHeader icon={Truck}>
              <span className="text-lg sm:text-xl">
                {t("faq.sections.deliveryPickup")}
              </span>
            </SectionHeader>
            <SectionContainer>
              <div className="space-y-0">
                <FAQItem
                  question={t("faq.questions.deliveryTime.question")}
                  answer={t("faq.questions.deliveryTime.answer")}
                />
                <FAQItem
                  question={t("faq.questions.localPickupAvailable.question")}
                  answer={t("faq.questions.localPickupAvailable.answer")}
                />
              </div>
            </SectionContainer>
          </section>

          {/* Satisfaction & Support */}
          <section>
            <SectionHeader icon={Shield}>
              <span className="text-lg sm:text-xl">
                {t("faq.sections.satisfactionSupport")}
              </span>
            </SectionHeader>
            <SectionContainer>
              <div className="space-y-0">
                <FAQItem
                  question={t("faq.questions.satisfaction.question")}
                  answer={t("faq.questions.satisfaction.answer")}
                />
              </div>
            </SectionContainer>
          </section>

          {/* Product Details Section */}
          <section>
            <SectionHeader icon={Package}>{t("details.title")}</SectionHeader>
            <SectionContainer>
              <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                <li>{t("details.premiumCanvas")}</li>
                <li>{t("details.fadeResistant")}</li>
                <li>{t("details.handStretched")}</li>
                <li>{t("details.readyToHang")}</li>
                <li>{t("details.madeInQuebec")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Delivery Details Section */}
          <section>
            <SectionHeader icon={Clock}>
              {t("deliveryDetails.title")}
            </SectionHeader>
            <SectionContainer>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("deliveryDetails.processingTime")}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {t("deliveryDetails.processingTimeValue")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("deliveryDetails.localPickup")}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {t("deliveryDetails.localPickupValue")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("deliveryDetails.totalDeliveryTime")}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {t("deliveryDetails.totalDeliveryTimeValue")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {t("deliveryDetails.shippingCost")}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {t("deliveryDetails.shippingCostValue")}
                  </span>
                </div>
              </div>
            </SectionContainer>
          </section>

          {/* Quality Assurance Section */}
          <section>
            <SectionHeader icon={HelpCircle}>
              {t("qualityAssurance.title")}
            </SectionHeader>
            <SectionContainer>
              <p className="mb-4 text-sm sm:text-base">
                {t("qualityAssurance.description")}
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4 sm:mb-6 text-sm sm:text-base">
                <li>{t("qualityAssurance.satisfaction")}</li>
                <li>{t("qualityAssurance.replacement")}</li>
                <li>{t("qualityAssurance.expertSupport")}</li>
              </ul>
              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-sm sm:text-base">
                  🛡️ {t("guarantee.title")}
                </p>
                <p className="text-green-700 text-xs sm:text-sm mt-1 leading-relaxed">
                  {t("guarantee.description")}
                </p>
              </div>
            </SectionContainer>
          </section>

          <ContactSection />
        </div>
      </div>
    </main>
  );
}
