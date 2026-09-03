import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Address, AddressPayload } from "@/types/address.types";

// All address endpoints are cookie-owned and scoped to the guestId cookie.

// GET /api/addresses — returns saved addresses for this guest, default-first.
export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<ApiResponse<Address[]>>("/addresses");
  return data.data ?? [];
}

// POST /api/addresses — creates a new delivery address.
export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await apiClient.post<ApiResponse<Address>>("/addresses", payload);
  if (!data.data) {
    throw new Error(data.message || "Failed to create address");
  }
  return data.data;
}

// PUT /api/addresses/:addressId — updates an existing address.
export async function updateAddress(addressId: number, payload: AddressPayload): Promise<Address> {
  const { data } = await apiClient.put<ApiResponse<Address>>(`/addresses/${addressId}`, payload);
  if (!data.data) {
    throw new Error(data.message || "Failed to update address");
  }
  return data.data;
}

// DELETE /api/addresses/:addressId — deletes a saved address.
export async function deleteAddress(addressId: number): Promise<void> {
  await apiClient.delete(`/addresses/${addressId}`);
}
