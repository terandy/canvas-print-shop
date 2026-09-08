"use client";

import { Popover, Transition } from "@headlessui/react";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { editorialLinks, printLinks } from "./menu-links";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-sm text-[13px] font-medium transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export default function DesktopMenu() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const isShop = ["/shop", "/product/", "/canvas-prints/"].some((path) =>
    pathname.startsWith(`/${locale}${path}`)
  );

  return (
    <nav
      aria-label={t("mainNavigation")}
      className="hidden items-center gap-7 lg:flex xl:gap-9"
    >
      <Popover key={pathname}>
        {({ open, close }) => (
          <>
            <Popover.Button
              className={`${linkClass} ${open || isShop ? "text-primary-dark" : "text-secondary"}`}
            >
              <span>{t("shop")}</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition duration-200 ease-out motion-reduce:transition-none"
              enterFrom="translate-y-1 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="transition duration-150 ease-in motion-reduce:transition-none"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-1 opacity-0"
            >
              <Popover.Panel className="absolute inset-x-0 top-full border-t border-secondary/10 bg-[#FCFBF8] p-8 shadow-[0_20px_32px_-20px_rgba(31,26,23,0.3)] lg:px-10">
                <div className="grid grid-cols-[0.85fr_1fr_1fr] gap-8">
                  <div className="flex flex-col items-start py-2 pr-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-dark">
                      {t("collection")}
                    </p>
                    <p className="mt-4 max-w-64 font-serif text-4xl leading-[1.1] tracking-[-0.025em]">
                      {t("collectionTitle")}
                    </p>
                    <p className="mt-4 max-w-60 text-sm leading-relaxed text-gray">
                      {t("collectionDescription")}
                    </p>
                    <Link
                      href={`/${locale}/shop`}
                      onClick={() => close()}
                      className="mt-6 inline-flex min-h-11 items-center gap-5 border-b border-secondary/30 text-[13px] font-medium transition-colors hover:border-primary-dark hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      {t("viewAll")}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                  {printLinks.map((print) => (
                    <Link
                      key={print.key}
                      href={`/${locale}${print.path}`}
                      onClick={() => close()}
                      className="group rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-background">
                        <Image
                          src={print.image}
                          alt=""
                          fill
                          sizes="(min-width: 1440px) 415px, 32vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <span className="font-serif text-2xl tracking-[-0.02em] transition-colors group-hover:text-primary-dark">
                          {t(`products.${print.key}.title`)}
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-primary-dark"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-gray">
                        {t(`products.${print.key}.description`)}
                      </p>
                    </Link>
                  ))}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      {editorialLinks.map((link) => {
        const active = pathname.startsWith(`/${locale}${link.path}`);
        return (
          <Link
            key={link.key}
            href={`/${locale}${link.path}`}
            aria-current={active ? "page" : undefined}
            className={`${linkClass} ${active ? "text-primary-dark" : "text-secondary"}`}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
