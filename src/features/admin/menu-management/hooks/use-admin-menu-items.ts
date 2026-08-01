"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMenuItem,
  deleteMenuItem,
  searchMenuItemsAdmin,
  setMenuItemAvailability,
  updateMenuItem,
  type MenuItemPayload,
} from "../api/admin-menu-items.api";

const KEY = ["admin", "menu-items"];

// Fetches one page of menu items; params are part of the query key so each page/search combo caches separately.
export function useAdminMenuItems(params: { page: number; pageSize: number; search?: string }) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => searchMenuItemsAdmin(params),
  });
}

// Bundles create/update/toggle-availability/delete menu-item mutations, all sharing the same cache invalidation.
export function useMenuItemMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY }); // matches every paginated variant since KEY is a prefix of the full query key
    // The public menu grid reads the same items — keep it in sync too.
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
  };

  // Creates a menu item, then refreshes both admin and public menu caches.
  const create = useMutation({
    mutationFn: (payload: MenuItemPayload) => createMenuItem(payload),
    onSuccess: () => { invalidate(); toast.success("Menu item created"); },
    onError: () => toast.error("Could not create menu item"),
  });

  // Updates a menu item, then refreshes both admin and public menu caches.
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuItemPayload }) => updateMenuItem(id, payload),
    onSuccess: () => { invalidate(); toast.success("Menu item updated"); },
    onError: () => toast.error("Could not update menu item"),
  });

  // Flips isAvailable, then refreshes both admin and public menu caches.
  const toggleAvailability = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) => setMenuItemAvailability(id, available),
    onSuccess: () => { invalidate(); toast.success("Availability updated"); },
    onError: () => toast.error("Could not update availability"),
  });

  // Deletes a menu item, then refreshes both admin and public menu caches.
  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => { invalidate(); toast.success("Menu item deleted"); },
    onError: () => toast.error("Could not delete menu item"),
  });

  return { create, update, toggleAvailability, remove };
}
