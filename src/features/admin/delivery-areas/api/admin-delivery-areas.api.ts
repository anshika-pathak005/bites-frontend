import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { DeliveryArea } from "@/types/admin.types";

// Shape sent to the backend for both create and update delivery-area calls.
export interface DeliveryAreaPayload {
  name: string;
  deliveryCharge: number;
  isActive: boolean;
}

// Fetches all delivery areas (including inactive ones) via GET /admin/delivery-areas.
export async function fetchAllDeliveryAreasAdmin() {
  const { data } = await apiClient.get<ApiResponse<DeliveryArea[]>>("/admin/delivery-areas");
  return data.data ?? [];
}

// Creates a new delivery area via POST /admin/delivery-areas.
export async function createDeliveryArea(payload: DeliveryAreaPayload) {
  const { data } = await apiClient.post<ApiResponse<DeliveryArea>>("/admin/delivery-areas", payload);
  return data.data;
}

// Updates an existing delivery area via PUT /admin/delivery-areas/:id.
export async function updateDeliveryArea(id: string, payload: DeliveryAreaPayload) {
  const { data } = await apiClient.put<ApiResponse<DeliveryArea>>(`/admin/delivery-areas/${id}`, payload);
  return data.data;
}

// Soft-deletes (deactivates) a delivery area via DELETE /admin/delivery-areas/:id.
export async function deleteDeliveryArea(id: string) {
  await apiClient.delete(`/admin/delivery-areas/${id}`);
}
