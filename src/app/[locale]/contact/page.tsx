import React from "react";
import { Mail, Phone, MapPin, LucideIcon, Store } from "lucide-react";
import { EMAIL, PHONE, ADDRESS } from "@/lib/constants";
import {
  BUSINESS_DATA,
  getLocationAddressLines,
  type SupportedLocale,
} from "@/lib/business-data";
import { PageHeader, SectionHeader, SectionContainer } from "@/components";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale, "/contact"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      ...openGraphMetadata(locale, "/contact"),
    },
  };
}

interface ContactSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  label: React.ReactNode;
}

const ContactSection = ({
  icon: Icon,
  title,
  subtitle,
  href,
  label,
}: ContactSectionProps) => (
  <SectionContainer className="transition-all hover:border-primary/10 hover:bg-primary/5">
    <div className="flex items-start gap-6">
      <div className="bg-primary/10 rounded-full p-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 space-y-3">
        <SectionHeader className="!mt-4">{title}</SectionHeader>
        <p className="text-gray">{subtitle}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </Link>
      </div>
    </div>
  </SectionContainer>
);

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Contact");
  const { quebecCityWorkshop, montrealBranch } = BUSINESS_DATA.locations;
  const pickupLocations = [
    {
      location: quebecCityWorkshop,
      name: t("locations.quebecCityName"),
      note: t("locations.quebecCityNote"),
      hours: t("openingHours.value"),
    },
    {
      location: montrealBranch,
      name: t("locations.montrealName"),
      note: t("locations.montrealNote"),
      // No confirmed opening hours are published for Montreal yet.
      hours: t("locations.hoursUnavailable"),
    },
  ].filter(({ location }) => location.localPickup === true);

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <div className="mb-16 text-center space-y-4">
          <PageHeader className="!mb-0">{t("pageTitle")}</PageHeader>
          <p className="text-lg text-gray max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-8">
          <ContactSection
            icon={Mail}
            title={t("email.title")}
            subtitle={t("email.subtitle")}
            href={EMAIL.href}
            label={EMAIL.label}
          />

          <ContactSection
            icon={Phone}
            title={t("phone.title")}
            subtitle={t("openingHours.value")}
            href={PHONE.href}
            label={PHONE.label}
          />

          <ContactSection
            icon={MapPin}
            title={t("address.title")}
            subtitle={t("openingHours.value")}
            href={ADDRESS.href}
            label={
              <address className="not-italic">
                {ADDRESS.label.split("::").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            }
          />
        </div>

        {pickupLocations.length > 0 && (
          <section className="mt-16" aria-labelledby="locations-heading">
            <SectionHeader id="locations-heading">
              {t("locations.heading")}
            </SectionHeader>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {pickupLocations.map(({ location, name, note, hours }) => (
                <SectionContainer key={location.id}>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-secondary">{name}</h3>
                      <address className="not-italic text-sm text-gray">
                        {getLocationAddressLines(
                          location,
                          locale as SupportedLocale
                        ).map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                      <p className="text-sm text-gray">{hours}</p>
                      <p className="text-sm text-gray">{note}</p>
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {t("locations.pickupBadge")}
                      </span>
                    </div>
                  </div>
                </SectionContainer>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
