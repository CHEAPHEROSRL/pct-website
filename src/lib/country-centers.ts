// Geographic centers (approximate centroids) for the countries we expect
// pledgers from. Used by /api/pledges/countries to aggregate-by-country —
// pins on the PLEDGERS world map are placed at the country centroid, NOT
// at the pledger's actual IP-derived coordinates. That preserves privacy
// (IP geo is imprecise and revealing exact pledger location feels wrong)
// and keeps the map cleaner.
//
// Codes are ISO 3166-1 alpha-2 (what Vercel returns in x-vercel-ip-country).
// Names are display strings only — used in tooltips, not for matching.
//
// Not exhaustive: ~100 countries covering the practical reach of a
// US-/AU-focused charity hike. Pledges from a country missing here fall
// back to no pin (the API just skips them) — easy to add as needed.

export interface CountryCenter {
  name: string;
  lat: number;
  lng: number;
}

export const COUNTRY_CENTERS: Record<string, CountryCenter> = {
  // — North America —
  US: { name: "United States", lat: 39.8283, lng: -98.5795 },
  CA: { name: "Canada", lat: 56.1304, lng: -106.3468 },
  MX: { name: "Mexico", lat: 23.6345, lng: -102.5528 },
  // — Central / South America —
  AR: { name: "Argentina", lat: -38.4161, lng: -63.6167 },
  BR: { name: "Brazil", lat: -14.2350, lng: -51.9253 },
  CL: { name: "Chile", lat: -35.6751, lng: -71.5430 },
  CO: { name: "Colombia", lat: 4.5709, lng: -74.2973 },
  CR: { name: "Costa Rica", lat: 9.7489, lng: -83.7534 },
  EC: { name: "Ecuador", lat: -1.8312, lng: -78.1834 },
  GT: { name: "Guatemala", lat: 15.7835, lng: -90.2308 },
  PA: { name: "Panama", lat: 8.5380, lng: -80.7821 },
  PE: { name: "Peru", lat: -9.1900, lng: -75.0152 },
  UY: { name: "Uruguay", lat: -32.5228, lng: -55.7658 },
  VE: { name: "Venezuela", lat: 6.4238, lng: -66.5897 },
  // — Europe (UK + Ireland) —
  GB: { name: "United Kingdom", lat: 55.3781, lng: -3.4360 },
  IE: { name: "Ireland", lat: 53.4129, lng: -8.2439 },
  // — Europe (Western) —
  AT: { name: "Austria", lat: 47.5162, lng: 14.5501 },
  BE: { name: "Belgium", lat: 50.5039, lng: 4.4699 },
  CH: { name: "Switzerland", lat: 46.8182, lng: 8.2275 },
  DE: { name: "Germany", lat: 51.1657, lng: 10.4515 },
  ES: { name: "Spain", lat: 40.4637, lng: -3.7492 },
  FR: { name: "France", lat: 46.2276, lng: 2.2137 },
  IT: { name: "Italy", lat: 41.8719, lng: 12.5674 },
  LU: { name: "Luxembourg", lat: 49.8153, lng: 6.1296 },
  NL: { name: "Netherlands", lat: 52.1326, lng: 5.2913 },
  PT: { name: "Portugal", lat: 39.3999, lng: -8.2245 },
  // — Europe (Nordic) —
  DK: { name: "Denmark", lat: 56.2639, lng: 9.5018 },
  FI: { name: "Finland", lat: 61.9241, lng: 25.7482 },
  IS: { name: "Iceland", lat: 64.9631, lng: -19.0208 },
  NO: { name: "Norway", lat: 60.4720, lng: 8.4689 },
  SE: { name: "Sweden", lat: 60.1282, lng: 18.6435 },
  // — Europe (Central / Eastern) —
  BG: { name: "Bulgaria", lat: 42.7339, lng: 25.4858 },
  CZ: { name: "Czechia", lat: 49.8175, lng: 15.4730 },
  EE: { name: "Estonia", lat: 58.5953, lng: 25.0136 },
  GR: { name: "Greece", lat: 39.0742, lng: 21.8243 },
  HR: { name: "Croatia", lat: 45.1000, lng: 15.2000 },
  HU: { name: "Hungary", lat: 47.1625, lng: 19.5033 },
  LT: { name: "Lithuania", lat: 55.1694, lng: 23.8813 },
  LV: { name: "Latvia", lat: 56.8796, lng: 24.6032 },
  PL: { name: "Poland", lat: 51.9194, lng: 19.1451 },
  RO: { name: "Romania", lat: 45.9432, lng: 24.9668 },
  RS: { name: "Serbia", lat: 44.0165, lng: 21.0059 },
  SI: { name: "Slovenia", lat: 46.1512, lng: 14.9955 },
  SK: { name: "Slovakia", lat: 48.6690, lng: 19.6990 },
  UA: { name: "Ukraine", lat: 48.3794, lng: 31.1656 },
  // — Russia + Belarus —
  BY: { name: "Belarus", lat: 53.7098, lng: 27.9534 },
  RU: { name: "Russia", lat: 61.5240, lng: 105.3188 },
  // — Middle East / North Africa —
  AE: { name: "United Arab Emirates", lat: 23.4241, lng: 53.8478 },
  EG: { name: "Egypt", lat: 26.8206, lng: 30.8025 },
  IL: { name: "Israel", lat: 31.0461, lng: 34.8516 },
  JO: { name: "Jordan", lat: 30.5852, lng: 36.2384 },
  LB: { name: "Lebanon", lat: 33.8547, lng: 35.8623 },
  MA: { name: "Morocco", lat: 31.7917, lng: -7.0926 },
  QA: { name: "Qatar", lat: 25.3548, lng: 51.1839 },
  SA: { name: "Saudi Arabia", lat: 23.8859, lng: 45.0792 },
  TN: { name: "Tunisia", lat: 33.8869, lng: 9.5375 },
  TR: { name: "Türkiye", lat: 38.9637, lng: 35.2433 },
  // — Sub-Saharan Africa —
  ET: { name: "Ethiopia", lat: 9.1450, lng: 40.4897 },
  GH: { name: "Ghana", lat: 7.9465, lng: -1.0232 },
  KE: { name: "Kenya", lat: -0.0236, lng: 37.9062 },
  NG: { name: "Nigeria", lat: 9.0820, lng: 8.6753 },
  RW: { name: "Rwanda", lat: -1.9403, lng: 29.8739 },
  SN: { name: "Senegal", lat: 14.4974, lng: -14.4524 },
  TZ: { name: "Tanzania", lat: -6.3690, lng: 34.8888 },
  UG: { name: "Uganda", lat: 1.3733, lng: 32.2903 },
  ZA: { name: "South Africa", lat: -30.5595, lng: 22.9375 },
  ZW: { name: "Zimbabwe", lat: -19.0154, lng: 29.1549 },
  // — South Asia —
  BD: { name: "Bangladesh", lat: 23.6850, lng: 90.3563 },
  IN: { name: "India", lat: 20.5937, lng: 78.9629 },
  LK: { name: "Sri Lanka", lat: 7.8731, lng: 80.7718 },
  NP: { name: "Nepal", lat: 28.3949, lng: 84.1240 },
  PK: { name: "Pakistan", lat: 30.3753, lng: 69.3451 },
  // — East / Southeast Asia —
  CN: { name: "China", lat: 35.8617, lng: 104.1954 },
  HK: { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  ID: { name: "Indonesia", lat: -0.7893, lng: 113.9213 },
  JP: { name: "Japan", lat: 36.2048, lng: 138.2529 },
  KR: { name: "South Korea", lat: 35.9078, lng: 127.7669 },
  MY: { name: "Malaysia", lat: 4.2105, lng: 101.9758 },
  PH: { name: "Philippines", lat: 12.8797, lng: 121.7740 },
  SG: { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  TH: { name: "Thailand", lat: 15.8700, lng: 100.9925 },
  TW: { name: "Taiwan", lat: 23.6978, lng: 120.9605 },
  VN: { name: "Vietnam", lat: 14.0583, lng: 108.2772 },
  // — Oceania —
  AU: { name: "Australia", lat: -25.2744, lng: 133.7751 },
  FJ: { name: "Fiji", lat: -16.5780, lng: 179.4144 },
  NZ: { name: "New Zealand", lat: -40.9006, lng: 174.8860 },
  PG: { name: "Papua New Guinea", lat: -6.3149, lng: 143.9555 },
};

/**
 * Convert a 2-letter ISO country code to its flag emoji using regional
 * indicator symbols. Browser support is universal-ish: works perfectly on
 * Mac/iOS/Android, mostly fine on modern Chrome/Firefox on Windows. On
 * older Windows installs the user may see the country code letters in a
 * box — still informational, just less pretty. We accept this trade-off.
 */
export function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return code;
  const codePoints = [...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
