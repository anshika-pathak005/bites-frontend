// A menu category (e.g. "Starters", "Desserts") used to group menu items.
export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

// A single dish/item available to order, as managed by admins.
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  isBestSeller: boolean;
  isTodaysSpecial: boolean;
}

// Query params for filtering/paginating the menu item list endpoint.
export interface MenuItemFilters {
  categoryId?: string;
  search?: string;
  vegOnly?: boolean;
  bestSellerOnly?: boolean;
  todaysSpecialOnly?: boolean;
  page?: number;
  pageSize?: number;
}
