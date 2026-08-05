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
      <Link href={ROUTES.admin.orders} className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Order header: number, placed time, current status */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-headline-md md:text-headline-lg font-headline-lg">{order.orderNumber}</h1>
          <p className="text-secondary text-sm mt-1">
            Placed {new Date(order.placedAt).toLocaleString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* One button per allowed next status; hidden entirely for terminal statuses */}
      {nextOptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {nextOptions.map((s: OrderStatus) => (
            <button
              key={s}
              onClick={() => updateStatus.mutate({ id: order.id, status: s })}
              disabled={updateStatus.isPending}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-label-md hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              Mark as {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Customer and delivery info side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-2">
          <h3 className="font-headline-md text-headline-md mb-2">Customer</h3>
          <p className="text-sm"><span className="text-secondary">Name:</span> {order.customerName}</p>
          <p className="text-sm"><span className="text-secondary">Phone:</span> {order.customerPhone}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-2">
          <h3 className="font-headline-md text-headline-md mb-2">Delivery</h3>
          <p className="text-sm"><span className="text-secondary">Address:</span> {order.deliveryAddress}</p>
        </div>
      </div>

      {/* Line items and price breakdown */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6">
        <h3 className="font-headline-md text-headline-md mb-4">Items</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.itemName} × {item.quantity}</span>
              <span>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant/30 mt-4 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-secondary">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-secondary">
            <span>Delivery Charge</span>
            <span>{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-headline-md font-headline-md pt-2">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
