"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  User,
  LogOut,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const NAV_LINKS = [
  { label: "Home", href: ROUTES.home, icon: Home },
  { label: "Menu", href: ROUTES.menu, icon: UtensilsCrossed },
  { label: "Track Order", href: ROUTES.trackOrder, icon: Truck },
  { label: "About", href: ROUTES.about, icon: Info },
  { label: "Contact", href: ROUTES.contact, icon: Phone },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartQuery } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll detection
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const showGlass = isScrolled || isOpen;

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push(ROUTES.home);
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      setUserDropdownOpen(false);
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        showGlass
          ? "bg-surface/85 backdrop-blur-md border-b border-outline-variant/15 shadow-lg shadow-black/20 py-0"
          : "bg-transparent border-b border-transparent shadow-none py-1"
      )}
    >
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-20 flex items-center justify-between">
        {/* Brand Logo - Plain image without background or text */}
        <Link href={ROUTES.home} className="inline-flex items-center group">
          <div className="relative h-10 w-28 sm:h-12 sm:w-36 transition-transform duration-300 group-hover:scale-105">
            {!logoError ? (
              <Image
                src="/images/logo.png"
                alt="Bites Logo"
                fill
                priority
                unoptimized
                onError={() => setLogoError(true)}
                className="object-contain"
              />
            ) : (
              <span className="font-headline-lg text-2xl font-bold text-primary">Bites</span>
            )}
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-body-md text-sm lg:text-body-md font-medium transition-all duration-200 relative py-1",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant hover:text-primary hover:scale-105"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full shadow-[0_0_8px_rgba(245,166,78,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Cart Icon Button */}
          <Link
            href={ROUTES.cart}
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-on-surface hover:border-primary-container hover:text-primary transition-all duration-200 shrink-0 group"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-primary-container text-surface text-[11px] font-bold flex items-center justify-center shadow-glow animate-success-pop">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Customer Identity / Auth Control */}
          <div className="hidden sm:block relative" ref={dropdownRef}>
            {isAuthenticated && customer ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 hover:border-primary-container/60 text-on-surface transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-container text-surface font-bold text-xs flex items-center justify-center">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">{customer.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-secondary" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-outline-variant/20">
                      <p className="text-xs font-bold text-on-surface truncate">{customer.name}</p>
                      <p className="text-[10px] text-secondary truncate">{customer.email}</p>
                    </div>
                    <Link
                      href={ROUTES.profile}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-primary" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href={ROUTES.trackOrder}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
                    >
                      <Truck className="w-4 h-4 text-primary" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/20 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-error" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={ROUTES.login}>
                <Button size="md" className="rounded-lg text-surface font-semibold gap-1.5 glow-hover">
                  <User className="w-4 h-4" />
                  <span>Log In</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface hover:text-primary transition-colors flex items-center justify-center shrink-0"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Top-Down Dropdown Menu Panel */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-20 bg-black/75 backdrop-blur-md z-30 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="md:hidden fixed top-20 left-0 right-0 bg-surface-container-low border-b border-outline-variant/30 shadow-2xl z-40 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
            {/* Logged in User Bar on Mobile */}
            {isAuthenticated && customer ? (
              <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-container text-surface font-bold text-sm flex items-center justify-center">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{customer.name}</p>
                    <p className="text-[10px] text-secondary">{customer.email}</p>
                  </div>
                </div>
                <Link
                  href={ROUTES.profile}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high text-xs font-semibold text-primary hover:bg-primary hover:text-surface transition-colors"
                >
                  Profile
                </Link>
              </div>
            ) : null}

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
                        ? "bg-surface-container text-primary border border-primary-container/40 shadow-sm font-semibold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-on-surface-variant")} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-outline-variant/20 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-error-container/20 text-error font-semibold text-xs border border-error/30 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({customer?.name})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={ROUTES.login} onClick={() => setIsOpen(false)}>
                    <Button size="md" variant="outline" className="w-full font-semibold py-3 rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={ROUTES.register} onClick={() => setIsOpen(false)}>
                    <Button size="md" className="w-full text-surface font-bold py-3 rounded-xl glow-hover">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        open={showLogoutModal}
        title="Log Out of Bites Account?"
        message="Your cart and orders are saved to your account and will be safely waiting for you whenever you log back in."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
