import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { constantTimeEqual } from "@/lib/security";
import { safeParse } from "@/lib/redis-safe";
import type { PledgeRecord } from "@/lib/types";

/**
 * GET /api/admin/pledges/list-all
 *
 * Read-only diagnostic dump of every pledge-related record in Redis.
 * Built so the admin can SEE everything before deciding what to delete
 * (we don't want to nuke a real user's pledge by accident when cleaning
 * up test data).
 *
 * Returns:
 *   - live[]    : all pledger:<hash> records (confirmed pledges)
 *   - pending[] : all pending:<hash> records (not yet confirmed)
 *   - listEntries[] : entries from pledgers:list (the denormalised list
 *                     used by /pledgers wall — may differ from live if
 *                     index ever got out of sync)
 *   - counters: { count, totalPledged, etc. } — raw counter values
 *
 * Each record includes its Redis key so deletion is straightforward.
 * Admin auth required.
 */

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return constantTimeEqual(token, process.env.ADMIN_AUTH_TOKEN);
}

interface DumpEntry {
  key: string;
  record: PledgeRecord | unknown;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }

  try {
    // Scan all keys via the KEYS command. Fine at our scale (a few dozen
    // records at most). For larger deployments use SCAN with cursors.
    const [liveKeys, pendingKeys] = await Promise.all([
      redis.keys("pledger:*"),
      redis.keys("pending:*"),
    ]);

    // Fetch values for each key in parallel.
    const live: DumpEntry[] = await Promise.all(
      liveKeys.map(async (key) => ({
        key,
        record: safeParse<PledgeRecord | null>(await redis.get<string>(key), null),
      }))
    );

    const pending: DumpEntry[] = await Promise.all(
      pendingKeys.map(async (key) => ({
        key,
        record: safeParse<PledgeRecord | null>(await redis.get<string>(key), null),
      }))
    );

    // The denormalised list used by /pledgers wall
    const listRaw = await redis.lrange<string>("pledgers:list", 0, -1);
    const listEntries = (listRaw || []).map((raw) => safeParse<PledgeRecord | null>(raw, null));

    // Counter values
    const [countRaw, totalRaw] = await Promise.all([
      redis.get<number>("pledgers:count"),
      redis.get<number>("pledgers:total_pledged"),
    ]);

    return NextResponse.json({
      summary: {
        liveCount: live.length,
        pendingCount: pending.length,
        listLength: listEntries.length,
        counterCount: countRaw ?? 0,
        counterTotalPledged: totalRaw ?? 0,
      },
      live,
      pending,
      listEntries,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to dump pledges", details: String(err) },
      { status: 500 }
    );
  }
}
