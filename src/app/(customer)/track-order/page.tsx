"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useTrackOrder } from "@/features/orders/hooks/use-track-order";
import { ORDER_STATUS_LABELS } from "@/constants/order-status";
import type { OrderStatus } from "@/types/order.types";

// The order in which stages appear in the visual progress tracker. CANCELLED
// is handled separately since it isn't a step in the normal forward flow.
const PROGRESS_STEPS: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

// Next.js requires useSearchParams() to sit inside a Suspense boundary — the
// actual page content lives in TrackOrderContent below, and this default
// export just supplies that boundary around it.
export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

// Lets a guest look up their order(s) by order number or phone number.
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"orderNumber" | "phone">("orderNumber");
  const [value, setValue] = useState("");
  const { mutate, data: orders, isPending, isError } = useTrackOrder();

  // Arriving from the Order Success page's "Track Order" button pre-fills
  // and auto-searches, so the guest doesn't have to type their own order id.
  useEffect(() => {
    const prefillOrderNumber = searchParams.get("orderNumber");
    if (prefillOrderNumber) {
      setValue(prefillOrderNumber);
      mutate({ mode: "orderNumber", value: prefillOrderNumber });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Manual search submit — trims whitespace and skips empty queries
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      mutate({ mode, value: value.trim() });
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto py-stack-md sm:py-stack-lg">
      <div className="text-center mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">LIVE STATUS</span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">Track Your Order</h1>
        <p className="text-secondary text-sm sm:text-body-md mt-1">
          Look up your order status using your Order ID or phone number.
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 mb-stack-md">
        <ModeTab
          label="Order ID"
          active={mode === "orderNumber"}
          onClick={() => setMode("orderNumber")}
        />
        <ModeTab
          label="Phone Number"
          active={mode === "phone"}
          onClick={() => setMode("phone")}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 mb-stack-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            className="pl-11 py-2.5 sm:py-3 text-sm sm:text-body-md rounded-xl"
            placeholder={
              mode === "orderNumber" ? "e.g. ORD-7K4QX9P2" : "e.g. 9876543210"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" size="md" className="text-white font-semibold px-5 sm:px-6" disabled={isPending}>
          {isPending ? <Spinner className="w-4 h-4" /> : "Track"}
        </Button>
      </form>

      {isError && (
        <p className="text-center text-secondary py-8">
          Something went wrong. Please try again.
        </p>
      )}

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-sm">
          <Package className="w-10 h-10 text-on-surface-variant" />
          <p className="text-secondary text-body-md">No orders found matching your search.</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start gap-2 border-b border-outline-variant/30 pb-3">
              <div>
                <p className="text-[11px] text-secondary uppercase tracking-widest font-semibold">
                  Order ID
                </p>
                <p className="font-headline-md text-lg sm:text-headline-md text-primary font-bold">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-secondary block">Total Amount</span>
                <span className="text-lg sm:text-headline-md font-bold text-on-surface">
                  {formatPrice(order.grandTotal)}
                </span>
              </div>
            </div>

            {/* Cancelled orders skip the progress tracker entirely */}
            {order.status === "CANCELLED" ? (
              <div className="px-4 py-3 rounded-xl bg-error-container text-on-error-container text-xs sm:text-sm font-semibold">
                This order was cancelled.
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 overflow-x-auto border-b border-outline-variant/30 pb-4">
                {PROGRESS_STEPS.map((step, index) => {
                  // A step is "done" if it's at or before the order's current status
                  const currentIndex = PROGRESS_STEPS.indexOf(order.status);
                  const isDone = index <= currentIndex;
                  return (
                    <div
                      key={step}
                      className="flex-1 flex flex-col items-center relative min-w-[55px]"
                    >
                      {index > 0 && (
                        <div
                          className={cn(
                            "absolute top-2.5 sm:top-3 right-1/2 w-full h-0.5",
                            isDone ? "bg-primary" : "bg-outline-variant/60",
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 rounded-full z-10 border-2 transition-colors",
                          isDone
                            ? "bg-primary border-primary"
                            : "bg-surface-container-lowest border-outline-variant",
                        )}
                      />
                      <span className="text-[9px] sm:text-[10px] text-center mt-1.5 text-secondary font-medium leading-tight">
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Items Breakdown */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">Ordered Items</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm text-secondary">
                  <span>
                    {item.itemName} × {item.quantity}
                  </span>
                  <span className="font-semibold text-on-surface">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Toggle button for switching between order-number and phone lookup modes
function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-label-md font-semibold transition-all duration-200 cursor-pointer select-none",
        active ? "bg-primary text-white shadow-sm" : "bg-surface-container-high text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed-variant"
      )}
    >
      {label}
    </button>
  );
}
