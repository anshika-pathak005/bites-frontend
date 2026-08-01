"use client";

import { useMutation } from "@tanstack/react-query";
import { trackByOrderNumber, trackByPhone } from "../api/orders.api";
import type { Order } from "@/types/order.types";

// A mutation (not a query) on purpose — tracking only runs when the guest
// submits the search form, not automatically on page load.
export function useTrackOrder() {
  return useMutation({
    mutationFn: async (input: { mode: "orderNumber" | "phone"; value: string }): Promise<Order[]> => {
      if (input.mode === "orderNumber") {
        const order = await trackByOrderNumber(input.value);
        return order ? [order] : [];
      }
      return trackByPhone(input.value);
    },
  });
}
