// Centralized route paths — use these instead of hardcoding URL strings
// throughout the app so links stay consistent if a path ever changes.
export const ROUTES = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: "/order-success",
  trackOrder: "/track-order",
  contact: "/contact",
  about: "/about",
  // Admin-only routes, nested under /admin.
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    orders: "/admin/orders",
    menu: "/admin/menu",
    categories: "/admin/categories",
    deliveryAreas: "/admin/delivery-areas",
    customers: "/admin/customers",
    settings: "/admin/settings",
    profile: "/admin/profile",
  },
} as const;
