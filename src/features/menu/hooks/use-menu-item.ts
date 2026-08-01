import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { fetchMenuItemById } from "../api/menu-items.api";

// Powers the item detail page (/menu/[itemId]).
export function useMenuItem(id: string) {
  return useQuery({
    queryKey: queryKeys.menuItems.detail(id),
    queryFn: () => fetchMenuItemById(id),
    enabled: !!id,
  });
}
