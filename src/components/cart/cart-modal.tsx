"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { UpdateQuantityType, useCart } from "../../contexts/cart-context";
import { createUrl } from "@/lib/utils/base";
import Image from "next/image";
import Link from "next/link";
import Price from "../price";
import OpenCart from "./open-cart";
import { DEFAULT_OPTION } from "@/lib/constants";
import DeleteItemButton from "./delete-item-button";
import EditItemQuantityButton from "./edit-item-quantity-button";
import { useFormStatus } from "react-dom";
import LoadingDots from "../loading-dots";
import {
  createCartAndSetCookie,
  redirectToCheckout,
} from "@/lib/utils/cart-actions";
import { Cart, CartItem } from "@/lib/shopify/types";
import { ShoppingCart, X } from "lucide-react";

type MerchandiseSearchParams = {
  [key: string]: string;
};

const CheckoutButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      type="submit"
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
    </button>
  );
};

const Totals = ({ cart }: { cart: Cart }) => {
  return (
    <>
      <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1">
        <p>Taxes</p>
        <Price
          className="text-right text-base text-black"
          amount={cart.cost.totalTaxAmount.amount}
          currencyCode={cart.cost.totalTaxAmount.currencyCode}
        />
      </div>
      <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1">
        <p>Shipping</p>
        <p className="text-right">Calculated at checkout</p>
      </div>
      <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1">
        <p>Total</p>
        <Price
          className="text-right text-base text-black"
          amount={cart.cost.totalAmount.amount}
          currencyCode={cart.cost.totalAmount.currencyCode}
        />
      </div>
    </>
  );
};

const CartItemCard = ({
  item,
  updateOptimisticCartItemQuantity,
  closeCart,
}: {
  item: CartItem;
  closeCart: () => void;
  updateOptimisticCartItemQuantity: (
    cartItemId: string,
    updateType: UpdateQuantityType
  ) => void;
}) => {
  const merchandiseSearchParams: MerchandiseSearchParams = {};

  if (item.id) merchandiseSearchParams.cartItemID = item.id;

  item.merchandise.selectedOptions.forEach(({ name, value }) => {
    if (value !== DEFAULT_OPTION) {
      merchandiseSearchParams[name.toLocaleLowerCase()] = value;
    }
  });
  const imgURL = item.attributes?.find(
    (attr) => attr.key === "_IMAGE URL"
  )?.value;
  const borderStyle = item.attributes?.find(
    (attr) => attr.key === "borderStyle"
  )?.value;
  const direction = item.attributes?.find(
    (attr) => attr.key === "direction"
  )?.value;

  if (imgURL) merchandiseSearchParams["imgURL"] = imgURL;
  if (borderStyle) merchandiseSearchParams["borderStyle"] = borderStyle;
  if (direction) merchandiseSearchParams["direction"] = direction.toLowerCase();

  const merchandiseUrl = createUrl(
    `/product/${item.merchandise.product.handle}`,
    new URLSearchParams(merchandiseSearchParams)
  );

  return (
    <li className="lex w-full flex-col border-b border-neutral-300">
      <div className="relative flex w-full flex-row justify-between px-1 py-4">
        <DeleteItemButton
          item={item}
          optimisticUpdate={updateOptimisticCartItemQuantity}
        />
      </div>
      <div className="flex flex-row">
        <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300">
          <Image
            src={imgURL ?? item.merchandise.product.featuredImage.url}
            width={64}
            height={64}
            alt="Custom Print"
            className="w-24 h-24 object-cover rounded"
          />
        </div>
        <Link
          href={merchandiseUrl}
          onClick={closeCart}
          className="z-30 ml-2 flex flex-row space-x-4"
        >
          <div className="flex flex-1 flex-col text-base">
            <span className="leading-tight">
              {item.merchandise.product.title}
            </span>
            {item.merchandise.title !== DEFAULT_OPTION ? (
              <p className="text-sm text-neutral-500">
                {item.merchandise.title}
              </p>
            ) : null}
            {item.attributes
              .filter((attr) => attr.key !== "_IMAGE URL")
              .map((attr) => (
                <span
                  key={attr.key}
                  className="first-letter:capitalize text-sm text-neutral-500"
                >
                  {attr.value}
                  {attr.key === "borderStyle" && " border"}
                </span>
              ))}
          </div>
        </Link>
      </div>
      <div className="flex h-16 flex-col justify-between">
        <Price
          className="flex justify-end space-y-2 text-right text-sm"
          amount={item.cost.totalAmount.amount}
          currencyCode={item.cost.totalAmount.currencyCode}
        />
        <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200">
          <EditItemQuantityButton
            item={item}
            type="minus"
            optimisticUpdate={updateOptimisticCartItemQuantity}
          />
          <p className="w-6 text-center">
            <span className="w-full text-sm">{item.quantity}</span>
          </p>
          <EditItemQuantityButton
            item={item}
            type="plus"
            optimisticUpdate={updateOptimisticCartItemQuantity}
          />
        </div>
      </div>
    </li>
  );
};

const CartModal = () => {
  const { cart, updateOptimisticCartItemQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }

      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, quantityRef]);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} />
      </button>
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
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
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
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] z-[999]">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Cart</p>
                <button aria-label="Close cart" onClick={closeCart}>
                  <X />
                </button>
              </div>

              {!cart || cart.lines.length === 0 ? (
                <div>
                  <ShoppingCart className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your Cart is Empty.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="flex-grow overflow-auto py-4">
                    {cart.lines
                      .sort((a, b) =>
                        a.merchandise.product.title.localeCompare(
                          b.merchandise.product.title
                        )
                      )
                      .map((item) => (
                        <CartItemCard
                          key={`cart${item.id}`}
                          item={item}
                          closeCart={closeCart}
                          updateOptimisticCartItemQuantity={
                            updateOptimisticCartItemQuantity
                          }
                        />
                      ))}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500">
                    <Totals cart={cart} />
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
