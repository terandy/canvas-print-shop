import { Metadata } from "next";
import { RefreshCw, ShieldCheck, Clock } from "lucide-react";
import {
  SectionHeader,
  SectionContainer,
  PageHeader,
  ContactSection,
} from "@/components";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ReturnsPolicy.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ReturnsPolicy() {
  // Get translations for this page
  const t = await getTranslations("ReturnsPolicy");

  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>{t("pageTitle")}</PageHeader>
        <div className="flex flex-col gap-8">
          {/* Introduction */}
          <section>
            <SectionContainer variant="secondary">
              <p className="text-lg leading-relaxed">{t("introduction")}</p>
            </SectionContainer>
          </section>

          {/* Return Window */}
          <section>
            <SectionHeader icon={Clock}>
              {t("returnWindow.title")}
            </SectionHeader>
            <SectionContainer>
              <p>{t("returnWindow.description")}</p>
              <ul>
                <li>{t("returnWindow.reasons.quality")}</li>
                <li>{t("returnWindow.reasons.damage")}</li>
                <li>{t("returnWindow.reasons.incorrect")}</li>
                <li>{t("returnWindow.reasons.expectations")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Return Process */}
          <section>
            <SectionHeader icon={RefreshCw}>
              {t("returnProcess.title")}
            </SectionHeader>
            <SectionContainer>
              <p>{t("returnProcess.description")}</p>
              <ul>
                <li>{t("returnProcess.requirements.orderInfo")}</li>
                <li>{t("returnProcess.requirements.reason")}</li>
                <li>{t("returnProcess.requirements.photos")}</li>
                <li>{t("returnProcess.requirements.preference")}</li>
              </ul>
              <SectionContainer variant="secondary">
                <p className="text-secondary font-medium">
                  {t("returnProcess.response")}
                </p>
              </SectionContainer>
            </SectionContainer>
          </section>

          {/* Our Guarantee */}
          <section>
            <SectionHeader icon={ShieldCheck}>
              {t("guarantee.title")}
            </SectionHeader>
            <SectionContainer>
              <p>{t("guarantee.description")}</p>
              <ul>
                <li>{t("guarantee.benefits.replacements")}</li>
                <li>{t("guarantee.benefits.refunds")}</li>
                <li>{t("guarantee.benefits.shipping")}</li>
                <li>{t("guarantee.benefits.support")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Refund Process */}
          <section>
            <SectionHeader>{t("refundProcess.title")}</SectionHeader>
            <SectionContainer>
              <ul>
                <li>{t("refundProcess.timeline")}</li>
                <li>{t("refundProcess.method")}</li>
                <li>{t("refundProcess.confirmation")}</li>
                <li>{t("refundProcess.bankProcessing")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Exceptions */}
          <section>
            <SectionHeader>{t("exceptions.title")}</SectionHeader>
            <SectionContainer>
              <p>{t("exceptions.description")}</p>
              <ul>
                <li>{t("exceptions.items.customSizes")}</li>
                <li>{t("exceptions.items.misuse")}</li>
                <li>{t("exceptions.items.lateReturns")}</li>
              </ul>
            </SectionContainer>
          </section>
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
