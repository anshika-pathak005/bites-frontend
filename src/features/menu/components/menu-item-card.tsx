"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import type { MenuItem } from "@/types/menu.types";

// Menu listing card: image, name, veg/non-veg chip, price, and Add to Cart / Buy Now actions.
export function MenuItemCard({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { addItem } = useCart();

  function handleBuyNow() {
    // Same Buy Now Flow as the item detail page — skips the cart, goes straight to checkout.
    router.push(`/checkout?buyNowItemId=${item.id}&quantity=1`);
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all group overflow-hidden">
      {/* Inset padding shrinks the image within the card; aspect-square keeps it a true 1:1 ratio, object-cover avoids stretching */}
      <div className="p-2">
        <Link href={`/menu/${item.id}`} className="block relative aspect-square w-full overflow-hidden rounded-lg bg-surface-container">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No image</div>
          )}
          {/* Overlay blocks the "add" affordance visually when the item is out of stock */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
              <span className="text-inverse-on-surface font-label-sm text-label-sm">Out of Stock</span>
            </div>
          )}
        </Link>
      </div>

      <div className="px-3 pb-3 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link href={`/menu/${item.id}`}>
            <h3 className="font-label-md text-label-md hover:text-primary transition-colors">
              {item.name}
            </h3>
          </Link>
          <DietChip isVeg={item.isVeg} />
        </div>

        {/* Price moved up near the name, Meesho-style — the buttons row owns the bottom of the card */}
        <span className="text-primary font-bold text-body-lg mb-2">{formatPrice(item.price)}</span>

        {(item.isBestSeller || item.isTodaysSpecial) && (
          <div className="flex flex-wrap gap-2 mb-2">
            {item.isBestSeller && (
              <Badge>
                <Star className="w-3 h-3" /> Best Seller
              </Badge>
            )}
            {item.isTodaysSpecial && <Badge>Today&apos;s Special</Badge>}
          </div>
        )}

        {item.description && (
          <p className="text-secondary text-xs mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* mt-auto pins the action row to the bottom even when descriptions vary in length */}
        <div className="mt-auto pt-1 flex gap-2">
          <button
            onClick={() => addItem.mutate({ menuItemId: item.id, quantity: 1 })}
            disabled={!item.isAvailable || addItem.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 border border-primary text-primary rounded-full py-2 text-label-sm font-label-sm hover:bg-primary-fixed/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {addItem.isPending ? <Spinner className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!item.isAvailable}
            className="flex-1 flex items-center justify-center bg-primary text-on-primary rounded-full py-2 text-label-sm font-label-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
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
        isVeg ? "border-green-600 text-green-700 bg-green-50" : "border-red-600 text-red-700 bg-red-50"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", isVeg ? "bg-green-600" : "bg-red-600")} />
      {isVeg ? "Veg" : "Non-Veg"}
    </span>
  );
}
