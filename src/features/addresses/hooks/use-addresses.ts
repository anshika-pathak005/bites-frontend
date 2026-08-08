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

export function useAddresses() {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: fetchAddresses,
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
    mutationFn: ({ id, payload }: { id: string; payload: AddressPayload }) =>
      updateAddress(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Address updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddress(id),
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
