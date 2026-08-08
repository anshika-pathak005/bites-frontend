"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchMyOrders, trackByOrderNumber, cancelOrder } from "../api/orders.api";
import type { Order } from "@/types/order.types";

// Hook to fetch all orders for the current guest cookie session
export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders.myOrders,
    queryFn: fetchMyOrders,
  });
}

// Hook to track a single order by order number (works across devices)
export function useTrackSingleOrder(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.track(orderNumber),
    queryFn: () => trackByOrderNumber(orderNumber),
    enabled: !!orderNumber && enabled,
  });
}

// Mutation to track an order dynamically
export function useTrackOrderMutation() {
  return useMutation({
    mutationFn: async (orderNumber: string): Promise<Order | null> => {
      return trackByOrderNumber(orderNumber);
    },
  });
}

// Hook to cancel an order (POST /api/orders/:orderNumber/cancel with no body)
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderNumber: string) => {
      return cancelOrder(orderNumber);
    },
    onSuccess: (data, orderNumber) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.myOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.track(orderNumber) });
      toast.success("Order cancelled successfully");
    },
    onError: (err, orderNumber) => {
      // Re-fetch and re-render the order on 400 (e.g. cancellation window expired)
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.myOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.track(orderNumber) });

      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "Cancellation window has expired for this order.";
        toast.error(msg);
      } else {
        toast.error("Could not cancel this order.");
      }
    },
  });
}
