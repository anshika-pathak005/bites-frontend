"use client";

import { useState, useCallback } from "react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { isGuestNudgeSuppressed, setGuestNudgeCooldown } from "@/components/customer/guest-auth-modal";

/**
 * Custom hook to trigger non-intrusive auth prompts for guest users.
 * Automatically checks if the user is authenticated (never shows for logged-in users)
 * and respects the 4-day dismissal cooldown stored in localStorage.
 */
export function useGuestAuthNudge() {
  const { isAuthenticated } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Attempts to open the guest auth nudge modal.
   * Returns true if triggered, false if skipped (logged-in user or within 4-day cooldown).
   */
  const triggerNudgeIfEligible = useCallback((): boolean => {
    if (isAuthenticated) return false;
    if (isGuestNudgeSuppressed()) return false;

    setIsOpen(true);
    return true;
  }, [isAuthenticated]);

  const closeNudge = useCallback(() => {
    setIsOpen(false);
  }, []);

  const dismissAndCooldown = useCallback(() => {
    setGuestNudgeCooldown();
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    triggerNudgeIfEligible,
    closeNudge,
    dismissAndCooldown,
  };
}
