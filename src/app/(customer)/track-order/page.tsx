"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice, cn } from "@/lib/utils";
import {
  useMyOrders,
  useTrackOrderMutation,
  useCancelOrder,
} from "@/features/orders/hooks/use-track-order";
import { ORDER_STATUS_LABELS } from "@/constants/order-status";
import type { Order, OrderStatus } from "@/types/order.types";

const PROGRESS_STEPS: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <TrackOrderPageContent />
    </Suspense>
  );
}

function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const myOrdersQuery = useMyOrders();
  const trackOrderMutation = useTrackOrderMutation();
  const cancelOrderMutation = useCancelOrder();

  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);

  const myOrders = myOrdersQuery.data ?? [];
  const hasMyOrders = myOrders.length > 0;

  // If redirected from checkout or query string with ?orderNumber=...
  useEffect(() => {
    const prefill = searchParams.get("orderNumber")?.trim();
    if (!prefill) return;

    setSearchOrderNumber(prefill);

    // Only run cross-device lookup if myOrders finished loading and does NOT already contain this order
    if (!myOrdersQuery.isLoading) {
      const alreadyInMyOrders = myOrders.some(
        (o) => o.orderNumber.toLowerCase() === prefill.toLowerCase()
      );
      if (!alreadyInMyOrders) {
        trackOrderMutation.mutate(prefill, {
          onSuccess: (order) => {
            if (order) {
              setTrackedOrder(order);
              setHasSearched(true);
            }
          },
        });
      }
    }
  }, [searchParams, myOrdersQuery.isLoading, myOrders]);

  // Handle manual order search
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchOrderNumber.trim();
    if (!query) return;

    trackOrderMutation.mutate(query, {
      onSuccess: (order) => {
        setTrackedOrder(order ?? null);
        setHasSearched(true);
      },
    });
  }

  // Handle cancel order execution
  function handleConfirmCancel() {
    if (!cancellingOrder) return;
    cancelOrderMutation.mutate(cancellingOrder.orderNumber, {
      onSettled: () => {
        setCancellingOrder(null);
        // If the currently viewed single tracked order was cancelled, re-track it
        if (trackedOrder && trackedOrder.orderNumber === cancellingOrder.orderNumber) {
          trackOrderMutation.mutate(cancellingOrder.orderNumber, {
            onSuccess: (updated) => setTrackedOrder(updated ?? null),
          });
        }
      },
    });
  }

  if (myOrdersQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-xs text-secondary font-medium">Loading your orders...</p>
      </div>
    );
  }

  const displayedRecentOrders = hasSearched && trackedOrder
    ? myOrders.filter((o) => o.orderNumber.toLowerCase() !== trackedOrder.orderNumber.toLowerCase())
    : myOrders;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto py-stack-md sm:py-stack-lg">
      {/* Header */}
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">
          LIVE STATUS
        </span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">
          Track Your Orders
        </h1>
        <p className="text-secondary text-sm sm:text-body-md mt-1">
          {hasMyOrders
            ? "Your active and recent orders on this device are displayed below."
            : "Look up your order status instantly using your Order ID."}
        </p>
      </div>

      {/* Cross-device / Manual Lookup Panel */}
      {hasMyOrders ? (
        <div className="mb-stack-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowSearchBox((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Track an order from another device or browser
            </span>
            {showSearchBox ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSearchBox && (
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5 mt-3 pt-3 border-t border-outline-variant/30">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input
                  className="pl-10 py-2 text-xs sm:text-sm rounded-xl"
                  placeholder="Enter Order ID (e.g. ORD-12345)"
                  value={searchOrderNumber}
                  onChange={(e) => setSearchOrderNumber(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="text-white font-semibold rounded-xl px-5"
                disabled={trackOrderMutation.isPending}
              >
                {trackOrderMutation.isPending ? <Spinner className="w-3.5 h-3.5" /> : "Track"}
              </Button>
            </form>
          )}
        </div>
      ) : (
        /* Empty State: Search Input shown prominently */
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5 sm:gap-3 mb-stack-lg max-w-xl mx-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input
              className="pl-11 py-3 text-sm sm:text-body-md rounded-xl shadow-xs"
              placeholder="Enter your Order ID (e.g. ORD-987654)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="md"
            className="text-white font-semibold px-6 sm:px-8 rounded-xl shadow-xs"
            disabled={trackOrderMutation.isPending}
          >
            {trackOrderMutation.isPending ? <Spinner className="w-4 h-4" /> : "Track Order"}
          </Button>
        </form>
      )}

      {/* Display Single Tracked Order if searched */}
      {hasSearched && (
        <div className="mb-stack-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary">
              Search Result
            </h3>
            <button
              onClick={() => {
                setHasSearched(false);
                setTrackedOrder(null);
              }}
              className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {trackedOrder ? (
            <OrderTrackingCard
              order={trackedOrder}
              onCancelClick={(order) => setCancellingOrder(order)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <Package className="w-8 h-8 text-on-surface-variant/50" />
              <p className="text-secondary text-sm font-medium">
                No order found matching Order ID &ldquo;{searchOrderNumber}&rdquo;.
              </p>
              <p className="text-xs text-secondary/80">
                Please double-check the Order ID from your confirmation screen.
              </p>
            </div>
          )}
        </div>
      )}

      {/* List of Cookie-Owned Orders (Same Device Automatic Experience) */}
      {displayedRecentOrders.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <h2 className="text-sm sm:text-base font-bold text-on-surface">
              Recent Orders ({displayedRecentOrders.length})
            </h2>
            <button
              onClick={() => myOrdersQuery.refetch()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {displayedRecentOrders.map((order) => (
              <OrderTrackingCard
                key={order.id || order.orderNumber}
                order={order}
                onCancelClick={(ord) => setCancellingOrder(ord)}
              />
            ))}
          </div>
        </div>
      ) : (
        !hasSearched && (
          <div className="flex flex-col items-center gap-4 py-16 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                No Active Orders on this Device
              </h3>
              <p className="text-secondary text-xs sm:text-sm mt-1 max-w-sm">
                If you recently placed an order on a different device or cleared your cookies, enter your Order ID above to track it live.
              </p>
            </div>
          </div>
        )
      )}

      {/* Confirmation Dialog for Order Cancellation */}
      <ConfirmDialog
        open={!!cancellingOrder}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${cancellingOrder?.orderNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        isLoading={cancelOrderMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingOrder(null)}
      />
    </div>
  );
}

// Reusable Order Card with visual status progress and instant Cancel button
function OrderTrackingCard({
  order,
  onCancelClick,
}: {
  order: Order;
  onCancelClick: (order: Order) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyOrderNumber() {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 hover:shadow-md transition-all duration-200">
      {/* Top Header: Order Number, Date, Status, and Cancel Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-secondary uppercase tracking-widest font-semibold">
              Order ID
            </span>
            <button
              onClick={copyOrderNumber}
              className="p-1 rounded hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-headline-md text-base sm:text-headline-md text-primary font-bold">
            {order.orderNumber}
          </p>
          {order.placedAt && (
            <p className="text-[11px] text-secondary mt-0.5">
              Placed on {new Date(order.placedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Status Badge */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              isCancelled
                ? "bg-error-container text-on-error-container"
                : isDelivered
                ? "bg-green-100 text-green-800"
                : "bg-primary-fixed text-on-primary-fixed-variant"
            )}
          >
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>

          {/* Cancel button: displayed when backend flag cancellable === true */}
          {order.cancellable && !isCancelled && !isDelivered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancelClick(order)}
              className="text-error border-error/40 hover:bg-error-container/20 hover:border-error rounded-full text-xs font-semibold px-3 py-1 h-auto"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Visual Status Progress Tracker */}
      {isCancelled ? (
        <div className="px-4 py-3 rounded-xl bg-error-container/60 border border-error/20 text-on-error-container text-xs sm:text-sm font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-error" />
          <span>This order was cancelled.</span>
          {order.cancelReason && <span className="font-normal text-secondary">({order.cancelReason})</span>}
        </div>
      ) : (
        <div className="py-4 sm:py-6 border-b border-outline-variant/30">
          <div className="flex items-center justify-between overflow-x-auto">
            {PROGRESS_STEPS.map((step, index) => {
              const currentIndex = PROGRESS_STEPS.indexOf(order.status);
              const isDone = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step} className="flex-1 flex flex-col items-center relative min-w-[65px]">
                  {index > 0 && (
                    <div
                      className={cn(
                        "absolute top-2.5 sm:top-3 right-1/2 w-full h-0.5 transition-colors",
                        isDone ? "bg-primary" : "bg-outline-variant/60"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 rounded-full z-10 border-2 transition-all flex items-center justify-center",
                      isDone
                        ? "bg-primary border-primary text-white"
                        : "bg-surface-container-lowest border-outline-variant",
                      isCurrent && "ring-4 ring-primary/20 scale-110"
                    )}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] sm:text-[10px] text-center mt-1.5 font-medium leading-tight",
                      isDone ? "text-primary font-bold" : "text-secondary"
                    )}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ordered Items Breakdown */}
      <div className="space-y-2 pt-1">
        <p className="text-xs text-secondary font-semibold uppercase tracking-wider">
          Ordered Items
        </p>
        <div className="divide-y divide-outline-variant/20">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-1.5 text-xs sm:text-sm">
              <span className="text-on-surface font-medium">
                {item.itemName} <span className="text-secondary font-normal">× {item.quantity}</span>
              </span>
              <span className="font-semibold text-on-surface">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info & Grand Total Footer */}
      <div className="border-t border-outline-variant/30 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="text-secondary max-w-sm">
          <p className="font-medium text-on-surface">
            Delivery to: {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ""}
          </p>
          {order.deliveryAddress && (
            <p className="text-secondary text-[11px] sm:text-xs mt-0.5 line-clamp-1">
              {order.deliveryAddress}
              {order.landmark ? ` • Near ${order.landmark}` : ""}
              {order.pincode ? ` • ${order.pincode}` : ""}
              {order.distanceKm != null ? ` • ${Number(order.distanceKm).toFixed(1)} km` : ""}
            </p>
          )}
        </div>

        <div className="text-right sm:text-right space-y-0.5">
          <div className="text-xs text-secondary flex items-center justify-end gap-2">
            <span>Delivery Charge:</span>
            <span className="font-medium text-on-surface">
              {order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge ?? 0)}
            </span>
          </div>
          <span className="text-xs text-secondary block">Total Paid (COD)</span>
          <span className="text-base sm:text-lg font-bold text-primary">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
