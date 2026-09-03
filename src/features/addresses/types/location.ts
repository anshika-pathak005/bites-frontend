/**
 * The shape every location input emits, and how much we trust it.
 *
 * This lives in its own file because two very different components produce it —
 * the map picker (GPS + drag, used on phones) and the coordinate entry form
 * (paste + verify, used on desktop). Neither should have to import the other.
 */

/**
 *  exact  — the user deliberately confirmed this spot: they dragged the map to
 *           it, or they opened it in Google Maps and confirmed it was their
 *           home. This is the ONLY value that may be saved.
 *  approx — we have a coordinate but nobody has confirmed it: a coarse GPS fix,
 *           or coordinates typed in but not yet verified. Good enough to
 *           reverse-geocode and prefill the form with, never good enough to save.
 *  none   — nothing chosen yet.
 */
export type PinPrecision = "none" | "approx" | "exact";

export interface PickedLocation {
  latitude: number;
  longitude: number;
  /** Street + area + city from reverse geocoding. Never a house/flat number. */
  areaLine: string;
  landmark: string;
  pincode: string;
  city: string;
  /** India Post grid code for this spot — stable identity across GPS jitter. */
  digipin: string | null;
  precision: PinPrecision;
}

export const BLANK_LOCATION: PickedLocation = {
  latitude: 0,
  longitude: 0,
  areaLine: "",
  landmark: "",
  pincode: "",
  city: "",
  digipin: null,
  precision: "none",
};
