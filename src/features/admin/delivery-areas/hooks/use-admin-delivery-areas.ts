"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDeliveryArea,
  deleteDeliveryArea,
  fetchAllDeliveryAreasAdmin,
  updateDeliveryArea,
  type DeliveryAreaPayload,
} from "../api/admin-delivery-areas.api";

const KEY = ["admin", "delivery-areas"];

// Fetches and caches the full admin delivery-area list (active + inactive).
export function useAdminDeliveryAreas() {
  return useQuery({ queryKey: KEY, queryFn: fetchAllDeliveryAreasAdmin });
}

// Bundles create/update/delete delivery-area mutations, all sharing the same cache invalidation.
export function useDeliveryAreaMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY });
    // Public checkout also reads the active delivery areas — keep it fresh too.
    queryClient.invalidateQueries({ queryKey: ["delivery-areas"] });
  };

  // Creates a delivery area, then refreshes both admin and public caches.
  const create = useMutation({
    mutationFn: (payload: DeliveryAreaPayload) => createDeliveryArea(payload),
    onSuccess: () => { invalidate(); toast.success("Delivery area created"); },
    onError: () => toast.error("Could not create delivery area"),
  });

  // Updates a delivery area, then refreshes both admin and public caches.
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeliveryAreaPayload }) => updateDeliveryArea(id, payload),
    onSuccess: () => { invalidate(); toast.success("Delivery area updated"); },
    onError: () => toast.error("Could not update delivery area"),
  });

  // Deactivates a delivery area, then refreshes both admin and public caches.
  const remove = useMutation({
    mutationFn: (id: string) => deleteDeliveryArea(id),
    onSuccess: () => { invalidate(); toast.success("Delivery area deactivated"); },
    onError: () => toast.error("Could not deactivate delivery area"),
  });

  return { create, update, remove };
}
