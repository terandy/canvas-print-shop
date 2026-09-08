"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu as MenuIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./brand";
import Search from "./search";
import LanguageSwitcher from "./LanguageSwitcher";
import QuickLinks from "./quick-links";
import { editorialLinks, printLinks } from "./menu-links";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = () => setIsOpen(false);
  const t = useTranslations("Nav");
  const tTrust = useTranslations("trustStrip");
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("openMenu")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <MenuIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
      <Transition show={isOpen}>
        <Dialog
          onClose={closeMobileMenu}
          initialFocus={closeButtonRef}
          className="relative z-50"
        >
          <Dialog.Title className="sr-only">{t("mainNavigation")}</Dialog.Title>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300 motion-reduce:transition-none"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200 motion-reduce:transition-none"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-secondary/30 backdrop-blur-sm"
              aria-hidden="true"
            />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out motion-reduce:transition-none"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-200 ease-in motion-reduce:transition-none"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 flex h-dvh w-full max-w-md flex-col bg-[#FCFBF8] text-secondary shadow-xl">
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-secondary/10 px-5 sm:px-7">
                <Brand onClick={closeMobileMenu} />
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label={t("closeMenu")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/15 transition-colors hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
                <Search onSearch={closeMobileMenu} />
                <nav aria-label={t("mainNavigation")} className="mt-6">
                  <Link
                    href={`/${locale}/shop`}
                    onClick={closeMobileMenu}
                    aria-current={
                      pathname === `/${locale}/shop` ? "page" : undefined
                    }
                    className="group flex min-h-11 items-center justify-between rounded-sm font-serif text-[30px] tracking-[-0.025em] transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {t("shop")}
                    <ArrowUpRight
                      className="h-5 w-5 text-primary-dark"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                  <ul className="mb-5 mt-3 space-y-1">
                    {printLinks.map((print) => (
                      <li key={print.key}>
                        <Link
                          href={`/${locale}${print.path}`}
                          onClick={closeMobileMenu}
                          aria-current={
                            pathname === `/${locale}${print.path}`
                              ? "page"
                              : undefined
                          }
                          className="group flex items-center gap-4 rounded-sm py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-background">
                            <Image
                              src={print.image}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium transition-colors group-hover:text-primary-dark">
                              {t(`products.${print.key}.title`)}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-gray">
                              {t(`products.${print.key}.description`)}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-gray"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-y border-secondary/10 py-2">
                    {editorialLinks.map((link) => (
                      <Link
                        key={link.key}
                        href={`/${locale}${link.path}`}
                        onClick={closeMobileMenu}
                        aria-current={
                          pathname.startsWith(`/${locale}${link.path}`)
                            ? "page"
                            : undefined
                        }
                        className="flex min-h-14 items-center justify-between rounded-sm font-serif text-[28px] tracking-[-0.025em] transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {t(link.key)}
                        <ArrowUpRight
                          className="h-5 w-5 text-gray"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                </nav>
                <div className="mt-7">
                  <QuickLinks variant="menu" onClick={closeMobileMenu} />
                </div>
              </div>
              <div className="shrink-0 border-t border-secondary/10 bg-[#F3F1EB] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray">
                    {tTrust("madeInCanada")}
                  </span>
                  <LanguageSwitcher
                    className="flex"
                    onNavigate={closeMobileMenu}
                  />
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
