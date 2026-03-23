import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { ChallengeRecord, ChallengePublic, PledgeRecord, ChallengeType } from "@/lib/types";
import { sendChallengeStarted, sendChallengeResult } from "@/lib/email";
import crypto from "crypto";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const token = auth.replace("Bearer ", "");
  return token === process.env.ADMIN_AUTH_TOKEN;
}

/** Normalize old records that used targetMiles/startMile/currentMiles */
function normalize(r: ChallengeRecord): ChallengeRecord {
  if (r.targetMiles !== undefined && r.target === undefined) {
    r.target = r.targetMiles;
    r.start = r.startMile ?? 0;
    r.current = r.currentMiles ?? r.start;
    r.unit = r.unit || "mi";
    r.challengeType = r.challengeType || "distance";
  }
  return r;
}

function toPublic(r: ChallengeRecord): ChallengePublic {
  const n = normalize(r);
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    target: n.target,
    start: n.start,
    current: n.current,
    unit: n.unit,
    challengeType: n.challengeType,
    deadline: n.deadline,
    status: n.status,
    commitmentCount: n.commitmentCount,
    createdAt: n.createdAt,
    resolvedAt: n.resolvedAt,
  };
}

async function notifyAllPledgers(redis: Redis, challenge: ChallengeRecord) {
  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );
    const durationHours = Math.round((challenge.deadline - challenge.createdAt) / (1000 * 60 * 60));
    for (const r of records) {
      sendChallengeStarted(r.email, r.name, challenge.title, challenge.target, challenge.unit, durationHours).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to notify pledgers:", err);
  }
}

async function notifyChallengeResult(redis: Redis, challenge: ChallengeRecord, succeeded: boolean) {
  try {
    const rawList = await redis.lrange<string>("pledgers:list", 0, -1);
    const records: PledgeRecord[] = (rawList || []).map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    // Get commitments to find boost amounts per pledger
    const commitments = succeeded
      ? await redis.lrange<string>(`challenge:${challenge.id}:commitments`, 0, -1)
      : [];
    const boostMap = new Map<string, number>();
    for (const raw of commitments || []) {
      const c = typeof raw === "string" ? JSON.parse(raw) : raw;
      boostMap.set(c.pledgerId, c.boostAmount);
    }

    for (const r of records) {
      const boostApplied = boostMap.get(r.id) || null;
      sendChallengeResult(r.email, r.name, challenge.title, succeeded, boostApplied).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to notify challenge result:", err);
  }
}

// GET — Get active challenge + recent history (public)
export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ active: null, history: [] });
  }

  try {
    const activeRaw = await redis.get<string>("challenge:active");
    let active: ChallengePublic | null = null;

    if (activeRaw) {
      const record: ChallengeRecord =
        typeof activeRaw === "string" ? JSON.parse(activeRaw) : activeRaw;
      active = toPublic(record);
    }

    const historyRaw = await redis.lrange<string>("challenge:history", 0, 9);
    const history: ChallengePublic[] = (historyRaw || []).map((item) => {
      const r: ChallengeRecord =
        typeof item === "string" ? JSON.parse(item) : item;
      return toPublic(r);
    });

    return NextResponse.json(
      { active, history },
      { headers: { "Cache-Control": "s-maxage=10, stale-while-revalidate=20" } }
    );
  } catch (err) {
    console.error("Failed to fetch challenges:", err);
    return NextResponse.json({ active: null, history: [] });
  }
}

// POST — Admin creates a new challenge
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    // Check no active challenge already
    const existing = await redis.get<string>("challenge:active");
    if (existing) {
      return NextResponse.json(
        { error: "A challenge is already active. Resolve it first." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      target,
      start,
      unit,
      challengeType,
      durationHours,
      // Backward compat: accept old field names too
      targetMiles,
      startMile,
    } = body;

    const resolvedChallengeType: ChallengeType = challengeType || "distance";
    const resolvedUnit: string = unit || (resolvedChallengeType === "distance" ? "mi" : resolvedChallengeType === "elevation" ? "ft" : "");
    const resolvedTarget: number = target ?? targetMiles;
    const resolvedStart: number = start ?? startMile ?? (resolvedChallengeType === "location" || resolvedChallengeType === "custom" ? 0 : 0);

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (typeof resolvedTarget !== "number" || resolvedTarget <= 0) {
      return NextResponse.json({ error: "Target must be positive" }, { status: 400 });
    }
    if (typeof resolvedStart !== "number" || resolvedStart < 0) {
      return NextResponse.json({ error: "Start must be >= 0" }, { status: 400 });
    }
    if (typeof durationHours !== "number" || durationHours <= 0 || durationHours > 168) {
      return NextResponse.json({ error: "Duration must be 1-168 hours" }, { status: 400 });
    }

    const id = crypto.randomBytes(8).toString("hex");
    const now = Date.now();

    const record: ChallengeRecord = {
      id,
      title: title.trim().slice(0, 200),
      description: (description || "").trim().slice(0, 500),
      target: resolvedTarget,
      start: resolvedStart,
      current: resolvedStart,
      unit: resolvedUnit,
      challengeType: resolvedChallengeType,
      deadline: now + durationHours * 60 * 60 * 1000,
      status: "active",
      commitmentCount: 0,
      createdAt: now,
      resolvedAt: null,
    };

    await redis.set("challenge:active", JSON.stringify(record));

    // Email all pledgers about the new challenge (fire-and-forget)
    notifyAllPledgers(redis, record).catch(() => {});

    return NextResponse.json({ success: true, challenge: toPublic(record) }, { status: 201 });
  } catch (err) {
    console.error("Failed to create challenge:", err);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}

// PUT — Admin resolves or updates the active challenge
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const activeRaw = await redis.get<string>("challenge:active");
    if (!activeRaw) {
      return NextResponse.json({ error: "No active challenge" }, { status: 404 });
    }

    let record: ChallengeRecord =
      typeof activeRaw === "string" ? JSON.parse(activeRaw) : activeRaw;
    record = normalize(record);

    const body = await req.json();
    const { action, current, currentMiles } = body;

    // Update current progress if provided (accept both new and old field name)
    const resolvedCurrent = current ?? currentMiles;
    if (typeof resolvedCurrent === "number" && resolvedCurrent >= 0) {
      record.current = resolvedCurrent;
    }

    if (action === "succeed" || action === "fail" || action === "cancel") {
      const statusMap: Record<string, "succeeded" | "failed" | "cancelled"> = {
        succeed: "succeeded",
        fail: "failed",
        cancel: "cancelled",
      };
      record.status = statusMap[action];
      record.resolvedAt = Date.now();

      // Email all pledgers about the result (fire-and-forget, before cleanup)
      notifyChallengeResult(redis, record, action === "succeed").catch(() => {});

      // Move to history
      await redis.lpush("challenge:history", JSON.stringify(record));
      await redis.del("challenge:active");

      // If succeeded, apply all pre-committed boosts
      if (action === "succeed") {
        const commitments = await redis.lrange<string>(
          `challenge:${record.id}:commitments`,
          0,
          -1
        );

        for (const raw of commitments || []) {
          const commitment =
            typeof raw === "string" ? JSON.parse(raw) : raw;

          // Get pledger record and apply boost
          const pledgerKey = `pledger:${commitment.pledgerId}`;
          const pledgerRaw = await redis.get<string>(pledgerKey);
          if (!pledgerRaw) continue;

          const pledger =
            typeof pledgerRaw === "string" ? JSON.parse(pledgerRaw) : pledgerRaw;

          const oldTotal = pledger.totalPledge;
          pledger.amount += commitment.boostAmount;
          pledger.totalPledge = (pledger.amount * 2650) / pledger.interval;
          pledger.updatedAt = Date.now();
          pledger.boosts.push({
            challengeId: record.id,
            challengeTitle: record.title,
            addedAmount: commitment.boostAmount,
            addedAt: Date.now(),
          });

          await redis.set(pledgerKey, JSON.stringify(pledger));

          // Update aggregate
          const totalDiff = pledger.totalPledge - oldTotal;
          await redis.incrbyfloat("pledgers:total_pledged", totalDiff);

          // Update list entry
          const list = await redis.lrange<string>("pledgers:list", 0, -1);
          for (let i = 0; i < list.length; i++) {
            const item = typeof list[i] === "string" ? JSON.parse(list[i]) : list[i];
            if (item.id === commitment.pledgerId) {
              await redis.lset("pledgers:list", i, JSON.stringify(pledger));
              break;
            }
          }
        }

        // Clean up commitments
        await redis.del(`challenge:${record.id}:commitments`);
      }

      return NextResponse.json({
        success: true,
        challenge: toPublic(record),
        boostsApplied: action === "succeed" ? record.commitmentCount : 0,
      });
    }

    // Just updating current progress (no resolution)
    await redis.set("challenge:active", JSON.stringify(record));
    return NextResponse.json({ success: true, challenge: toPublic(record) });
  } catch (err) {
    console.error("Failed to update challenge:", err);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}
