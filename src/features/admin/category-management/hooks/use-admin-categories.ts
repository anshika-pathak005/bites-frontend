"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  fetchAllCategoriesAdmin,
  updateCategory,
  type CategoryPayload,
} from "../api/admin-categories.api";

const KEY = ["admin", "categories"];

// Fetches and caches the full admin category list (active + inactive).
export function useAdminCategories() {
  return useQuery({ queryKey: KEY, queryFn: fetchAllCategoriesAdmin });
}

// Bundles create/update/delete category mutations, all sharing the same cache invalidation.
export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY });
    // Categories also show up in the public-facing menu filters — refresh those too.
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // Creates a category, then refreshes both admin and public category caches.
  const create = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Category created");
    },
    onError: () => toast.error("Could not create category"),
  });

  // Updates a category, then refreshes both admin and public category caches.
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) => updateCategory(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Category updated");
    },
    onError: () => toast.error("Could not update category"),
  });

  // Deactivates a category, then refreshes both admin and public category caches.
  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Category deactivated");
    },
    onError: () => toast.error("Could not deactivate category"),
  });

  return { create, update, remove };
}
