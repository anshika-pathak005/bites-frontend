"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Navigation,
  ReceiptText,
  Banknote,
  CreditCard,
  Flame,
  Truck,
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

const PROGRESS_STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "PENDING", label: "Placed", icon: Clock },
  { status: "ACCEPTED", label: "Accepted", icon: Check },
  { status: "PREPARING", label: "Preparing", icon: Flame },
  { status: "OUT_FOR_DELIVERY", label: "On the Way", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

function formatOrderDate(dateString?: string) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

function PaymentStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s === "PAID" || s === "COMPLETED" || s === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
        Paid
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        Payment Pending
      </span>
    );
  }
  if (s === "CANCELLED" || s === "FAILED" || s === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        {s}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-container text-secondary border border-outline-variant/30">
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method?: string }) {
  const m = method?.toUpperCase() || "COD";
  if (m === "COD" || m === "CASH") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface">
        <Banknote className="w-3.5 h-3.5 text-primary" />
        Cash on Delivery (COD)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface">
      <CreditCard className="w-3.5 h-3.5 text-primary" />
      {method || "Online Payment"}
    </span>
  );
}

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

  // If redirected from checkout or query string with ?orderNumber=...
  useEffect(() => {
    const prefill = searchParams.get("orderNumber");
    if (prefill) {
      setSearchOrderNumber(prefill);
      trackOrderMutation.mutate(prefill.trim(), {
        onSuccess: (order) => {
          if (order) {
            setTrackedOrder(order);
            setHasSearched(true);
          }
        },
      });
    }
  }, [searchParams]);

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

  const myOrders = myOrdersQuery.data ?? [];
  const hasMyOrders = myOrders.length > 0;

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
      {hasMyOrders ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <h2 className="text-sm sm:text-base font-bold text-on-surface">
              Recent Orders ({myOrders.length})
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
            {myOrders.map((order) => (
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

// Reusable Order Card with visual status progress, ordered items, delivery & billing breakdown
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
  const stepStatuses = PROGRESS_STEPS.map((s) => s.status);
  const currentStepIndex = stepStatuses.indexOf(order.status);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-sm p-4 sm:p-6 space-y-5 hover:shadow-md transition-all duration-200">
      {/* Top Header: Order Number, Date, Status, and Cancel Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-secondary uppercase tracking-widest font-semibold">
              Order ID
            </span>
            <button
              onClick={copyOrderNumber}
              className="p-1 rounded-md hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-headline-md text-base sm:text-headline-md text-primary font-bold">
            {order.orderNumber}
          </p>
          {order.placedAt && (
            <p className="text-[11px] text-secondary mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-secondary/70 inline-block" />
              Placed on {formatOrderDate(order.placedAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
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
        <div className="px-4 py-3.5 rounded-2xl bg-error-container/40 border border-error/20 text-on-error-container text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <XCircle className="w-5 h-5 shrink-0 text-error" />
          <div>
            <span>This order was cancelled.</span>
            {order.cancelReason && (
              <p className="font-normal text-secondary text-xs mt-0.5">Reason: {order.cancelReason}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-2 border-b border-outline-variant/30 pb-5">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {PROGRESS_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.status} className="flex-1 flex flex-col items-center relative min-w-[60px]">
                  {index > 0 && (
                    <div
                      className={cn(
                        "absolute top-3 sm:top-3.5 right-1/2 w-full h-0.5 transition-colors",
                        isDone ? "bg-primary" : "bg-outline-variant/60"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full z-10 border-2 transition-all flex items-center justify-center",
                      isDone
                        ? "bg-primary border-primary text-white"
                        : "bg-surface-container-lowest border-outline-variant text-secondary/60",
                      isCurrent && "ring-4 ring-primary/20 scale-110 shadow-sm"
                    )}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] text-center mt-1.5 font-medium leading-tight",
                      isDone ? "text-primary font-bold" : "text-secondary"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Grid: Items Breakdown on Left/Top, Delivery & Bill Breakdown on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Left Column: Ordered Items List */}
        <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                Ordered Items ({order.items?.length || 0})
              </span>
            </div>

            <div className="divide-y divide-outline-variant/15 max-h-56 overflow-y-auto pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-start text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-on-surface">{item.itemName}</p>
                    <p className="text-[11px] text-secondary">
                      {formatPrice(item.itemPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-on-surface pt-0.5">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-secondary">Items Subtotal</span>
            <span className="font-bold text-on-surface">{formatPrice(order.subtotal ?? 0)}</span>
          </div>
        </div>

        {/* Right Column: Delivery Details + Bill Summary */}
        <div className="space-y-4">
          {/* Delivery & Customer Info Card */}
          <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Delivery Address
              </span>
              {order.distanceKm != null && !isNaN(Number(order.distanceKm)) && (
                <span className="text-[11px] font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/30">
                  {Number(order.distanceKm).toFixed(1)} km away
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-secondary">
              <div className="flex flex-wrap items-center justify-between gap-1 text-on-surface font-semibold">
                <span>{order.customerName}</span>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                  >
                    <Phone className="w-3 h-3" />
                    {order.customerPhone}
                  </a>
                )}
              </div>
              <p className="text-on-surface-variant leading-relaxed text-xs">
                {order.deliveryAddress}
              </p>
              {(order.landmark || order.pincode) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] pt-1 border-t border-outline-variant/15 text-secondary">
                  {order.landmark && (
                    <span className="inline-flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-primary/70 shrink-0" />
                      <span>Landmark: <strong className="text-on-surface font-medium">{order.landmark}</strong></span>
                    </span>
                  )}
                  {order.pincode && (
                    <span>
                      PIN: <strong className="text-on-surface font-medium">{order.pincode}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-surface-container-low/40 rounded-2xl p-4 border border-outline-variant/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/20">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 text-primary" />
                Bill Summary
              </span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="space-y-1.5 text-xs text-secondary pt-0.5">
              <div className="flex justify-between items-center">
                <span>Item Subtotal</span>
                <span className="font-semibold text-on-surface">{formatPrice(order.subtotal ?? 0)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Delivery Charge</span>
                  {order.distanceKm != null && !isNaN(Number(order.distanceKm)) && (
                    <span className="text-[10px] text-secondary/80">({Number(order.distanceKm).toFixed(1)} km)</span>
                  )}
                </span>
                <span className="font-semibold text-on-surface">
                  {order.deliveryCharge === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(order.deliveryCharge ?? 0)
                  )}
                </span>
              </div>

              <div className="border-t border-outline-variant/30 pt-2.5 mt-1.5 flex justify-between items-end">
                <div>
                  <span className="text-xs text-secondary uppercase tracking-wider font-semibold block">
                    Grand Total
                  </span>
                  <div className="mt-0.5">
                    <PaymentMethodBadge method={order.paymentMethod} />
                  </div>
                </div>
                <span className="text-lg sm:text-xl font-bold text-primary">
                  {formatPrice(order.grandTotal ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
