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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { ROUTES } from "@/constants/routes";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, isAuthenticated, authReady, logout } = useCustomerAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!authReady) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto py-stack-lg flex justify-center">
        <div className="animate-pulse text-secondary text-sm">Loading your account details...</div>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop max-w-md mx-auto py-stack-lg text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary mx-auto">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">You are browsing as a Guest</h1>
        <p className="text-sm text-secondary leading-relaxed">
          Log in or create an account to access your profile, view saved addresses, and get personalized culinary recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href={ROUTES.login}>
            <Button size="lg" className="w-full sm:w-auto text-surface font-bold">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
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

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto py-stack-md sm:py-stack-lg space-y-6 sm:space-y-8">
      {/* Top Banner Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-container to-primary-fixed border border-primary/30 flex items-center justify-center text-surface font-headline-lg font-bold text-2xl sm:text-3xl shrink-0 shadow-glow">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container border border-primary-container/30 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-primary" />
              Bites Customer
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{customer.name}</h1>
            <p className="text-xs sm:text-sm text-secondary">{customer.email}</p>
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

      {/* Account Details & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Personal Details Card */}
        <div className="md:col-span-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <User className="w-4 h-4 text-primary" />
            Account Details
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium">Full Name</span>
              <p className="font-semibold text-on-surface">{customer.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary/70 inline" /> Email Address
              </span>
              <p className="font-semibold text-on-surface break-all">{customer.email}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] text-secondary block font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-primary/70 inline" /> Phone Number
              </span>
              <p className="font-semibold text-on-surface">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="md:col-span-2 space-y-3 sm:space-y-4">
          <Link href={ROUTES.trackOrder} className="block group">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-primary-container/60 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    My Orders & Tracking
                  </h3>
                  <p className="text-xs text-secondary">View order progress, live delivery status, and history</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href={ROUTES.cart} className="block group">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-primary-container/60 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    View Shopping Cart
                  </h3>
                  <p className="text-xs text-secondary">Review items saved in your current culinary basket</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href={ROUTES.menu} className="block group">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-primary-container/60 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    Explore Midnight Menu
                  </h3>
                  <p className="text-xs text-secondary">Browse categories, best sellers, and today&apos;s specials</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="bg-surface-container/60 border border-outline-variant/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-secondary">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <span>
          Your cart items, saved addresses, and past orders are automatically stored in your Bites customer account.
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
