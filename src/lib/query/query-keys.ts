// Centralized TanStack Query key factory. Keys are arrays that go from
// general to specific (entity -> operation -> params), so invalidating a
// broad key (e.g. "menu-items") also invalidates all its nested variants.
export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  menuItems: {
    all: ["menu-items"] as const,
    // Filters object is part of the key so each distinct filter combo caches separately.
    list: (filters: object) => ["menu-items", "list", filters] as const,
    detail: (id: string) => ["menu-items", "detail", id] as const,
  },
  deliveryAreas: {
    all: ["delivery-areas"] as const,
  },
  cart: {
    // Keyed by session id since carts are anonymous/session-scoped, not user-scoped.
    detail: (sessionId: string) => ["cart", sessionId] as const,
  },
  orders: {
    // Keyed by the customer's lookup query (e.g. order number/phone).
    track: (query: string) => ["orders", "track", query] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    orders: (filters: object) => ["admin", "orders", filters] as const,
    customers: (filters: object) => ["admin", "customers", filters] as const,
  },
};
