"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import { ROUTES } from "@/constants/routes";

// Guest shopping cart page — lists items, lets the guest adjust quantity/remove, and links to checkout.
export default function CartPage() {
  const { cartQuery, updateQuantity, removeItem } = useCart();
  const cart = cartQuery.data;

  // Block rendering until the cart session has loaded
  if (cartQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg">
      <h1 className="font-headline-lg text-headline-lg mb-stack-md">Your Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <ShoppingBag className="w-12 h-12 text-on-surface-variant" />
          <p className="text-secondary">Your cart is empty.</p>
          <Link href={ROUTES.menu}>
            <Button>Browse the Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {/* Line items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-sm"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-label-md text-label-md truncate">{item.name}</h4>
                  <p className="text-primary font-bold">{formatPrice(item.unitPrice)}</p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-2 py-1">
                  <button
                    onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem.mutate(item.id)}
                  className="text-on-surface-variant hover:text-error transition-colors p-2"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-4 sticky top-24">
            <h3 className="font-headline-md text-headline-md">Order Summary</h3>
            <div className="flex justify-between text-body-md">
              <span className="text-secondary">Subtotal</span>
              <span className="font-bold">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-secondary">Delivery charge is calculated at checkout based on your area.</p>
            <Link href={ROUTES.checkout}>
              <Button size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
