import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Category } from "@/types/menu.types";

// Public endpoint — GET /api/categories — only ever returns active categories.
export async function fetchCategories() {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories");
  return data.data ?? [];
}
