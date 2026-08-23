"use client";

import { useQuery } from "@tanstack/react-query";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { fetchCustomerRecommendations } from "../auth/api/customer-auth.api";
import { queryKeys } from "@/lib/query/query-keys";

/**
 * Hook to fetch personalized menu recommendations for logged-in customers.
 * Disabled for guests so no unauthenticated requests or 401 warnings occur.
 */
export function useRecommendations() {
  const { customer, isAuthenticated } = useCustomerAuth();

  return useQuery({
    queryKey: queryKeys.customer.recommendations,
    queryFn: fetchCustomerRecommendations,
    enabled: !!isAuthenticated && !!customer,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
