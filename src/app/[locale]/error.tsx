"use client";

import { Button } from "@/components";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Get translations for error messages
  const t = useTranslations("Error");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="text-gray mb-6">{t("message")}</p>
      <Button onClick={() => reset()}>{t("tryAgain")}</Button>
    </div>
  );
}
