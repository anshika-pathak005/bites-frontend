"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "@/features/menu/hooks/use-categories";
import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/menu.types";

// Landing page section showcasing every active category as a horizontally
// scrollable row; clicking a card jumps to /menu pre-filtered to that category.
export function CategoriesSection() {
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <section className="py-stack-lg bg-surface-container-low">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-stack-md">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary font-label-md text-label-md tracking-widest">EXPLORE</span>
            <h2 className="font-headline-lg text-headline-lg">What Are You Craving Today?</h2>
          </div>
          <Link href={ROUTES.menu} className="hidden sm:flex items-center gap-2 text-primary font-label-md text-label-md hover:gap-3 transition-all">
            View Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Loading / error / empty / results states for the category fetch */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {isError && (
          <p className="text-center text-secondary py-12">Could not load categories right now.</p>
        )}

        {categories && categories.length === 0 && (
          <p className="text-center text-secondary py-12">No categories yet — check back soon.</p>
        )}

        {categories && categories.length > 0 && (
          // snap-x keeps cards aligned to the viewport edge as the user scrolls right;
          // the arbitrary properties below hide the scrollbar across all browsers.
          <div className="flex gap-gutter overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Single category card — links to the menu page pre-filtered to this category.
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`${ROUTES.menu}?category=${category.id}`}
      className="shrink-0 w-52 sm:w-48 md:w-60 snap-start bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
    >
      {/* Inset padding shrinks the image within the card; aspect-square keeps it a true 1:1 ratio */}
      <div className="p-2">
        <div className="relative aspect-square w-full rounded-lg bg-surface-container overflow-hidden">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">No image</div>
          )}
        </div>
      </div>

      <div className="px-2 pb-3">
        <h2 className="font-label-md text-label-md group-hover:text-primary transition-colors">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-secondary text-xs mt-1 line-clamp-2">{category.description}</p>
        )}
      </div>
    </Link>
  );
}
