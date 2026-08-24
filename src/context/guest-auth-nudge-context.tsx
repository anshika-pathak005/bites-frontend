"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useCustomerAuth } from "./customer-auth-context";
import {
  GuestAuthModal,
  isGuestNudgeSuppressed,
  setGuestNudgeCooldown,
} from "@/components/customer/guest-auth-modal";

interface GuestAuthNudgeContextValue {
  triggerNudgeIfEligible: () => boolean;
  isOpen: boolean;
  closeNudge: () => void;
}

const GuestAuthNudgeContext = createContext<GuestAuthNudgeContextValue | undefined>(undefined);

export function GuestAuthNudgeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);

  const triggerNudgeIfEligible = useCallback((): boolean => {
    // 1. Logged in users are NEVER nudged
    if (isAuthenticated) return false;
    // 2. Check 4-day localStorage cooldown
    if (isGuestNudgeSuppressed()) return false;

    setIsOpen(true);
    return true;
  }, [isAuthenticated]);

  const closeNudge = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <GuestAuthNudgeContext.Provider
      value={{
        triggerNudgeIfEligible,
        isOpen,
        closeNudge,
      }}
    >
      {children}
      <GuestAuthModal open={isOpen} onClose={closeNudge} />
    </GuestAuthNudgeContext.Provider>
  );
}

export function useGuestAuthNudgeContext() {
  const ctx = useContext(GuestAuthNudgeContext);
  if (!ctx) {
    throw new Error("useGuestAuthNudgeContext must be used within a GuestAuthNudgeProvider");
  }
  return ctx;
}
