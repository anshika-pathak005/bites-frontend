import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchDeliveryAreas } from "../api/delivery-areas.api";

// Loads the list of deliverable areas for the checkout address form's area picker.
export function useDeliveryAreas() {
  return useQuery({
    queryKey: queryKeys.deliveryAreas.all,
    queryFn: fetchDeliveryAreas,
  });
}
