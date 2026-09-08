import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import CartModal from "../cart/cart-modal";
import Brand from "./brand";
import DesktopMenu from "./desktop-menu";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./mobile-menu";
import SearchPopover from "./search-popover";

const Navbar = async () => {
  const locale = await getLocale();
  const t = await getTranslations("Nav");

  return (
    <header className="relative z-30 border-b border-secondary/10 bg-[#FCFBF8] text-secondary">
      <div className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:h-24 lg:gap-8 lg:px-10">
        <Brand />
        <DesktopMenu />
        <div className="flex shrink-0 items-center gap-0 lg:gap-2">
          <SearchPopover />
          <LanguageSwitcher compact className="hidden lg:flex" />
          <div
            aria-hidden="true"
            className="mx-2 hidden h-5 w-px bg-secondary/15 lg:block"
          />
          <CartModal />
          <Link
            href={`/${locale}/shop`}
            className="ml-4 hidden min-h-11 items-center gap-5 rounded-full bg-secondary px-5 text-[13px] font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary xl:inline-flex"
          >
            {t("createPrint")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
