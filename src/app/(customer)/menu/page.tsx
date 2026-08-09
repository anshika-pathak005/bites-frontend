"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useCategories } from "@/features/menu/hooks/use-categories";
import { useMenuItems } from "@/features/menu/hooks/use-menu-items";
import { MenuItemCard } from "@/features/menu/components/menu-item-card";
import { useDebounce } from "@/hooks/use-debounce";
import type { MenuItemFilters } from "@/types/menu.types";

const PAGE_SIZE = 12;

// Next.js requires useSearchParams() to sit inside a Suspense boundary — the
// actual page content lives in MenuPageContent below, and this default
// export just supplies that boundary around it.
export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <MenuPageContent />
    </Suspense>
  );
}

// Full menu browsing page — search, category tabs, dietary/special filters, and paginated results.
function MenuPageContent() {
  const searchParams = useSearchParams();
  // Pre-select the category from a `?category=<id>` link (e.g. the homepage category cards)
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    () => searchParams.get("category") ?? undefined
  );
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [todaysSpecialOnly, setTodaysSpecialOnly] = useState(false);
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  const { data: categories } = useCategories();

  // Reset to page 0 whenever debounced search input changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // Re-syncs the selected category if the user (re-)arrives via a `?category=`
  // link while this page is already mounted — client-side nav doesn't remount it.
  useEffect(() => {
    setActiveCategoryId(searchParams.get("category") ?? undefined);
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Combined filter object sent to the menu items query
  const filters: MenuItemFilters = {
    categoryId: activeCategoryId,
    search: debouncedSearch || undefined,
    vegOnly: vegOnly || undefined,
    bestSellerOnly: bestSellerOnly || undefined,
    todaysSpecialOnly: todaysSpecialOnly || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError } = useMenuItems(filters);

  // Changing any filter should always jump back to page 1 — otherwise a
  // guest could land on an empty "page 3" after narrowing their search.
  function updateFilter(update: () => void) {
    update();
    setPage(0);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">
          OUR MENU
        </span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg text-on-surface font-bold">
          Discover Our Delicious Menu
        </h1>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-stack-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <Input
          placeholder="Search dishes..."
          className="pl-11 py-2.5 sm:py-3 text-sm sm:text-body-md rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs (Wrapping flex row across all screens) */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-stack-sm">
        <button
          onClick={() => updateFilter(() => setActiveCategoryId(undefined))}
          className={cn(
            "px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-label-md font-semibold transition-all duration-200 cursor-pointer select-none",
            activeCategoryId === undefined
              ? "bg-primary text-white shadow-sm"
              : "bg-surface-container-high text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed-variant"
          )}
        >
          All
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => updateFilter(() => setActiveCategoryId(category.id))}
            className={cn(
              "px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-label-md font-semibold transition-all duration-200 cursor-pointer select-none",
              activeCategoryId === category.id
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed-variant"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Dietary / special filters */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-stack-md sm:mb-stack-lg">
        <FilterChip label="Veg Only" active={vegOnly} onClick={() => updateFilter(() => setVegOnly((v) => !v))} />
        <FilterChip label="Best Sellers" active={bestSellerOnly} onClick={() => updateFilter(() => setBestSellerOnly((v) => !v))} />
        <FilterChip label="Today's Special" active={todaysSpecialOnly} onClick={() => updateFilter(() => setTodaysSpecialOnly((v) => !v))} />
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      )}

      {isError && <p className="text-center text-secondary py-16">Could not load the menu right now.</p>}

      {data && data.items.length === 0 && (
        <p className="text-center text-secondary py-16">No dishes match your filters.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          {/* Responsive grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-gutter">
            {data.items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 sm:gap-4 mt-stack-md sm:mt-stack-lg">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 sm:px-5 sm:py-2 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-secondary text-xs sm:text-sm font-medium">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="px-4 py-2 sm:px-5 sm:py-2 rounded-full border border-outline-variant text-xs sm:text-sm font-semibold disabled:opacity-40 hover:bg-surface-variant transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Toggleable pill button used for the dietary/special filters
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-label-sm font-semibold border transition-all duration-200 cursor-pointer select-none",
        active
          ? "bg-primary-fixed border-primary text-on-primary-fixed-variant shadow-sm"
          : "border-outline-variant/60 text-on-surface-variant hover:bg-surface-variant"
      )}
    >
      {label}
    </button>
  );
}
