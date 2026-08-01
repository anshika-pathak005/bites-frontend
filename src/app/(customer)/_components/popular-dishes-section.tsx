"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { MenuItemCard } from "@/features/menu/components/menu-item-card";
import { ROUTES } from "@/constants/routes";

// Landing page section showing the top best-seller dishes fetched from the API.
export function PopularDishesSection() {
  // Real data — pulls the actual best-seller menu items from the backend,
  // never hardcoded content.
  const { data, isLoading, isError } = useMenuItems({ bestSellerOnly: true, pageSize: 6 });

  return (
    <section className="py-stack-lg bg-surface-container-low">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-stack-md">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary font-label-md text-label-md tracking-widest">POPULAR</span>
            <h2 className="font-headline-lg text-headline-lg">Our Most Loved Dishes</h2>
          </div>
          <Link href={ROUTES.menu} className="hidden sm:flex items-center gap-2 text-primary font-label-md text-label-md hover:gap-3 transition-all">
            View Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Loading / error / empty / results states for the best-seller fetch */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        )}

        {isError && (
          <p className="text-center text-secondary py-12">Could not load dishes right now.</p>
        )}

        {data && data.items.length === 0 && (
          <p className="text-center text-secondary py-12">No best sellers yet — check back soon.</p>
        )}

        {data && data.items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {data.items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
