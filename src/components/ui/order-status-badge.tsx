import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants/order-status";
import type { OrderStatus } from "@/types/order.types";

// Background/text color per order status, keyed so every status must be handled.
const STATUS_STYLES: Record<OrderStatus, { bg: string; dot: string }> = {
  PENDING: { bg: "bg-primary-fixed text-on-primary-fixed-variant border-primary/20", dot: "bg-primary" },
  ACCEPTED: { bg: "bg-secondary-container text-on-secondary-container border-secondary/20", dot: "bg-secondary" },
  PREPARING: { bg: "bg-amber-100 text-amber-900 border-amber-200", dot: "bg-amber-600" },
  OUT_FOR_DELIVERY: { bg: "bg-primary-container text-on-primary-container border-primary/20", dot: "bg-primary" },
  DELIVERED: { bg: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-600" },
  CANCELLED: { bg: "bg-error-container text-on-error-container border-error/20", dot: "bg-error" },
};

// Small colored pill showing an order's current status with its human-readable label.
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status] || { bg: "bg-surface-container text-on-surface border-outline-variant/30", dot: "bg-secondary" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 border",
        style.bg
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
      <span>{ORDER_STATUS_LABELS[status] || status}</span>
    </span>
  );
}
