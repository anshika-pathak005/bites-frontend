import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: DeliveryChargeSlabPayload }) =>
      updateDeliverySlab(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteDeliverySlab(id),
    onSuccess: invalidate,
  });

  return {
    createSlab: createMutation,
    updateSlab: updateMutation,
    deleteSlab: deleteMutation,
  };
}
