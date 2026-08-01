"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Star, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import type { MenuItem } from "@/types/menu.types";

// Menu listing card: shows item info and an "add to cart" button that posts straight to the guest cart.
export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-xl transition-all group overflow-hidden">
      <Link href={`/menu/${item.id}`} className="block h-56 overflow-hidden relative bg-surface-container">
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
            <span className="text-inverse-on-surface font-label-md text-label-md">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-stack-md">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link href={`/menu/${item.id}`}>
            <h3 className="font-headline-md text-headline-md hover:text-primary transition-colors">
              {item.name}
            </h3>
          </Link>
          {item.isVeg && <Leaf className="w-5 h-5 text-green-600 shrink-0" aria-label="Vegetarian" />}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {item.isBestSeller && (
            <Badge>
              <Star className="w-3 h-3" /> Best Seller
            </Badge>
          )}
          {item.isTodaysSpecial && <Badge>Today&apos;s Special</Badge>}
        </div>

        {item.description && (
          <p className="text-secondary text-body-md mb-4 line-clamp-2">{item.description}</p>
        )}

        <div className="flex justify-between items-center">
          {/* Live price shown here; checkout re-prices using the current value, not this snapshot */}
          <span className="text-primary font-bold text-headline-md">{formatPrice(item.price)}</span>
          <button
            onClick={() => addItem.mutate({ menuItemId: item.id, quantity: 1 })}
            disabled={!item.isAvailable || addItem.isPending}
            className="bg-primary-container text-on-primary-container p-3 rounded-full flex items-center justify-center hover:scale-110 transition-all disabled:opacity-40 disabled:pointer-events-none"
            aria-label={`Add ${item.name} to cart`}
          >
            {addItem.isPending ? <Spinner className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
