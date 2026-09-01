"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import { ROUTES } from "@/constants/routes";
import type { CartItem } from "@/types/cart.types";

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("data:image/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Guest shopping cart page — lists items, lets the guest adjust quantity/remove with confirmation, and links to checkout.
export default function CartPage() {
  const { cartQuery, addItem, updateQuantity, removeItem } = useCart();
  const cart = cartQuery.data;

  // Item pending deletion confirmation (null means delete modal is closed)
  const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
  // State for clearing the entire cart dialog confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [isRestoring, setIsRestoring] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const backup = localStorage.getItem("bites_cart_backup");
      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHasBackup(true);
          }
        } catch {}
      }
    }
  }, []);

  async function handleRestoreCart() {
    setIsRestoring(true);
    try {
      const backup = localStorage.getItem("bites_cart_backup");
      if (backup) {
        const items = JSON.parse(backup) as { menuItemId: string; quantity: number }[];
        for (const item of items) {
          await addItem.mutateAsync({ menuItemId: item.menuItemId, quantity: item.quantity });
        }
        localStorage.removeItem("bites_cart_backup");
        setHasBackup(false);
        toast.success("Cart items restored successfully!");
      }
    } catch {
      toast.error("Failed to restore some cart items.");
    } finally {
      setIsRestoring(false);
    }
  }

  // Block rendering until the cart session has loaded
  if (cartQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;
  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;

  async function handleClearCart() {
    if (!cart || cart.items.length === 0) return;
    setIsClearing(true);
    try {
      for (const item of cart.items) {
        await removeItem.mutateAsync(item.id);
      }
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg pb-28 lg:pb-stack-lg">
      {/* Header with Title, Item Count, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-stack-md border-b border-outline-variant/30 pb-4">
        <div>
          <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">
            YOUR CART
          </span>
          <h1 className="font-headline-lg text-headline-md sm:text-headline-lg text-on-surface flex items-center gap-3">
            Shopping Cart
            {!isEmpty && (
              <span className="inline-flex items-center justify-center bg-primary-fixed text-black text-label-sm font-bold px-2.5 py-0.5 rounded-full text-xs sm:text-sm">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </h1>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link href={ROUTES.menu}>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex items-center gap-1.5 rounded-full text-xs font-medium cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="text-error hover:text-error hover:bg-error-container/20 text-xs sm:text-sm rounded-full cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Cart
            </Button>
          </div>
        )}
      </div>

      {hasBackup && isEmpty && (
        <div className="bg-primary/10 border border-primary/20 p-5 rounded-3xl max-w-md mx-auto mb-8 text-center space-y-3.5 shadow-md">
          <p className="text-xs sm:text-sm text-secondary font-medium">
            It looks like your payment was not completed, but your cart items were saved.
          </p>
          <Button
            size="md"
            onClick={handleRestoreCart}
            disabled={isRestoring}
            className="text-black font-semibold rounded-xl px-6 py-2.5 cursor-pointer"
          >
            {isRestoring ? <Spinner className="w-4 h-4 text-black inline mr-2" /> : null}
            Restore Cart Items
          </Button>
        </div>
      )}

      {isEmpty ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm my-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Your cart is empty</h2>
          <p className="text-secondary text-body-md">
            Looks like you haven&apos;t added any delicious items to your cart yet.
          </p>
          <div className="pt-2">
            <Link href={ROUTES.menu}>
              <Button size="lg" className="rounded-full px-8 gap-2 font-semibold cursor-pointer text-black">
                Browse Our Menu
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {/* Line items list */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.items.map((item) => {
              const hasValidImg = !failedImages[item.id] && isValidImageUrl(item.imageUrl);
              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
                      {hasValidImg && item.imageUrl ? (
                        <Image
                          src={item.imageUrl.trim()}
                          alt={item.name}
                          fill
                          unoptimized
                          onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Main Product Info & Controls */}
                    <div className="flex-grow min-w-0 pr-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-label-md text-body-md sm:text-label-md font-semibold text-on-surface line-clamp-2 sm:truncate">
                            {item.name}
                          </h4>
                          <p className="text-secondary text-xs sm:text-body-md mt-0.5">
                            {formatPrice(item.unitPrice)} each
                          </p>
                        </div>

                        {/* Trash Button - Mobile View (Top Right) */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="sm:hidden text-on-surface-variant/70 hover:text-error transition-colors p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-error-container/20 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </button>
                      </div>

                      {/* Mobile Stepper & Subtotal Row */}
                      <div className="flex sm:hidden items-center justify-between gap-2 mt-3 pt-2.5 border-t border-outline-variant/20">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1 border border-outline-variant/30">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                setDeleteTarget(item);
                              } else {
                                updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1 });
                              }
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors active:scale-95 text-on-surface cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-on-surface">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors active:scale-95 text-on-surface cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-[11px] text-secondary block leading-none">Total</span>
                          <span className="text-primary font-bold text-sm">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop / Tablet Stepper, Subtotal, and Delete Button */}
                    <div className="hidden sm:flex items-center gap-5 shrink-0 ml-auto">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-2.5 py-1 border border-outline-variant/30">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              setDeleteTarget(item);
                            } else {
                              updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity - 1 });
                            }
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors active:scale-95 text-on-surface cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-on-surface">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors active:scale-95 text-on-surface cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="w-24 text-right">
                        <span className="text-xs text-secondary block leading-none">Total</span>
                        <span className="text-primary font-bold text-base">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-xl hover:bg-error-container/20 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5 lg:sticky lg:top-24">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-body-md">
              <div className="flex justify-between items-center text-secondary">
                <span>Items ({itemCount})</span>
                <span className="font-medium text-on-surface">{formatPrice(cart.subtotal)}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/30 pt-4 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-headline-md text-headline-md text-on-surface">Subtotal</span>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
              <p className="text-xs text-secondary">Delivery details will be collected at checkout.</p>
            </div>

            <div className="pt-2 space-y-3">
              <Link href={ROUTES.checkout} className="block w-full">
                <Button size="lg" className="w-full text-body-md font-bold gap-2 rounded-xl text-black cursor-pointer">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 text-black" />
                </Button>
              </Link>
              <Link href={ROUTES.menu} className="block text-center text-xs text-secondary hover:text-primary transition-colors sm:hidden">
                Add more items from menu
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for Mobile Devices */}
      {!isEmpty && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 shadow-2xl z-40">
          <div className="max-w-container-max mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-secondary block">Total ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="text-primary font-bold text-xl">{formatPrice(cart.subtotal)}</span>
            </div>
            <Link href={ROUTES.checkout} className="flex-1 max-w-[200px]">
              <Button size="lg" className="w-full text-sm font-bold gap-1.5 rounded-xl shadow-md text-black cursor-pointer">
                Checkout
                <ArrowRight className="w-4 h-4 text-black" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Confirm Deletion Dialog for individual cart item */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove item from cart?"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from your cart?`}
        confirmLabel="Remove Item"
        cancelLabel="Keep Item"
        isLoading={removeItem.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            removeItem.mutate(deleteTarget.id, {
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Deletion Dialog for clearing the entire cart */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear entire cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmLabel="Clear Cart"
        cancelLabel="Cancel"
        isLoading={isClearing}
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
