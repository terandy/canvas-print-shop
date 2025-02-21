"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { UpdateQuantityType, useCart } from "../../contexts/cart-context";
import { createUrl } from "@/lib/utils/base";
import Image from "next/image";
import Link from "next/link";
import Price from "../product/price";
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
import { Pencil, ShoppingCart, X } from "lucide-react";
import Button from "../buttons/button";
import SquareButton from "../buttons/square-button";
import Badge from "../badge";
import ButtonLink from "../buttons/button-link";

type MerchandiseSearchParams = {
  [key: string]: string;
};

const CheckoutButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full flex justify-center">
      {pending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
    </Button>
  );
};

const Totals = ({ cart }: { cart: Cart }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-light/10 pb-3">
        <p className="text-gray">Taxes</p>
        <Price
          className="text-right text-base text-secondary"
          amount={cart.cost.totalTaxAmount.amount}
          currencyCode={cart.cost.totalTaxAmount.currencyCode}
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
          amount={cart.cost.totalAmount.amount}
          currencyCode={cart.cost.totalAmount.currencyCode}
        />
      </div>
    </div>
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
    <li className="border-b border-gray-light/10 py-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-light/20 bg-background">
          <Image
            src={imgURL ?? item.merchandise.product.featuredImage.url}
            width={80}
            height={80}
            alt="Custom Print"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="space-y-1">
            <p className="text-secondary font-medium">
              {item.merchandise.product.title}
            </p>
            {item.merchandise.title !== DEFAULT_OPTION && (
              <p className="text-sm text-gray">{item.merchandise.title}</p>
            )}
            {item.attributes
              .filter((attr) => attr.key !== "_IMAGE URL")
              .map((attr) => (
                <span
                  key={attr.key}
                  className="block text-sm text-gray first-letter:capitalize"
                >
                  {attr.value}
                  {attr.key === "borderStyle" && " border"}
                </span>
              ))}
          </div>
        </div>
        <div className="flex">
          <DeleteItemButton
            item={item}
            optimisticUpdate={updateOptimisticCartItemQuantity}
          />
          <ButtonLink
            href={merchandiseUrl}
            onClick={closeCart}
            icon={Pencil}
            size="sm"
            title="Edit"
            variant="secondary"
          >
            Edit
          </ButtonLink>
        </div>
      </div>
      <div className="flex mt-4 items-center justify-between gap-4">
        <div className="flex items-center rounded-full border border-gray-light/20">
          <EditItemQuantityButton
            item={item}
            type="minus"
            optimisticUpdate={updateOptimisticCartItemQuantity}
          />
          <p className="w-8 text-center text-secondary">{item.quantity}</p>
          <EditItemQuantityButton
            item={item}
            type="plus"
            optimisticUpdate={updateOptimisticCartItemQuantity}
          />
        </div>
        <Price
          className="text-secondary font-medium"
          amount={item.cost.totalAmount.amount}
          currencyCode={item.cost.totalAmount.currencyCode}
        />
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
      <Badge count={cart?.totalQuantity}>
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

              {!cart || cart.lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8">
                  <ShoppingCart className="w-16 h-16 text-gray-light" />
                  <p className="mt-4 text-xl font-medium text-secondary">
                    Your Cart is Empty
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ul className="flex-1 overflow-auto p-4 space-y-6">
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
                  <div className="border-t border-gray-light/10 p-4 space-y-4">
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
