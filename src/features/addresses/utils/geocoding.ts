export interface GeocodedLocation {
  fullAddress: string;
  landmark?: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

/**
 * Reverse-geocodes GPS coordinates into a street address using OpenStreetMap Nominatim.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Reverse geocode failed: ${res.statusText}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || "";
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";
    const pincode = addr.postcode || "";

    // Build a readable address string if available, or fall back to display_name
    let computedAddress = [street, city, state].filter(Boolean).join(", ");
    if (!computedAddress && data.display_name) {
      computedAddress = data.display_name.split(",").slice(0, 4).join(",").trim();
    }

    const landmark = addr.landmark || addr.building || addr.amenity || addr.suburb || "";

    return {
      fullAddress: computedAddress || data.display_name || "",
      landmark,
      pincode: pincode ? pincode.replace(/\s+/g, "") : "",
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Failed to reverse geocode location:", error);
    return {
      fullAddress: "",
      landmark: "",
      pincode: "",
      latitude,
      longitude,
    };
  }
}

/**
 * Forward-geocodes a text address or pincode into latitude/longitude coordinates.
 */
export async function forwardGeocode(
  query: string,
  pincode?: string
): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  try {
    const fullSearchQuery = [query, pincode].filter(Boolean).join(" ");
    if (!fullSearchQuery.trim()) return null;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullSearchQuery)}&format=json&limit=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        return {
          latitude: lat,
          longitude: lon,
          displayName: first.display_name,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to forward geocode address:", error);
    return null;
  }
}
