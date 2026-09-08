"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { EMAIL } from "@/lib/constants";

const EmailHelpButton = () => {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  // The canvas page has inline help links; leave its mobile order controls clear.
  const isCanvasProduct = /\/product\/canvas\/?$/.test(pathname);
  const label = t("emailUs");

  return (
    <a
      href={EMAIL.href}
      aria-label={`${label}: ${EMAIL.label}`}
      title={`${label}: ${EMAIL.label}`}
      className={`fixed bottom-4 right-4 z-40 ${isCanvasProduct ? "hidden lg:inline-flex" : "inline-flex"} items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6`}
    >
      <Mail aria-hidden="true" className="h-5 w-5" />
      <span>{label}</span>
    </a>
  );
};

export default EmailHelpButton;
