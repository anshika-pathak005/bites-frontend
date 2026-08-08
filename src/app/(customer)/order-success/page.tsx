"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Flame,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trackByOrderNumber } from "@/features/orders/api/orders.api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/order.types";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setIsLoading(false);
      return;
    }
    trackByOrderNumber(orderNumber)
      .then((result) => setOrder(result ?? null))
      .catch((err) => {
        console.error("Order lookup error:", err);
        setOrder(null);
      })
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

  function handleCopy() {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-xs text-secondary font-medium animate-pulse">
          Confirming your order details...
        </p>
      </div>
    );
  }

  if (!orderNumber || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center px-margin-mobile">
        <Package className="w-12 h-12 text-on-surface-variant/40" />
        <p className="text-secondary text-sm">We couldn&apos;t find that order.</p>
        <Link href="/track-order">
          <Button className="rounded-full text-white font-semibold cursor-pointer">
            Track an Order
          </Button>
        </Link>
      </div>
    );
  }

  const firstName = order.customerName ? order.customerName.split(" ")[0] : "there";

  return (
    <div className="relative px-margin-mobile md:px-margin-desktop py-stack-md sm:py-stack-lg max-w-xl mx-auto overflow-hidden">
      <div className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-6 my-4 transition-all duration-300">
        {/* Animated Hero Success Ring Icon */}
        <div className="relative flex items-center justify-center mx-auto w-24 h-24 sm:w-28 sm:h-28">
          {/* Radiating Expanding Pulsing Rings */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-primary-fixed/40 animate-pulse-ring [animation-delay:400ms]" />

          {/* Main Solid Icon Badge */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-success-pop">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>
        </div>

        {/* Celebratory Title & Subtitle */}
        <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed-variant text-[11px] font-bold tracking-widest uppercase mb-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Order Confirmed</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">
            Deliciousness on the Way!
          </h1>
          <p className="text-secondary text-xs sm:text-body-md pt-1 max-w-md mx-auto leading-relaxed">
            Thanks, <span className="font-semibold text-on-surface">{firstName}</span>! Your order has been placed successfully and the kitchen is getting ready.
          </p>
        </div>

        {/* Live Kitchen Preparation Pulse Badge */}
        <div className="bg-surface-container/70 border border-outline-variant/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-primary animate-bounce [animation-duration:1.5s]" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span>Preparing Order</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              </p>
              <p className="text-[11px] text-secondary">
                {order.items?.length ?? 1} {(order.items?.length ?? 1) === 1 ? "item" : "items"} • Total:{" "}
                <span className="font-semibold text-on-surface">{formatPrice(order.grandTotal)}</span> (COD)
              </p>
            </div>
          </div>
          <Link href={`/track-order?orderNumber=${order.orderNumber}`} className="shrink-0">
            <span className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Live Map <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Prominent Order Number Display with Increased Padding and Tactile Copy Feedback */}
        <div className="bg-surface-container-high/60 border border-outline-variant/40 rounded-2xl px-6 py-6 w-full text-center relative group transition-all hover:bg-surface-container-high/90">
          <p className="text-[11px] text-secondary uppercase tracking-widest font-semibold mb-1">
            Your Order ID
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <p className="font-headline-md text-xl sm:text-2xl text-primary font-bold tracking-wider select-all">
              {order.orderNumber}
            </p>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl hover:bg-surface-container text-secondary hover:text-primary transition-all duration-200 cursor-pointer active:scale-90"
              title="Copy Order ID"
              aria-label="Copy Order ID"
            >
              {copied ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Cross-Device Safety Net Note */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
            <span className="font-semibold text-primary">Cross-device tracking: </span>
            Save this Order ID if you want to track or check your order status from a different phone, laptop, or browser.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Link href={`/track-order?orderNumber=${order.orderNumber}`} className="block w-full">
            <Button
              size="lg"
              className="w-full text-white font-semibold rounded-xl py-6 text-sm sm:text-body-md shadow-md hover:shadow-lg transition-all cursor-pointer gap-2 group"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link
            href="/menu"
            className="block text-center text-xs sm:text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer py-1"
          >
            Browse more delicious items from Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
