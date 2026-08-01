import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Cart } from "@/types/cart.types";

// All cart endpoints are public — a guest is identified only by sessionId,
// generated once per browser by CartProvider (see src/context/cart-context.tsx).

// GET /api/cart/:sessionId — fetches the full cart (items + totals) for this guest session.
export async function fetchCart(sessionId: string) {
  const { data } = await apiClient.get<ApiResponse<Cart>>(`/cart/${sessionId}`);
  return data.data;
}

// POST /api/cart/items — adds a menu item to the cart, creating the cart if needed.
export async function addCartItem(sessionId: string, menuItemId: string, quantity: number) {
  const { data } = await apiClient.post<ApiResponse<Cart>>("/cart/items", {
    sessionId,
    menuItemId,
    quantity,
  });
  return data.data;
}

// PATCH /api/cart/:sessionId/items/:cartItemId — changes the quantity of one existing cart line item.
export async function updateCartItemQuantity(sessionId: string, cartItemId: string, quantity: number) {
  const { data } = await apiClient.patch<ApiResponse<Cart>>(
    `/cart/${sessionId}/items/${cartItemId}`,
    { quantity }
  );
  return data.data;
}

// DELETE /api/cart/:sessionId/items/:cartItemId — removes a single line item from the cart.
export async function removeCartItem(sessionId: string, cartItemId: string) {
  const { data } = await apiClient.delete<ApiResponse<Cart>>(`/cart/${sessionId}/items/${cartItemId}`);
  return data.data;
}
