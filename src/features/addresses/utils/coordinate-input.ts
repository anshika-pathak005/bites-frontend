/**
 * Turns whatever the user pasted into a lat/lng pair — or into a specific,
 * actionable error.
 *
 * Deliberately pure and network-free. Everything here is string work on text
 * the user already has in their clipboard. We do NOT resolve short links, and
 * we do NOT scrape Google's HTML: both need a server round trip, both break
 * from datacenter IPs, and both were rejected in the decision doc.
 *
 * The formats below are not hypothetical — they are what Google Maps actually
 * puts on the clipboard depending on how the user got there.
 */

import { isInDigipinBounds } from "@/lib/geo/digipin";

export type CoordinateParseFailure =
  /** Nothing typed yet. Not shown as an error until they try to continue. */
  | "empty"
  /** maps.app.goo.gl / goo.gl/maps — needs a server to resolve. We don't. */
  | "short_link"
  /** A /maps/place/ or @lat,lng URL: that pair is the camera, not the pin. */
  | "camera_url"
  /** Text present, but no coordinate pair could be found in it. */
  | "unparseable"
  | "lat_out_of_range"
  | "lng_out_of_range"
  /** Valid numbers, but longitude was typed where latitude goes. Fixable. */
  | "swapped"
  /** Parsed fine, but the point is not in India. */
  | "outside_india";

export interface CoordinateParseOk {
  ok: true;
  latitude: number;
  longitude: number;
  /**
   * The pair re-joined in canonical "lat,lng" form, at the precision the user
   * typed. Used for the Google Maps verify link so what they see is what they
   * pasted — Number() round-tripping would turn 26.0765030 into 26.20306.
   */
  canonical: string;
}

export interface CoordinateParseError {
  ok: false;
  code: CoordinateParseFailure;
  message: string;
  /** For "swapped" only: the corrected pair, so the UI can offer one-tap fix. */
  suggestion?: { latitude: number; longitude: number; canonical: string };
}

export type CoordinateParseResult = CoordinateParseOk | CoordinateParseError;

/* ------------------------------------------------------------------ */
/* Angle parsing                                                       */
/* ------------------------------------------------------------------ */

/**
 * Matches one angle in any of the forms Google produces:
 *   26.0765030          plain decimal
 *   -26.0765030         signed decimal
 *   26.0765030°N        decimal with hemisphere
 *   26°12'11.0"N       degrees / minutes / seconds
 *
 * The minute and second groups are optional, which is what lets one regex
 * cover both the decimal and the DMS case.
 */
const ANGLE =
  /(-?\d+(?:\.\d+)?)\s*(?:°|d(?![a-z]))?\s*(?:(\d+(?:\.\d+)?)\s*(?:'|′|’)\s*(?:(\d+(?:\.\d+)?)\s*(?:"|″|''|”)?\s*)?)?\s*([NSEW])?/gi;

interface Angle {
  value: number;
  /** Present only when the text carried an explicit N/S/E/W. */
  hemisphere?: "N" | "S" | "E" | "W";
}

function toDecimal(
  degrees: number,
  minutes: string | undefined,
  seconds: string | undefined,
  hemisphere: string | undefined,
): Angle {
  const sign = degrees < 0 ? -1 : 1;
  let value =
    Math.abs(degrees) +
    (minutes ? Number(minutes) / 60 : 0) +
    (seconds ? Number(seconds) / 3600 : 0);
  value *= sign;

  const h = hemisphere?.toUpperCase() as Angle["hemisphere"];
  // S and W are negative. A pasted "-26.2 S" is contradictory; treat the letter
  // as authoritative since it is the thing the user could actually read.
  if (h === "S" || h === "W") value = -Math.abs(value);
  if (h === "N" || h === "E") value = Math.abs(value);

  return h ? { value, hemisphere: h } : { value };
}

function extractAngles(text: string): Angle[] {
  const found: Angle[] = [];
  for (const m of text.matchAll(ANGLE)) {
    // The optional groups make a zero-length match possible; skip those.
    if (!m[1]) continue;
    found.push(toDecimal(Number(m[1]), m[2], m[3], m[4]));
    if (found.length === 2) break;
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* URL handling                                                        */
/* ------------------------------------------------------------------ */

const SHORT_LINK = /(maps\.app\.goo\.gl|goo\.gl\/maps)/i;

/**
 * Pulls the coordinate-bearing part out of a Google Maps URL.
 *
 * Only `?q=` and `?query=` are accepted. Both are documented parameters that
 * mean "this exact point", and both are what a long-press share produces.
 *
 * `/@lat,lng,17z` is refused on purpose even though it parses cleanly: that
 * pair is where the *camera* was, not where the pin is. On a /maps/place/ URL
 * the two differ by 100-200m, and the failure is silent — which is the exact
 * problem the decision doc rejected link-parsing over.
 */
function fromUrl(text: string): CoordinateParseResult | { pass: string } {
  if (
    !/^https?:\/\//i.test(text) &&
    !/^(www\.)?(maps\.)?google\./i.test(text)
  ) {
    return { pass: text };
  }

  if (SHORT_LINK.test(text)) {
    return {
      ok: false,
      code: "short_link",
      message:
        "This is a shortened Google Maps link, which doesn't contain the coordinates. Open it in Google Maps, tap the coordinates shown at the bottom to copy them, and paste those here.",
    };
  }

  let url: URL;
  try {
    url = new URL(text.startsWith("http") ? text : `https://${text}`);
  } catch {
    return { pass: text };
  }

  const q = url.searchParams.get("q") ?? url.searchParams.get("query");
  if (q) return { pass: q };

  if (url.pathname.includes("/@") || url.pathname.includes("/place/")) {
    return {
      ok: false,
      code: "camera_url",
      message:
        "This link points at a place, not at an exact spot — the coordinates in it can be a few hundred metres off. In Google Maps, press and hold on your house, then copy the numbers that appear and paste them here.",
    };
  }

  return { pass: text };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

/**
 * Formats a pair for display and for the verify link.
 *
 * Six decimals is ~0.1m — far finer than any consumer GPS — and matches what
 * Google Maps itself shows, so the number on screen looks like the number the
 * user copied.
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

/** The link the user opens to check the pin. Documented Search URL API. */
export function googleMapsVerifyUrl(
  latitude: number,
  longitude: number,
): string {
  const q = encodeURIComponent(formatCoordinates(latitude, longitude));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function parseCoordinateInput(input: string): CoordinateParseResult {
  const text = (input ?? "").trim();

  if (!text) {
    return {
      ok: false,
      code: "empty",
      message: "Paste the latitude and longitude from Google Maps.",
    };
  }

  const urlStep = fromUrl(text);
  if ("ok" in urlStep) return urlStep;

  const angles = extractAngles(urlStep.pass);

  if (angles.length < 2) {
    return {
      ok: false,
      code: "unparseable",
      message:
        "That doesn't look like a pair of coordinates. It should be two numbers separated by a comma, like 26.0765030, 83.1850130.",
    };
  }

  const [first, second] = angles;

  // If the user pasted "83.1850130E, 26.0765030N", the hemisphere letters say
  // which is which regardless of the order they were typed in.
  let latitude = first.value;
  let longitude = second.value;
  const firstIsLongitude = first.hemisphere === "E" || first.hemisphere === "W";
  const secondIsLatitude =
    second.hemisphere === "N" || second.hemisphere === "S";
  if (firstIsLongitude || secondIsLatitude) {
    latitude = second.value;
    longitude = first.value;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      ok: false,
      code: "unparseable",
      message:
        "Those numbers couldn't be read. Copy them again from Google Maps and paste them here.",
    };
  }

  // Range checks come before the India check so the message names the real
  // problem: 200 is not "outside India", it is not a latitude at all.
  if (Math.abs(latitude) > 90) {
    return {
      ok: false,
      code: "lat_out_of_range",
      message: `Latitude must be between -90 and 90. You entered ${latitude}.`,
    };
  }
  if (Math.abs(longitude) > 180) {
    return {
      ok: false,
      code: "lng_out_of_range",
      message: `Longitude must be between -180 and 180. You entered ${longitude}.`,
    };
  }

  // Both numbers are individually valid but the point is nowhere near us. The
  // overwhelmingly common cause is the pair being the wrong way round, and
  // -90..90 can never catch that on its own: 82.9 is a perfectly legal
  // longitude, so a swapped pair passes every range check and lands in the
  // Arctic. Indian latitudes (8-37) and longitudes (68-97) don't overlap, so
  // testing the reversed pair is unambiguous.
  if (!isInDigipinBounds(latitude, longitude)) {
    if (isInDigipinBounds(longitude, latitude)) {
      return {
        ok: false,
        code: "swapped",
        message:
          "These look reversed — the longitude is in the latitude box. Latitude comes first.",
        suggestion: {
          latitude: longitude,
          longitude: latitude,
          canonical: formatCoordinates(longitude, latitude),
        },
      };
    }

    return {
      ok: false,
      code: "outside_india",
      message:
        "That spot isn't in India, so we can't deliver there. Check the numbers and try again.",
    };
  }

  return {
    ok: true,
    latitude,
    longitude,
    canonical: formatCoordinates(latitude, longitude),
  };
}
