import { getTranslations } from "next-intl/server";
import {
  SectionContainer,
  SectionHeader,
  PageHeader,
  ContactInfo,
} from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Canvas Print Shop",
  description:
    "Learn about how Canvas Print Shop protects and handles your personal information. Our privacy policy outlines our data collection, use, and protection practices.",
};

export default async function PrivacyPolicy() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>{t("title")}</PageHeader>

        <div className="flex flex-col gap-8">
          {/* Last Updated */}
          <p className="text-gray text-center">
            {t("lastUpdated", { date: new Date().toLocaleDateString("en-CA") })}
          </p>

          {/* Sections */}
          {[
            "introduction",
            "informationWeCollect",
            "howWeUseInformation",
            "informationSharing",
            "dataSecurity",
            "yourRights",
            "cookiePolicy",
            "changesToPolicy",
          ].map((section) => (
            <section key={section}>
              <SectionHeader>{t(`${section}.title`)}</SectionHeader>
              <SectionContainer>
                <p>{t(`${section}.content`)}</p>
              </SectionContainer>
            </section>
          ))}

          {/* Contact Section */}
          <section>
            <SectionHeader>{t("questions.title")}</SectionHeader>
            <SectionContainer className="bg-primary/5 border border-primary/10">
              <p>{t("questions.content")}</p>
              <div className="mt-4">
                <ContactInfo />
              </div>
            </SectionContainer>
          </section>
        </div>
      </div>
    </main>
  );
}
