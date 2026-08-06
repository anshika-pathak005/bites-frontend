"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  UtensilsCrossed,
  Truck,
  Phone,
  Info,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/features/cart/hooks/use-cart";
import { Button } from "@/components/ui/button";

// Static list of public-site nav links, in display order with icons for mobile topbar menu.
const NAV_LINKS = [
  { label: "Home", href: ROUTES.home, icon: Home },
  { label: "Menu", href: ROUTES.menu, icon: UtensilsCrossed },
  { label: "Track Order", href: ROUTES.trackOrder, icon: Truck },
  { label: "Contact", href: ROUTES.contact, icon: Phone },
  { label: "About", href: ROUTES.about, icon: Info },
];

// Sticky top nav for the public site: branding, links, cart badge, CTA, and responsive mobile top dropdown menu.
export function Navbar() {
  const pathname = usePathname();
  const { cartQuery } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Sum quantities across all line items; 0 while the cart hasn't loaded yet.
  const itemCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="fixed top-0 w-full bg-surface/95 backdrop-blur-md shadow-sm z-50">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link href={ROUTES.home} className="text-headline-md font-headline-md font-bold text-primary">
          Bites
        </Link>

        {/* Desktop Navigation Links */}
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

        {/* Right Header Controls (Cart Icon + Order Now CTA + Mobile Menu Button) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon Button (Remains in header on all screen sizes) */}
          <Link
            href={ROUTES.cart}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary-fixed transition-colors shrink-0"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 text-on-surface" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Order Now Button */}
          <Link href={ROUTES.menu} className="hidden sm:inline-flex">
            <Button size="md" className="text-white font-semibold">
              Order Now
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button (Switches between Menu and X icon) */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors flex items-center justify-center shrink-0"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Top-Down Dropdown Menu Panel (Opens directly from top below navbar) */}
      {isOpen && (
        <>
          {/* Dark backdrop overlay covering below navbar */}
          <div
            className="md:hidden fixed inset-0 top-20 bg-inverse-surface/60 z-30 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Top-Down Dropdown Panel */}
          <div className="md:hidden fixed top-20 left-0 right-0 bg-surface-container-lowest border-b border-outline-variant/30 shadow-2xl z-40 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="space-y-1.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl font-label-md text-body-md font-semibold transition-all",
                      isActive
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface hover:bg-surface-variant hover:text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-outline-variant/30">
              <Link href={ROUTES.menu} onClick={() => setIsOpen(false)} className="block w-full">
                <Button size="lg" className="w-full text-white font-semibold gap-2 py-3.5 rounded-xl">
                  Order Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}


