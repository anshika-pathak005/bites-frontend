import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";

export interface AdminCustomer {
  id: string | number;
  name: string;
  phone: string;
  email: string | null;
  ordersCount?: number;
  totalSpent?: number;
  lastOrderAt?: string | null;
  joinedAt?: string | null;
}

export interface AdminCustomerAddress {
  id: string | number;
  label: string | null;
  fullAddress: string;
  landmark: string | null;
  pincode?: string | null;
  deliveryAreaName?: string;
  isDefault: boolean;
}

// Fetches all registered customers via GET /admin/customers.
export async function fetchAllCustomers() {
  const { data } = await apiClient.get<ApiResponse<AdminCustomer[]>>("/admin/customers");
  return data.data ?? [];
}

// Fetches saved addresses for one customer via GET /admin/customers/:id/addresses.
export async function fetchCustomerAddresses(customerId: string | number) {
  const { data } = await apiClient.get<ApiResponse<AdminCustomerAddress[]>>(`/admin/customers/${customerId}/addresses`);
  return data.data ?? [];
}
