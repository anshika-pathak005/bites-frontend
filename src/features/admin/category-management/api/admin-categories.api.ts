import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Category } from "@/types/menu.types";

// Shape sent to the backend for both create and update category calls.
export interface CategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

// Fetches all categories (including inactive ones) via GET /admin/categories.
export async function fetchAllCategoriesAdmin() {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/admin/categories");
  return data.data ?? [];
}

// Creates a new category via POST /admin/categories.
export async function createCategory(payload: CategoryPayload) {
  const { data } = await apiClient.post<ApiResponse<Category>>("/admin/categories", payload);
  return data.data;
}

// Updates an existing category via PUT /admin/categories/:id.
export async function updateCategory(id: string, payload: CategoryPayload) {
  const { data } = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
  return data.data;
}

// Soft-deletes (deactivates) a category via DELETE /admin/categories/:id.
export async function deleteCategory(id: string) {
  await apiClient.delete(`/admin/categories/${id}`);
}
