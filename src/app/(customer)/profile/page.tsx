"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Truck,
  ShoppingBag,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UtensilsCrossed,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddressSelector } from "@/features/addresses/components/address-selector";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { ROUTES } from "@/constants/routes";

function formatMemberSince(dateString?: string) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, isAuthenticated, authReady, logout } = useCustomerAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Purely cosmetic here (highlights whichever card was last tapped) —
  // profile page is for managing addresses, not choosing one for an order.
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | undefined
  >(undefined);

  if (!authReady) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto py-stack-lg flex justify-center">
        <div className="animate-pulse text-secondary text-sm">
          Loading your account details...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop max-w-md mx-auto py-stack-lg text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary mx-auto">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          You are browsing as a Guest
        </h1>
        <p className="text-sm text-secondary leading-relaxed">
          Log in or create an account to access your profile, view saved
          addresses, and get personalized culinary recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href={ROUTES.login}>
            <Button size="lg" className="w-full sm:w-auto text-black font-bold">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto font-semibold"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
    }
  }

  const memberSince = formatMemberSince(customer.createdAt);

  const quickActions = [
    {
      href: ROUTES.trackOrder,
      icon: Truck,
      title: "My Orders & Tracking",
      description: "View order progress, live delivery status, and history",
    },
    {
      href: ROUTES.cart,
      icon: ShoppingBag,
      title: "View Shopping Cart",
      description: "Review items saved in your current culinary basket",
    },
    {
      href: ROUTES.menu,
      icon: UtensilsCrossed,
      title: "Explore Midnight Menu",
      description: "Browse categories, best sellers, and today's specials",
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-6xl xl:max-w-7xl mx-auto py-stack-md sm:py-stack-lg space-y-6 sm:space-y-8">
      {/* Top Banner Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-container to-primary-fixed border border-primary/30 flex items-center justify-center text-surface font-headline-lg font-bold text-2xl sm:text-3xl shrink-0 shadow-glow">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container border border-primary-container/30 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-primary" />
              Bites Customer
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface">
              {customer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-secondary">
              <span>{customer.email}</span>
              {memberSince && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-primary/70" />
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/40 text-error hover:bg-error-container/20 text-xs sm:text-sm font-semibold transition-all cursor-pointer self-stretch sm:self-center justify-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Row 1 — Account Details beside the address book.
          The address book is the reason most people open this page, so it sits
          above the fold rather than below three navigation cards. Account
          details are read-only and short, so they take the narrow column. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Personal Details Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <User className="w-4 h-4 text-primary" />
            Account Details
          </h2>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium">
                Full Name
              </span>
              <p className="font-semibold text-on-surface">{customer.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary/70 inline" /> Email
                Address
              </span>
              <p className="font-semibold text-on-surface break-all">
                {customer.email}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-primary/70 inline" /> Phone
                Number
              </span>
              <p className="font-semibold text-on-surface">{customer.phone}</p>
            </div>
          </div>

          <Link
            href={ROUTES.checkout}
            className="flex items-center gap-2 pt-3 mt-1 border-t border-outline-variant/20 text-xs font-semibold text-primary hover:underline w-fit"
          >
            <MapPin className="w-3.5 h-3.5" />
            Go to checkout
          </Link>
        </div>

        {/* Saved Delivery Addresses — the same add/edit/delete book used at
            checkout, so managing addresses here stays in sync with what shows
            up there. */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 sm:p-6 lg:p-7 shadow-sm space-y-5">
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Saved Delivery Addresses
          </h2>
          <AddressSelector
            selectedAddressId={selectedAddressId}
            onSelectAddress={(address) => setSelectedAddressId(address.id)}
          />
        </div>
      </div>

      {/* Row 2 — the three quick actions, one line on desktop. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
        {quickActions.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="block group">
            <div className="h-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary-container/60 transition-all duration-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-secondary mt-1">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Reassurance banner, full width under the actions. */}
      <div className="bg-surface-container/60 border border-outline-variant/20 rounded-2xl p-4 sm:p-5 flex items-center gap-3 text-xs sm:text-sm text-secondary">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <span>
          Your cart items, saved addresses, and past orders are automatically
          stored in your Bites customer account.
        </span>
      </div>

      {/* Logout Reassurance Confirm Modal */}
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
    </div>
  );
}
