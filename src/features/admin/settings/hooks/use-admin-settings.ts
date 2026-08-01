"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchRestaurantSettings, updateRestaurantSettings, type RestaurantSettingsPayload } from "../api/admin-settings.api";

const KEY = ["admin", "restaurant-settings"];

// Fetches and caches the restaurant settings record.
export function useRestaurantSettings() {
  return useQuery({ queryKey: KEY, queryFn: fetchRestaurantSettings });
}

// Updates restaurant settings; on success invalidates both the admin and public-facing settings caches.
export function useUpdateRestaurantSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RestaurantSettingsPayload) => updateRestaurantSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      // The public footer/contact info reads the same settings — refresh it too.
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Settings updated");
    },
    onError: () => toast.error("Could not update settings"),
  });
}
