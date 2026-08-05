import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";

// POST /admin/uploads/image — multipart upload (JPG/PNG/WEBP, <=5MB, enforced
// server-side). Returns the hosted URL to store on the owning record (menu
// item image, category image, restaurant logo, etc).
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ApiResponse<{ url: string }>>("/admin/uploads/image", formData);

  if (!data.data?.url) {
    throw new Error(data.error?.message ?? "Image upload failed");
  }
  return data.data.url;
}
