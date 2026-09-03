/**
 * Server-only Nominatim client.
 *
 * Everything Nominatim-specific lives here so that swapping in Ola Maps,
 * Mappls or Google later means editing exactly one file.
 *
 * NOTE ON PRODUCTION: the throttle and cache below are per-process. On a
 * serverless host (Vercel) each cold instance gets its own, so under real
 * traffic you will still exceed Nominatim's 1 req/sec policy. Before launch,
 * either self-host Nominatim or move to a commercial provider. This file is
 * built so that is a one-file change.
 */

export interface GeocodedLocation {
  /** Street + area + city, ready to prefill the "area" input. Never a house no. */
  areaLine: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

const BASE_URL =
  process.env.NOMINATIM_BASE_URL?.replace(/\/$/, "") ??
  "https://nominatim.openstreetmap.org";

// Nominatim's policy requires a User-Agent that identifies the app and a way to
// reach its operator. Set NOMINATIM_CONTACT in .env before deploying.
const CONTACT = process.env.NOMINATIM_CONTACT ?? "set-NOMINATIM_CONTACT-in-env";
const USER_AGENT = `BitesFoodDelivery/1.0 (${CONTACT})`;

const MIN_GAP_MS = 1100; // Nominatim allows 1 req/sec. 1.1s leaves headroom.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

type CacheEntry = { value: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

// A promise chain, not a timestamp check. Two concurrent requests that both
// read "last call was 2s ago" would otherwise both fire immediately; queueing
// them guarantees they are actually spaced out.
let queue: Promise<unknown> = Promise.resolve();

function readCache(key: string): unknown | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function writeCache(key: string, value: unknown) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // Map preserves insertion order, so the first key is the oldest.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Runs a Nominatim call through the shared queue + cache.
 *
 * Reverse only. Forward search was removed along with the picker's search box:
 * Nominatim has no usable colony/sector/phase coverage for Indian cities, so
 * the endpoint returned nothing useful while still consuming the 1 req/sec
 * budget that reverse geocoding actually needs.
 */
export async function callNominatim(
  endpoint: "reverse",
  params: Record<string, string>
): Promise<unknown> {
  const query = new URLSearchParams(params).toString();
  const cacheKey = `${endpoint}?${query}`;

  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;

  const run = async () => {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS));

    const response = await fetch(`${BASE_URL}/${endpoint}?${query}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 429 || response.status === 403) {
      throw new Error(
        "The address lookup service is rate-limiting us. Please type your address manually."
      );
    }
    if (!response.ok) {
      throw new Error(`Address lookup failed (${response.status}).`);
    }

    const json = await response.json();
    writeCache(cacheKey, json);
    return json;
  };

  // Chain onto the queue and keep the chain alive even if this call throws.
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Turns Nominatim's reverse payload into the shape the address form wants. */
export function normalizeReverseResult(
  raw: any,
  latitude: number,
  longitude: number
): GeocodedLocation {
  const addr = raw?.address ?? {};

  const street = addr.road || addr.pedestrian || addr.residential || "";
  const area =
    addr.neighbourhood || addr.suburb || addr.village || addr.hamlet || "";
  const city = addr.city || addr.town || addr.municipality || addr.county || "";
  const state = addr.state || "";

  // Deliberately excludes house_number. Nominatim's house numbers in India are
  // sparse and frequently belong to a neighbouring plot; a wrong number is more
  // damaging to a rider than a missing one, so we always ask the user instead.
  let areaLine = [street, area, city].filter(Boolean).join(", ");
  if (!areaLine && typeof raw?.display_name === "string") {
    areaLine = raw.display_name.split(",").slice(0, 4).join(",").trim();
  }

  return {
    areaLine,
    landmark: addr.amenity || addr.building || addr.shop || "",
    pincode: typeof addr.postcode === "string" ? addr.postcode.replace(/\s+/g, "") : "",
    city,
    state,
    latitude,
    longitude,
  };
}
