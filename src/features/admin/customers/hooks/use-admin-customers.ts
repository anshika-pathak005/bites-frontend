import { useQuery } from "@tanstack/react-query";
import { fetchAllCustomers, fetchCustomerAddresses } from "../api/admin-customers.api";

// Fetches and caches the full customer list for the admin customers table.
export function useAdminCustomers() {
  return useQuery({ queryKey: ["admin", "customers"], queryFn: fetchAllCustomers });
}

// Fetches a single customer's addresses; disabled until a customer is selected.
export function useCustomerAddresses(customerId: string | number | null) {
  return useQuery({
    queryKey: ["admin", "customers", customerId, "addresses"],
    queryFn: () => fetchCustomerAddresses(customerId!), // non-null assertion is safe because `enabled` guards the null case
    enabled: !!customerId,
  });
}
