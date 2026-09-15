import "server-only";

/**
 * Sliding-window limiters for the endpoints that put a paid model behind a
 * button.
 *
 * WHAT THIS IS NOT: a guarantee. A window lives in the process, and Vercel
 * runs several of them, so a determined caller spread across instances gets
 * roughly `limit x instances`. It is a cost brake, not a security boundary.
 *
 * WHY IT IS STILL IN MEMORY: the alternative is a write to Postgres on every
 * message, which for a single church is a lot of machinery for a handful of
 * callers an hour. The honest upgrade path, once one of these endpoints costs
 * real money — or once it is opened to every logged-in member rather than the
 * few staff who can reach the admin area — is a shared store (Upstash Redis or
 * a `ChatAttempt` table following the `PinAttempt` pattern): swap the guts of
 * `createLimiter` and no caller changes.
 *
 * The hard caps in each caller's Zod schema are the part that always holds,
 * because they do not depend on any shared state.
 */

type Window = { limit: number; windowMs: number };

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * Bounded so a stream of unique keys cannot grow a map without limit. Evicting
 * the oldest entry is safe: the worst case is that one caller's window resets
 * early, which is the same outcome as an instance restart.
 */
const MAX_TRACKED_KEYS = 5_000;

function createLimiter(windows: readonly Window[]) {
  const longestWindowMs = Math.max(...windows.map((w) => w.windowMs));
  /** key -> request timestamps, newest last. */
  const hits = new Map<string, number[]>();

  function sweep(now: number) {
    for (const [key, stamps] of hits) {
      const live = stamps.filter((s) => now - s < longestWindowMs);
      if (live.length) hits.set(key, live);
      else hits.delete(key);
    }
  }

  return function check(key: string): RateLimitResult {
    const now = Date.now();

    // Cheap amortised cleanup — every ~64th call, rather than a timer that
    // would keep a serverless instance warm for no reason.
    if (hits.size > 0 && Math.random() < 1 / 64) sweep(now);

    const stamps = (hits.get(key) ?? []).filter(
      (s) => now - s < longestWindowMs,
    );

    for (const { limit, windowMs } of windows) {
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
    if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
      const oldestKey = hits.keys().next().value;
      if (oldestKey !== undefined) hits.delete(oldestKey);
    }
    hits.set(key, stamps);

    return { ok: true };
  };
}

/** A visitor asking questions, not a script. Both windows must pass. */
const publicLimiter = createLimiter([
  { limit: 6, windowMs: 60_000 }, // burst
  { limit: 40, windowMs: 60 * 60_000 }, // sustained
]);

/**
 * Staff drafting a warta, keyed by user id rather than IP — a secretariat
 * behind one office NAT must not throttle itself.
 *
 * Roomier than the public window because the caller is authenticated, holds
 * ADMIN or STAFF, and a real drafting session is several regenerations in a
 * row. What this catches is a stuck retry loop, not an attacker; a staff
 * account that could abuse this could also just delete the members table.
 */
const staffDraftLimiter = createLimiter([
  { limit: 10, windowMs: 60_000 },
  { limit: 80, windowMs: 60 * 60_000 },
]);

/** The public landing-page assistant, keyed by caller IP. */
export function checkRateLimit(ip: string): RateLimitResult {
  return publicLimiter(ip);
}

/** The admin drafting copilot, keyed by `session.user.id`. */
export function checkStaffDraftLimit(userId: string): RateLimitResult {
  return staffDraftLimiter(userId);
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
