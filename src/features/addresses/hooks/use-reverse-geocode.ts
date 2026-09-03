"use client";

import { useEffect, useRef, useState } from "react";
import { reverseGeocode, GeocodingError } from "../utils/geocoding";

/**
 * Coordinates -> street / area / pincode.
 *
 * Shared by the GPS result card and the coordinate entry form so both prefill
 * the address fields identically. Debounced and abortable, because the
 * coordinate form calls this while the user is still typing.
 *
 * A failed lookup is NOT treated as a failed location. The coordinate is what
 * actually gets the rider to the door; the text is a convenience. On failure we
 * return empty fields plus a message, and the user types the street themselves.
 */

export interface ResolvedAddress {
  areaLine: string;
  landmark: string;
  pincode: string;
  city: string;
}

export const EMPTY_ADDRESS: ResolvedAddress = {
  areaLine: "",
  landmark: "",
  pincode: "",
  city: "",
};

const DEBOUNCE_MS = 400;

export function useReverseGeocode(
  latitude: number | null,
  longitude: number | null
) {
  const [address, setAddress] = useState<ResolvedAddress | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Depend on the formatted pair, not the raw numbers, so an unchanged
  // coordinate arriving as a new object identity doesn't refire the lookup.
  const key =
    latitude === null || longitude === null
      ? null
      : `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (!key) {
      setAddress(null);
      setError(null);
      setIsResolving(false);
      return;
    }

    const [lat, lon] = key.split(",").map(Number);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsResolving(true);
      setError(null);

      try {
        const geo = await reverseGeocode(lat, lon, controller.signal);
        setAddress({
          areaLine: geo.areaLine,
          landmark: geo.landmark,
          pincode: geo.pincode,
          city: geo.city,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setAddress(EMPTY_ADDRESS);
        setError(
          err instanceof GeocodingError
            ? `${err.message} Your location is still fine — just type the street and area below.`
            : "Couldn't look up this address. Your location is still fine — type the street and area below."
        );
      } finally {
        if (!controller.signal.aborted) setIsResolving(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { address, isResolving, error };
}
