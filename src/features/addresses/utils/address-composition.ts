import { addressDedupKey, isInDigipinBounds } from "@/lib/geo/digipin";
import type { Address } from "@/types/address.types";

/**
 * The backend stores one free-text `fullAddress` string. The form collects the
 * parts separately (because a rider needs the flat number and a geocoder can
 * never supply it), then joins them here on the way out and splits them apart
 * on the way back in.
 *
 * Keeping this in one file means that when the backend eventually grows real
 * columns for these parts, only this file and the payload builder change.
 */

export interface AddressParts {
  flatOrHouse: string;
  buildingOrSociety: string;
  areaOrStreet: string;
}

export function composeFullAddress(parts: AddressParts): string {
  return [parts.flatOrHouse, parts.buildingOrSociety, parts.areaOrStreet]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

// "Flat 3B", "H.No 12", "Plot 7", "#402", "204" — anything that reads like a
// door identifier rather than a street name.
const HOUSE_LIKE = /^\s*(#|flat|flt|h\.?\s?no|house|plot|shop|door|unit|apt)\b|^\s*[#]?\d/i;

/**
 * Best-effort inverse of composeFullAddress, for editing addresses that were
 * saved before the form was split up.
 *
 * This is lossy by nature — one string cannot be reliably decomposed. When the
 * first segment doesn't look like a door number we leave `flatOrHouse` empty
 * rather than guessing, which makes the (required) field prompt the user to
 * supply the piece that was missing all along.
 */
export function splitStoredAddress(fullAddress: string): AddressParts {
  const segments = (fullAddress ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return { flatOrHouse: "", buildingOrSociety: "", areaOrStreet: "" };
  }

  if (HOUSE_LIKE.test(segments[0])) {
    return {
      flatOrHouse: segments[0],
      buildingOrSociety: "",
      areaOrStreet: segments.slice(1).join(", "),
    };
  }

  return {
    flatOrHouse: "",
    buildingOrSociety: "",
    areaOrStreet: segments.join(", "),
  };
}

/**
 * Finds an already-saved address that refers to the same doorstep.
 *
 * Matching on raw coordinates would never work: two GPS reads of the same gate
 * differ in the 5th decimal. addressDedupKey snaps the coordinate to a ~16m
 * DIGIPIN cell and pairs it with a normalised flat number, so "Flat 3-B" and
 * "flat #3b" at the same building collapse to one key while the flat upstairs
 * stays distinct.
 */
export function findDuplicateAddress(
  addresses: Address[],
  latitude: number,
  longitude: number,
  flatOrHouse: string,
  ignoreAddressId?: number
): Address | null {
  if (!isInDigipinBounds(latitude, longitude)) return null;

  const candidateKey = addressDedupKey(latitude, longitude, flatOrHouse);

  for (const existing of addresses) {
    if (ignoreAddressId !== undefined && existing.id === ignoreAddressId) continue;
    // Legacy rows can have null coordinates; there is nothing to compare.
    if (existing.latitude === null || existing.longitude === null) continue;
    if (!isInDigipinBounds(existing.latitude, existing.longitude)) continue;

    const existingKey = addressDedupKey(
      existing.latitude,
      existing.longitude,
      splitStoredAddress(existing.fullAddress).flatOrHouse
    );

    if (existingKey === candidateKey) return existing;
  }

  return null;
}
