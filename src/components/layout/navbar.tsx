"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/features/cart/hooks/use-cart";

// Static list of public-site nav links, in display order.
const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Menu", href: ROUTES.menu },
  { label: "Track Order", href: ROUTES.trackOrder },
  { label: "Contact", href: ROUTES.contact },
  { label: "About", href: ROUTES.about },
];

// Sticky top nav for the public site: branding, links, cart badge, and CTA.
export function Navbar() {
  const pathname = usePathname();
  // Cart count in the header needs the live cart — same hook every cart
  // page uses, so the badge and the cart page never disagree.
  const { cartQuery } = useCart();
  // Sum quantities across all line items; 0 while the cart hasn't loaded yet.
  const itemCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="fixed top-0 w-full bg-surface/90 backdrop-blur-md shadow-sm z-50">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link href={ROUTES.home} className="text-headline-md font-headline-md font-bold text-primary">
          Bites
        </Link>

        <nav className="hidden md:flex gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-label-md text-label-md pb-1 transition-all",
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-secondary hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.cart}
            className="relative w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary-fixed transition-colors"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 text-on-surface" />
            {/* Hide the count bubble entirely when the cart is empty */}
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href={ROUTES.menu} className="hidden sm:inline-flex">
            <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98]">
              Order Now
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
