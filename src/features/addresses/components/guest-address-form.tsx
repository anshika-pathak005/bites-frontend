"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationStep } from "./location-step";
import type { PickedLocation, PinPrecision } from "../types/location";
import { composeFullAddress } from "../utils/address-composition";

/**
 * Fields this form contributes to the checkout payload. Guests get no saved
 * address book — they pin and type a fresh address each time, and it flows
 * straight onto the order. (Logging in is what persists an address.)
 *
 * The shape is unchanged so the checkout page consumes it exactly as before.
 */
export interface GuestAddressValue {
  fullAddress: string;
  landmark: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface GuestAddressFormProps {
  onChange: (value: GuestAddressValue) => void;
}

const BLANK: GuestAddressValue = {
  fullAddress: "",
  landmark: "",
  pincode: "",
  latitude: 0,
  longitude: 0,
};

export function GuestAddressForm({ onChange }: GuestAddressFormProps) {
  const [flatOrHouse, setFlatOrHouse] = useState("");
  const [buildingOrSociety, setBuildingOrSociety] = useState("");
  const [areaOrStreet, setAreaOrStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");

  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });
  const [precision, setPrecision] = useState<PinPrecision>("none");

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /**
   * Push up to checkout.
   *
   * Until the pin is confirmed we deliberately emit blanks rather than the
   * rough coordinate. That keeps checkout's own validation from passing on a
   * guess, and stops the delivery-fee quote being calculated against a location
   * that could be in the wrong city.
   */
  useEffect(() => {
    if (precision !== "exact") {
      onChangeRef.current(BLANK);
      return;
    }

    onChangeRef.current({
      fullAddress: composeFullAddress({ flatOrHouse, buildingOrSociety, areaOrStreet }),
      landmark: landmark.trim(),
      pincode: pincode.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }, [
    precision,
    flatOrHouse,
    buildingOrSociety,
    areaOrStreet,
    landmark,
    pincode,
    coords,
  ]);

  const handleLocationChange = useCallback((loc: PickedLocation) => {
    setPrecision(loc.precision);
    setCoords({ latitude: loc.latitude, longitude: loc.longitude });
    // Only fill fields the user hasn't touched, so moving the pin never
    // clobbers wording they've already corrected.
    setAreaOrStreet((prev) => prev || loc.areaLine);
    setPincode((prev) => prev || loc.pincode);
    setLandmark((prev) => prev || loc.landmark);
  }, []);

  /**
   * Guests get the same two-option flow as logged-in customers — the desktop
   * problem is identical whether or not there is an account behind it. The
   * only difference is that nothing here is persisted to an address book.
   */

  const labelClass = "block mb-1.5 text-sm font-semibold text-on-surface";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-on-surface leading-relaxed">
          <span className="font-semibold">Ordering as a guest.</span>{" "}
          <a href="/login" className="text-primary font-semibold underline underline-offset-2">
            Log in
          </a>{" "}
          to save this address and never type it again.
        </p>
      </div>

      <div>
        <label className={labelClass}>Your delivery location</label>
        <LocationStep autoLocateOnMount onChange={handleLocationChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Flat / House / Floor <span className="text-error">*</span>
          </label>
          <Input
            value={flatOrHouse}
            onChange={(e) => setFlatOrHouse(e.target.value)}
            placeholder="e.g. 402, 2nd Floor"
            className="text-sm"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass}>Building / Society (Optional)</label>
          <Input
            value={buildingOrSociety}
            onChange={(e) => setBuildingOrSociety(e.target.value)}
            placeholder="e.g. Shalimar Residency"
            className="text-sm"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Street / Area</label>
        <Input
          value={areaOrStreet}
          onChange={(e) => setAreaOrStreet(e.target.value)}
          placeholder="Auto-filled from your pin — edit if needed"
          className="text-sm"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Landmark (Optional)</label>
          <Input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near City Mall"
            className="text-sm"
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass}>Pincode</label>
          <Input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="e.g. 226010"
            className="text-sm"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
          />
        </div>
      </div>
    </div>
  );
}
