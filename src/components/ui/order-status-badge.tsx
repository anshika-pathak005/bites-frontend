import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants/order-status";
import type { OrderStatus } from "@/types/order.types";

// Background/text color per order status, keyed so every status must be handled.
const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-primary-fixed text-on-primary-fixed-variant",
  ACCEPTED: "bg-secondary-container text-on-secondary-container",
  PREPARING: "bg-secondary-container text-on-secondary-container",
  OUT_FOR_DELIVERY: "bg-primary-container text-on-primary-container",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-error-container text-on-error-container",
};

// Small colored pill showing an order's current status with its human-readable label.
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-label-md", STATUS_STYLES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
