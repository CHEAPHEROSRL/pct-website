import { pctWaypoints } from "@/lib/trail";
import type { SupportGiftLocation } from "@/lib/types";

/** Calculate percentage of trail segments that have gifts nearby */
export function getTrailFundingPercent(gifts: SupportGiftLocation[]): number {
  const totalSegments = pctWaypoints.length - 1;
  if (totalSegments <= 0) return 0;

  const giftMiles = gifts.map((g) => g.trailMile);
  let funded = 0;

  for (let i = 0; i < totalSegments; i++) {
    const start = pctWaypoints[i].miles;
    const end = pctWaypoints[i + 1].miles;
    if (giftMiles.some((m) => m >= start && m < end)) {
      funded++;
    }
  }

  return Math.round((funded / totalSegments) * 100);
}
