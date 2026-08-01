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
    <div className="flex flex-col items-center gap-6 py-24 px-margin-mobile text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-primary" />
      </div>
      <h1 className="font-headline-lg text-headline-lg">Order Placed!</h1>
      <p className="text-secondary">
        Thanks, {order.customerName.split(" ")[0]} — your order has been received and is being reviewed by the restaurant.
      </p>
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm px-8 py-4 w-full">
        <p className="text-xs text-secondary uppercase tracking-widest">Order ID</p>
        <p className="font-headline-md text-headline-md text-primary">{order.orderNumber}</p>
      </div>
      <Link href={`/track-order?orderNumber=${order.orderNumber}`} className="w-full">
        <Button size="lg" className="w-full">Track Order</Button>
      </Link>
    </div>
  );
}
