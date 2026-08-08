"use client";

import React from "react";

/**
 * Guest sessions are now fully managed server-side via HttpOnly guestId cookies.
 * No client-side sessionId, localStorage, or UUID generation is needed.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
