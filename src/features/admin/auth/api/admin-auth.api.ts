import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { AdminAuthResponse, AdminUser } from "@/types/admin.types";

// Logs an admin in via POST /admin/auth/login, returns tokens + user on success.
export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<AdminAuthResponse>>("/admin/auth/login", { email, password });
  return data.data;
}

// Invalidates the given refresh token via POST /admin/auth/logout.
export async function logoutRequest(refreshToken: string) {
  await apiClient.post("/admin/auth/logout", { refreshToken });
}

// Fetches the logged-in admin's own profile via GET /admin/profile.
export async function fetchProfile() {
  const { data } = await apiClient.get<ApiResponse<AdminUser>>("/admin/profile");
  return data.data;
}

// Updates name/email for the logged-in admin via PUT /admin/profile.
export async function updateProfileRequest(payload: { name: string; email: string }) {
  const { data } = await apiClient.put<ApiResponse<AdminUser>>("/admin/profile", payload);
  return data.data;
}

// Changes the logged-in admin's password via PUT /admin/profile/password.
export async function changePasswordRequest(payload: { currentPassword: string; newPassword: string }) {
  await apiClient.put("/admin/profile/password", payload);
}
