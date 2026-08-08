import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { Cart } from "@/types/cart.types";

// All cart endpoints are cookie-owned — the backend automatically creates and
// associates an HttpOnly guestId cookie on the first request.

// GET /api/cart — fetches the full cart (items + totals) for this guest.
export async function fetchCart(): Promise<Cart | null> {
  const { data } = await apiClient.get<ApiResponse<Cart>>("/cart");
  return data.data;
}

// POST /api/cart/items — adds a menu item to the cart (body: { menuItemId, quantity }).
export async function addCartItem(menuItemId: string, quantity: number): Promise<Cart | null> {
  const { data } = await apiClient.post<ApiResponse<Cart>>("/cart/items", {
    menuItemId,
    quantity,
  });
  return data.data;
}

// PATCH /api/cart/items/:cartItemId — changes the quantity of one existing cart line item.
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<Cart | null> {
  const { data } = await apiClient.patch<ApiResponse<Cart>>(
    `/cart/items/${cartItemId}`,
    { quantity }
  );
  return data.data;
}

// DELETE /api/cart/items/:cartItemId — removes a single line item from the cart.
export async function removeCartItem(cartItemId: string): Promise<Cart | null> {
  const { data } = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${cartItemId}`);
  return data.data;
}
