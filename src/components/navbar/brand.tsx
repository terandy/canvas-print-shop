import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Brand({ onClick }: { onClick?: () => void }) {
  const locale = useLocale();
  const t = useTranslations("Nav");

  return (
    <Link
      href={`/${locale}`}
      onClick={onClick}
      aria-label={t("home")}
      className="group flex shrink-0 items-center gap-2.5 rounded-sm text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:gap-3"
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        className="h-8 w-8 text-primary-dark transition-colors group-hover:text-primary lg:h-10 lg:w-10"
        aria-hidden="true"
      >
        <path
          d="M4 13V4h9M31 4h9v9M40 31v9h-9M13 40H4v-9"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M13 13h18v18H13z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 17h10v10H17z" fill="currentColor" />
      </svg>
      <span className="flex flex-col gap-1.5">
        <span className="font-serif text-[29px] leading-[0.85] tracking-[-0.055em] lg:text-[34px]">
          {t("brandCanvas")}
        </span>
        <span className="pl-0.5 text-[9px] font-medium uppercase leading-none tracking-[0.28em] lg:text-[10px]">
          {t("brandPrintShop")}
        </span>
      </span>
    </Link>
  );
}
