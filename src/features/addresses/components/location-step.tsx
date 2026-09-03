"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Crosshair,
  Loader2,
  LocateFixed,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoordinateEntry } from "./coordinate-entry";
import { LocationConfirm } from "./location-confirm";
import { useReverseGeocode, EMPTY_ADDRESS } from "../hooks/use-reverse-geocode";
import { encodeDigipin, isInDigipinBounds } from "@/lib/geo/digipin";
import { BLANK_LOCATION, type PickedLocation } from "../types/location";

/**
 * The single place that decides HOW the user gives us a location.
 *
 * Both address entry points — the saved-address modal (profile and logged-in
 * checkout) and the guest checkout form — render this, so the flow is identical
 * in both.
 *
 *   locating  ->  GPS is running
 *   located   ->  the fix was accurate enough to be worth showing. The user
 *                 still has to open it in Google Maps and confirm it.
 *   trouble   ->  the fix wasn't usable. Offer the two ways round it.
 *   coords    ->  user chose to type coordinates from Google Maps.
 *
 * There is deliberately no map of our own. It existed to let the user drag a
 * coarse fix onto their building, but on a desktop the fix lands in the wrong
 * city, and dragging fifteen kilometres across unlabelled satellite imagery is
 * not something anyone actually does.
 *
 * Note that "accurate enough" is not the same as "confirmed" — see
 * LocationConfirm for why the GPS path is gated the same way the typed path is.
 */

const ACCURACY_THRESHOLD_M = 150;

type Stage = "locating" | "located" | "trouble" | "coords";

interface LocationStepProps {
  initialLatitude?: number;
  initialLongitude?: number;
  autoLocateOnMount?: boolean;
  onChange: (value: PickedLocation) => void;
}

export function LocationStep({
  initialLatitude,
  initialLongitude,
  autoLocateOnMount = true,
  onChange,
}: LocationStepProps) {
  const hasInitial =
    typeof initialLatitude === "number" &&
    typeof initialLongitude === "number" &&
    (initialLatitude !== 0 || initialLongitude !== 0);

  const [stage, setStage] = useState<Stage>(
    hasInitial ? "located" : autoLocateOnMount ? "locating" : "trouble"
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    hasInitial ? { lat: initialLatitude!, lng: initialLongitude! } : null
  );
  // A saved address arrives already confirmed — see LocationConfirm.
  const [confirmed, setConfirmed] = useState(hasInitial);

  const isLocated = stage === "located" && coords !== null;

  const { address, isResolving, error } = useReverseGeocode(
    isLocated ? coords!.lat : null,
    isLocated ? coords!.lng : null
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /** Push the located coordinate upward. The coords stage reports itself. */
  useEffect(() => {
    if (!isLocated) return;

    const resolved = address ?? EMPTY_ADDRESS;
    onChangeRef.current({
      latitude: coords!.lat,
      longitude: coords!.lng,
      areaLine: resolved.areaLine,
      landmark: resolved.landmark,
      pincode: resolved.pincode,
      city: resolved.city,
      digipin: isInDigipinBounds(coords!.lat, coords!.lng)
        ? encodeDigipin(coords!.lat, coords!.lng)
        : null,
      precision: confirmed ? "exact" : "approx",
    });
  }, [isLocated, coords, address, confirmed]);

  const requestGps = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStage("trouble");
      return;
    }

    setStage("locating");
    setConfirmed(false);
    onChangeRef.current(BLANK_LOCATION);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Above the threshold the browser guessed from Wi-Fi or the ISP's IP
        // address, which on a laptop is routinely the wrong part of town. We
        // don't show the user the number — it isn't theirs to act on.
        if (
          accuracy > ACCURACY_THRESHOLD_M ||
          !isInDigipinBounds(latitude, longitude)
        ) {
          setCoords(null);
          setStage("trouble");
          return;
        }

        setCoords({ lat: latitude, lng: longitude });
        setStage("located");
      },
      () => {
        setCoords(null);
        setStage("trouble");
      },
      // maximumAge: 0 forces a fresh reading. A cached fix can be hours old and
      // from a completely different place.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!hasInitial && autoLocateOnMount) requestGps();
  }, [hasInitial, autoLocateOnMount, requestGps]);

  const goTo = useCallback((next: Stage) => {
    onChangeRef.current(BLANK_LOCATION);
    setCoords(null);
    setConfirmed(false);
    setStage(next);
  }, []);

  /* ---------------------------------------------------------------- */

  if (stage === "locating") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container/60 px-4 py-4">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
        <p className="text-sm text-on-surface sm:text-base">
          Finding your location…
        </p>
      </div>
    );
  }

  if (stage === "coords") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => goTo("trouble")}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <CoordinateEntry onChange={onChange} />
      </div>
    );
  }

  if (isLocated) {
    return (
      <div className="space-y-2.5">
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {hasInitial
            ? "This is the location saved on this address. Check it in Google Maps and confirm it's still right."
            : "We found this location. Check it in Google Maps and confirm it's your house."}
        </p>

        <LocationConfirm
          latitude={coords!.lat}
          longitude={coords!.lng}
          areaLine={address?.areaLine ?? ""}
          isResolving={isResolving}
          initiallyConfirmed={hasInitial}
          onConfirmedChange={setConfirmed}
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-sm leading-relaxed text-amber-100">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => goTo("trouble")}
          className="cursor-pointer text-sm font-medium text-on-surface-variant hover:text-on-surface hover:underline"
        >
          This isn&apos;t my location
        </button>
      </div>
    );
  }

  /* trouble */
  return (
    <div className="space-y-3 rounded-xl border border-outline-variant/40 bg-surface-container/60 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-on-surface sm:text-base">
          Trouble picking your address
        </p>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
          We couldn&apos;t work out exactly where you are. Laptops and desktops
          have no GPS, so they guess from your internet connection — often the
          wrong part of town. Pick one of these instead:
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3.5">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">
            Order from your phone
          </p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            Open this site on your phone and your location will be picked up
            accurately. Easiest option if your phone is nearby.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo("coords")}
        className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3.5 text-left transition-colors hover:bg-primary/20"
      >
        <Crosshair className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">
            Enter latitude &amp; longitude
          </p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            Copy the coordinates of your house from Google Maps and paste them
            here. You&apos;ll check them before anything is saved.
          </p>
        </div>
      </button>

      <Button
        type="button"
        variant="outline"
        onClick={requestGps}
        className="w-full cursor-pointer rounded-xl text-sm font-semibold"
      >
        <LocateFixed className="mr-2 h-4 w-4 text-primary" />
        Try my location again
      </Button>
    </div>
  );
}
