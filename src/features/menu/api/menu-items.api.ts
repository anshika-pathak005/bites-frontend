import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse, PaginatedResult } from "@/types/api.types";
import type { MenuItem, MenuItemFilters } from "@/types/menu.types";

// GET /api/menu-items — paginated, filterable menu listing (category, search, veg-only, etc. via filters).
export async function fetchMenuItems(filters: MenuItemFilters) {
  const { data } = await apiClient.get<ApiResponse<PaginatedResult<MenuItem>>>("/menu-items", {
    params: filters,
  });
  return data.data;
}

// GET /api/menu-items/:id — single item detail; the price here is always the current live price.
export async function fetchMenuItemById(id: string) {
  const { data } = await apiClient.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
  return data.data;
}
