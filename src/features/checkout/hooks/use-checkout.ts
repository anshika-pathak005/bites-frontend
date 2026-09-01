"use client";

import { useMutation } from "@tanstack/react-query";
import { placeOrder, verifyPayment } from "../api/checkout.api";
import type { VerifyPaymentPayload } from "@/types/order.types";

// Submits the checkout form via POST /api/orders (cookie-backed guest identity).
export function usePlaceOrder() {
  return useMutation({
    mutationFn: placeOrder,
  });
}

// Verifies Razorpay payment signature via POST /api/orders/:orderNumber/verify-payment
export function useVerifyPayment() {
  return useMutation({
    mutationFn: ({
      orderNumber,
      payload,
    }: {
      orderNumber: string;
      payload: VerifyPaymentPayload;
    }) => verifyPayment(orderNumber, payload),
  });
}
