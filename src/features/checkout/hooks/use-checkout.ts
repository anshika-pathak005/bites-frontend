"use client";

import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../api/checkout.api";

// Submits the checkout form via POST /api/orders (cookie-backed guest identity).
export function usePlaceOrder() {
  return useMutation({
    mutationFn: placeOrder,
  });
}
