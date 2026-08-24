"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useMenuItem } from "@/features/menu/hooks/use-menu-item";
import { usePlaceOrder } from "@/features/checkout/hooks/use-checkout";
import { useDeliveryQuote } from "@/features/checkout/hooks/use-delivery-quote";
import { AddressSelector } from "@/features/addresses/components/address-selector";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import type { Address } from "@/types/address.types";
import type { CheckoutPayload } from "@/types/order.types";

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

  const { cartQuery } = useCart();
  const { data: buyNowItem, isLoading: isLoadingBuyNowItem } = useMenuItem(buyNowItemId ?? "");
  const { addressesQuery } = useAddresses();
  const savedAddresses = addressesQuery.data ?? [];
  const placeOrder = usePlaceOrder();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

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

  // Handle saved address selection: instantly clears previous quote and fetches the new one
  function handleSelectSavedAddress(address: Address) {
    setSelectedAddress(address);
    setValue("fullAddress", address.fullAddress, { shouldValidate: true });
    setValue("landmark", address.landmark || "");
    setValue("pincode", address.pincode, { shouldValidate: true });
    setValue("latitude", address.latitude, { shouldValidate: true });
    setValue("longitude", address.longitude, { shouldValidate: true });
    setInlineError(null);
  }

  // Work out subtotal and delivery charge calculations
  const subtotal = isBuyNowFlow
    ? (buyNowItem?.price ?? 0) * buyNowQuantity
    : cartQuery.data?.subtotal ?? 0;

  const isCalculatingDelivery = quoteQuery.isLoading && quoteQuery.fetchStatus !== "idle";
  const deliveryCharge = quoteQuery.data?.deliveryCharge ?? 0;
  const isOutsideRadius = quoteQuery.isError;
  const grandTotal = subtotal + (quoteQuery.isSuccess ? deliveryCharge : 0);

  // Extract quote error message (e.g. "outside our 8km delivery radius")
  const quoteErrorMessage = quoteQuery.error
    ? axios.isAxiosError(quoteQuery.error)
      ? quoteQuery.error.response?.data?.message ||
        quoteQuery.error.response?.data?.error?.message ||
        "This address is outside our 8km delivery service area."
      : quoteQuery.error.message || "Address is outside our 8km delivery radius."
    : null;

  const isLoadingSummary = isBuyNowFlow ? isLoadingBuyNowItem : cartQuery.isLoading;
  const hasNothingToOrder = isBuyNowFlow ? !buyNowItem : (cartQuery.data?.items.length ?? 0) === 0;

  async function onSubmit(values: CheckoutFormValues) {
    setInlineError(null);

    if (!values.fullAddress || !values.pincode) {
      setInlineError("Please select or add a delivery address to proceed.");
      return;
    }

    if (isOutsideRadius) {
      setInlineError(quoteErrorMessage || "Selected address is outside our 8km delivery radius.");
      return;
    }

    // Do NOT send deliveryCharge from frontend — backend recalculates and validates automatically
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
    };

    placeOrder.mutate(payload, {
      onSuccess: (order) => {
        if (order?.orderNumber) {
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
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">
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
                "p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-3",
                "bg-error-container text-on-error-container border border-error/30"
              )}
              role="alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Delivery Service Notice</p>
                <p>{inlineError || quoteErrorMessage}</p>
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

          {/* Delivery Address Section with Saved Address Book & Add Address Modal */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
              Delivery Address
            </h3>

            {/* Address Selector with Saved Addresses, Default badge, and Add New Address Modal */}
            <AddressSelector
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectSavedAddress}
            />

            {errors.fullAddress && !fullAddressValue && (
              <p className="text-error text-xs">{errors.fullAddress.message}</p>
            )}

            {/* Payment Method */}
            <div className="pt-3 border-t border-outline-variant/30">
              <p className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
                Payment Method
              </p>
              <div className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container text-sm sm:text-body-md font-medium text-on-surface flex items-center justify-between">
                <span>Cash on Delivery (COD)</span>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">
            Order Summary
          </h3>

          {isBuyNowFlow && buyNowItem && (
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">
                {buyNowItem.name} × {buyNowQuantity}
              </span>
              <span className="font-semibold text-on-surface">
                {formatPrice(buyNowItem.price * buyNowQuantity)}
              </span>
            </div>
          )}

          {!isBuyNowFlow &&
            cartQuery.data?.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-body-md">
                <span className="text-secondary">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold text-on-surface">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}

          <div className="border-t border-outline-variant/30 pt-4 space-y-2.5">
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium text-on-surface">{formatPrice(subtotal)}</span>
            </div>

            {/* Dynamic Delivery Charge with Live Calculating Status */}
            <div className="flex justify-between items-center text-xs sm:text-body-md">
              <span className="text-secondary">Delivery Charge</span>
              {isCalculatingDelivery ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Spinner className="w-3.5 h-3.5 text-primary" />
                  Calculating delivery...
                </span>
              ) : isOutsideRadius ? (
                <span className="text-xs text-error font-semibold">Outside 8km radius</span>
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
            className="w-full text-black font-bold py-6 rounded-xl cursor-pointer"
            disabled={
              placeOrder.isPending ||
              isCalculatingDelivery ||
              isOutsideRadius ||
              !selectedAddress
            }
          >
            {placeOrder.isPending ? (
              <Spinner className="w-5 h-5 text-black" />
            ) : isOutsideRadius ? (
              "Address Outside 8km Radius"
            ) : isCalculatingDelivery ? (
              "Calculating Delivery..."
            ) : (
              "Place Order"
            )}
          </Button>

          <p className="text-[11px] text-center text-secondary">
            By placing your order, you agree to our terms of service and delivery policy.
          </p>
        </div>
      </form>
    </div>
  );
}
