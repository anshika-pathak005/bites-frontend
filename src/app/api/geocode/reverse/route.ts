import { NextResponse } from "next/server";
import {
  callNominatim,
  normalizeReverseResult,
  type GeocodedLocation,
} from "@/lib/geo/nominatim-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/geocode/reverse?lat=..&lon=..
 *
 * Why this route exists instead of the browser calling Nominatim directly:
 *
 *  1. Nominatim requires an identifying User-Agent. `fetch()` in a browser
 *     cannot set one, so direct client calls are policy-violating and get
 *     blocked in production.
 *  2. Their limit is 1 request/second. Serialising here is the only place we
 *     can actually enforce that.
 *  3. Responses are cached, so panning back over the same spot is free.
 *  4. When you move to a paid provider (Ola Maps / Mappls / Google), only this
 *     file changes — no API key ever reaches the browser.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { ok: false, message: "lat and lon must be valid numbers." },
      { status: 400 }
    );
  }

  try {
    // zoom=18 asks for building-level detail. In parts of India OSM has no
    // building data at all, in which case Nominatim gracefully falls back to
    // the nearest street/suburb — which is still what we want to show.
    const raw = await callNominatim("reverse", {
      lat: lat.toFixed(6),
      lon: lon.toFixed(6),
      format: "jsonv2",
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });

    const result: GeocodedLocation = normalizeReverseResult(raw, lat, lon);
    return NextResponse.json(
      { ok: true, data: result },
      // Let the CDN/browser reuse this too — coordinates never change meaning.
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reverse geocoding failed.";
    // 502, not 500: the failure is upstream, and the client uses this to show
    // "couldn't read the address, type it manually" rather than dying silently.
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
