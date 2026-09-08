"use client";

import { Popover, Transition } from "@headlessui/react";
import { SearchIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";
import Search from "./search";

export default function SearchPopover() {
  const t = useTranslations("Search");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Popover key={`${pathname}?${searchParams.toString()}`}>
      {({ open, close }) => (
        <>
          <Popover.Button
            aria-label={open ? t("close") : t("open")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {open ? (
              <X
                className="h-[19px] w-[19px]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            ) : (
              <SearchIcon
                className="h-[19px] w-[19px]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            )}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out motion-reduce:transition-none"
            enterFrom="-translate-y-1 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition duration-150 ease-in motion-reduce:transition-none"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="-translate-y-1 opacity-0"
          >
            <Popover.Panel
              focus
              className="absolute inset-x-0 top-full border-t border-secondary/10 bg-[#FCFBF8] px-5 py-6 shadow-[0_20px_32px_-20px_rgba(31,26,23,0.3)] sm:px-8 lg:left-auto lg:right-10 lg:w-[440px] lg:border lg:p-6"
            >
              <p className="mb-3 font-serif text-2xl text-secondary">
                {t("title")}
              </p>
              <Search onSearch={() => close()} />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
