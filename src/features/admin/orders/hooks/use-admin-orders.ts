"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchOrderById, searchOrders, updateOrderStatus, type AdminOrderFilters } from "../api/admin-orders.api";
import type { OrderStatus } from "@/types/order.types";

// Fetches one page of orders; filters are baked into the query key so each filter/page combo caches separately.
export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: queryKeys.admin.orders(filters),
    queryFn: () => searchOrders(filters),
  });
}

// Fetches a single order's detail; disabled until an id is available.
export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
}

// Updates an order's status; on success invalidates orders list/detail and the dashboard summary.
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: OrderStatus }) => updateOrderStatus(String(id), status),
    onSuccess: () => {
      // Broad invalidation on purpose — a status change affects the orders
      // list, the order detail view, AND the dashboard's pending count all
      // at once, so all three need to refetch.
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Could not update order status — check the status change is allowed"),
  });
}
