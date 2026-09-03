"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Info, MapPin } from "lucide-react";
import axios from "axios";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAddresses } from "../hooks/use-addresses";
import { LocationStep } from "./location-step";
import type { PickedLocation, PinPrecision } from "../types/location";
import {
  composeFullAddress,
  splitStoredAddress,
  findDuplicateAddress,
} from "../utils/address-composition";
import type { Address, AddressPayload } from "@/types/address.types";

const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. Home, Work)"),
  // Required on purpose. Reverse geocoding cannot supply a door number, and an
  // address without one sends the rider to the right gali and the wrong gate.
  flatOrHouse: z.string().min(1, "Flat / house number is required"),
  buildingOrSociety: z.string().optional(),
  areaOrStreet: z.string().min(3, "Please enter the street or area"),
  landmark: z.string().optional(),
  // Optional on the backend (CustomerAddressRequest), and reverse geocoding
  // genuinely fails to return one in parts of India. Empty is allowed; a
  // half-typed one is not.
  pincode: z
    .string()
    .regex(/^\d{6}$/, "A pincode must be 6 digits")
    .or(z.literal("")),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const LABEL_SUGGESTIONS = ["Home", "Work", "Other"];

const EMPTY_FORM: AddressFormValues = {
  label: "Home",
  flatOrHouse: "",
  buildingOrSociety: "",
  areaOrStreet: "",
  landmark: "",
  pincode: "",
  latitude: 0,
  longitude: 0,
  isDefault: false,
};

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
  const { addressesQuery, createMutation, updateMutation } = useAddresses();
  const isEditing = !!initialData;
  const savedAddresses = useMemo(
    () => addressesQuery.data ?? [],
    [addressesQuery.data]
  );

  const [precision, setPrecision] = useState<PinPrecision>("none");
  const [digipin, setDigipin] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  // Leaflet holds a live map instance, so the picker gets a fresh key each time
  // the modal opens rather than being reused across a stale container.
  const [mapKey, setMapKey] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const activeLabel = watch("label");
  const flatValue = watch("flatOrHouse");
  const latValue = watch("latitude");
  const lngValue = watch("longitude");

  /**
   * The picker owns the coordinate. Text it resolves is treated as a *default*
   * for the area line, never an override — dragging the pin after the user has
   * reworded their street shouldn't wipe what they typed.
   */
  const handleLocationChange = useCallback(
    (loc: PickedLocation) => {
      setValue("latitude", loc.latitude, { shouldValidate: true });
      setValue("longitude", loc.longitude, { shouldValidate: true });
      setPrecision(loc.precision);
      setDigipin(loc.digipin);

      if (loc.areaLine && !getValues("areaOrStreet")) {
        setValue("areaOrStreet", loc.areaLine, { shouldValidate: true });
      }
      if (loc.pincode && !getValues("pincode")) {
        setValue("pincode", loc.pincode, { shouldValidate: true });
      }
      if (loc.landmark && !getValues("landmark")) {
        setValue("landmark", loc.landmark);
      }
      setInlineError(null);
    },
    [setValue, getValues]
  );

  // Open / reset lifecycle
  useEffect(() => {
    if (!open) return;

    setInlineError(null);
    setMapKey((k) => k + 1);

    if (initialData) {
      const parts = splitStoredAddress(initialData.fullAddress);
      reset({
        label: initialData.label ?? "Home",
        flatOrHouse: parts.flatOrHouse,
        buildingOrSociety: parts.buildingOrSociety,
        areaOrStreet: parts.areaOrStreet,
        landmark: initialData.landmark ?? "",
        pincode: initialData.pincode ?? "",
        latitude: initialData.latitude ?? 0,
        longitude: initialData.longitude ?? 0,
        isDefault: initialData.isDefault,
      });
      // An already-saved address was confirmed when it was created.
      setPrecision(
        initialData.latitude !== null && initialData.longitude !== null
          ? "exact"
          : "none"
      );
    } else {
      reset(EMPTY_FORM);
      setPrecision("none");
      setDigipin(null);
    }
  }, [open, initialData, reset]);

  // Live duplicate warning, so the user finds out before hitting Save.
  const duplicate = useMemo(() => {
    if (precision !== "exact" || !flatValue?.trim()) return null;
    if (!latValue && !lngValue) return null;
    return findDuplicateAddress(
      savedAddresses,
      latValue,
      lngValue,
      flatValue,
      initialData?.id
    );
  }, [precision, flatValue, latValue, lngValue, savedAddresses, initialData?.id]);

  async function onSubmit(values: AddressFormValues) {
    setInlineError(null);

    if (!values.latitude && !values.longitude) {
      setInlineError("Please pin your location on the map first.");
      return;
    }

    if (precision !== "exact") {
      setInlineError(
        "Please confirm your location first, then save."
      );
      return;
    }

    if (duplicate) {
      setInlineError(
        `You've already saved this exact spot as "${duplicate.label}". Edit that one instead, or change the flat number.`
      );
      return;
    }

    // The backend still takes a single fullAddress string, so the parts are
    // joined back together here. Nothing about the API contract changes.
    const payload: AddressPayload = {
      label: values.label.trim(),
      fullAddress: composeFullAddress({
        flatOrHouse: values.flatOrHouse,
        buildingOrSociety: values.buildingOrSociety ?? "",
        areaOrStreet: values.areaOrStreet,
      }),
      landmark: values.landmark?.trim() || undefined,
      pincode: values.pincode.trim() || undefined,
      latitude: values.latitude,
      longitude: values.longitude,
      isDefault: values.isDefault,
    };

    try {
      const saved = initialData
        ? await updateMutation.mutateAsync({ id: initialData.id, payload })
        : await createMutation.mutateAsync(payload);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        setInlineError(
          data?.message ||
            data?.error?.message ||
            (typeof data === "string" ? data : null) ||
            "Could not save address. Please check your details."
        );
      } else if (err instanceof Error) {
        setInlineError(err.message);
      } else {
        setInlineError("An unexpected error occurred while saving the address.");
      }
    }
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending;

  /**
   * Deliberately NOT wired to the button's `disabled` attribute.
   *
   * A disabled button swallows the click and explains nothing — the user is
   * left staring at a greyed-out control with no idea what is missing. Instead
   * the button stays clickable and looks inactive, and onSubmit turns the
   * click into a specific sentence about what to do next. Only a save already
   * in flight actually disables it.
   */
  const isBlocked = precision !== "exact" || !!duplicate;

  const labelClass = "block mb-1.5 text-sm font-semibold text-on-surface";

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>Your delivery location</label>
          <LocationStep
            key={mapKey}
            autoLocateOnMount={!initialData}
            initialLatitude={initialData?.latitude ?? undefined}
            initialLongitude={initialData?.longitude ?? undefined}
            onChange={handleLocationChange}
          />
        </div>

        {duplicate && (
          <div
            className="p-3.5 rounded-xl text-sm flex items-start gap-2.5 bg-amber-950/50 border border-amber-500/30 text-amber-100"
            role="alert"
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Already saved</p>
              <p className="leading-relaxed">
                This doorstep is saved as &quot;{duplicate.label}&quot;. Change the
                flat number or pick a different spot to add a new one.
              </p>
            </div>
          </div>
        )}

        {inlineError && (
          <div
            className="p-3.5 rounded-xl text-sm font-medium flex items-start gap-2.5 bg-error-container text-on-error-container border border-error/30"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Delivery Notice</p>
              <p>{inlineError}</p>
            </div>
          </div>
        )}

        {/* Label */}
        <div>
          <label className={labelClass}>Address Label</label>
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
            placeholder="Custom label (e.g. Apartment, PG)"
            className="text-sm"
          />
          {errors.label && <p className="text-error text-sm mt-1">{errors.label.message}</p>}
        </div>

        {/* Door details — the part no map can ever fill in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              Flat / House / Floor <span className="text-error">*</span>
            </label>
            <Input
              {...register("flatOrHouse")}
              placeholder="e.g. 402, 2nd Floor"
              className="text-sm"
              autoComplete="off"
            />
            {errors.flatOrHouse && (
              <p className="text-error text-sm mt-1">{errors.flatOrHouse.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Building / Society (Optional)</label>
            <Input
              {...register("buildingOrSociety")}
              placeholder="e.g. Shalimar Residency"
              className="text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Street / Area</label>
          <Input
            {...register("areaOrStreet")}
            placeholder="Auto-filled from your pin — edit if needed"
            className="text-sm"
            autoComplete="off"
          />
          {errors.areaOrStreet && (
            <p className="text-error text-sm mt-1">{errors.areaOrStreet.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Landmark (Optional)</label>
            <Input
              {...register("landmark")}
              placeholder="e.g. Near City Mall"
              className="text-sm"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelClass}>Pincode</label>
            <Input
              {...register("pincode")}
              placeholder="e.g. 226010"
              className="text-sm"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
            />
            {errors.pincode && (
              <p className="text-error text-sm mt-1">{errors.pincode.message}</p>
            )}
          </div>
        </div>

        {digipin && precision === "exact" && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              DIGIPIN <span className="font-mono font-semibold text-on-surface">{digipin}</span>{" "}
              — India Post&apos;s 4m grid code for this pin.
            </span>
          </div>
        )}

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isDefault")}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
          />
          <span className="text-sm text-on-surface font-medium">
            Set as default delivery address
          </span>
        </label>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl text-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            aria-disabled={isBlocked}
            className={cn(
              "rounded-xl text-black font-bold text-sm px-6 cursor-pointer",
              isBlocked && "opacity-50"
            )}
          >
            {isSaving ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                <span>Saving...</span>
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
