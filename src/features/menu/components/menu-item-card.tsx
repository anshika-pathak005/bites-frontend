"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import type { MenuItem } from "@/types/menu.types";

/**
 * Validates if the given string is a safe, valid image URL or path before passing to Next.js Image.
 */
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

// Menu listing card: image, name, veg/non-veg chip, price, and Add to Cart / Buy Now actions.
export function MenuItemCard({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  function handleBuyNow() {
    // Buy Now Flow skips the cart, going straight to checkout with query params.
    router.push(`/checkout?buyNowItemId=${item.id}&quantity=1`);
  }

  const hasValidImage = !imageError && isValidImageUrl(item.imageUrl);

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      {/* Inset padding shrinks the image within the card; aspect-square keeps it a true 1:1 ratio */}
      <div className="p-2 sm:p-2.5">
        <Link
          href={`/menu/${item.id}`}
          className="block relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container"
        >
          {hasValidImage && item.imageUrl ? (
            <Image
              src={item.imageUrl.trim()}
              alt={item.name}
              fill
              unoptimized
              onError={() => setImageError(true)}
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/50 text-xs gap-1 bg-surface-container">
              <UtensilsCrossed className="w-6 h-6" />
              <span>No image</span>
            </div>
          )}

          {/* Overlay blocks the "add" affordance visually when the item is out of stock */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
              <span className="text-inverse-on-surface font-label-sm text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded bg-black/60">
                Out of Stock
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="px-2.5 sm:px-3.5 pb-3 sm:pb-3.5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-1.5 mb-1">
          <Link href={`/menu/${item.id}`} className="min-w-0 flex-1">
            <h3 className="font-label-md text-xs sm:text-body-md font-semibold text-on-surface hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <DietChip isVeg={item.isVeg} />
        </div>

        {/* Price */}
        <span className="text-primary font-bold text-sm sm:text-body-lg mb-1.5 sm:mb-2">
          {formatPrice(item.price)}
        </span>

        {(item.isBestSeller || item.isTodaysSpecial) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.isBestSeller && (
              <Badge>
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Best Seller
              </Badge>
            )}
            {item.isTodaysSpecial && <Badge>Special</Badge>}
          </div>
        )}

        {item.description && (
          <p className="text-secondary text-[11px] sm:text-xs mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* mt-auto pins the action row to the bottom even when descriptions vary in length */}
        <div className="mt-auto pt-1 flex gap-1.5 sm:gap-2">
          <button
            onClick={() => addItem.mutate({ menuItemId: item.id, quantity: 1 })}
            disabled={!item.isAvailable || addItem.isPending}
            className="flex-1 flex items-center justify-center gap-1 border border-primary text-primary font-semibold rounded-full py-1.5 sm:py-2 text-[11px] sm:text-xs hover:bg-primary-fixed/30 transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
          >
            {addItem.isPending ? (
              <Spinner className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!item.isAvailable}
            className="flex-1 flex items-center justify-center bg-primary text-white font-semibold rounded-full py-1.5 sm:py-2 text-[11px] sm:text-xs hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Small dietary indicator chip — green for veg, red for non-veg (colors follow the common food-app convention).
function DietChip({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 mt-1 text-[10px] font-label-sm uppercase tracking-wide",
        isVeg
          ? "border-green-600 text-green-700 bg-green-50"
          : "border-red-600 text-red-700 bg-red-50"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", isVeg ? "bg-green-600" : "bg-red-600")} />
      {isVeg ? "Veg" : "Non-Veg"}
    </span>
  );
}
