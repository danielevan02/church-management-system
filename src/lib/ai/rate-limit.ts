import "server-only";

/**
 * A per-IP sliding window for the public assistant endpoint.
 *
 * WHAT THIS IS NOT: a guarantee. The window lives in the process, and Vercel
 * runs several of them, so a determined caller spread across instances gets
 * roughly `limit x instances`. It is a cost brake, not a security boundary.
 *
 * WHY IT IS STILL IN MEMORY: the alternative is a write to Postgres on every
 * message, which for a single church's public page is a lot of machinery for a
 * handful of visitors an hour. The honest upgrade path, once this endpoint
 * costs real money, is a shared store (Upstash Redis or a `ChatAttempt` table
 * following the `PinAttempt` pattern) — swap the two functions below and no
 * caller changes.
 *
 * The hard caps in the route's Zod schema are the part that always holds,
 * because they do not depend on any shared state.
 */

type Window = { limit: number; windowMs: number };

/** A visitor asking questions, not a script. Both windows must pass. */
const WINDOWS: readonly Window[] = [
  { limit: 6, windowMs: 60_000 }, // burst
  { limit: 40, windowMs: 60 * 60_000 }, // sustained
];

const LONGEST_WINDOW_MS = Math.max(...WINDOWS.map((w) => w.windowMs));

/** IP -> request timestamps, newest last. */
const hits = new Map<string, number[]>();

/**
 * Bounded so a stream of unique IPs cannot grow the map without limit. Evicting
 * the oldest entry is safe: the worst case is that one caller's window resets
 * early, which is the same outcome as an instance restart.
 */
const MAX_TRACKED_IPS = 5_000;

function sweep(now: number) {
  for (const [ip, stamps] of hits) {
    const live = stamps.filter((s) => now - s < LONGEST_WINDOW_MS);
    if (live.length) hits.set(ip, live);
    else hits.delete(ip);
  }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  // Cheap amortised cleanup — every ~64th call, rather than a timer that would
  // keep a serverless instance warm for no reason.
  if (hits.size > 0 && Math.random() < 1 / 64) sweep(now);

  const stamps = (hits.get(ip) ?? []).filter(
    (s) => now - s < LONGEST_WINDOW_MS,
  );

  for (const { limit, windowMs } of WINDOWS) {
    const inWindow = stamps.filter((s) => now - s < windowMs);
    if (inWindow.length >= limit) {
      const oldest = inWindow[0];
      return {
        ok: false,
        retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      };
    }
  }

  stamps.push(now);
  if (!hits.has(ip) && hits.size >= MAX_TRACKED_IPS) {
    const oldestKey = hits.keys().next().value;
    if (oldestKey !== undefined) hits.delete(oldestKey);
  }
  hits.set(ip, stamps);

  return { ok: true };
}

/**
 * The caller's address, as far as it can be trusted.
 *
 * `x-forwarded-for` is client-settable in general; on Vercel the platform
 * rewrites it, so the FIRST entry is the real peer. Falling back to a single
 * bucket for unknown callers is deliberate — an unidentifiable flood should be
 * throttled together rather than waved through.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "unknown";
}
