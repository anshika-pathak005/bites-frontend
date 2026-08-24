"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { X, Sparkles, MapPin, Package, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const STORAGE_KEY = "bites_guest_nudge_until";
const COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000; // 4 Days in milliseconds

export interface GuestAuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Checks if the 4-day guest nudge cooldown period is active in localStorage.
 */
export function isGuestNudgeSuppressed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    return !isNaN(until) && Date.now() < until;
  } catch {
    return false;
  }
}

/**
 * Sets the 4-day cooldown timestamp in localStorage so the guest is not annoyed again.
 */
export function setGuestNudgeCooldown(): void {
  if (typeof window === "undefined") return;
  try {
    const until = Date.now() + COOLDOWN_MS;
    localStorage.setItem(STORAGE_KEY, until.toString());
  } catch {
    // Ignore storage quota or disabled localStorage errors
  }
}

/**
 * Beautiful, non-intrusive Guest Auth Nudge Modal.
 * Encourages guest users to sign in/register for saved cart, order tracking,
 * saved addresses, and recommendations across devices.
 */
export function GuestAuthModal({ open, onClose }: GuestAuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  function handleContinueAsGuest() {
    setGuestNudgeCooldown();
    onClose();
  }

  function handleSignInClick() {
    setGuestNudgeCooldown();
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleContinueAsGuest}
      />

      {/* Modal Surface Container */}
      <div className="relative z-10 max-w-md w-full bg-surface-container-lowest/95 border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center overflow-hidden">
        {/* Decorative Background Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleContinueAsGuest}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface-container/60 hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header Icon */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-inner">
            <Image
              src="/images/logo.png"
              alt="Bites Logo"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Unlock The Full Experience
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Make Bites Yours
            </h2>
          </div>
        </div>

        {/* Value Proposition Description */}
        <p className="text-xs sm:text-sm text-secondary leading-relaxed px-2">
          Sign in to access your orders, saved addresses, personalized recommendations, and your cart across devices.
        </p>

        {/* Quick Perks Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-on-surface font-semibold text-left pt-1">
          <div className="bg-surface-container/40 border border-outline-variant/20 p-2.5 rounded-xl flex items-center gap-2">
            <Package className="w-4 h-4 text-primary shrink-0" />
            <span>Track Live Orders</span>
          </div>
          <div className="bg-surface-container/40 border border-outline-variant/20 p-2.5 rounded-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>Saved Addresses</span>
          </div>
          <div className="bg-surface-container/40 border border-outline-variant/20 p-2.5 rounded-xl flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary shrink-0" />
            <span>Curated For You</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link href={ROUTES.login} onClick={handleSignInClick} className="block w-full">
            <Button
              size="lg"
              className="w-full text-black font-bold py-3.5 rounded-xl glow-hover flex items-center justify-center gap-2 shadow-lg shadow-primary-container/25 cursor-pointer"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <button
            onClick={handleContinueAsGuest}
            className="w-full text-xs text-secondary hover:text-on-surface font-semibold transition-colors py-2 cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
