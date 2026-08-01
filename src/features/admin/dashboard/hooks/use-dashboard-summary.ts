import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchDashboardSummary } from "../api/dashboard.api";

// Fetches and caches the dashboard summary; also invalidated by order status changes elsewhere.
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: fetchDashboardSummary,
  });
}
