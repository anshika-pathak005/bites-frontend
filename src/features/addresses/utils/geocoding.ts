/**
 * Client-side geocoding.
 *
 * These functions talk to OUR OWN /api/geocode/* routes, never to Nominatim
 * directly. See src/lib/geo/nominatim-server.ts for why.
 */

export interface GeocodedLocation {
  /** Street + area + city. Never contains a house/flat number — we ask for that. */
  areaLine: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export class GeocodingError extends Error {}

const EMPTY: Omit<GeocodedLocation, "latitude" | "longitude"> = {
  areaLine: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
};

/**
 * Coordinates -> address text.
 *
 * Throws GeocodingError on failure instead of returning empty strings. The old
 * version swallowed errors, which made a rate-limited lookup look identical to
 * "this place genuinely has no address" — the user saw an empty confirmation
 * line and no explanation. The picker now catches this and says so.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<GeocodedLocation> {
  const res = await fetch(
    `/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,
    { signal }
  );

  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.ok) {
    throw new GeocodingError(
      body?.message || "Couldn't read the address for this pin."
    );
  }

  return { ...EMPTY, ...body.data, latitude, longitude };
}
