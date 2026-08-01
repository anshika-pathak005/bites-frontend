import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchMenuItems } from "../api/menu-items.api";
import type { MenuItemFilters } from "@/types/menu.types";

// Powers the menu listing/browse page; refetches whenever filters change since they're part of the query key.
export function useMenuItems(filters: MenuItemFilters) {
  return useQuery({
    queryKey: queryKeys.menuItems.list(filters),
    queryFn: () => fetchMenuItems(filters),
  });
}
