import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants/order-status";
import type { OrderStatus } from "@/types/order.types";

// Dark theme background/text color per order status, matching Midnight Gourmet aesthetic.
const STATUS_STYLES: Record<OrderStatus, { bg: string; dot: string }> = {
  PENDING: { bg: "bg-amber-950/80 text-amber-400 border-amber-500/40 font-bold", dot: "bg-amber-400 animate-pulse" },
  ACCEPTED: { bg: "bg-sky-950/80 text-sky-400 border-sky-500/40 font-bold", dot: "bg-sky-400" },
  PREPARING: { bg: "bg-amber-950/90 text-primary border-primary/40 font-bold", dot: "bg-primary" },
  OUT_FOR_DELIVERY: { bg: "bg-indigo-950/80 text-indigo-400 border-indigo-500/40 font-bold", dot: "bg-indigo-400" },
  DELIVERED: { bg: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-bold", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" },
  CANCELLED: { bg: "bg-red-950/80 text-red-400 border-red-500/40 font-bold", dot: "bg-red-400" },
};

// Small colored pill showing an order's current status with its human-readable label.
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status] || { bg: "bg-surface-container text-on-surface border-outline-variant/30 font-bold", dot: "bg-secondary" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 border shadow-xs",
        style.bg
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
      <span>{ORDER_STATUS_LABELS[status] || status}</span>
    </span>
  );
}
