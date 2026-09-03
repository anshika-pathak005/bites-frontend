"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeftRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationConfirm } from "./location-confirm";
import { useReverseGeocode, EMPTY_ADDRESS } from "../hooks/use-reverse-geocode";
import {
  parseCoordinateInput,
  type CoordinateParseResult,
} from "../utils/coordinate-input";
import { encodeDigipin, isInDigipinBounds } from "@/lib/geo/digipin";
import { BLANK_LOCATION, type PickedLocation } from "../types/location";

/**
 * Desktop path: type a coordinate copied out of Google Maps, then confirm it
 * there. The confirm block itself is shared with the GPS path — see
 * LocationConfirm.
 */

interface CoordinateEntryProps {
  onChange: (value: PickedLocation) => void;
}

export function CoordinateEntry({ onChange }: CoordinateEntryProps) {
  const [raw, setRaw] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const parsed: CoordinateParseResult = useMemo(
    () => parseCoordinateInput(raw),
    [raw]
  );

  const latitude = parsed.ok ? parsed.latitude : null;
  const longitude = parsed.ok ? parsed.longitude : null;

  const { address, isResolving, error } = useReverseGeocode(latitude, longitude);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (latitude === null || longitude === null) {
      onChangeRef.current(BLANK_LOCATION);
      return;
    }

    const resolved = address ?? EMPTY_ADDRESS;
    onChangeRef.current({
      latitude,
      longitude,
      areaLine: resolved.areaLine,
      landmark: resolved.landmark,
      pincode: resolved.pincode,
      city: resolved.city,
      digipin: isInDigipinBounds(latitude, longitude)
        ? encodeDigipin(latitude, longitude)
        : null,
      precision: confirmed ? "exact" : "approx",
    });
  }, [latitude, longitude, address, confirmed]);

  const applySwap = useCallback(() => {
    if (parsed.ok || !parsed.suggestion) return;
    setRaw(parsed.suggestion.canonical);
  }, [parsed]);

  const showError = !parsed.ok && parsed.code !== "empty" && raw.trim().length > 0;

  return (
    <div className="space-y-3.5">
      {/* Instructions. Written for someone holding a phone in one hand. */}
      <ol className="space-y-2 rounded-xl border border-outline-variant/40 bg-surface-container/60 px-4 py-3.5 text-sm leading-relaxed text-on-surface-variant">
        <li className="font-semibold text-on-surface">
          How to get your coordinates
        </li>
        <li>1. Open the Google Maps app on your phone.</li>
        <li>2. Find your house on the map.</li>
        <li>3. Press and hold on it until a red pin drops.</li>
        <li>4. Copy the two numbers shown at the bottom, then type them below.</li>
        <li className="pt-0.5">
          They look like this:{" "}
          <span className="font-mono font-semibold text-on-surface">
            26.203060, 82.958871
          </span>
        </li>
      </ol>

      <div>
        <label
          className="mb-1.5 block text-sm font-semibold text-on-surface"
          htmlFor="coordinate-input"
        >
          Latitude &amp; longitude
        </label>
        <Input
          id="coordinate-input"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="26.203060, 82.958871"
          className="font-mono text-sm"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={showError}
        />

        {showError && (
          <div
            className="mt-2 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-container/40 px-4 py-3"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
            <div className="min-w-0 space-y-2">
              <p className="text-sm leading-relaxed text-on-error-container">
                {parsed.message}
              </p>
              {parsed.code === "swapped" && parsed.suggestion && (
                <button
                  type="button"
                  onClick={applySwap}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-variant"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                  Swap to {parsed.suggestion.canonical}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {parsed.ok && (
        <>
          <LocationConfirm
            latitude={parsed.latitude}
            longitude={parsed.longitude}
            areaLine={address?.areaLine ?? ""}
            isResolving={isResolving}
            onConfirmedChange={setConfirmed}
          />

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-sm leading-relaxed text-amber-100">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
