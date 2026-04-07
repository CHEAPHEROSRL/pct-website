/**
 * Day-by-day cumulative mileage for Paul's PCT thru-hike.
 *
 * This is the source of truth for "how many miles had Paul covered by the
 * end of Day N?" — used by the journal map markers to anchor each blog post
 * at the correct trail position.
 *
 * Add a new entry as Paul completes each day. If a day isn't in the table
 * yet, the system falls back to the current simulated mile (so newly created
 * posts get a sensible default).
 *
 * Source: Paul's own day-by-day report. Update as the hike progresses.
 */

export interface DayMileage {
  /** Day number, 1-indexed. Day 0 is the night before the start. */
  day: number;
  /** Miles walked that specific day */
  miles: number;
  /** Cumulative mileage from Mile 0 (Campo) to end of this day */
  cumulative: number;
  /** Optional note about the day */
  note?: string;
}

export const DAY_MILEAGE: DayMileage[] = [
  { day: 0, miles: 0, cumulative: 0, note: "Night before start — at the southern terminus" },
  { day: 1, miles: 14, cumulative: 14, note: "Campo to Mile 14 water cache (just shy of Hauser Creek)" },
  { day: 2, miles: 6, cumulative: 20, note: "To Lake Morena (home of the famous Malt Shop)" },
  { day: 3, miles: 3, cumulative: 23, note: "Nero at Lake Morena" },
  { day: 4, miles: 0, cumulative: 23, note: "Zero at Lake Morena" },
  { day: 5, miles: 9.4, cumulative: 32.4 },
  { day: 6, miles: 3, cumulative: 35.4, note: "Nero" },
  { day: 7, miles: 13.8, cumulative: 49.2 },
  { day: 8, miles: 22, cumulative: 71.2 },
  { day: 9, miles: 12.1, cumulative: 83.3 },
  { day: 10, miles: 9.7, cumulative: 93 },
  { day: 11, miles: 15, cumulative: 108 },
  { day: 12, miles: 8.2, cumulative: 116.2 },
  { day: 13, miles: 0, cumulative: 116.2, note: "Zero" },
  { day: 14, miles: 0, cumulative: 116.2, note: "Zero" },
];

/**
 * Look up the cumulative mile for a given day number. Returns null if the
 * day isn't in the table yet (caller should fall back to current simulated
 * mile or another sensible default).
 */
export function getMileForDay(day: number): number | null {
  if (day < 0) return null;
  const entry = DAY_MILEAGE.find((d) => d.day === day);
  return entry ? entry.cumulative : null;
}

/**
 * Returns the highest day number we have mileage data for. Useful for the
 * admin UI to show "lookup table covers Day 0–N".
 */
export function getLastTrackedDay(): number {
  if (DAY_MILEAGE.length === 0) return -1;
  return DAY_MILEAGE[DAY_MILEAGE.length - 1].day;
}
