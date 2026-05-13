import type { GpsPoint } from "./types";

export interface PctWaypoint {
  lat: number;
  lng: number;
  miles: number;
  elevationFt: number;
  name?: string;
}

// PCT waypoints — real landmark mile markers + approximate elevations.
// Mile values come from widely-published PCT mileage data (Halfmile / PCTA
// style). Elevations are approximate within ~±200 ft for named landmarks.
// Coordinates are approximate for each landmark; the polyline formed by
// these waypoints traces the general shape of the trail, not every switchback.
// Used for: map polyline, simulated-mode current position, elevation lookup.
export const pctWaypoints: PctWaypoint[] = [
  // — Southern California —
  { lat: 32.589, lng: -116.467, miles: 0, elevationFt: 2915, name: "Campo" },
  { lat: 32.691, lng: -116.516, miles: 20, elevationFt: 3060, name: "Lake Morena" },
  { lat: 32.868, lng: -116.421, miles: 42, elevationFt: 5925, name: "Mt. Laguna" },
  { lat: 32.970, lng: -116.478, miles: 60, elevationFt: 4500 },
  { lat: 33.078, lng: -116.547, miles: 77, elevationFt: 2285, name: "Scissors Crossing" },
  { lat: 33.283, lng: -116.634, miles: 109, elevationFt: 3050, name: "Warner Springs" },
  { lat: 33.520, lng: -116.640, miles: 151, elevationFt: 4500 },
  { lat: 33.748, lng: -116.681, miles: 179, elevationFt: 8100, name: "Saddle Junction" },
  { lat: 33.740, lng: -116.721, miles: 180, elevationFt: 5400, name: "Idyllwild" },
  { lat: 33.890, lng: -116.710, miles: 189, elevationFt: 7700, name: "Fuller Ridge" },
  { lat: 33.938, lng: -116.710, miles: 210, elevationFt: 1335, name: "San Gorgonio Pass" },
  { lat: 34.020, lng: -116.660, miles: 234, elevationFt: 4500 },
  { lat: 34.180, lng: -116.820, miles: 252, elevationFt: 8500, name: "Onyx Summit" },
  { lat: 34.255, lng: -116.824, miles: 266, elevationFt: 6800, name: "Big Bear Lake" },
  { lat: 34.337, lng: -117.442, miles: 342, elevationFt: 3000, name: "Cajon Pass" },
  { lat: 34.360, lng: -117.633, miles: 369, elevationFt: 5935, name: "Wrightwood" },
  { lat: 34.358, lng: -117.751, miles: 376, elevationFt: 9407, name: "Mt. Baden-Powell" },
  { lat: 34.498, lng: -118.323, miles: 454, elevationFt: 2517, name: "Agua Dulce" },
  { lat: 34.810, lng: -118.710, miles: 518, elevationFt: 3100, name: "Hikertown" },
  { lat: 35.132, lng: -118.448, miles: 566, elevationFt: 4140, name: "Tehachapi" },
  { lat: 35.662, lng: -118.025, miles: 651, elevationFt: 5245, name: "Walker Pass" },
  { lat: 36.027, lng: -118.124, miles: 702, elevationFt: 6150, name: "Kennedy Meadows" },

  // — Sierra Nevada —
  { lat: 36.468, lng: -118.199, miles: 750, elevationFt: 11160, name: "Cottonwood Pass" },
  { lat: 36.565, lng: -118.237, miles: 767, elevationFt: 10640, name: "Mt. Whitney Jct" },
  { lat: 36.695, lng: -118.374, miles: 779, elevationFt: 13153, name: "Forester Pass" },
  { lat: 36.780, lng: -118.409, miles: 792, elevationFt: 11926, name: "Glen Pass" },
  { lat: 36.930, lng: -118.486, miles: 807, elevationFt: 12130, name: "Pinchot Pass" },
  { lat: 37.050, lng: -118.540, miles: 818, elevationFt: 12100, name: "Mather Pass" },
  { lat: 37.110, lng: -118.678, miles: 839, elevationFt: 11955, name: "Muir Pass" },
  { lat: 37.371, lng: -118.860, miles: 864, elevationFt: 10900, name: "Selden Pass" },
  { lat: 37.563, lng: -118.970, miles: 884, elevationFt: 10900, name: "Silver Pass" },
  { lat: 37.630, lng: -119.063, miles: 907, elevationFt: 7600, name: "Reds Meadow" },
  { lat: 37.800, lng: -119.258, miles: 931, elevationFt: 11056, name: "Donohue Pass" },
  { lat: 37.877, lng: -119.345, miles: 943, elevationFt: 8600, name: "Tuolumne Meadows" },
  { lat: 38.328, lng: -119.635, miles: 1018, elevationFt: 9620, name: "Sonora Pass" },
  { lat: 38.544, lng: -119.810, miles: 1052, elevationFt: 8700, name: "Ebbetts Pass" },
  { lat: 38.694, lng: -119.989, miles: 1076, elevationFt: 8574, name: "Carson Pass" },
  { lat: 38.836, lng: -120.035, miles: 1092, elevationFt: 7400, name: "Echo Lake" },

  // — Northern California —
  { lat: 39.564, lng: -120.634, miles: 1195, elevationFt: 4250, name: "Sierra City" },
  { lat: 40.004, lng: -121.250, miles: 1287, elevationFt: 2310, name: "Belden" },
  { lat: 40.450, lng: -121.430, miles: 1332, elevationFt: 6500, name: "Lassen" },
  { lat: 40.684, lng: -121.466, miles: 1376, elevationFt: 4379, name: "Old Station" },
  { lat: 41.020, lng: -121.647, miles: 1419, elevationFt: 3000, name: "Burney Falls" },
  { lat: 41.147, lng: -122.309, miles: 1502, elevationFt: 2150, name: "Castle Crags" },
  { lat: 41.389, lng: -122.970, miles: 1598, elevationFt: 5950, name: "Etna Summit" },
  { lat: 41.847, lng: -123.191, miles: 1657, elevationFt: 1371, name: "Seiad Valley" },

  // — Oregon —
  { lat: 42.010, lng: -122.800, miles: 1691, elevationFt: 4200, name: "CA/OR Border" },
  { lat: 42.100, lng: -122.617, miles: 1726, elevationFt: 2013, name: "Ashland" },
  { lat: 42.195, lng: -122.466, miles: 1762, elevationFt: 5094, name: "Hyatt Lake" },
  { lat: 42.929, lng: -122.165, miles: 1829, elevationFt: 6001, name: "Crater Lake" },
  { lat: 43.550, lng: -121.979, miles: 1911, elevationFt: 4820, name: "Shelter Cove" },
  { lat: 43.882, lng: -121.820, miles: 1955, elevationFt: 4900, name: "Elk Lake" },
  { lat: 44.260, lng: -121.790, miles: 1984, elevationFt: 5325, name: "McKenzie Pass" },
  { lat: 44.804, lng: -121.790, miles: 2040, elevationFt: 4950, name: "Olallie Lake" },
  { lat: 45.330, lng: -121.712, miles: 2107, elevationFt: 5960, name: "Timberline Lodge" },
  { lat: 45.669, lng: -121.897, miles: 2147, elevationFt: 150, name: "Cascade Locks" },

  // — Washington —
  { lat: 45.935, lng: -121.519, miles: 2229, elevationFt: 1900, name: "Trout Lake" },
  { lat: 46.637, lng: -121.391, miles: 2295, elevationFt: 4400, name: "White Pass" },
  { lat: 46.870, lng: -121.517, miles: 2323, elevationFt: 5432, name: "Chinook Pass" },
  { lat: 47.426, lng: -121.413, miles: 2393, elevationFt: 3030, name: "Snoqualmie Pass" },
  { lat: 47.748, lng: -121.089, miles: 2461, elevationFt: 4056, name: "Stevens Pass" },
  { lat: 48.516, lng: -120.734, miles: 2580, elevationFt: 4855, name: "Rainy Pass" },
  { lat: 48.720, lng: -120.670, miles: 2622, elevationFt: 6180, name: "Harts Pass" },
  { lat: 49.000, lng: -120.811, miles: 2650, elevationFt: 4240, name: "Monument 78" },
  { lat: 49.070, lng: -120.780, miles: 2659, elevationFt: 3872, name: "Manning Park" },
];

// Simple [lat, lng] array for rendering the polyline on the map
export const pctRouteCoords: [number, number][] = pctWaypoints.map((w) => [w.lat, w.lng]);

// Named locations along the trail for "nearest location" display
const namedLocations = pctWaypoints.filter((w) => w.name);

// — Trail Sections (pledger pin claims) —

export type TrailRegion = "socal" | "sierra" | "norcal" | "oregon" | "washington";

export const TRAIL_REGIONS: Record<TrailRegion, { label: string; rangeLabel: string }> = {
  socal: { label: "Southern California", rangeLabel: "MI 0–700" },
  sierra: { label: "Sierra Nevada", rangeLabel: "MI 700–1100" },
  norcal: { label: "Northern California", rangeLabel: "MI 1100–1691" },
  oregon: { label: "Oregon", rangeLabel: "MI 1691–2147" },
  washington: { label: "Washington", rangeLabel: "MI 2147–2650" },
};

export interface TrailSection {
  id: string;
  name: string;
  miles: number;
  lat: number;
  lng: number;
  region: TrailRegion;
  // Short marketing line shown under the name in the picker. Keep under ~40 chars.
  subtitle?: string;
}

// Curated subset of pctWaypoints suitable as pin-claim landmarks. Drawn from
// the real waypoint coordinates above so a section's lat/lng matches Paul's
// position when he reaches that mile.
export const trailSections: TrailSection[] = [
  { id: "campo", name: "Campo", miles: 0, lat: 32.589, lng: -116.467, region: "socal", subtitle: "Southern terminus" },
  { id: "lake-morena", name: "Lake Morena", miles: 20, lat: 32.691, lng: -116.516, region: "socal" },
  { id: "mt-laguna", name: "Mt. Laguna", miles: 42, lat: 32.868, lng: -116.421, region: "socal" },
  { id: "warner-springs", name: "Warner Springs", miles: 109, lat: 33.283, lng: -116.634, region: "socal" },
  { id: "idyllwild", name: "Idyllwild", miles: 180, lat: 33.740, lng: -116.721, region: "socal" },
  { id: "big-bear-lake", name: "Big Bear Lake", miles: 266, lat: 34.255, lng: -116.824, region: "socal" },
  { id: "cajon-pass", name: "Cajon Pass", miles: 342, lat: 34.337, lng: -117.442, region: "socal" },
  { id: "wrightwood", name: "Wrightwood", miles: 369, lat: 34.360, lng: -117.633, region: "socal" },
  { id: "agua-dulce", name: "Agua Dulce", miles: 454, lat: 34.498, lng: -118.323, region: "socal" },
  { id: "tehachapi", name: "Tehachapi", miles: 566, lat: 35.132, lng: -118.448, region: "socal" },
  { id: "walker-pass", name: "Walker Pass", miles: 651, lat: 35.662, lng: -118.025, region: "socal" },
  { id: "kennedy-meadows", name: "Kennedy Meadows", miles: 702, lat: 36.027, lng: -118.124, region: "socal", subtitle: "Gateway to the Sierra" },
  { id: "forester-pass", name: "Forester Pass", miles: 779, lat: 36.695, lng: -118.374, region: "sierra", subtitle: "Highest point, 13,153 ft" },
  { id: "muir-pass", name: "Muir Pass", miles: 839, lat: 37.110, lng: -118.678, region: "sierra" },
  { id: "tuolumne-meadows", name: "Tuolumne Meadows", miles: 943, lat: 37.877, lng: -119.345, region: "sierra", subtitle: "Yosemite National Park" },
  { id: "sonora-pass", name: "Sonora Pass", miles: 1018, lat: 38.328, lng: -119.635, region: "sierra" },
  { id: "echo-lake", name: "Echo Lake", miles: 1092, lat: 38.836, lng: -120.035, region: "sierra" },
  { id: "sierra-city", name: "Sierra City", miles: 1195, lat: 39.564, lng: -120.634, region: "norcal" },
  { id: "belden", name: "Belden", miles: 1287, lat: 40.004, lng: -121.250, region: "norcal" },
  { id: "lassen", name: "Lassen", miles: 1332, lat: 40.450, lng: -121.430, region: "norcal", subtitle: "Lassen National Park" },
  { id: "burney-falls", name: "Burney Falls", miles: 1419, lat: 41.020, lng: -121.647, region: "norcal" },
  { id: "castle-crags", name: "Castle Crags", miles: 1502, lat: 41.147, lng: -122.309, region: "norcal" },
  { id: "ashland", name: "Ashland", miles: 1726, lat: 42.100, lng: -122.617, region: "oregon" },
  { id: "crater-lake", name: "Crater Lake", miles: 1829, lat: 42.929, lng: -122.165, region: "oregon" },
  { id: "mckenzie-pass", name: "McKenzie Pass", miles: 1984, lat: 44.260, lng: -121.790, region: "oregon" },
  { id: "timberline-lodge", name: "Timberline Lodge", miles: 2107, lat: 45.330, lng: -121.712, region: "oregon", subtitle: "Mt. Hood" },
  { id: "cascade-locks", name: "Cascade Locks", miles: 2147, lat: 45.669, lng: -121.897, region: "oregon", subtitle: "Bridge of the Gods" },
  { id: "white-pass", name: "White Pass", miles: 2295, lat: 46.637, lng: -121.391, region: "washington" },
  { id: "snoqualmie-pass", name: "Snoqualmie Pass", miles: 2393, lat: 47.426, lng: -121.413, region: "washington" },
  { id: "stevens-pass", name: "Stevens Pass", miles: 2461, lat: 47.748, lng: -121.089, region: "washington" },
  { id: "rainy-pass", name: "Rainy Pass", miles: 2580, lat: 48.516, lng: -120.734, region: "washington" },
  { id: "manning-park", name: "Manning Park", miles: 2659, lat: 49.070, lng: -120.780, region: "washington", subtitle: "Canada · Finish" },
];

export function getTrailSection(id: string): TrailSection | undefined {
  return trailSections.find((s) => s.id === id);
}

// — Section Sponsors (managed via /admin → Sponsors tab) —
//
// Stored in Redis (key: "sponsors:all") as a JSON array. Logos are uploaded to
// Vercel Blob via the admin endpoint. Exactly one of `sectionId` or
// `customLocation` is set per record — admin UI enforces this. Custom locations
// exist so a sponsor deal can claim a stretch we didn't pre-name in
// trailSections (e.g. a specific summit, trail town, or memorial).
export interface SponsorRecord {
  id: string;
  companyName: string;
  logoUrl: string;
  websiteUrl?: string;
  // Set when the sponsor maps to one of the curated named landmarks.
  sectionId?: string;
  // Set when the sponsor occupies a freeform location on the trail. `miles`
  // is required so we can apply the same "only render after Paul has reached
  // it"-style logic uniformly. Actually for sponsors we render from day one
  // (sponsors paid for visibility), but miles is still useful for sorting.
  customLocation?: {
    name: string;
    miles: number;
    lat: number;
    lng: number;
  };
  createdAt: number;
}

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
 * Given a mile marker (0–2650), interpolate the lat/lng/elevation along the PCT route.
 * Used by simulated tracking to convert a mile number into a map position.
 */
export function interpolateFromMile(miles: number): {
  lat: number;
  lng: number;
  elevationFt: number;
  nearestName: string;
} {
  const clamped = Math.max(0, Math.min(2650, miles));

  // Find the two waypoints that bracket this mile
  for (let i = 0; i < pctWaypoints.length - 1; i++) {
    const a = pctWaypoints[i];
    const b = pctWaypoints[i + 1];

    if (clamped >= a.miles && clamped <= b.miles) {
      const t = b.miles === a.miles ? 0 : (clamped - a.miles) / (b.miles - a.miles);
      const lat = a.lat + t * (b.lat - a.lat);
      const lng = a.lng + t * (b.lng - a.lng);
      const elevationFt = a.elevationFt + t * (b.elevationFt - a.elevationFt);
      const nearestName = getNearestLocationName(lat, lng);
      return { lat, lng, elevationFt, nearestName };
    }
  }

  // Past the end — return Manning Park
  const last = pctWaypoints[pctWaypoints.length - 1];
  return {
    lat: last.lat,
    lng: last.lng,
    elevationFt: last.elevationFt,
    nearestName: last.name || "Manning Park",
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

/**
 * Max elevation reached along the PCT up to a given mile marker.
 * Scans every waypoint where miles <= currentMiles and returns the highest
 * elevation seen. Also includes the interpolated elevation at currentMiles
 * itself, so the answer stays right even when the hiker is mid-ascent
 * between two waypoints.
 *
 * Used to render "Highest Point Reached" on the tracker — which should be a
 * running max, not the current elevation or a hardcoded Mt. Whitney value.
 */
export function getMaxElevationUpTo(currentMiles: number): number {
  if (currentMiles <= 0) return pctWaypoints[0].elevationFt;
  let max = pctWaypoints[0].elevationFt;
  for (const wp of pctWaypoints) {
    if (wp.miles > currentMiles) break;
    if (wp.elevationFt > max) max = wp.elevationFt;
  }
  // Also consider the interpolated elevation at the exact current mile
  // (handles the ascending-segment case).
  for (let i = 0; i < pctWaypoints.length - 1; i++) {
    const a = pctWaypoints[i];
    const b = pctWaypoints[i + 1];
    if (currentMiles >= a.miles && currentMiles <= b.miles) {
      const t = b.miles === a.miles ? 0 : (currentMiles - a.miles) / (b.miles - a.miles);
      const interpolated = a.elevationFt + t * (b.elevationFt - a.elevationFt);
      if (interpolated > max) max = interpolated;
      break;
    }
  }
  return max;
}
