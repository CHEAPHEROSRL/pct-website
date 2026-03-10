/**
 * Geocode a city name to coordinates using the Nominatim (OpenStreetMap) API.
 * Free, no API key required. Rate limit: 1 request/second.
 */
export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeCity(
  query: string
): Promise<GeocodedLocation | null> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "PaulBarryPCT2026/1.0",
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.length) return null;

    const result = data[0];
    // Simplify display name: take first 2-3 parts (city, state)
    const parts = (result.display_name as string).split(", ");
    const displayName =
      parts.length >= 3
        ? `${parts[0]}, ${parts[parts.length - 3]}`
        : parts.slice(0, 2).join(", ");

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName,
    };
  } catch {
    return null;
  }
}
