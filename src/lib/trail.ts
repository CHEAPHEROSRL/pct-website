import type { GpsPoint } from "./types";

export interface PctWaypoint {
  lat: number;
  lng: number;
  miles: number;
  elevationFt: number;
  name?: string;
}

// PCT waypoints with cumulative mile markers and approximate elevations.
// Mile values are scaled from Haversine distances to the known 2,650-mile total.
// Elevations are approximate based on PCT elevation profile data.
export const pctWaypoints: PctWaypoint[] = [
  { lat: 32.589, lng: -116.467, miles: 0, elevationFt: 2915, name: "Campo" },
  { lat: 32.72, lng: -116.48, miles: 15, elevationFt: 3400 },
  { lat: 32.88, lng: -116.52, miles: 35, elevationFt: 4200 },
  { lat: 33.05, lng: -116.60, miles: 55, elevationFt: 3100, name: "Warner Springs" },
  { lat: 33.24, lng: -116.68, miles: 80, elevationFt: 4500 },
  { lat: 33.35, lng: -116.70, miles: 100, elevationFt: 5200 },
  { lat: 33.47, lng: -116.72, miles: 120, elevationFt: 5400, name: "Idyllwild" },
  { lat: 33.60, lng: -116.80, miles: 150, elevationFt: 4800 },
  { lat: 33.82, lng: -116.83, miles: 180, elevationFt: 3400 },
  { lat: 33.92, lng: -116.85, miles: 210, elevationFt: 3200 },
  { lat: 34.02, lng: -117.05, miles: 240, elevationFt: 3500 },
  { lat: 34.18, lng: -117.30, miles: 280, elevationFt: 6800, name: "Big Bear" },
  { lat: 34.24, lng: -117.45, miles: 310, elevationFt: 5200 },
  { lat: 34.32, lng: -117.68, miles: 340, elevationFt: 4800 },
  { lat: 34.37, lng: -117.82, miles: 370, elevationFt: 5600 },
  { lat: 34.43, lng: -118.06, miles: 400, elevationFt: 4200 },
  { lat: 34.68, lng: -118.25, miles: 450, elevationFt: 5000, name: "Agua Dulce" },
  { lat: 34.78, lng: -118.38, miles: 490, elevationFt: 4500 },
  { lat: 34.82, lng: -118.52, miles: 520, elevationFt: 3800, name: "Tehachapi" },
  { lat: 36.02, lng: -118.08, miles: 700, elevationFt: 6150, name: "Kennedy Meadows" },
  { lat: 36.45, lng: -118.18, miles: 770, elevationFt: 10400 },
  { lat: 36.58, lng: -118.25, miles: 800, elevationFt: 13100, name: "Mt. Whitney" },
  { lat: 36.74, lng: -118.40, miles: 840, elevationFt: 11500, name: "Forester Pass" },
  { lat: 37.00, lng: -118.52, miles: 880, elevationFt: 10900 },
  { lat: 37.24, lng: -118.60, miles: 920, elevationFt: 11000, name: "Muir Pass" },
  { lat: 37.50, lng: -118.68, miles: 960, elevationFt: 9600 },
  { lat: 37.74, lng: -118.78, miles: 1000, elevationFt: 9700, name: "Mammoth Lakes" },
  { lat: 37.87, lng: -119.33, miles: 1040, elevationFt: 8600, name: "Tuolumne Meadows" },
  { lat: 38.18, lng: -119.60, miles: 1100, elevationFt: 10800, name: "Sonora Pass" },
  { lat: 38.65, lng: -119.90, miles: 1170, elevationFt: 8700 },
  { lat: 39.15, lng: -120.12, miles: 1250, elevationFt: 7100, name: "Sierra City" },
  { lat: 39.50, lng: -120.25, miles: 1310, elevationFt: 6200 },
  { lat: 39.95, lng: -120.55, miles: 1380, elevationFt: 5100, name: "Belden" },
  { lat: 40.42, lng: -121.30, miles: 1460, elevationFt: 5500, name: "Burney Falls" },
  { lat: 40.78, lng: -121.50, miles: 1520, elevationFt: 6000 },
  { lat: 41.18, lng: -122.05, miles: 1580, elevationFt: 4900, name: "Castle Crags" },
  { lat: 41.55, lng: -122.28, miles: 1630, elevationFt: 5400 },
  { lat: 41.85, lng: -122.38, miles: 1670, elevationFt: 4200, name: "Etna" },
  { lat: 42.18, lng: -122.68, miles: 1720, elevationFt: 1800, name: "Ashland" },
  { lat: 42.55, lng: -122.15, miles: 1780, elevationFt: 5900 },
  { lat: 42.87, lng: -122.10, miles: 1830, elevationFt: 6000, name: "Crater Lake" },
  { lat: 43.10, lng: -122.12, miles: 1870, elevationFt: 5800 },
  { lat: 43.55, lng: -121.98, miles: 1930, elevationFt: 5200, name: "Shelter Cove" },
  { lat: 44.05, lng: -121.78, miles: 2000, elevationFt: 5900, name: "Sisters" },
  { lat: 44.48, lng: -121.78, miles: 2060, elevationFt: 4600, name: "Olallie Lake" },
  { lat: 44.82, lng: -121.85, miles: 2100, elevationFt: 6000, name: "Timberline Lodge" },
  { lat: 45.10, lng: -121.82, miles: 2130, elevationFt: 4000 },
  { lat: 45.67, lng: -121.90, miles: 2147, elevationFt: 150, name: "Cascade Locks" },
  { lat: 45.85, lng: -121.70, miles: 2190, elevationFt: 4800 },
  { lat: 46.15, lng: -121.52, miles: 2240, elevationFt: 5200 },
  { lat: 46.38, lng: -121.48, miles: 2280, elevationFt: 5800, name: "White Pass" },
  { lat: 46.72, lng: -121.38, miles: 2330, elevationFt: 5500 },
  { lat: 47.05, lng: -121.18, miles: 2390, elevationFt: 4900, name: "Snoqualmie Pass" },
  { lat: 47.35, lng: -121.08, miles: 2430, elevationFt: 5200 },
  { lat: 47.55, lng: -120.92, miles: 2470, elevationFt: 5500, name: "Stevens Pass" },
  { lat: 47.85, lng: -120.75, miles: 2520, elevationFt: 5000 },
  { lat: 48.15, lng: -120.68, miles: 2560, elevationFt: 6200 },
  { lat: 48.42, lng: -120.62, miles: 2590, elevationFt: 6500, name: "Rainy Pass" },
  { lat: 48.65, lng: -120.72, miles: 2620, elevationFt: 5800, name: "Harts Pass" },
  { lat: 48.85, lng: -120.78, miles: 2640, elevationFt: 4800 },
  { lat: 49.00, lng: -121.05, miles: 2650, elevationFt: 3850, name: "Manning Park" },
];

// Simple [lat, lng] array for rendering the polyline on the map
export const pctRouteCoords: [number, number][] = pctWaypoints.map((w) => [w.lat, w.lng]);

// Named locations along the trail for "nearest location" display
const namedLocations = pctWaypoints.filter((w) => w.name);

/** Haversine distance between two points in miles */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function metersToFeet(m: number): number {
  return m * 3.28084;
}

/**
 * Snap a GPS coordinate to the nearest point on the PCT route.
 * Returns cumulative miles along the trail and the nearest named location.
 */
export function snapToTrail(lat: number, lng: number) {
  let minDist = Infinity;
  let bestMiles = 0;
  let bestElevation = pctWaypoints[0].elevationFt;

  for (let i = 0; i < pctWaypoints.length - 1; i++) {
    const a = pctWaypoints[i];
    const b = pctWaypoints[i + 1];

    // Project point onto segment a→b
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const lenSq = dx * dx + dy * dy;

    let t = 0;
    if (lenSq > 0) {
      t = ((lng - a.lng) * dx + (lat - a.lat) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }

    const projLat = a.lat + t * dy;
    const projLng = a.lng + t * dx;
    const dist = haversineDistance(lat, lng, projLat, projLng);

    if (dist < minDist) {
      minDist = dist;
      bestMiles = a.miles + t * (b.miles - a.miles);
      bestElevation = a.elevationFt + t * (b.elevationFt - a.elevationFt);
    }
  }

  const nearestName = getNearestLocationName(lat, lng);

  return {
    miles: bestMiles,
    elevationFt: bestElevation,
    nearestName,
  };
}

/** Find the nearest named location to a given coordinate */
export function getNearestLocationName(lat: number, lng: number): string {
  let minDist = Infinity;
  let name = "PCT";

  for (const loc of namedLocations) {
    const dist = haversineDistance(lat, lng, loc.lat, loc.lng);
    if (dist < minDist) {
      minDist = dist;
      name = loc.name!;
    }
  }

  return name;
}

/**
 * Interpolate elevation from the PCT waypoint data for a given coordinate.
 * Useful as fallback when GPS altitude is unavailable.
 */
export function getInterpolatedElevation(lat: number, lng: number): number {
  const result = snapToTrail(lat, lng);
  return result.elevationFt;
}

/**
 * Compute today's distance walked and elevation gain from a list of GPS points.
 */
export function computeTodayStats(history: GpsPoint[]): {
  distance: number;
  elevationGain: number;
} {
  if (history.length < 2) return { distance: 0, elevationGain: 0 };

  let distance = 0;
  let elevationGain = 0;

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];

    // Skip points with poor accuracy (> 50 meters)
    if (curr.accuracy && curr.accuracy > 50) continue;

    distance += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);

    if (prev.altitude !== null && curr.altitude !== null) {
      const diff = curr.altitude - prev.altitude;
      if (diff > 0) {
        elevationGain += diff;
      }
    }
  }

  return {
    distance,
    elevationGain: metersToFeet(elevationGain),
  };
}

/**
 * Determine which trail section index (0-4) a given mile marker falls into.
 * Sections: SoCal (0-700), Sierra (700-1100), NorCal (1100-1691), Oregon (1691-2147), Washington (2147-2650)
 */
export function getTrailSectionIndex(miles: number): number {
  if (miles < 700) return 0;
  if (miles < 1100) return 1;
  if (miles < 1691) return 2;
  if (miles < 2147) return 3;
  return 4;
}
