"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Star, Sparkles, Plus } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useCategories } from "@/features/menu/hooks/use-categories";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { useCart } from "@/features/cart/hooks/use-cart";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu.types";

// Curated signature dishes for showcase and instant preview
const SIGNATURE_SHOWCASE_ITEMS = [
  {
    id: "showcase-1",
    name: "The Midnight Classic Burger",
    category: "Burgers",
    price: 14,
    description: "Double beef patty, aged cheddar, caramelized onions, house truffle garlic aioli on brioche.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop",
    isPopular: true,
  },
  {
    id: "showcase-2",
    name: "Truffle Mushroom Woodfired Pizza",
    category: "Pizza",
    price: 22,
    description: "Wild portobello mushrooms, white truffle oil, fior di latte mozzarella, roasted garlic cream.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop",
    isPopular: true,
  },
  {
    id: "showcase-3",
    name: "Handcrafted Cacio e Pepe",
    category: "Pasta",
    price: 18,
    description: "Handmade tonnarelli pasta, aged pecorino romano, freshly toasted cracked tellicherry black pepper.",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3adc644d942?w=600&h=450&fit=crop",
    isPopular: false,
  },
  {
    id: "showcase-4",
    name: "Molten Belgian Dark Lava Cake",
    category: "Dessert",
    price: 12,
    description: "70% Valrhona dark chocolate molten center, dusted with gold sugar, served with vanilla bean gelato.",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=450&fit=crop",
    isPopular: true,
  },
];

export function MenuPreviewSection() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { data: categories } = useCategories();
  const { data: menuData, isLoading } = useMenuItems({
    categoryId: selectedCategoryId,
    pageSize: 8,
  });
  const { addItem } = useCart();

  // If live items exist in the API, render them; otherwise fallback to curated luxury items
  const items = menuData && menuData.items.length > 0 ? menuData.items : null;

  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface max-w-container-max mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-1.5 w-6 bg-primary-container rounded-full" />
          <span className="text-primary-container font-label-md text-xs sm:text-label-md tracking-widest uppercase font-semibold">
            EXPLORE FLAVORS
          </span>
          <span className="h-1.5 w-6 bg-primary-container rounded-full" />
        </div>
        <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary-fixed font-bold tracking-tight mb-3">
          Popular Dishes & Menu Preview
        </h2>
        <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant max-w-lg mx-auto">
          Explore our chef&apos;s recommendations or dive into category specials.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={cn(
              "px-5 py-2 rounded-full font-body-md text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
              selectedCategoryId === undefined
                ? "bg-primary-container text-black shadow-glow"
                : "bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:border-primary-container hover:text-primary-fixed"
            )}
          >
            All Dishes
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                "px-5 py-2 rounded-full font-body-md text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
                selectedCategoryId === cat.id
                  ? "bg-primary-container text-black shadow-glow"
                  : "bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:border-primary-container hover:text-primary-fixed"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-primary-container" />
        </div>
      )}

      {/* Live Items Grid */}
      {!isLoading && items && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {items.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              onAddToCart={() => addItem.mutate({ menuItemId: item.id, quantity: 1 })}
              isPending={addItem.isPending}
            />
          ))}
        </div>
      )}

      {/* Fallback Showcase Items Grid when API is empty or connecting */}
      {!isLoading && !items && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SIGNATURE_SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 hover:border-primary-container/60 card-zoom-container flex flex-col justify-between group transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden bg-surface-container-high">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover card-zoom-image brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80" />
                {item.isPopular && (
                  <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-primary-fixed border border-primary-container/40 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary-container" />
                    <span>Signature</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-title-lg text-base sm:text-title-lg font-semibold text-on-surface group-hover:text-primary-fixed transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                  <span className="font-headline-lg text-xl font-bold text-primary-container">
                    ${item.price}
                  </span>
                  <Link href={ROUTES.menu}>
                    <button className="py-2 px-4 border border-primary-container/60 text-primary-container rounded-xl font-body-md text-xs font-semibold hover:bg-primary-container hover:text-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Order
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explore Full Menu Action */}
      <div className="text-center">
        <Link href={ROUTES.menu}>
          <button className="bg-primary-container text-black px-7 py-3 rounded-xl font-body-md text-sm font-semibold hover:bg-primary-fixed hover:scale-105 transition-all duration-200 glow-hover inline-flex items-center gap-2 shadow-lg shadow-primary-container/25 cursor-pointer">
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </section>
  );
}

function DishCard({
  item,
  onAddToCart,
  isPending,
}: {
  item: MenuItem;
  onAddToCart: () => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-surface-container rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 hover:border-primary-container/60 card-zoom-container flex flex-col justify-between group transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-surface-container-high">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover card-zoom-image brightness-90 group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-xs">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80" />

        {item.isBestSeller && (
          <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-primary-fixed border border-primary-container/40 flex items-center gap-1.5">
            <Star className="w-3 h-3 text-primary-container fill-primary-container" />
            <span>Best Seller</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/menu/${item.id}`}>
            <h3 className="font-title-lg text-base sm:text-title-lg font-semibold text-on-surface hover:text-primary-fixed transition-colors line-clamp-1 mb-1.5">
              {item.name}
            </h3>
          </Link>
          {item.description && (
            <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
          <span className="font-headline-lg text-lg sm:text-xl font-bold text-primary-container">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={onAddToCart}
            disabled={!item.isAvailable || isPending}
            className="py-2 px-3.5 border border-primary-container/60 text-primary-container rounded-xl font-body-md text-xs font-semibold hover:bg-primary-container hover:text-black transition-all duration-200 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
