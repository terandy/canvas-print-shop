import { Metadata } from "next";
import { Truck, Clock, MapPin } from "lucide-react";
import {
  SectionHeader,
  SectionContainer,
  PageHeader,
  ContactSection,
} from "@/components";
import { getTranslations } from "next-intl/server";
import { canonicalMetadata, openGraphMetadata } from "@/lib/seo";
import {
  BUSINESS_DATA,
  formatOpeningTime,
  getLocationAddressLines,
  type SupportedLocale,
} from "@/lib/business-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "ShippingPolicy.metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    ...canonicalMetadata(locale, "/shipping-policy"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      ...openGraphMetadata(locale, "/shipping-policy"),
    },
  };
}

export default async function ShippingPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Get translations for this page
  const t = await getTranslations("ShippingPolicy");

  // Every location that actually accepts collection, with its own hours.
  const pickupLocations = Object.values(BUSINESS_DATA.locations)
    .filter((location) => location.localPickup === true)
    .map((location) => ({
      location,
      hours: location.openingHours
        ? t("localPickup.weekdayHours", {
            opens: formatOpeningTime(
              location.openingHours.opens,
              locale as SupportedLocale
            ),
            closes: formatOpeningTime(
              location.openingHours.closes,
              locale as SupportedLocale
            ),
          })
        : "",
    }));

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>{t("pageTitle")}</PageHeader>

        <div className="flex flex-col gap-8">
          {/* Local Pickup */}
          <section>
            <SectionHeader icon={MapPin}>
              {t("localPickup.title")}
            </SectionHeader>
            <SectionContainer>
              <p>{t("localPickup.description")}</p>
              <ul>
                {/* Both counters and their hours come from BUSINESS_DATA, so
                    this page cannot drift from what checkout actually offers. */}
                {pickupLocations.map(({ location, hours }) => (
                  <li key={location.id}>
                    {t("localPickup.hoursLine", {
                      name: location.name,
                      address: getLocationAddressLines(
                        location,
                        locale as SupportedLocale
                      )[0],
                      hours,
                    })}
                  </li>
                ))}
                <li>{t("localPickup.select")}</li>
                <li>{t("localPickup.email")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Canada Post Delivery */}
          <section>
            <SectionHeader icon={Truck}>{t("canadaPost.title")}</SectionHeader>
            <SectionContainer>
              <p>{t("canadaPost.description")}</p>
              <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">
                {t("canadaPost.estimatedTitle")}
              </h3>
              <ul>
                <li>{t("canadaPost.local")}</li>
                <li>{t("canadaPost.majorCities")}</li>
                <li>{t("canadaPost.ruralAreas")}</li>
                <li>{t("canadaPost.remoteLocations")}</li>
              </ul>
              <p className="text-sm mt-4">{t("canadaPost.disclaimer")}</p>
            </SectionContainer>
          </section>

          {/* Processing Time */}
          <section>
            <SectionHeader icon={Clock}>
              {t("processingTime.title")}
            </SectionHeader>
            <SectionContainer>
              <p>{t("processingTime.description")}</p>
              <ul>
                <li>{t("processingTime.standard")}</li>
                <li>{t("processingTime.payment")}</li>
                <li>{t("processingTime.tracking")}</li>
                <li>{t("processingTime.rush")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Shipping Costs */}
          <section>
            <SectionHeader>{t("shippingCosts.title")}</SectionHeader>
            <SectionContainer>
              <ul>
                <li>{t("shippingCosts.localPickup")}</li>
                <li>{t("shippingCosts.standard")}</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Order Tracking */}
          <section>
            <SectionHeader>{t("orderTracking.title")}</SectionHeader>
            <SectionContainer>
              <p>{t("orderTracking.description")}</p>
              <ul>
                <li>{t("orderTracking.number")}</li>
                <li>{t("orderTracking.website")}</li>
                <li>{t("orderTracking.notifications")}</li>
                <li>{t("orderTracking.support")}</li>
              </ul>
            </SectionContainer>
          </section>
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
