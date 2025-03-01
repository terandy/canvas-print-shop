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
  onClick?: () => void;
}

const QuickLinks: React.FC<Props> = ({ size, onClick }) => {
  const t = useTranslations("Footer");
  const locale = useLocale();

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
          "font-semibold text-gray-900"
        )}
      >
        {t("customerService")}
      </h3>
      <ul className="mt-4 space-y-2">
        {companyLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <li key={link.name}>
              <Link
                href={link.href}
                className={clsx(
                  "text-gray-600 hover:text-gray-900 flex items-center gap-2",
                  size === "sm" && "text-sm"
                )}
                onClick={onClick}
              >
                <IconComponent className={clsx(size === "sm" && "h-4 w-4")} />
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
