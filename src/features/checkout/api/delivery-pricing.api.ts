import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";

export interface DeliveryQuote {
  deliveryCharge: number;
  distanceKm?: number;
  message?: string;
}

// GET /api/delivery-pricing/quote?latitude={lat}&longitude={lng} — computes delivery charge based on GPS distance
export async function fetchDeliveryQuote(latitude: number, longitude: number): Promise<DeliveryQuote> {
  const { data } = await apiClient.get<ApiResponse<DeliveryQuote>>("/delivery-pricing/quote", {
    params: { latitude, longitude },
  });
  if (!data.data) {
    throw new Error(data.message || "Failed to calculate delivery quote");
  }
  return data.data;
}
