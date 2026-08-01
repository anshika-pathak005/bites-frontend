import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";

// GET /api/orders/track/:orderNumber — public lookup of a single order (no auth) by its order number.
// Returned order.status is one of PENDING/ACCEPTED/PREPARING/OUT_FOR_DELIVERY/DELIVERED/CANCELLED.
export async function trackByOrderNumber(orderNumber: string) {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
  return data.data;
}

// GET /api/orders/track?phone=... — public lookup of all orders placed under a phone number.
export async function trackByPhone(phone: string) {
  const { data } = await apiClient.get<ApiResponse<Order[]>>("/orders/track", {
    params: { phone },
  });
  return data.data ?? [];
}
