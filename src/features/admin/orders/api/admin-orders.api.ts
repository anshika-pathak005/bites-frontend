import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { Order, OrderStatus } from "@/types/order.types";

// Filter/pagination params accepted by the admin orders list endpoint.
export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

// Fetches a paginated, filtered list of orders via GET /admin/orders.
export async function searchOrders(filters: AdminOrderFilters) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResult<Order>>>("/admin/orders", { params: filters }); // filters (status/search/date range/page) forwarded as query params
  return data.data;
}

// Fetches a single order's full detail via GET /admin/orders/:id.
export async function fetchOrderById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  return data.data;
}

// Transitions an order to a new status via PATCH /admin/orders/:id/status.
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
  return data.data;
}
