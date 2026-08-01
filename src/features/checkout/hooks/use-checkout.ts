"use client";

import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../api/checkout.api";

// Submits the checkout form via POST /api/orders. The caller decides Cart Flow vs Buy Now Flow
// by which fields it puts on the payload (cartSessionId vs buyNow) — see checkout.api.ts#placeOrder.
export function usePlaceOrder() {
  return useMutation({
    mutationFn: placeOrder,
  });
}
