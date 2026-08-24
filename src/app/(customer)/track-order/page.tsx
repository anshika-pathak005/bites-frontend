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
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCustomerAuth } from "@/context/customer-auth-context";
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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        Paid
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Payment Pending
      </span>
    );
  }
  if (s === "CANCELLED" || s === "FAILED" || s === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
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
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
        <Banknote className="w-3.5 h-3.5 text-primary" />
        Cash on Delivery
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
      <CreditCard className="w-3.5 h-3.5 text-primary" />
      Online ({m})
    </span>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<OrderTrackFallback />}>
      <TrackOrderContent />
    </Suspense>
  );
}

function OrderTrackFallback() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-5xl lg:max-w-6xl mx-auto py-stack-lg flex justify-center">
      <Spinner className="w-8 h-8 text-primary-container" />
    </div>
  );
}

function TrackOrderContent() {
  const { isAuthenticated } = useCustomerAuth();
  const searchParams = useSearchParams();
  const urlOrderNumber = searchParams.get("orderNumber");

  const [searchOrderNumber, setSearchOrderNumber] = useState(urlOrderNumber || "");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  const myOrdersQuery = useMyOrders();
  const trackOrderMutation = useTrackOrderMutation();
  const cancelOrderMutation = useCancelOrder();

  useEffect(() => {
    if (urlOrderNumber) {
      setSearchOrderNumber(urlOrderNumber);
      trackOrderMutation.mutate(urlOrderNumber, {
        onSuccess: (res) => {
          setTrackedOrder(res);
          setHasSearched(true);
        },
      });
    }
  }, [urlOrderNumber]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;

    trackOrderMutation.mutate(searchOrderNumber.trim(), {
      onSuccess: (res) => {
        setTrackedOrder(res);
        setHasSearched(true);
      },
      onError: () => {
        setTrackedOrder(null);
        setHasSearched(true);
      },
    });
  }

  function handleConfirmCancel() {
    if (!cancellingOrder) return;
    cancelOrderMutation.mutate(String(cancellingOrder.id), {
      onSuccess: () => {
        setCancellingOrder(null);
        if (trackedOrder?.id === cancellingOrder.id) {
          setTrackedOrder((prev) => (prev ? { ...prev, status: "CANCELLED", cancellable: false } : null));
        }
      },
    });
  }

  const myOrders = myOrdersQuery.data || [];
  const hasMyOrders = myOrders.length > 0;

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-5xl lg:max-w-6xl mx-auto py-stack-md sm:py-stack-lg space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Track Your Order Live
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed">
          Monitor your midnight culinary delivery progress in real-time or search by Order ID.
        </p>
      </div>

      {/* Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2.5 sm:gap-3 max-w-xl mx-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            className="pl-11 py-3 text-sm rounded-xl shadow-xs"
            placeholder="Enter your Order ID (e.g. ORD-987654)"
            value={searchOrderNumber}
            onChange={(e) => setSearchOrderNumber(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          size="md"
          className="text-black font-bold px-6 sm:px-8 rounded-xl glow-hover"
          disabled={trackOrderMutation.isPending}
        >
          {trackOrderMutation.isPending ? <Spinner className="w-4 h-4 text-black" /> : "Track"}
        </Button>
      </form>

      {/* Single Search Result View */}
      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Search Result
            </h3>
            <button
              onClick={() => {
                setHasSearched(false);
                setTrackedOrder(null);
              }}
              className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {trackedOrder ? (
            <OrderTrackingCard
              order={trackedOrder}
              defaultExpanded={true}
              onCancelClick={(order) => setCancellingOrder(order)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
              <Package className="w-8 h-8 text-on-surface-variant/50" />
              <p className="text-secondary text-sm font-medium">
                No order found matching Order ID &ldquo;{searchOrderNumber}&rdquo;.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accordion Order List for Logged-In Users */}
      {isAuthenticated && (
        hasMyOrders ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                Recent Orders ({myOrders.length})
              </h2>
              <button
                onClick={() => myOrdersQuery.refetch()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh Orders
              </button>
            </div>

            <div className="space-y-3">
              {myOrders.map((order, idx) => (
                <OrderTrackingCard
                  key={order.id || order.orderNumber}
                  order={order}
                  defaultExpanded={idx === 0}
                  onCancelClick={(ord) => setCancellingOrder(ord)}
                />
              ))}
            </div>
          </div>
        ) : (
          !hasSearched && (
            <div className="flex flex-col items-center gap-4 py-16 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/30 text-primary flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                  No Active Orders Found
                </h3>
                <p className="text-secondary text-xs sm:text-sm mt-1 max-w-sm">
                  Enter your Order ID above to track live delivery status.
                </p>
              </div>
            </div>
          )
        )
      )}

      {/* Guest Sign-In Conversion Card (Only for Guests) */}
      {!isAuthenticated && <GuestTrackOrderBanner />}

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        open={!!cancellingOrder}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${cancellingOrder?.orderNumber}?`}
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        isLoading={cancelOrderMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingOrder(null)}
      />
    </div>
  );
}

/**
 * Attractive Sign-In Conversion Banner Card rendered specifically for guest users on /track-order.
 */
function GuestTrackOrderBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-surface-container-lowest via-surface-container/40 to-surface-container-lowest border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto my-6 text-center space-y-5">
      {/* Decorative Glow Background Accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Badge & Header */}
      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/25">
          <Sparkles className="w-3.5 h-3.5" />
          Guest Order Tracking
        </span>
        <h3 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-1">
          Never Lose Track of Your Midnight Orders
        </h3>
        <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto leading-relaxed">
          Sign in to automatically save all your active orders, track live deliveries in 1-click without typing Order IDs, and auto-fill saved addresses across devices.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-on-surface pt-1">
        <div className="bg-surface-container/60 border border-outline-variant/30 p-3 rounded-2xl flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>Auto Order History</span>
        </div>
        <div className="bg-surface-container/60 border border-outline-variant/30 p-3 rounded-2xl flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>Saved Addresses</span>
        </div>
        <div className="bg-surface-container/60 border border-outline-variant/30 p-3 rounded-2xl flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>1-Click Live Status</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href={ROUTES.login} className="w-full sm:w-auto">
          <Button size="md" className="w-full sm:w-auto text-black font-bold px-7 py-3 rounded-xl glow-hover flex items-center justify-center gap-2 shadow-md shadow-primary/20 cursor-pointer">
            <span>Sign In to Track Automatically</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Button>
        </Link>
        <Link href={ROUTES.register} className="text-xs text-secondary hover:text-primary font-semibold transition-colors py-2 px-3">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

/**
 * Expandable Accordion Order Card Component
 */
function OrderTrackingCard({
  order,
  defaultExpanded = false,
  onCancelClick,
}: {
  order: Order;
  defaultExpanded?: boolean;
  onCancelClick: (order: Order) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  function copyOrderNumber(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  const stepStatuses = PROGRESS_STEPS.map((s) => s.status);
  const currentStepIndex = stepStatuses.indexOf(order.status);

  // Field fallbacks to support both backend DTO schemas smoothly
  const grandTotal = order.grandTotal ?? (order as unknown as { total?: number }).total ?? 0;
  const subtotal = order.subtotal ?? 0;
  const deliveryCharge = order.deliveryCharge ?? (order as unknown as { deliveryFee?: number }).deliveryFee ?? 0;
  const deliveryAddress = order.deliveryAddress || (order as unknown as { address?: { street?: string } }).address?.street || "";
  const pincode = order.pincode || (order as unknown as { address?: { pincode?: string } }).address?.pincode || "";
  const landmark = order.landmark || (order as unknown as { address?: { landmark?: string } }).address?.landmark || "";
  const phone = order.customerPhone || (order as unknown as { address?: { phone?: string } }).address?.phone || "";

  // Summary items list text (e.g. "2x Truffle Pasta, 1x Gelato")
  const itemsSummary = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.quantity}x ${i.itemName || (i as unknown as { name?: string }).name || "Item"}`).join(", ")
    : "Items";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-primary-container/40">
      {/* Clickable Header Bar (Summary View) */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-surface-container-lowest hover:bg-surface-container/40 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary shrink-0 mt-0.5 sm:mt-0">
            <Package className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-on-surface">
                Order #{order.orderNumber}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-1 rounded hover:bg-surface-container text-secondary hover:text-primary transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-secondary line-clamp-1 max-w-md">{itemsSummary}</p>
            {order.placedAt && (
              <p className="text-[11px] text-secondary/80 flex items-center gap-1 pt-0.5">
                <Clock className="w-3 h-3 text-secondary/60 inline" />
                {formatOrderDate(order.placedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Right side summary details & Action chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
          <div className="text-left sm:text-right">
            <p className="text-sm sm:text-base font-bold text-primary">{formatPrice(grandTotal)}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isCancelled
                    ? "bg-red-950/80 text-red-400 border border-red-500/40"
                    : isDelivered
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                    : "bg-primary-fixed text-on-primary-fixed-variant"
                )}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-secondary hover:text-primary transition-colors shrink-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Accordion Body Content */}
      {isExpanded && (
        <div className="border-t border-outline-variant/20 p-4 sm:p-6 space-y-6 bg-surface-container-lowest/50 animate-in fade-in duration-200">
          {/* Progress Tracker */}
          {isCancelled ? (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/20 text-on-error-container text-xs font-semibold flex items-center gap-2.5">
              <XCircle className="w-5 h-5 shrink-0 text-error" />
              <div>
                <span>This order was cancelled.</span>
                {order.cancelReason && (
                  <p className="font-normal text-secondary text-xs mt-0.5">Reason: {order.cancelReason}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2 border-b border-outline-variant/20 pb-5">
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
                            ? "bg-primary border-primary text-surface"
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

          {/* Details Grid: Items + Address & Bill Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Itemized Order List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <ReceiptText className="w-4 h-4 text-primary" />
                Ordered Items ({order.items?.length || 0})
              </h4>
              <div className="space-y-2 bg-surface-container/40 p-3.5 rounded-2xl border border-outline-variant/20">
                {order.items?.map((item, i) => {
                  const itemName = item.itemName || (item as unknown as { name?: string }).name || "Item";
                  const itemUnitPrice = item.itemPrice ?? (item as unknown as { price?: number }).price ?? 0;
                  const itemSubtotal = item.subtotal ?? (itemUnitPrice * item.quantity);

                  return (
                    <div key={item.id || i} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-surface-container border border-outline-variant/30 flex items-center justify-center text-[11px] font-bold text-primary">
                          {item.quantity}
                        </span>
                        <span className="font-semibold text-on-surface">{itemName}</span>
                      </div>
                      <span className="font-bold text-on-surface">{formatPrice(itemSubtotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address & Billing */}
            <div className="space-y-4">
              {/* Address */}
              <div className="space-y-1.5 bg-surface-container/40 p-3.5 rounded-2xl border border-outline-variant/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Delivery Location
                </h4>
                {deliveryAddress ? (
                  <p className="text-xs font-semibold text-on-surface">{deliveryAddress}</p>
                ) : (
                  <p className="text-xs text-secondary italic">Address provided at order placement</p>
                )}
                {(landmark || pincode) && (
                  <p className="text-xs text-secondary">
                    {[landmark && `Landmark: ${landmark}`, pincode && `PIN: ${pincode}`].filter(Boolean).join(" • ")}
                  </p>
                )}
                {phone && (
                  <p className="text-[11px] text-secondary/80 flex items-center gap-1 pt-0.5">
                    <Phone className="w-3 h-3 text-primary/70 inline" />
                    {phone}
                  </p>
                )}
              </div>

              {/* Bill & Payment */}
              <div className="space-y-2 bg-surface-container/40 p-3.5 rounded-2xl border border-outline-variant/20 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <PaymentMethodBadge method={order.paymentMethod} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <div className="flex justify-between text-secondary pt-1">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Delivery Fee</span>
                  <span>{deliveryCharge > 0 ? formatPrice(deliveryCharge) : "FREE"}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-on-surface pt-1.5 border-t border-outline-variant/20">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Order Action inside expanded view */}
          {order.cancellable && !isCancelled && !isDelivered && (
            <div className="pt-2 flex justify-end border-t border-outline-variant/20">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancelClick(order)}
                className="text-error border-error/40 hover:bg-error-container/20 hover:border-error rounded-xl text-xs font-semibold px-4 py-2"
              >
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
