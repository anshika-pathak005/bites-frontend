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
  cart: {
    // Cookie-backed guest cart session (no client sessionId parameter needed).
    all: ["cart"] as const,
    detail: () => ["cart"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
  },
  deliveryPricing: {
    quote: (lat?: number, lon?: number) => ["delivery-pricing", "quote", lat, lon] as const,
  },
  orders: {
    myOrders: ["orders", "my-orders"] as const,
    track: (orderNumber: string) => ["orders", "track", orderNumber] as const,
  },
  customer: {
    profile: ["customer", "profile"] as const,
    recommendations: ["customer", "recommendations"] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    orders: (filters: object) => ["admin", "orders", filters] as const,
    customers: (filters: object) => ["admin", "customers", filters] as const,
    deliverySlabs: ["admin", "delivery-charge-slabs"] as const,
  },
};
