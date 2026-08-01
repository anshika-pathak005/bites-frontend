import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { CheckoutPayload, Order } from "@/types/order.types";

// POST /api/orders — backend tells apart Cart Flow vs Buy Now Flow purely
// from which optional fields are present on this same payload shape.
export async function placeOrder(payload: CheckoutPayload) {
  const body = {
    name: payload.delivery.name,
    phone: payload.delivery.phone,
    deliveryAreaId: payload.delivery.deliveryAreaId,
    fullAddress: payload.delivery.fullAddress,
    landmark: payload.delivery.landmark,
    // Cart Flow: cartSessionId is set, buyNow fields are undefined — order everything in the cart.
    cartSessionId: payload.cartSessionId,
    // Buy Now Flow: buyNow fields are set instead — order this single item directly, bypassing the cart.
    // Note: backend prices this using the menu item's LIVE price, not whatever was shown when added — deliberate.
    buyNowMenuItemId: payload.buyNow?.menuItemId,
    buyNowQuantity: payload.buyNow?.quantity,
  };
  const { data } = await apiClient.post<ApiResponse<Order>>("/orders", body);
  return data.data;
}
