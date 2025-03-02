import MobileMenu from "./mobile-menu";
import Search from "./search";
import { ButtonLink, CartModal } from "@/components";
import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "../Logo";

const Navbar: React.FC = async () => {
  return (
    <nav className="flex items-center justify-between p-4 lg:px-6 sticky top-0 backdrop-blur-sm z-10">
      <div className="block flex-none md:hidden">
        <MobileMenu />
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <ButtonLink
            href={"/"}
            prefetch={true}
            icon={Logo}
            iconPosition="left"
            variant="outline"
            className="bg-white items-center uppercase text-xs text-gray-700"
          >
            <span>Canvas Print Shop</span>
          </ButtonLink>
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
  );
};

export default Navbar;
