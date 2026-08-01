import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { MenuItem } from "@/types/menu.types";

// Shape sent to the backend for both create and update menu-item calls.
export interface MenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isBestSeller: boolean;
  isTodaysSpecial: boolean;
}

// Fetches a paginated, optionally search-filtered page of menu items via GET /admin/menu-items.
export async function searchMenuItemsAdmin(params: { page: number; pageSize: number; search?: string }) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResult<MenuItem>>>("/admin/menu-items", { params }); // page/pageSize/search passed straight through as query params
  return data.data;
}

// Creates a new menu item via POST /admin/menu-items.
export async function createMenuItem(payload: MenuItemPayload) {
  const { data } = await apiClient.post<ApiResponse<MenuItem>>("/admin/menu-items", payload);
  return data.data;
}

// Updates an existing menu item via PUT /admin/menu-items/:id.
export async function updateMenuItem(id: string, payload: MenuItemPayload) {
  const { data } = await apiClient.put<ApiResponse<MenuItem>>(`/admin/menu-items/${id}`, payload);
  return data.data;
}

// Toggles availability only (no full payload) via PATCH /admin/menu-items/:id/availability.
export async function setMenuItemAvailability(id: string, available: boolean) {
  const { data } = await apiClient.patch<ApiResponse<MenuItem>>(`/admin/menu-items/${id}/availability`, null, {
    params: { available }, // `available` sent as a query param since the PATCH body is empty
  });
  return data.data;
}

// Deletes a menu item via DELETE /admin/menu-items/:id.
export async function deleteMenuItem(id: string) {
  await apiClient.delete(`/admin/menu-items/${id}`);
}
