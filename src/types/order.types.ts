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

// Customer-provided delivery info collected at checkout.
export interface DeliveryDetails {
  name: string;
  phone: string;
  deliveryAreaId: string;
  fullAddress: string;
  landmark?: string;
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
  deliveryCharge: number;
  subtotal: number;
  grandTotal: number;
  placedAt: string;
}

// Request body for placing an order via checkout.
export interface CheckoutPayload {
  delivery: DeliveryDetails;
  paymentMethod: "COD";
  // one of the two, depending on cart-flow vs buy-now-flow
  cartSessionId?: string;
  buyNow?: { menuItemId: string; quantity: number };
}
