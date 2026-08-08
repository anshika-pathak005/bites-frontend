// Backend-enforced order lifecycle state; see src/constants/order-status.ts
// for the allowed transitions — keep both in sync with the backend.
export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

// A line item snapshot on a placed order (price/name captured at order time).
export interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
}

// A placed order as returned by the backend (order tracking, admin views).
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  deliveryCharge: number;
  subtotal: number;
  grandTotal: number;
  placedAt: string;
  cancellable?: boolean;
  cancelReason?: string;
}

// Request body for placing an order via checkout (cookie-owned guest session).
export interface CheckoutPayload {
  name: string;
  phone: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  latitude: number;
  longitude: number;
  // Omit both for Cart Flow; set both for Buy Now Flow
  buyNowMenuItemId?: string;
  buyNowQuantity?: number;
}
