/**
 * These two types mirror the backend contract exactly. Nothing here is
 * aspirational — every field below exists on the Java side today:
 *
 *   Address        <- CustomerAddressResponse
 *   AddressPayload -> CustomerAddressRequest
 *
 * Fields the backend neither accepts nor returns are deliberately absent:
 *
 *  - `digipin` used to be declared on both. The backend has no such column, so
 *    sending it did nothing and reading it always gave undefined. DIGIPIN is
 *    still computed in the browser for duplicate detection (lib/geo/digipin.ts);
 *    it just isn't part of the wire format. When the backend grows the column,
 *    add it to BOTH types and to the payload builder at the same time.
 *  - `createdAt` / `updatedAt` were declared but CustomerAddressResponse does
 *    not include them, so they were always undefined.
 */

export interface Address {
  /** Java Long -> JSON number. Not a string. */
  id: number;
  /** "Home", "Work", "Other". Optional on the backend, so it can come back null. */
  label: string | null;
  fullAddress: string;
  landmark: string | null;
  pincode: string | null;
  /** Null only on legacy rows saved before coordinates were required. */
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface AddressPayload {
  label: string;
  fullAddress: string;
  landmark?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}
