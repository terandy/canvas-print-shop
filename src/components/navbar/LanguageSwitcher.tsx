"use client";

import { Fragment } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface Props {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
}

export default function LanguageSwitcher({
  className = "",
  compact = false,
  onNavigate,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");
  const query = searchParams.toString();

  return (
    <nav aria-label={t("language")} className={`items-center ${className}`}>
      {(["en", "fr"] as const).map((code, index) => (
        <Fragment key={code}>
          {index > 0 && (
            <span aria-hidden="true" className="text-xs text-secondary/25">
              /
            </span>
          )}
          <Link
            href={`/${code}${pathWithoutLocale}${query ? `?${query}` : ""}`}
            hrefLang={code}
            lang={code}
            aria-label={t(`languages.${code}`)}
            aria-current={locale === code ? "true" : undefined}
            onClick={onNavigate}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2 text-xs transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${locale === code ? "font-semibold text-secondary underline decoration-primary-dark decoration-1 underline-offset-[6px]" : "text-gray"}`}
          >
            {compact ? code.toUpperCase() : t(`languages.${code}`)}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
