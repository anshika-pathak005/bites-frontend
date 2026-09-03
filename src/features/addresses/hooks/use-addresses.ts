"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../api/addresses.api";
import type { AddressPayload } from "@/types/address.types";

interface UseAddressesOptions {
  // Guests no longer have a saved-address book, so the checkout page passes
  // `enabled: isAuthenticated` to keep GET /api/addresses from ever firing for
  // an anonymous caller. Defaults to true so existing (logged-in) callers —
  // the profile address book, the AddressFormModal — are unaffected.
  enabled?: boolean;
}

export function useAddresses(options: UseAddressesOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: fetchAddresses,
    enabled,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
  }

  const createMutation = useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Address saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddressPayload }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Address updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => {
      invalidate();
      toast.success("Address removed");
    },
    onError: () => toast.error("Could not remove address"),
  });

  return {
    addressesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
