"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Navigation, RotateCcw } from "lucide-react";
import axios from "axios";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAddresses } from "../hooks/use-addresses";
import type { Address, AddressPayload } from "@/types/address.types";

const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. Home, Work)"),
  fullAddress: z.string().min(5, "Please enter your full address"),
  landmark: z.string().optional(),
  pincode: z.string().min(4, "Please enter a valid pincode"),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const LABEL_SUGGESTIONS = ["Home", "Work", "Other"];

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Address | null;
  onSaved?: (address: Address) => void;
}

export function AddressFormModal({
  open,
  onClose,
  initialData,
  onSaved,
}: AddressFormModalProps) {
  const { createMutation, updateMutation } = useAddresses();
  const isEditing = !!initialData;

  // GPS coordinate state maintained purely in form/component state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [hasValidCoordinates, setHasValidCoordinates] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: "Home",
      fullAddress: "",
      landmark: "",
      pincode: "",
      latitude: 0,
      longitude: 0,
      isDefault: false,
    },
  });

  const activeLabel = watch("label");
  const currentLat = watch("latitude");
  const currentLon = watch("longitude");

  // Requests GPS coordinates seamlessly without auto-filling street text
  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Browser geolocation is not supported on this device.");
      setHasValidCoordinates(false);
      return;
    }

    setGpsError(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue("latitude", latitude, { shouldValidate: true });
        setValue("longitude", longitude, { shouldValidate: true });
        setHasValidCoordinates(true);
        setIsLocating(false);
        setGpsError(null);
      },
      (error) => {
        setIsLocating(false);
        setHasValidCoordinates(false);
        setValue("latitude", 0);
        setValue("longitude", 0);

        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            "Location access is required to verify delivery availability in our 8km service area. Please allow browser location access to add this address."
          );
        } else {
          setGpsError(
            "Could not determine your location. Please ensure location services are enabled and try again."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }, [setValue]);

  // Modal open / reset lifecycle
  useEffect(() => {
    if (open) {
      setInlineError(null);
      if (initialData) {
        // Editing existing address: already has valid coordinates
        reset({
          label: initialData.label,
          fullAddress: initialData.fullAddress,
          landmark: initialData.landmark || "",
          pincode: initialData.pincode,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          isDefault: initialData.isDefault,
        });
        setHasValidCoordinates(
          typeof initialData.latitude === "number" &&
            typeof initialData.longitude === "number" &&
            (initialData.latitude !== 0 || initialData.longitude !== 0)
        );
        setGpsError(null);
        setIsLocating(false);
      } else {
        // Adding new address: seamlessly request GPS coordinates on modal open
        reset({
          label: "Home",
          fullAddress: "",
          landmark: "",
          pincode: "",
          latitude: 0,
          longitude: 0,
          isDefault: false,
        });
        setHasValidCoordinates(false);
        requestLocation();
      }
    }
  }, [open, initialData, reset, requestLocation]);

  async function onSubmit(values: AddressFormValues) {
    setInlineError(null);

    // Require valid GPS coordinates
    const lat = values.latitude;
    const lon = values.longitude;

    if (!lat || !lon || (lat === 0 && lon === 0)) {
      setGpsError(
        "Location access is required to verify delivery availability in our 8km service area. Please allow location access to continue."
      );
      return;
    }

    const payload: AddressPayload = {
      label: values.label.trim(),
      fullAddress: values.fullAddress.trim(),
      landmark: values.landmark?.trim() || undefined,
      pincode: values.pincode.trim(),
      latitude: lat,
      longitude: lon,
      isDefault: values.isDefault,
    };

    try {
      if (initialData) {
        const updated = await updateMutation.mutateAsync({
          id: initialData.id,
          payload,
        });
        onSaved?.(updated);
      } else {
        const created = await createMutation.mutateAsync(payload);
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const msg =
          errorData?.message ||
          errorData?.error?.message ||
          (typeof errorData === "string" ? errorData : null) ||
          "Could not save address. Please check your details.";

        setInlineError(msg);
      } else if (err instanceof Error) {
        setInlineError(err.message);
      } else {
        setInlineError("An unexpected error occurred while saving the address.");
      }
    }
  }

  const isSaving =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  const canSubmit = hasValidCoordinates && !isLocating && !isSaving;

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Seamless Location Status Indicator */}
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200",
            isLocating
              ? "bg-surface-container/70 border-outline-variant/40 text-on-surface"
              : hasValidCoordinates
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-error-container/60 border-error/30 text-on-error-container"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {isLocating ? (
                <Spinner className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : hasValidCoordinates ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">
                  {isLocating
                    ? "Verifying delivery area location..."
                    : hasValidCoordinates
                    ? "Delivery area location verified"
                    : "Location permission required"}
                </p>
                <p className="text-[11px] sm:text-xs opacity-90 leading-relaxed">
                  {isLocating
                    ? "Requesting device GPS coordinates to ensure you're within our delivery service area."
                    : hasValidCoordinates
                    ? "Coordinates captured. Enter your address details below to save."
                    : gpsError ||
                      "Location access is required to verify delivery availability in our 8km service area."}
                </p>
              </div>
            </div>

            {!isLocating && !hasValidCoordinates && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={requestLocation}
                className="shrink-0 rounded-full text-xs font-semibold gap-1 self-start cursor-pointer hover:bg-surface-container"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Backend Inline Error Alert (e.g. 400 "outside our 8km delivery radius") */}
        {inlineError && (
          <div
            className={cn(
              "p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5",
              inlineError.toLowerCase().includes("radius") ||
                inlineError.toLowerCase().includes("outside") ||
                inlineError.toLowerCase().includes("8km")
                ? "bg-error-container text-on-error-container border border-error/30"
                : "bg-error-container/70 text-on-error-container"
            )}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Delivery Notice</p>
              <p>{inlineError}</p>
            </div>
          </div>
        )}

        {/* Address Label Suggestions & Input */}
        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
            Address Label
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {LABEL_SUGGESTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setValue("label", label, { shouldValidate: true })}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                  activeLabel === label
                    ? "bg-primary text-black font-bold border-primary shadow-xs"
                    : "bg-surface-container-high text-on-surface border-outline-variant/40 hover:bg-surface-variant"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Input
            {...register("label")}
            placeholder="Custom label (e.g. Apartment, Vacation Home)"
            className="text-sm"
          />
          {errors.label && (
            <p className="text-error text-xs mt-1">{errors.label.message}</p>
          )}
        </div>

        {/* Full Street Address (Manually Entered) */}
        <div>
          <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
            Full Street Address
          </label>
          <Input
            {...register("fullAddress")}
            placeholder="House / Flat / Street / Area"
            className="text-sm"
          />
          {errors.fullAddress && (
            <p className="text-error text-xs mt-1">
              {errors.fullAddress.message}
            </p>
          )}
        </div>

        {/* Landmark & Pincode (Manually Entered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
              Landmark (Optional)
            </label>
            <Input
              {...register("landmark")}
              placeholder="e.g. Near City Mall"
              className="text-sm"
            />
          </div>

          <div>
            <label className="font-label-md text-xs sm:text-label-sm block mb-1.5 font-semibold text-on-surface">
              Pincode / Postal Code
            </label>
            <Input
              {...register("pincode")}
              placeholder="e.g. 560001"
              className="text-sm"
            />
            {errors.pincode && (
              <p className="text-error text-xs mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
        </div>

        {/* Set as Default Address Checkbox */}
        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
          />
          <span className="text-xs sm:text-sm text-on-surface font-medium">
            Set as default delivery address
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl text-xs sm:text-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-xl text-black font-bold text-xs sm:text-sm px-6 cursor-pointer",
              !canSubmit && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {isSaving ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                <span>Saving...</span>
              </>
            ) : isLocating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                <span>Verifying Location...</span>
              </>
            ) : (
              <span>{isEditing ? "Update Address" : "Save Address"}</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
