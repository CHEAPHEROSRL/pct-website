/**
 * safeParse<T>
 *
 * Safely extract a JSON value from Upstash Redis. Covers three realities:
 *
 * 1. Upstash sometimes returns strings, sometimes auto-deserialised objects,
 *    depending on what was stored and how. Code that always calls JSON.parse
 *    on the result will crash when Upstash hands back an already-parsed object.
 * 2. Keys may hold malformed JSON written by an older version of the code,
 *    a failed partial write, or a manual Upstash console edit.
 * 3. Keys may be missing entirely (null / undefined), which is normal and
 *    should not crash the caller.
 *
 * This helper collapses all three cases into: return the fallback if we can't
 * give back a valid T.
 *
 * Use when you're fetching an admin settings blob, a pledge record, a cached
 * JSON object, etc. — anywhere a crash on parse would 500 a public route.
 */
export function safeParse<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  // Upstash already deserialised it for us
  if (typeof raw === "object") return raw as T;
  // Non-string primitive (number, boolean) — treat as malformed
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
