import { apiClient } from "@/lib/api/axios-instance";
import type { ApiResponse } from "@/types/api.types";
import type { CheckoutPayload, Order, VerifyPaymentPayload } from "@/types/order.types";

// POST /api/orders — backend identifies the guest by the HttpOnly guestId cookie.
export async function placeOrder(payload: CheckoutPayload): Promise<Order> {
  const body: Record<string, unknown> = {
    name: payload.name,
    phone: payload.phone,
    fullAddress: payload.fullAddress,
    landmark: payload.landmark || undefined,
    pincode: payload.pincode,
    latitude: payload.latitude,
    longitude: payload.longitude,
    paymentMethod: payload.paymentMethod || "COD",
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

// POST /api/orders/:orderNumber/verify-payment — verifies Razorpay payment signature
export async function verifyPayment(
  orderNumber: string,
  payload: VerifyPaymentPayload
): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>(
    `/orders/${orderNumber}/verify-payment`,
    payload
  );
  if (!data.data) {
    throw new Error(data.message || "Payment verification failed");
  }
  return data.data;
}
