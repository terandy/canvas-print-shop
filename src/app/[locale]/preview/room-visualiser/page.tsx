import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/page-header";
import RoomVisualiser from "@/components/room-visualiser/room-visualiser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RoomVisualiser" });
  return {
    title: t("title"),
    description: t("subtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function RoomVisualiserPage() {
  const t = await getTranslations("RoomVisualiser");
  return (
    <main className="bg-background px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            {t("eyebrow")}
          </p>
          <PageHeader className="!mb-3 !text-left !text-3xl sm:!text-4xl">
            {t("title")}
          </PageHeader>
          <p className="text-gray">{t("subtitle")}</p>
        </div>
        <RoomVisualiser />
      </div>
    </main>
  );
}
