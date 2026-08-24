import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";

export interface DeliveryChargeSlab {
  id: number | string;
  minDistanceKm: number;
  maxDistanceKm: number;
  charge: number;
  isActive: boolean;
}

export interface DeliveryChargeSlabPayload {
  minDistanceKm: number;
  maxDistanceKm: number;
  charge: number;
  isActive: boolean;
}

// GET /api/admin/delivery-charge-slabs
export async function fetchDeliverySlabs(): Promise<DeliveryChargeSlab[]> {
  const { data } = await apiClient.get<ApiResponse<DeliveryChargeSlab[]>>("/admin/delivery-charge-slabs");
  return data.data ?? [];
}

// POST /api/admin/delivery-charge-slabs
export async function createDeliverySlab(payload: DeliveryChargeSlabPayload): Promise<DeliveryChargeSlab> {
  const { data } = await apiClient.post<ApiResponse<DeliveryChargeSlab>>("/admin/delivery-charge-slabs", payload);
  if (!data.data) {
    throw new Error(data.message || "Failed to create delivery charge slab");
  }
  return data.data;
}

// PUT /api/admin/delivery-charge-slabs/:id
export async function updateDeliverySlab(
  id: number | string,
  payload: DeliveryChargeSlabPayload
): Promise<DeliveryChargeSlab> {
  const { data } = await apiClient.put<ApiResponse<DeliveryChargeSlab>>(`/admin/delivery-charge-slabs/${id}`, payload);
  if (!data.data) {
    throw new Error(data.message || "Failed to update delivery charge slab");
  }
  return data.data;
}

// DELETE /api/admin/delivery-charge-slabs/:id
export async function deleteDeliverySlab(id: number | string): Promise<void> {
  await apiClient.delete(`/admin/delivery-charge-slabs/${id}`);
}
