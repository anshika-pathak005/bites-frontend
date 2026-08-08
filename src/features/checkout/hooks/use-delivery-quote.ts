"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchDeliveryQuote, type DeliveryQuote } from "../api/delivery-pricing.api";

export function useDeliveryQuote(latitude?: number, longitude?: number) {
  const hasCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  return useQuery<DeliveryQuote, Error>({
    queryKey: queryKeys.deliveryPricing.quote(latitude, longitude),
    queryFn: () => fetchDeliveryQuote(latitude!, longitude!),
    enabled: hasCoordinates,
    retry: false,
    staleTime: 30000,
  });
}
