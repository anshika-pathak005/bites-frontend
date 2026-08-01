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
    <div className="px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto py-stack-lg">
      <div className="text-center mb-stack-lg">
        <h1 className="font-headline-lg text-headline-lg">Track Your Order</h1>
        <p className="text-secondary mt-2">Look up your order using its Order ID or your phone number.</p>
      </div>

      <div className="flex justify-center gap-3 mb-stack-md">
        <ModeTab label="Order ID" active={mode === "orderNumber"} onClick={() => setMode("orderNumber")} />
        <ModeTab label="Phone Number" active={mode === "phone"} onClick={() => setMode("phone")} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-stack-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            className="pl-11"
            placeholder={mode === "orderNumber" ? "e.g. ORD-7K4QX9P2" : "e.g. 9876543210"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="w-5 h-5" /> : "Track"}
        </Button>
      </form>

      {isError && <p className="text-center text-secondary">Something went wrong. Please try again.</p>}

      {orders && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Package className="w-10 h-10 text-on-surface-variant" />
          <p className="text-secondary">No orders found.</p>
        </div>
      )}

      <div className="space-y-6">
        {orders?.map((order) => (
          <div key={order.id} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-secondary uppercase tracking-widest">Order ID</p>
                <p className="font-headline-md text-headline-md text-primary">{order.orderNumber}</p>
              </div>
              <span className="text-headline-md font-headline-md">{formatPrice(order.grandTotal)}</span>
            </div>

            {/* Cancelled orders skip the progress tracker entirely */}
            {order.status === "CANCELLED" ? (
              <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-label-md">
                This order was cancelled.
              </div>
            ) : (
              <div className="flex items-center justify-between mb-6">
                {PROGRESS_STEPS.map((step, index) => {
                  // A step is "done" if it's at or before the order's current status
                  const currentIndex = PROGRESS_STEPS.indexOf(order.status);
                  const isDone = index <= currentIndex;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {index > 0 && (
                        <div
                          className={cn(
                            "absolute top-3 right-1/2 w-full h-0.5",
                            isDone ? "bg-primary" : "bg-outline-variant"
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full z-10 border-2",
                          isDone ? "bg-primary border-primary" : "bg-surface-container-lowest border-outline-variant"
                        )}
                      />
                      <span className="text-[10px] text-center mt-2 text-secondary max-w-[70px]">
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-outline-variant/30 pt-4 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-secondary">
                  <span>{item.itemName} × {item.quantity}</span>
                  <span>{formatPrice(item.subtotal)}</span>
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
        "px-5 py-2 rounded-full font-label-md text-label-md transition-all",
        active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-primary-fixed"
      )}
    >
      {label}
    </button>
  );
}
