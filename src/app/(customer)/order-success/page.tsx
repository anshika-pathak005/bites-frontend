"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trackByOrderNumber } from "@/features/orders/api/orders.api";
import type { Order } from "@/types/order.types";

// Next.js requires useSearchParams() to sit inside a Suspense boundary — the
// actual page content lives in OrderSuccessContent below, and this default
// export just supplies that boundary around it.
export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

// Order confirmation screen shown right after checkout, looked up by order number in the URL.
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // A plain effect + fetch (not a TanStack Query hook) is enough here — this
  // page only ever needs to load the order once, right after it was placed.
  useEffect(() => {
    if (!orderNumber) {
      setIsLoading(false);
      return;
    }
    trackByOrderNumber(orderNumber)
      .then((result) => setOrder(result ?? null))
      .finally(() => setIsLoading(false));
  }, [orderNumber]);

  // Block rendering until the order lookup finishes
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // No order number in the URL, or the lookup came back empty
  if (!orderNumber || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center px-margin-mobile">
        <p className="text-secondary">We couldn&apos;t find that order.</p>
        <Link href="/track-order">
          <Button>Track an Order</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-md sm:py-stack-lg max-w-md mx-auto">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-5 my-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-fixed/50 text-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div>
          <span className="text-primary font-label-md text-xs sm:text-label-sm tracking-widest uppercase block mb-1">SUCCESS</span>
          <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">Order Placed!</h1>
        </div>
        <p className="text-secondary text-sm sm:text-body-md">
          Thanks, {order.customerName.split(" ")[0]} — your order has been received and is being prepared.
        </p>
        <div className="bg-surface-container-high/60 border border-outline-variant/30 rounded-2xl px-6 py-4 w-full">
          <p className="text-xs text-secondary uppercase tracking-widest font-semibold">Order ID</p>
          <p className="font-headline-md text-xl sm:text-headline-md text-primary font-bold">{order.orderNumber}</p>
        </div>
        <div className="pt-2">
          <Link href={`/track-order?orderNumber=${order.orderNumber}`} className="block w-full">
            <Button size="lg" className="w-full text-white font-semibold rounded-xl">Track Order Status</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
