"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  { label: "About", href: ROUTES.about, icon: Info },
  { label: "Contact", href: ROUTES.contact, icon: Phone },
];

// Sticky top nav for the public site: transparent at the top, transitions to luxury glass on scroll.
export function Navbar() {
  const pathname = usePathname();
  const { cartQuery } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect window scroll position to toggle transparent vs glass header
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sum quantities across all line items; 0 while the cart hasn't loaded yet.
  const itemCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const showGlass = isScrolled || isOpen;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        showGlass
          ? "bg-surface/50 backdrop-blur-md border-b border-outline-variant/15 shadow-lg shadow-black/20 py-0"
          : "bg-transparent border-b border-transparent shadow-none py-1"
      )}
    >
      <div className="flex justify-between items-center h-16 sm:h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Brand Logo with graphic and luxury text */}
        <Link href={ROUTES.home} className="flex items-center gap-2 group">
          <div className="relative h-9 w-28 sm:h-10 sm:w-32 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Bites Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-body-md text-sm lg:text-body-md font-medium transition-all duration-200 relative py-1",
                  isActive
                    ? "text-primary-fixed font-semibold"
                    : "text-on-surface-variant hover:text-primary-fixed hover:scale-105"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full shadow-[0_0_8px_rgba(255,193,116,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Controls (Cart Icon + Order Now CTA + Mobile Menu Button) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon Button */}
          <Link
            href={ROUTES.cart}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-on-surface hover:border-primary-container hover:text-primary-container transition-all duration-200 shrink-0 group"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-primary-container text-surface text-[11px] font-bold flex items-center justify-center shadow-glow animate-success-pop">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Order Now Button */}
          <Link href={ROUTES.menu} className="hidden sm:inline-flex">
            <Button size="md" className="rounded-lg text-surface font-semibold gap-1.5 glow-hover">
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface hover:text-primary-container transition-colors flex items-center justify-center shrink-0"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X className="w-6 h-6 text-primary-container" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Top-Down Dropdown Menu Panel */}
      {isOpen && (
        <>
          {/* Dark backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 top-20 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Top-Down Dropdown Panel */}
          <div className="md:hidden fixed top-20 left-0 right-0 bg-surface-container-low border-b border-outline-variant/30 shadow-2xl z-40 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
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
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl font-body-md text-sm font-medium transition-all",
                      isActive
                        ? "bg-surface-container text-primary-fixed border border-primary-container/40 shadow-sm"
                        : "text-on-surface hover:bg-surface-container hover:text-primary-fixed"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary-container" : "text-on-surface-variant")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-outline-variant/20">
              <Link href={ROUTES.menu} onClick={() => setIsOpen(false)} className="block w-full">
                <Button size="lg" className="w-full text-surface font-bold gap-2 py-3.5 rounded-xl glow-hover">
                  Explore Full Menu
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


