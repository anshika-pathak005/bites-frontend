"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CartContextValue {
  sessionId: string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// localStorage key the guest session id is persisted under, per browser.
const SESSION_STORAGE_KEY = "bites_cart_session_id";

// Generates a new guest session id, prefixed so it's identifiable in logs/DB.
function createSessionId() {
  return `guest_${crypto.randomUUID()}`;
}

/**
 * Every guest gets a stable session_id the moment they land on the site.
 * This is what the cart/cart_item tables key on server-side. When customer
 * login ships, this same id can be merged into the logged-in customer's cart.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Starts empty until the effect below reads/creates the id on mount (client-only, avoids SSR mismatch).
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      // Reuse the id from a previous visit so the cart persists across reloads
      setSessionId(existing);
    } else {
      // First visit: mint a new guest id and persist it for next time
      const created = createSessionId();
      window.localStorage.setItem(SESSION_STORAGE_KEY, created);
      setSessionId(created);
    }
  }, []);

  return <CartContext.Provider value={{ sessionId }}>{children}</CartContext.Provider>;
}

// Hook for reading the guest cart session id; throws if used outside the provider.
export function useCartSession() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartSession must be used within a CartProvider");
  }
  return ctx;
}
