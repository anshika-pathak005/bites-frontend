import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { CheckoutPayload, Order } from "@/types/order.types";

// POST /api/orders — backend identifies the guest by the HttpOnly guestId cookie.
// Body shape: { name, phone, fullAddress, landmark, pincode, latitude, longitude, buyNowMenuItemId?, buyNowQuantity? }
export async function placeOrder(payload: CheckoutPayload): Promise<Order> {
  const body: Record<string, unknown> = {
    name: payload.name,
    phone: payload.phone,
    fullAddress: payload.fullAddress,
    landmark: payload.landmark || undefined,
    pincode: payload.pincode,
    latitude: payload.latitude,
    longitude: payload.longitude,
  };

  // For Cart Flow: omit buyNowMenuItemId & buyNowQuantity entirely.
  // For Buy Now Flow: set both fields to purchase the single item directly.
  if (payload.buyNowMenuItemId) {
    body.buyNowMenuItemId = payload.buyNowMenuItemId;
    body.buyNowQuantity = payload.buyNowQuantity ?? 1;
  }

  const { data } = await apiClient.post<ApiResponse<Order>>("/orders", body);
  if (!data.data) {
    throw new Error(data.message || "Failed to place order");
  }
  return data.data;
}
