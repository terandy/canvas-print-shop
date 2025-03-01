import { getMenu } from "@/lib/shopify";
import { Menu } from "@/lib/shopify/types";
import Link from "next/link";
import MobileMenu from "./mobile-menu";
import Search from "./search";
import { CartModal } from "@/components";
import React from "react";
import { Home } from "lucide-react";
import SquareLink from "../buttons/square-link";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar: React.FC = async () => {
  return (
    <nav className="flex items-center justify-between p-4 lg:px-6 sticky top-0 backdrop-blur-sm z-10">
      <div className="block flex-none md:hidden">
        <MobileMenu />
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <SquareLink href={"/"} prefetch={true} icon={Home} />
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Search />
        </div>
        <div className="flex justify-end md:w-1/3">
          <LanguageSwitcher />
          <CartModal />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
