import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";

// GET /api/orders — retrieves all orders placed in this cookie-backed guest session.
export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<ApiResponse<Order[] | { items: Order[] }>>("/orders");
  if (!data.data) return [];
  if (Array.isArray(data.data)) return data.data;
  if ("items" in data.data && Array.isArray(data.data.items)) return data.data.items;
  return [];
}

// GET /api/orders/track/:orderNumber — public lookup of a single order (no auth/cookie required).
export async function trackByOrderNumber(orderNumber: string): Promise<Order | null> {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
  return data.data;
}

// POST /api/orders/:orderNumber/cancel — cancels an order placed within the cancellation window (no body).
export async function cancelOrder(orderNumber: string): Promise<Order | null> {
  const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${orderNumber}/cancel`);
  return data.data;
}
