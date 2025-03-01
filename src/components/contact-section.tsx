import SectionHeader from "./section-header";
import SectionContainer from "./section-container";
import { Mail } from "lucide-react";
import ContactInfo from "./contact-info";
import { getTranslations } from "next-intl/server";

const ContactSection = async () => {
  const t = await getTranslations("Contact");

  return (
    <section>
      <SectionHeader icon={Mail}>{t("needHelp")}</SectionHeader>
      <SectionContainer className="bg-secondary/5 border border-secondary/10">
        <p>{t("customerServiceMessage")}</p>
        <ContactInfo />
      </SectionContainer>
    </section>
  );
};

export default ContactSection;
