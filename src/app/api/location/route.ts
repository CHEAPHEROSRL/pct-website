import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { GpsPoint, LocationData } from "@/lib/types";
import { snapToTrail, computeTodayStats, metersToFeet } from "@/lib/trail";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  // Auth: Bearer header (GPSLogger / browser) or ?token= query param (OwnTracks)
  const authHeader = request.headers.get("authorization");
  const token =
    authHeader?.replace("Bearer ", "") ?? searchParams.get("token") ?? "";
  if (!token || token !== process.env.TRACKER_AUTH_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  // Parse and validate
  const body = await request.json();

  let lat: number, lng: number, altitude: number | null, timestamp: number, accuracy: number | null;

  if (format === "owntracks") {
    // OwnTracks HTTP payload: { _type, lat, lon, alt, tst (unix seconds), acc }
    lat = body.lat;
    lng = body.lon;
    altitude = typeof body.alt === "number" ? body.alt : null;
    timestamp = typeof body.tst === "number" ? body.tst * 1000 : Date.now();
    accuracy = typeof body.acc === "number" ? body.acc : null;
  } else {
    ({ lat, lng, altitude = null, timestamp = Date.now(), accuracy = null } = body);
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
  }

  // Rate limit: reject if last update was < 10s ago
  const lastTimestamp = await redis.get<number>("location:last_timestamp");
  if (lastTimestamp && Date.now() - lastTimestamp < 10000) {
    return NextResponse.json({ error: "Too frequent" }, { status: 429 });
  }

  const point: GpsPoint = {
    lat,
    lng,
    altitude,
    timestamp,
    accuracy,
  };

  // Store current position
  await redis.set("location:current", JSON.stringify(point));
  await redis.set("location:last_timestamp", point.timestamp);

  // Append to today's history
  const today = new Date().toISOString().slice(0, 10);
  await redis.rpush(`location:history:${today}`, JSON.stringify(point));
  await redis.expire(`location:history:${today}`, 90 * 24 * 60 * 60);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const redis = getRedis();

  // Default stats when no data or no Redis
  const defaults: LocationData = {
    current: null,
    stats: {
      totalMiles: 0,
      currentElevation: 2915,
      dayNumber: 0,
      todayDistance: 0,
      todayElevationGain: 0,
      lastUpdated: null,
      nearestLocationName: "Campo",
    },
  };

  if (!redis) {
    return NextResponse.json(defaults, {
      headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=20" },
    });
  }

  // Read current position
  const currentRaw = await redis.get<string>("location:current");
  if (!currentRaw) {
    return NextResponse.json(defaults, {
      headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=20" },
    });
  }

  const current: GpsPoint =
    typeof currentRaw === "string" ? JSON.parse(currentRaw) : currentRaw;

  // Compute trail stats
  const { miles, nearestName, elevationFt } = snapToTrail(current.lat, current.lng);

  // Day number
  const hikeStart = new Date(process.env.HIKE_START_DATE || "2026-03-28");
  const now = new Date();
  const dayNumber = Math.max(
    1,
    Math.ceil((now.getTime() - hikeStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Today's history for daily stats
  const today = new Date().toISOString().slice(0, 10);
  const historyRaw = await redis.lrange<string>(`location:history:${today}`, 0, -1);
  const history: GpsPoint[] = (historyRaw || []).map((s) =>
    typeof s === "string" ? JSON.parse(s) : s
  );
  const { distance, elevationGain } = computeTodayStats(history);

  // Current elevation: prefer GPS altitude, fallback to interpolated
  const currentElevation =
    current.altitude !== null ? metersToFeet(current.altitude) : elevationFt;

  const data: LocationData = {
    current,
    stats: {
      totalMiles: Math.round(miles * 10) / 10,
      currentElevation: Math.round(currentElevation),
      dayNumber,
      todayDistance: Math.round(distance * 10) / 10,
      todayElevationGain: Math.round(elevationGain),
      lastUpdated: current.timestamp,
      nearestLocationName: nearestName,
    },
  };

  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=20" },
  });
}
