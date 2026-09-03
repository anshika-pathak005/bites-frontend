/**
 * DIGIPIN — India Post's open geo-coded addressing grid (IIT Hyderabad + NRSC/ISRO).
 *
 * A 10-character alphanumeric code that is a *pure function* of lat/lng and
 * identifies a ~4m x 4m cell anywhere in India. Offline, no API, no key.
 *
 * Why this file exists: raw GPS coordinates are NOT a stable identity. Two reads
 * from the same doorstep differ in the 5th/6th decimal, so `lat + "," + lng` is
 * useless as a dedup key. DIGIPIN snaps to a grid, so it is stable.
 *
 * Verified against the reference vector: (21.034792, 79.029753) -> 3PT-9CP-86JL
 */

const GRID = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
] as const;

const BOUNDS = { minLat: 2.5, maxLat: 38.5, minLon: 63.5, maxLon: 99.5 };

/** True if the coordinate falls inside the DIGIPIN grid (roughly India + EEZ). */
export function isInDigipinBounds(lat: number, lon: number): boolean {
  return (
    lat >= BOUNDS.minLat &&
    lat <= BOUNDS.maxLat &&
    lon >= BOUNDS.minLon &&
    lon <= BOUNDS.maxLon
  );
}

/** lat/lng -> "XXX-XXX-XXXX". Throws if the point is outside India's grid. */
export function encodeDigipin(lat: number, lon: number): string {
  if (!isInDigipinBounds(lat, lon)) {
    throw new RangeError("Coordinates are outside the DIGIPIN grid (India).");
  }

  let { minLat, maxLat, minLon, maxLon } = BOUNDS;
  let out = "";

  for (let level = 1; level <= 10; level++) {
    const dLat = (maxLat - minLat) / 4;
    const dLon = (maxLon - minLon) / 4;

    // Rows run north -> south, so index 0 is the *top* (highest latitude).
    let row = 3 - Math.floor((lat - minLat) / dLat);
    let col = Math.floor((lon - minLon) / dLon);
    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    out += GRID[row][col];
    if (level === 3 || level === 6) out += "-";

    // Narrow the box to the cell we just picked.
    maxLat = minLat + dLat * (4 - row);
    minLat = minLat + dLat * (3 - row);
    minLon = minLon + dLon * col;
    maxLon = minLon + dLon;
  }

  return out;
}

/** "XXX-XXX-XXXX" -> centre of that cell. Inverse of encodeDigipin. */
export function decodeDigipin(digipin: string): { latitude: number; longitude: number } {
  const chars = digipin.replace(/-/g, "").toUpperCase();
  if (chars.length !== 10) {
    throw new Error("A DIGIPIN must have exactly 10 characters.");
  }

  let { minLat, maxLat, minLon, maxLon } = BOUNDS;

  for (const ch of chars) {
    const dLat = (maxLat - minLat) / 4;
    const dLon = (maxLon - minLon) / 4;

    let row = -1;
    let col = -1;
    for (let r = 0; r < 4 && row === -1; r++) {
      for (let c = 0; c < 4; c++) {
        if (GRID[r][c] === ch) {
          row = r;
          col = c;
          break;
        }
      }
    }
    if (row === -1) throw new Error(`Invalid DIGIPIN character: ${ch}`);

    maxLat = minLat + dLat * (4 - row);
    minLat = minLat + dLat * (3 - row);
    minLon = minLon + dLon * col;
    maxLon = minLon + dLon;
  }

  return {
    latitude: Number(((minLat + maxLat) / 2).toFixed(6)),
    longitude: Number(((minLon + maxLon) / 2).toFixed(6)),
  };
}

/**
 * Dedup key for "has this customer already saved this spot?".
 *
 * The last DIGIPIN character is the ~4m level, and GPS jitter alone can flip it
 * for the same doorstep. Dropping it gives a ~16m cell, which is stable across
 * repeat readings but still tight enough that two different houses rarely
 * collide. Pair it with the flat/house number, which no geocoder can ever infer.
 */
export function addressDedupKey(
  lat: number,
  lon: number,
  flatOrHouse: string
): string {
  const cell = encodeDigipin(lat, lon).replace(/-/g, "").slice(0, 9);
  const house = flatOrHouse
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // "Flat 3-B" and "flat #3b" collapse to the same key
    .trim();
  return `${cell}:${house}`;
}
