import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";

export interface DashboardSummary {
  todaysOrderCount: number;
  pendingOrderCount: number;
  todaysRevenue: number;
  recentOrders: Order[];
}

// Fetches the admin dashboard stats (today's orders/revenue, pending count, recent orders).
export async function fetchDashboardSummary() {
  const { data } = await apiClient.get<ApiResponse<DashboardSummary>>("/admin/dashboard/summary");
  return data.data;
}
