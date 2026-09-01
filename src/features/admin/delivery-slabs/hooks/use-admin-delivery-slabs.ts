import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/query-keys";
import {
  fetchDeliverySlabs,
  createDeliverySlab,
  updateDeliverySlab,
  deleteDeliverySlab,
  type DeliveryChargeSlabPayload,
} from "../api/admin-delivery-slabs.api";

export function useAdminDeliverySlabs() {
  return useQuery({
    queryKey: queryKeys.admin.deliverySlabs,
    queryFn: fetchDeliverySlabs,
  });
}

export function useDeliverySlabMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.deliverySlabs });
  };

  const createMutation = useMutation({
    mutationFn: createDeliverySlab,
    onSuccess: () => {
      invalidate();
      toast.success("Delivery pricing slab created");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create delivery charge slab");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: DeliveryChargeSlabPayload }) =>
      updateDeliverySlab(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Delivery pricing slab updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update delivery charge slab");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteDeliverySlab(id),
    onSuccess: () => {
      invalidate();
      toast.success("Delivery pricing slab deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete delivery charge slab");
    },
  });

  return {
    createSlab: createMutation,
    updateSlab: updateMutation,
    deleteSlab: deleteMutation,
  };
}
