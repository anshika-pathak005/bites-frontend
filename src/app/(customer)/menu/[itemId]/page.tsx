"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useMenuItem } from "@/features/menu/hooks/use-menu-item";
import { useCart } from "@/features/cart/hooks/use-cart";

// Single menu item's detail page — shows info, quantity picker, and Add to Cart / Buy Now actions.
export default function MenuItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const { data: item, isLoading, isError } = useMenuItem(itemId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Block rendering until the item has loaded
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError || !item) {
    return <p className="text-center text-secondary py-24">This item could not be found.</p>;
  }

  function handleBuyNow() {
    // Buy Now Flow skips the cart entirely — the item + quantity travel to
    // checkout as query params, and CheckoutPage reads them to build a
    // buyNow payload instead of a cart-based one.
    router.push(`/checkout?buyNowItemId=${item?.id}&quantity=${quantity}`);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        {/* Capped width keeps the image from stretching across the whole grid column on large screens */}
        <div className="relative aspect-square w-full max-w-sm mx-auto lg:mx-0 rounded-xl overflow-hidden border border-outline-variant bg-surface-container">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No image</div>
          )}
        </div>

        <div className="space-y-stack-sm">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-headline-lg text-headline-lg">{item.name}</h1>
            {item.isVeg && <Leaf className="w-6 h-6 text-green-600 shrink-0 mt-1" aria-label="Vegetarian" />}
          </div>

          {/* Status badges (best seller / today's special / out of stock) */}
          <div className="flex flex-wrap gap-2">
            {item.isBestSeller && (
              <Badge>
                <Star className="w-3 h-3" /> Best Seller
              </Badge>
            )}
            {item.isTodaysSpecial && <Badge>Today&apos;s Special</Badge>}
            {!item.isAvailable && <Badge className="bg-error-container text-on-error-container border-none">Out of Stock</Badge>}
          </div>

          {item.description && <p className="text-body-lg font-body-lg text-secondary">{item.description}</p>}

          <p className="text-primary font-bold text-headline-lg">{formatPrice(item.price)}</p>

          {item.isAvailable && (
            <>
              <div className="flex items-center gap-4 pt-2">
                <span className="font-label-md text-label-md">Quantity</span>
                {/* Quantity stepper, floored at 1 */}
                <div className="flex items-center gap-3 bg-surface-container-high rounded-full px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-label-md">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-lowest transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart (Cart Flow) vs Buy Now (skips cart, goes straight to checkout) */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => addItem.mutate({ menuItemId: item.id, quantity })}
                  disabled={addItem.isPending}
                >
                  Add to Cart
                </Button>
                <Button size="lg" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
