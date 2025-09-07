import MobileMenu from "./mobile-menu";
import Search from "./search";
import { ButtonLink, CartModal } from "@/components";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "../Logo";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

const ProudlyCanadian: React.FC<{ className?: string }> = async ({
  className,
}) => {
  const t = await getTranslations("canadian");
  return (
    <div className={className}>
      <div className="flex text-xs uppercase items-center gap-1">
        <span>{t("proudly")}</span>
        <Image src="/canadian-leaf.png" height={12} width={12} alt="canadian" />
        <span>{t("canadian")}</span>
      </div>
    </div>
  );
};

const Navbar: React.FC = async () => {
  return (
    <>
      <ProudlyCanadian className="pt-3 px-3 lg:hidden" />
      <nav className="flex items-center justify-between p-4 lg:px-6 sticky top-0 backdrop-blur-sm z-10">
        <div className="block flex-none md:hidden">
          <MobileMenu />
        </div>
        <div className="flex w-full items-center">
          <div className="flex items-center gap-3 w-full md:w-1/3">
            <ButtonLink
              href={"/"}
              prefetch={true}
              icon={Logo}
              iconPosition="left"
              variant="outline"
              className="bg-white items-center uppercase text-xs text-gray-700"
            >
              <div>
                <span>Canvas Print Shop</span>
              </div>
            </ButtonLink>
            <ProudlyCanadian className="hidden lg:block" />
          </div>
          <div className="hidden justify-center md:flex md:w-1/3">
            <Search />
          </div>
          <div className="flex justify-end md:w-1/3">
            <LanguageSwitcher className="hidden md:flex" />
            <CartModal />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
