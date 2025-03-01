"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts";
import Price from "../product/price";
import { useFormStatus } from "react-dom";
import LoadingDots from "../loading-dots";
import { redirectToCheckout } from "@/lib/utils/cart-actions";
import { ShoppingCart, X } from "lucide-react";
import Button from "../buttons/button";
import SquareButton from "../buttons/square-button";
import Badge from "../badge";
import type { CartState } from "@/contexts";
import CartItemCard from "./cart-item-card";

const CheckoutButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full flex justify-center">
      {pending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
    </Button>
  );
};

const Totals = ({ cartState }: { cartState: CartState }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-light/10 pb-3">
        <p className="text-gray">Taxes</p>
        <Price
          className="text-right text-base text-secondary"
          amount={cartState.cost.totalTaxAmount.amount}
          currencyCode={cartState.cost.totalTaxAmount.currencyCode}
        />
      </div>
      <div className="flex items-center justify-between border-b border-gray-light/10 pb-3">
        <p className="text-gray">Shipping</p>
        <p className="text-right text-gray">Calculated at checkout</p>
      </div>
      <div className="flex items-center justify-between pb-3">
        <p className="text-secondary font-semibold">Total</p>
        <Price
          className="text-right text-lg font-semibold text-secondary"
          amount={cartState.cost.totalAmount.amount}
          currencyCode={cartState.cost.totalAmount.currencyCode}
        />
      </div>
    </div>
  );
};

const CartModal = () => {
  const { state, updateCartItemQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(state?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (
      state?.totalQuantity &&
      state?.totalQuantity !== quantityRef.current &&
      state?.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }

      quantityRef.current = state?.totalQuantity;
    }
  }, [isOpen, state?.totalQuantity, quantityRef]);

  const items = state?.items ? Object.values(state?.items) : [];
  return (
    <>
      <Badge count={state?.totalQuantity}>
        <SquareButton
          aria-label="Open cart"
          icon={ShoppingCart}
          onClick={openCart}
        />
      </Badge>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-secondary/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-gray-light/10 bg-white/80 backdrop-blur-xl md:w-[400px] z-[999]">
              <div className="flex items-center justify-between p-4 border-b border-gray-light/10">
                <p className="flex gap-2 text-lg font-semibold text-secondary">
                  My Cart
                </p>
                <Button
                  aria-label="Close cart"
                  onClick={closeCart}
                  icon={X}
                  variant="ghost"
                />
              </div>

              {!state || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8">
                  <ShoppingCart className="w-16 h-16 text-gray-light" />
                  <p className="mt-4 text-xl font-medium text-secondary">
                    Your Cart is Empty
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ul className="flex-1 overflow-auto p-4 space-y-6">
                    {items
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((item) => (
                        <CartItemCard
                          key={`cart${item.id}`}
                          item={item}
                          closeCart={closeCart}
                          updateCartItemQuantity={updateCartItemQuantity}
                        />
                      ))}
                  </ul>
                  <div className="border-t border-gray-light/10 p-4 space-y-4">
                    <Totals cartState={state} />
                    <form
                      action={() => {
                        redirectToCheckout();
                      }}
                    >
                      <CheckoutButton />
                    </form>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default CartModal;
