"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useMenuItem } from "@/features/menu/hooks/use-menu-item";
import { useDeliveryAreas } from "@/features/checkout/hooks/use-delivery-areas";
import { usePlaceOrder } from "@/features/checkout/hooks/use-checkout";

// Validated client-side before we even attempt the API call — the backend
// re-validates everything again regardless, this is just for fast feedback.
const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Enter a valid phone number"),
  deliveryAreaId: z.string().min(1, "Select a delivery area"),
  fullAddress: z.string().min(5, "Enter your full delivery address"),
  landmark: z.string().optional(),
});
type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Next.js requires useSearchParams() to sit inside a Suspense boundary — the
// actual page content lives in CheckoutPageContent below, and this default
// export just supplies that boundary around it.
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

// Actual checkout form + order summary; handles both the Cart Flow and Buy Now Flow.
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Buy Now Flow arrives via query params from the item detail page. If
  // neither is present, this is a Cart Flow checkout instead.
  const buyNowItemId = searchParams.get("buyNowItemId");
  const buyNowQuantity = Number(searchParams.get("quantity") ?? "1");
  const isBuyNowFlow = !!buyNowItemId;

  const { cartQuery, sessionId } = useCart();
  const { data: buyNowItem, isLoading: isLoadingBuyNowItem } = useMenuItem(buyNowItemId ?? "");
  const { data: deliveryAreas, isLoading: isLoadingAreas } = useDeliveryAreas();
  const placeOrder = usePlaceOrder();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });

  // Watch the selected area so the delivery charge/total below stay in sync live
  const selectedAreaId = watch("deliveryAreaId");
  const selectedArea = deliveryAreas?.find((a) => a.id === selectedAreaId);

  // Work out what's actually being charged, regardless of which flow this is.
  const subtotal = isBuyNowFlow
    ? (buyNowItem?.price ?? 0) * buyNowQuantity
    : cartQuery.data?.subtotal ?? 0;
  const deliveryCharge = selectedArea?.deliveryCharge ?? 0;
  const grandTotal = subtotal + deliveryCharge;

  const isLoadingSummary = isBuyNowFlow ? isLoadingBuyNowItem : cartQuery.isLoading;
  const hasNothingToOrder = isBuyNowFlow ? !buyNowItem : (cartQuery.data?.items.length ?? 0) === 0;

  // Submit handler — builds the correct payload shape for whichever flow is active
  function onSubmit(values: CheckoutFormValues) {
    placeOrder.mutate(
      {
        delivery: {
          name: values.name,
          phone: values.phone,
          deliveryAreaId: values.deliveryAreaId,
          fullAddress: values.fullAddress,
          landmark: values.landmark,
        },
        paymentMethod: "COD",
        cartSessionId: isBuyNowFlow ? undefined : sessionId,
        buyNow: isBuyNowFlow ? { menuItemId: buyNowItemId!, quantity: buyNowQuantity } : undefined,
      },
      {
        onSuccess: (order) => {
          if (order) {
            router.push(`/order-success?orderNumber=${order.orderNumber}`);
          }
        },
        onError: () => {
          toast.error("Could not place your order. Please check your details and try again.");
        },
      }
    );
  }

  // Block rendering while cart/item/delivery-area data is still loading
  if (isLoadingSummary) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Nothing to check out (empty cart, or invalid/missing buy-now item)
  if (hasNothingToOrder) {
    return <p className="text-center text-secondary py-24">There&apos;s nothing to check out yet — add something from the menu first.</p>;
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md sm:py-stack-lg">
      <div className="mb-stack-md sm:mb-stack-lg">
        <span className="text-primary font-label-md text-label-sm sm:text-label-md tracking-widest uppercase block mb-1">FINAL STEP</span>
        <h1 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        {/* Delivery details */}
        <div className="lg:col-span-2 space-y-5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">Delivery Details</h3>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Full Name</label>
            <Input {...register("name")} placeholder="Your name" />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Phone Number</label>
            <Input {...register("phone")} placeholder="e.g. 9876543210" />
            {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Delivery Area</label>
            <select
              {...register("deliveryAreaId")}
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm sm:text-body-md outline-none focus:border-primary focus:border-2"
              disabled={isLoadingAreas}
            >
              <option value="">Select your area</option>
              {deliveryAreas?.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} — {formatPrice(area.deliveryCharge)}
                </option>
              ))}
            </select>
            {errors.deliveryAreaId && <p className="text-error text-xs mt-1">{errors.deliveryAreaId.message}</p>}
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Full Address</label>
            <Input {...register("fullAddress")} placeholder="House / street / area" />
            {errors.fullAddress && <p className="text-error text-xs mt-1">{errors.fullAddress.message}</p>}
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Landmark (optional)</label>
            <Input {...register("landmark")} placeholder="e.g. next to the blue gate" />
          </div>

          <div className="pt-2">
            <p className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">Payment Method</p>
            <div className="px-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-container text-sm sm:text-body-md font-medium text-on-surface">
              Cash on Delivery
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-3">Order Summary</h3>

          {isBuyNowFlow && buyNowItem && (
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">{buyNowItem.name} × {buyNowQuantity}</span>
              <span className="font-semibold text-on-surface">{formatPrice(buyNowItem.price * buyNowQuantity)}</span>
            </div>
          )}
          {!isBuyNowFlow &&
            cartQuery.data?.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-body-md">
                <span className="text-secondary">{item.name} × {item.quantity}</span>
                <span className="font-semibold text-on-surface">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}

          <div className="border-t border-outline-variant/30 pt-4 space-y-2">
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium text-on-surface">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-body-md">
              <span className="text-secondary">Delivery Charge</span>
              <span className="font-medium text-on-surface">{selectedArea ? formatPrice(deliveryCharge) : "Select area"}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/30">
              <span className="font-headline-md text-headline-md text-on-surface">Total</span>
              <span className="font-headline-lg text-headline-lg text-primary font-bold">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-white font-semibold py-6 rounded-xl" disabled={placeOrder.isPending}>
            {placeOrder.isPending ? <Spinner className="w-5 h-5 text-white" /> : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
