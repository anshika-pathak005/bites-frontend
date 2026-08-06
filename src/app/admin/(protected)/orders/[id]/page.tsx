"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { formatPrice } from "@/lib/utils";
import { useAdminOrder, useUpdateOrderStatus } from "@/features/admin/orders/hooks/use-admin-orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/constants/order-status";
import { ROUTES } from "@/constants/routes";
import type { OrderStatus } from "@/types/order.types";

// Full detail view for a single order, including status-advance actions.
export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError || !order) {
    return <p className="text-secondary">Order not found.</p>;
  }

  // Which statuses this order can move to next — mirrors the server-enforced
  // state machine (PENDING -> ACCEPTED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED,
  // with PENDING/ACCEPTED able to go to CANCELLED). Empty array means a terminal status.
  const nextOptions = ORDER_STATUS_TRANSITIONS[order.status];

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={ROUTES.admin.orders} className="inline-flex items-center gap-2 text-xs sm:text-sm text-secondary hover:text-primary font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Order header: number, placed time, current status */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <span className="text-primary font-label-md text-xs tracking-widest uppercase block mb-1">ORDER DETAILS</span>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface">{order.orderNumber}</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Placed {new Date(order.placedAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* One button per allowed next status */}
      {nextOptions.length > 0 && (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {nextOptions.map((s: OrderStatus) => (
            <button
              key={s}
              onClick={() => updateStatus.mutate({ id: order.id, status: s })}
              disabled={updateStatus.isPending}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:scale-[1.02] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Mark as {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Customer and delivery info side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-2">
          <h3 className="font-headline-md text-lg sm:text-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-2 mb-3">Customer</h3>
          <p className="text-xs sm:text-sm"><span className="text-secondary font-medium">Name:</span> <span className="font-semibold text-on-surface">{order.customerName}</span></p>
          <p className="text-xs sm:text-sm"><span className="text-secondary font-medium">Phone:</span> <span className="font-semibold text-on-surface">{order.customerPhone}</span></p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-2">
          <h3 className="font-headline-md text-lg sm:text-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-2 mb-3">Delivery</h3>
          <p className="text-xs sm:text-sm"><span className="text-secondary font-medium">Address:</span> <span className="font-semibold text-on-surface">{order.deliveryAddress}</span></p>
        </div>
      </div>

      {/* Line items and price breakdown */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6">
        <h3 className="font-headline-md text-lg sm:text-headline-md font-bold text-on-surface border-b border-outline-variant/30 pb-3 mb-4">Items</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs sm:text-sm">
              <span className="text-secondary">{item.itemName} × {item.quantity}</span>
              <span className="font-semibold text-on-surface">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant/30 mt-4 pt-4 space-y-1.5">
          <div className="flex justify-between text-xs sm:text-sm text-secondary">
            <span>Subtotal</span>
            <span className="font-medium text-on-surface">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-secondary">
            <span>Delivery Charge</span>
            <span className="font-medium text-on-surface">{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-base sm:text-headline-md font-bold pt-2 border-t border-outline-variant/30">
            <span className="text-on-surface">Total</span>
            <span className="text-primary">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
