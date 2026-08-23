"use client";

import { Sparkles } from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useRecommendations } from "@/features/customer/hooks/use-recommendations";
import { MenuItemCard } from "@/features/menu/components/menu-item-card";

/**
 * Recommendations carousel/grid for logged-in customers.
 * Completely hidden for guests or for customers with no order history.
 */
export function RecommendationsSection() {
  const { isAuthenticated, customer } = useCustomerAuth();
  const { data: recommendations, isLoading } = useRecommendations();

  // Hide section completely if guest, loading, or if no recommendations exist
  if (!isAuthenticated || !customer || isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-stack-md sm:py-stack-lg border-t border-outline-variant/15">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary-container/30 text-primary mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Crafted For Your Taste</span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Recommended For You
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-secondary max-w-sm">
          Handpicked culinary selections based on your past midnight orders.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-gutter">
        {recommendations.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
