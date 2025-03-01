"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Search from "./search";
import { Menu as MenuIcon, X } from "lucide-react";
import Button from "../buttons/button";
import SquareButton from "../buttons/square-button";
import LanguageSwitcher from "./LanguageSwitcher";
import QuickLinks from "./quick-links";

interface Props {}

const MobileMenu: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);
  return (
    <>
      <SquareButton
        onClick={openMobileMenu}
        aria-label="Open mobile menu"
        icon={MenuIcon}
      />
      <Transition show={isOpen}>
        <Dialog onClose={closeMobileMenu} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white pb-6">
              <div className="p-4 flex flex-col gap-2 ">
                <div className="flex justify-between">
                  <LanguageSwitcher />
                  <Button
                    onClick={closeMobileMenu}
                    aria-label="Close mobile menu"
                    icon={X}
                    variant="ghost"
                  />
                </div>
                <div className="mb-4 w-full">
                  <Search onSearch={closeMobileMenu} />
                </div>
                <QuickLinks onClick={closeMobileMenu} />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default MobileMenu;
