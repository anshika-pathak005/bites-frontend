"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useMenuItem } from "@/features/menu/hooks/use-menu-item";
import { usePlaceOrder, useVerifyPayment } from "@/features/checkout/hooks/use-checkout";
import { useCancelOrder } from "@/features/orders/hooks/use-track-order";
import { useDeliveryQuote } from "@/features/checkout/hooks/use-delivery-quote";
import { AddressSelector } from "@/features/addresses/components/address-selector";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import type { Address } from "@/types/address.types";
import type { CheckoutPayload, Order, PaymentMethod } from "@/types/order.types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required for delivery"),
  phone: z.string().min(6, "Enter a valid delivery contact phone number"),
  fullAddress: z.string().min(5, "Please select or add a delivery address"),
  landmark: z.string().optional(),
  pincode: z.string().min(4, "Please select or add a valid delivery address with pincode"),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Buy Now Flow arrives via query params from the item detail/menu page.
  const buyNowItemId = searchParams.get("buyNowItemId");
  const buyNowQuantity = Number(searchParams.get("quantity") ?? "1");
  const isBuyNowFlow = !!buyNowItemId;

  const { cartQuery, addItem } = useCart();
  const { data: buyNowItem, isLoading: isLoadingBuyNowItem } = useMenuItem(buyNowItemId ?? "");
  const { addressesQuery } = useAddresses();
  const savedAddresses = addressesQuery.data ?? [];

  const placeOrder = usePlaceOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const cancelOrderMutation = useCancelOrder();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [pendingOnlineOrder, setPendingOnlineOrder] = useState<Order | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isRestoringCart, setIsRestoringCart] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      fullAddress: "",
      landmark: "",
      pincode: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const fullAddressValue = watch("fullAddress");
  const latitudeValue = watch("latitude");
  const longitudeValue = watch("longitude");

  // Automatically select the default address (or first address) on initial load
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddress) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        handleSelectSavedAddress(defaultAddr);
      }
    }
  }, [savedAddresses, selectedAddress]);

  // Real-time Delivery Quote query via GET /api/delivery-pricing/quote?latitude={lat}&longitude={lng}
  const quoteQuery = useDeliveryQuote(latitudeValue, longitudeValue);

  // Handle saved address selection
  function handleSelectSavedAddress(address: Address) {
    setSelectedAddress(address);
    setValue("fullAddress", address.fullAddress, { shouldValidate: true });
    setValue("landmark", address.landmark || "");
    setValue("pincode", address.pincode, { shouldValidate: true });
    setValue("latitude", address.latitude, { shouldValidate: true });
    setValue("longitude", address.longitude, { shouldValidate: true });
    setInlineError(null);
  }

  // Cancel pending order and restore cart items from local storage backup
  async function handleCancelAndRestoreCart() {
    if (!pendingOnlineOrder) return;
    setIsRestoringCart(true);
    setInlineError(null);
    try {
      await cancelOrderMutation.mutateAsync(String(pendingOnlineOrder.id));

      const backupStr = localStorage.getItem("bites_cart_backup");
      if (backupStr) {
        const items = JSON.parse(backupStr) as { menuItemId: string; quantity: number }[];
        for (const item of items) {
          await addItem.mutateAsync({ menuItemId: item.menuItemId, quantity: item.quantity });
        }
        localStorage.removeItem("bites_cart_backup");
      }

      toast.success("Order cancelled. Your cart has been restored.");
      setPendingOnlineOrder(null);
      router.push("/cart");
    } catch (err: any) {
      setInlineError("Failed to cancel order & restore cart. Please try again.");
    } finally {
      setIsRestoringCart(false);
    }
  }

  // Subtotal & delivery charge calculations
  const subtotal = pendingOnlineOrder
    ? pendingOnlineOrder.subtotal
    : isBuyNowFlow
    ? (buyNowItem?.price ?? 0) * buyNowQuantity
    : cartQuery.data?.subtotal ?? 0;

  const isCalculatingDelivery = quoteQuery.isLoading && quoteQuery.fetchStatus !== "idle";
  const deliveryCharge = pendingOnlineOrder
    ? pendingOnlineOrder.deliveryCharge
    : quoteQuery.data?.deliveryCharge ?? 0;
  const isOutsideRadius = quoteQuery.isError;
  const grandTotal = pendingOnlineOrder
    ? pendingOnlineOrder.grandTotal
    : subtotal + (quoteQuery.isSuccess ? deliveryCharge : 0);

  const quoteErrorMessage = quoteQuery.error
    ? axios.isAxiosError(quoteQuery.error)
      ? quoteQuery.error.response?.data?.message ||
        quoteQuery.error.response?.data?.error?.message ||
        "This address is outside our delivery service area."
      : quoteQuery.error.message || "Address is outside our delivery radius."
    : null;

  const isLoadingSummary = isBuyNowFlow ? isLoadingBuyNowItem : cartQuery.isLoading;
  const hasNothingToOrder = !pendingOnlineOrder && (isBuyNowFlow ? !buyNowItem : (cartQuery.data?.items.length ?? 0) === 0);

  // Razorpay Checkout Widget Handler
  function launchRazorpayWidget(order: Order) {
    if (!order.razorpayOrderId || !order.razorpayKeyId) {
      setInlineError("Online payment details missing. Please try placing your order again.");
      return;
    }

    const options = {
      key: order.razorpayKeyId,
      amount: Math.round(order.grandTotal * 100), // Paise for Razorpay display
      currency: "INR",
      name: "Bites",
      description: `Order #${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      handler: async function (response: any) {
        try {
          setInlineError(null);
          const verifiedOrder = await verifyPaymentMutation.mutateAsync({
            orderNumber: order.orderNumber,
            payload: {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          });

          if (verifiedOrder && (verifiedOrder.paymentStatus === "PAID" || verifiedOrder)) {
            localStorage.removeItem("bites_cart_backup");
            toast.success("Payment verified successfully!");
            router.push(`/order-success?orderNumber=${order.orderNumber}`);
          }
        } catch (err: any) {
          const msg = err instanceof Error ? err.message : "Payment verification failed.";
          setInlineError(msg);
          setPendingOnlineOrder(order);
        }
      },
      prefill: {
        name: order.customerName,
        contact: order.customerPhone,
      },
      theme: { color: "#F97316" },
      modal: {
        ondismiss: function () {
          setInlineError(
            "Payment widget closed. Your order is pending payment — click 'Retry Online Payment' below to complete your order."
          );
          setPendingOnlineOrder(order);
        },
      },
    };

    if (typeof window !== "undefined" && window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        const failureMsg =
          response.error?.description || "Payment attempted but failed on Razorpay's side.";
        setInlineError(failureMsg);
        setPendingOnlineOrder(order);
      });
      rzp.open();
    } else {
      setInlineError("Razorpay SDK is loading. Please wait a moment and try again.");
      setPendingOnlineOrder(order);
    }
  }

  async function onSubmit(values: CheckoutFormValues) {
    setInlineError(null);

    if (!values.fullAddress || !values.pincode) {
      setInlineError("Please select or add a delivery address to proceed.");
      return;
    }

    if (isOutsideRadius) {
      setInlineError(quoteErrorMessage || "Selected address is outside our delivery service area.");
      return;
    }

    const payload: CheckoutPayload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      fullAddress: values.fullAddress.trim(),
      landmark: values.landmark?.trim() || undefined,
      pincode: values.pincode.trim(),
      latitude: values.latitude,
      longitude: values.longitude,
      buyNowMenuItemId: isBuyNowFlow ? buyNowItemId! : undefined,
      buyNowQuantity: isBuyNowFlow ? buyNowQuantity : undefined,
      paymentMethod,
    };

    placeOrder.mutate(payload, {
      onSuccess: (order) => {
        if (order?.paymentMethod === "ONLINE") {
          const cartItems = cartQuery.data?.items.map(item => ({
            menuItemId: item.menuItemId || (item as any).menuItem?.id || item.id,
            quantity: item.quantity
          })) || [];
          localStorage.setItem("bites_cart_backup", JSON.stringify(cartItems));

          launchRazorpayWidget(order);
        } else if (order?.orderNumber) {
          localStorage.removeItem("bites_cart_backup");
          router.push(`/order-success?orderNumber=${order.orderNumber}`);
        }
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          const errorData = err.response?.data;
          const msg =
            errorData?.message ||
            errorData?.error?.message ||
            (typeof errorData === "string" ? errorData : null) ||
            "Could not place your order. Please check your delivery details and try again.";

          setInlineError(msg);
        } else if (err instanceof Error) {
          setInlineError(err.message);
        } else {
          setInlineError("Could not place your order. Please try again.");
        }
      },
    });
  }

  if (isLoadingSummary) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (hasNothingToOrder) {
    return (
      <div className="px-margin-mobile text-center py-24 max-w-md mx-auto space-y-4">
        <p className="text-secondary text-body-md">
          There&apos;s nothing to check out yet — add something from the menu first.
        </p>
        <Button onClick={() => router.push("/menu")} className="rounded-full text-white font-semibold cursor-pointer">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-bold text-xs sm:text-sm tracking-widest uppercase block mb-1">
          FINAL STEP
        </span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {/* Left column: Delivery contact & address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inline Delivery Notice / Radius Error Alert */}
          {(inlineError || isOutsideRadius) && (
            <div
              className={cn(
                "p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm",
                "bg-error-container text-on-error-container border border-error/30"
              )}
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Notice</p>
                <p>{inlineError || quoteErrorMessage}</p>
              </div>
            </div>
          )}

          {/* Pending Online Payment Retry Card */}
          {pendingOnlineOrder && (
            <div className="bg-surface-container border border-primary/40 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                <div>
                  <span className="text-primary font-bold text-xs uppercase tracking-widest block">
                    ORDER #{pendingOnlineOrder.orderNumber} PENDING PAYMENT
                  </span>
                  <p className="text-xs text-secondary mt-0.5">
                    Your order was created. Complete online payment below.
                  </p>
                </div>
                <span className="font-bold text-primary text-base">
                  {formatPrice(pendingOnlineOrder.grandTotal)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => launchRazorpayWidget(pendingOnlineOrder)}
                  className="flex-grow text-black font-bold py-3 rounded-xl glow-hover cursor-pointer flex items-center justify-center gap-2"
                  disabled={verifyPaymentMutation.isPending || isRestoringCart}
                >
                  {verifyPaymentMutation.isPending ? (
                    <Spinner className="w-4 h-4 text-black" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-black" />
                      <span>Retry Online Payment</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelAndRestoreCart}
                  className="flex-grow text-error border-error/40 hover:bg-error-container/20 hover:border-error font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  disabled={verifyPaymentMutation.isPending || isRestoringCart}
                >
                  {isRestoringCart ? (
                    <Spinner className="w-4 h-4 text-error" />
                  ) : (
                    <span>Cancel Order & Edit Cart</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Delivery Contact Info */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
              Delivery Contact Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
                  Recipient Name
                </label>
                <Input {...register("name")} placeholder="Your full name" />
                {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
                  Phone Number
                </label>
                <Input {...register("phone")} placeholder="e.g. 9876543210" />
                {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Delivery Address Section with Saved Address Book */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
              Delivery Address
            </h3>

            <AddressSelector
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectSavedAddress}
            />

            {errors.fullAddress && !fullAddressValue && (
              <p className="text-error text-xs">{errors.fullAddress.message}</p>
            )}

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
              <label className="font-label-md text-xs sm:text-label-sm block font-semibold text-on-surface">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    paymentMethod === "COD"
                      ? "bg-primary/10 border-primary text-on-surface shadow-sm"
                      : "bg-surface-container/50 border-outline-variant/40 text-secondary hover:border-outline-variant"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary font-bold shrink-0">
                      <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block text-on-surface">Cash on Delivery</span>
                      <span className="text-[11px] text-secondary">Pay cash upon delivery</span>
                    </div>
                  </div>
                  {paymentMethod === "COD" && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </div>

                {/* Pay Online (Razorpay) */}
                <div
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={cn(
                    "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                    paymentMethod === "ONLINE"
                      ? "bg-primary/10 border-primary text-on-surface shadow-sm"
                      : "bg-surface-container/50 border-outline-variant/40 text-secondary hover:border-outline-variant"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary font-bold shrink-0">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm block text-on-surface">Pay Online</span>
                      <span className="text-[11px] text-secondary">UPI, Cards, NetBanking, Wallets</span>
                    </div>
                  </div>
                  {paymentMethod === "ONLINE" && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
            Order Summary
          </h3>

          {pendingOnlineOrder ? (
            pendingOnlineOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-body-md">
                <span className="text-secondary">
                  {item.itemName} × {item.quantity}
                </span>
                <span className="font-semibold text-on-surface">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))
          ) : isBuyNowFlow && buyNowItem ? (
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">
                {buyNowItem.name} × {buyNowQuantity}
              </span>
              <span className="font-semibold text-on-surface">
                {formatPrice(buyNowItem.price * buyNowQuantity)}
              </span>
            </div>
          ) : (
            cartQuery.data?.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-body-md">
                <span className="text-secondary">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-on-surface">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))
          )}

          <div className="border-t border-outline-variant/30 pt-4 space-y-2.5">
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium text-on-surface">{formatPrice(subtotal)}</span>
            </div>

            {/* Dynamic Delivery Charge */}
            <div className="flex justify-between items-center text-xs sm:text-body-md">
              <span className="text-secondary">Delivery Charge</span>
              {pendingOnlineOrder ? (
                <span className="font-medium text-on-surface">
                  {formatPrice(pendingOnlineOrder.deliveryCharge)}
                </span>
              ) : isCalculatingDelivery ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Spinner className="w-3.5 h-3.5 text-primary" />
                  Calculating delivery...
                </span>
              ) : isOutsideRadius ? (
                <span className="text-xs text-error font-semibold">Outside service radius</span>
              ) : quoteQuery.isSuccess ? (
                <span className="font-medium text-on-surface">
                  {formatPrice(deliveryCharge)}
                </span>
              ) : (
                <span className="text-xs text-secondary">Select address</span>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/30">
              <span className="font-headline-md text-headline-md text-on-surface">Total</span>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">
                {isCalculatingDelivery ? (
                  <span className="text-base text-secondary font-normal">Calculating...</span>
                ) : (
                  formatPrice(grandTotal)
                )}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-black font-bold rounded-xl cursor-pointer"
            disabled={
              placeOrder.isPending ||
              verifyPaymentMutation.isPending ||
              isCalculatingDelivery ||
              isOutsideRadius ||
              !selectedAddress
            }
          >
            {placeOrder.isPending || verifyPaymentMutation.isPending ? (
              <Spinner className="w-5 h-5 text-black" />
            ) : isOutsideRadius ? (
              "Address Outside Delivery Radius"
            ) : isCalculatingDelivery ? (
              "Calculating Delivery..."
            ) : paymentMethod === "ONLINE" ? (
              "Proceed to Pay Online"
            ) : (
              "Place Order (COD)"
            )}
          </Button>

          <p className="text-[11px] text-center text-secondary flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Secure 256-bit encrypted checkout</span>
          </p>
        </div>
      </form>
    </div>
  );
}
