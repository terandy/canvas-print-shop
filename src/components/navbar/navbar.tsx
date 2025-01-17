import { getMenu } from "@/lib/shopify";
import { Menu } from "@/lib/shopify/types";
import Link from "next/link";
import MobileMenu from "./mobile-menu";
import Search from "./search";
import CartModal from "@/components/cart/cart-modal";
import { HomeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import React from "react";

const Navbar: React.FC = async () => {
  const menu = await getMenu("next-js-frontend-menu");
  return <nav className="flex items-center justify-between p-4 lg:px-6 sticky top-0 backdrop-blur-sm z-[999]">
    <div className="block flex-none md:hidden">
      <MobileMenu menu={menu} />
    </div>
    <div className="flex w-full items-center">
      <div className="flex w-full md:w-1/3">
        <Link href={"/"} prefetch={true} className="h-11 w-11 flex items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
          <HomeIcon className={clsx("h-4 transition-all ease-in-out hover:scale-110")} />
        </Link>

        {menu.length > 0 ? <ul className="hidden gap-6 text-sm md:flex md:items-center">
          {menu.map((item: Menu) => <li key={item.title}>
            <Link href={item.path} prefetch={true} className="text-gray-700 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300">
              {item.title}
            </Link>
          </li>)}
        </ul> : null}
      </div>
      <div className="hidden justify-center md:flex md:w-1/3">
        <Search />
      </div>
      <div className="flex justify-end md:w-1/3">
        <CartModal />
      </div>
    </div>
  </nav>;
};

export default Navbar;