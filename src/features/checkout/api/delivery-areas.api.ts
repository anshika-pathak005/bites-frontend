import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { DeliveryArea } from "@/types/admin.types";

// GET /api/delivery-areas — lists the areas the restaurant delivers to, used to populate the checkout address form.
export async function fetchDeliveryAreas() {
  const { data } = await apiClient.get<ApiResponse<DeliveryArea[]>>("/delivery-areas");
  return data.data ?? [];
}
