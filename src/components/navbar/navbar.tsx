import MobileMenu from "./mobile-menu";
import Search from "./search";
import { ButtonLink, CartModal } from "@/components";
import React from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "../Logo";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

const ProudlyCanadian: React.FC<{ className?: string }> = async ({
  className,
}) => {
  const t = await getTranslations("canadian");
  return (
    <div className={className}>
      <div className="flex text-xs uppercase items-center gap-1">
        <span>{t("proudly")}</span>
        {/* Decorative — the adjacent text already says "Proudly Canadian". */}
        <Image src="/canadian-leaf.png" height={12} width={12} alt="" />
        <span>{t("canadian")}</span>
      </div>
    </div>
  );
};

const Navbar: React.FC = async () => {
  const locale = await getLocale();
  const tNav = await getTranslations("Nav");

  return (
    <>
      {/* Stacked above the bar until the inline copy below has room at xl.
          The two breakpoints must stay in sync or the tagline vanishes. */}
      <ProudlyCanadian className="pt-3 px-3 xl:hidden" />
      {/*
        Single flex row rather than three rigid `w-1/3` columns. The thirds
        could not fit the brand, the tagline, two nav links and the search box
        at tablet widths, so items collided and wrapped. Everything fixed-width
        is `shrink-0`; the search box is the only flexible element.
      */}
      <nav className="flex items-center gap-3 p-4 lg:gap-5 lg:px-6">
        <div className="block flex-none md:hidden">
          <MobileMenu />
        </div>

        <ButtonLink
          href={"/"}
          prefetch={true}
          icon={Logo}
          iconPosition="left"
          variant="outline"
          className="shrink-0 whitespace-nowrap bg-white items-center uppercase text-xs text-gray-700"
        >
          <span>Canvas Print Shop</span>
        </ButtonLink>

        {/* Tagline only once there is genuinely room for it. */}
        <ProudlyCanadian className="hidden shrink-0 xl:block" />

        {/* Primary navigation. The header previously had no links at all,
            which left /shop and the landing pages with no site-wide entry
            point above the fold. */}
        <div className="hidden shrink-0 items-center gap-5 md:flex lg:gap-6">
          <Link
            href={`/${locale}/shop`}
            className="whitespace-nowrap text-xs uppercase tracking-wide text-gray-700 transition-colors hover:text-gray-900"
          >
            {tNav("shop")}
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="whitespace-nowrap text-xs uppercase tracking-wide text-gray-700 transition-colors hover:text-gray-900"
          >
            {tNav("guides")}
          </Link>
        </div>

        {/* Absorbs the leftover space and shrinks first when the row tightens. */}
        <div className="ml-auto hidden min-w-0 max-w-sm flex-1 md:block">
          <Search />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <LanguageSwitcher className="hidden md:flex" />
          <CartModal />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
