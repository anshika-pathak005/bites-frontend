"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "@/features/menu/hooks/use-categories";
import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/menu.types";

// Curated high-res placeholder imagery for categories that don't have an image set in admin yet
const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop", // Burger
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=450&fit=crop", // Dessert
  "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=450&fit=crop", // Drinks
  "https://images.unsplash.com/photo-1621996346565-e3adc644d942?w=600&h=450&fit=crop", // Pasta
];

// Landing page section showcasing active categories in a horizontal snap-scroll luxury carousel
export function CategoriesSection() {
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <section className="py-stack-md sm:py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-b border-outline-variant/20">
      <div className="max-w-container-max mx-auto">
        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 bg-primary-container rounded-full" />
              <span className="text-primary-container font-label-md text-xs sm:text-label-md tracking-widest uppercase font-semibold">
                CURATED SELECTION
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl sm:text-headline-lg text-primary-fixed font-bold tracking-tight">
              Signature Bites
            </h2>
            <p className="font-body-md text-sm sm:text-body-md text-on-surface-variant mt-1">
              Our most loved late-night culinary creations and specialties.
            </p>
          </div>

          <Link
            href={ROUTES.menu}
            className="hidden sm:inline-flex items-center gap-2 text-primary-container font-body-md text-sm font-semibold hover:text-primary-fixed hover:gap-3 transition-all duration-200 group"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner className="w-8 h-8 text-primary-container" />
            <p className="text-xs text-on-surface-variant">Loading signature categories...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12 px-4 rounded-xl bg-surface-container border border-error/30 max-w-md mx-auto">
            <p className="text-sm text-error mb-2 font-medium">Could not load categories right now.</p>
            <Link href={ROUTES.menu} className="text-xs text-primary-container hover:underline font-semibold">
              Browse Menu Directly →
            </Link>
          </div>
        )}

        {categories && categories.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl bg-surface-container border border-outline-variant/30 max-w-md mx-auto">
            <p className="text-sm text-on-surface-variant">Fresh menu coming soon. Check out our main dishes!</p>
          </div>
        )}

        {/* Categories Carousel */}
        {categories && categories.length > 0 && (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-margin-mobile px-margin-mobile md:-mx-0 md:px-0">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                fallbackImage={DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length]}
              />
            ))}
          </div>
        )}

        {/* Mobile View All button */}
        <div className="mt-4 sm:hidden text-center">
          <Link href={ROUTES.menu}>
            <button className="w-full py-3 rounded-xl bg-surface-container border border-outline-variant/40 text-primary-container font-body-md text-sm font-semibold flex items-center justify-center gap-2">
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Single Category Card with dark surface elevation, zoom micro-interaction, and category deep link
function CategoryCard({ category, fallbackImage }: { category: Category; fallbackImage: string }) {
  const imageUrl = category.imageUrl || fallbackImage;

  return (
    <Link
      href={`${ROUTES.menu}?category=${category.id}`}
      className="shrink-0 w-[260px] sm:w-[290px] md:w-[320px] snap-start bg-surface-container rounded-2xl overflow-hidden card-zoom-container shadow-xl border border-outline-variant/30 hover:border-primary-container/60 group flex flex-col transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative h-52 sm:h-56 md:h-60 w-full overflow-hidden bg-surface-container-high">
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 260px, (max-width: 768px) 290px, 320px"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
        />
        {/* Subtle dark vignette on top of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80" />

        {/* Glassmorphic Popular / Category Pill */}
        <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-primary-fixed border border-primary-container/40 flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3 h-3 text-primary-container" />
          <span>Popular</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-surface-container">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-title-lg text-lg sm:text-title-lg font-semibold text-on-surface group-hover:text-primary-fixed transition-colors line-clamp-1">
              {category.name}
            </h3>
            <Flame className="w-4 h-4 text-primary-container opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>

          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
            {category.description || "Freshly curated late-night favorites prepared with signature house sauces and seasonings."}
          </p>
        </div>

        {/* Explore Button */}
        <div className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 group-hover:border-primary-container/60 group-hover:bg-primary-container group-hover:text-surface text-primary-container font-body-md text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-between">
          <span>Explore Category</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
