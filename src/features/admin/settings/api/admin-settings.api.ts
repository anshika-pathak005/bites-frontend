import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";

export interface RestaurantSettings {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  minOrderAmount: number;
  maxDeliveryRadiusKm: number;
  cancellationWindowMinutes?: number;
}

// Update payload omits `id` since it's not editable and isn't sent back to the server.
export type RestaurantSettingsPayload = Omit<RestaurantSettings, "id">;

// Fetches the single restaurant settings record via GET /admin/restaurant-settings.
export async function fetchRestaurantSettings() {
  const { data } = await apiClient.get<ApiResponse<RestaurantSettings>>("/admin/restaurant-settings");
  return data.data;
}

// Updates the restaurant settings record via PUT /admin/restaurant-settings.
export async function updateRestaurantSettings(payload: RestaurantSettingsPayload) {
  try {
    const { data } = await apiClient.put<ApiResponse<RestaurantSettings>>("/admin/restaurant-settings", payload);
    if (data && (data as any).success === false) {
      const errObj = (data as any).error;
      if (errObj?.fieldErrors) {
        const details = Object.values(errObj.fieldErrors).join(" • ");
        throw new Error(details || errObj.message || "Failed to update settings");
      }
      throw new Error((data as any).message || "Failed to update settings");
    }
    return data.data;
  } catch (err: any) {
    const apiError = err?.response?.data?.error;
    if (apiError?.fieldErrors) {
      const details = Object.values(apiError.fieldErrors).join(" • ");
      throw new Error(details || apiError.message || "Failed to update settings");
    }
    if (apiError?.message) {
      throw new Error(apiError.message);
    }
    throw err;
  }
}
