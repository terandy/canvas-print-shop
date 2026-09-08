"use client";

import clsx from "clsx";
import {
  ArrowLeftRight,
  HelpCircle,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface Props {
  size?: "sm";
  variant?: "menu";
  onClick?: () => void;
}

const QuickLinks: React.FC<Props> = ({ size, variant, onClick }) => {
  const t = useTranslations("Footer");
  const locale = useLocale();

  // Support/policy links only. Shop and Guides are primary navigation and are
  // rendered separately — they do not belong under "Customer Service".
  const companyLinks = [
    {
      name: t("links.privacy"),
      href: `/${locale}/privacy-policy`,
      icon: ShieldCheck,
    },
    { name: t("links.faqs"), href: `/${locale}/faqs`, icon: HelpCircle },
    {
      name: t("links.shipping"),
      href: `/${locale}/shipping-policy`,
      icon: Truck,
    },
    {
      name: t("links.returns"),
      href: `/${locale}/returns-policy`,
      icon: ArrowLeftRight,
    },
    { name: t("links.contact"), href: `/${locale}/contact`, icon: Mail },
  ];
  return (
    <div>
      <h3
        className={clsx(
          size === "sm" && "text-sm",
          variant === "menu"
            ? "text-[10px] font-medium uppercase tracking-[0.18em] text-gray"
            : "font-semibold text-gray-900"
        )}
      >
        {t("customerService")}
      </h3>
      <ul
        className={
          variant === "menu"
            ? "mt-3 grid grid-cols-2 gap-x-4"
            : "mt-4 space-y-2"
        }
      >
        {companyLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <li key={link.name}>
              <Link
                href={link.href}
                className={clsx(
                  variant === "menu"
                    ? "flex min-h-11 items-center rounded-sm py-2 text-xs leading-relaxed text-secondary transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    : "text-gray-600 hover:text-gray-900 flex items-center gap-2",
                  size === "sm" && "text-sm"
                )}
                onClick={onClick}
              >
                {variant !== "menu" && (
                  <IconComponent className={clsx(size === "sm" && "h-4 w-4")} />
                )}
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default QuickLinks;
