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

function extractErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

// GET /api/admin/delivery-charge-slabs
export async function fetchDeliverySlabs(): Promise<DeliveryChargeSlab[]> {
  const { data } = await apiClient.get<any>("/admin/delivery-charge-slabs");
  if (!data) return [];
  const payload = data.data ?? data;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.slabs)) return payload.slabs;
    if (Array.isArray(payload.content)) return payload.content;
  }
  return [];
}

// POST /api/admin/delivery-charge-slabs
export async function createDeliverySlab(payload: DeliveryChargeSlabPayload): Promise<DeliveryChargeSlab> {
  try {
    const { data } = await apiClient.post<ApiResponse<DeliveryChargeSlab>>("/admin/delivery-charge-slabs", payload);
    if (!data.data) {
      throw new Error(data.message || "Failed to create delivery charge slab");
    }
    return data.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to create delivery charge slab"));
  }
}

// PUT /api/admin/delivery-charge-slabs/:id
export async function updateDeliverySlab(
  id: number | string,
  payload: DeliveryChargeSlabPayload
): Promise<DeliveryChargeSlab> {
  try {
    const { data } = await apiClient.put<ApiResponse<DeliveryChargeSlab>>(`/admin/delivery-charge-slabs/${id}`, payload);
    if (!data.data) {
      throw new Error(data.message || "Failed to update delivery charge slab");
    }
    return data.data;
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to update delivery charge slab"));
  }
}

// DELETE /api/admin/delivery-charge-slabs/:id
export async function deleteDeliverySlab(id: number | string): Promise<void> {
  try {
    await apiClient.delete(`/admin/delivery-charge-slabs/${id}`);
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to delete delivery charge slab"));
  }
}
