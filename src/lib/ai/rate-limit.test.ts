import { afterEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit, checkStaffDraftLimit, clientIp } from "./rate-limit";

/** Each test gets its own bucket — the window store is module-level state. */
let seq = 0;
const freshIp = () => `10.0.0.${(seq += 1)}`;

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows a normal burst and blocks the one after it", () => {
    const ip = freshIp();
    for (let i = 0; i < 6; i += 1) {
      expect(checkRateLimit(ip).ok, `request ${i + 1}`).toBe(true);
    }
    expect(checkRateLimit(ip).ok).toBe(false);
  });

  it("reports how long to wait, in whole seconds within the window", () => {
    const ip = freshIp();
    for (let i = 0; i < 6; i += 1) checkRateLimit(ip);

    const blocked = checkRateLimit(ip);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) return;
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(60);
  });

  it("keeps one caller's flood away from everybody else", () => {
    const flooder = freshIp();
    const bystander = freshIp();
    for (let i = 0; i < 10; i += 1) checkRateLimit(flooder);

    expect(checkRateLimit(flooder).ok).toBe(false);
    expect(checkRateLimit(bystander).ok).toBe(true);
  });

  it("lets the burst window roll off", () => {
    vi.useFakeTimers();
    const ip = freshIp();
    for (let i = 0; i < 6; i += 1) checkRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit(ip).ok).toBe(true);
  });

  it("still holds the hourly window once the burst window stops applying", () => {
    vi.useFakeTimers();
    const ip = freshIp();
    // Spaced 80s apart, so the 6-per-minute burst window never trips and only
    // the sustained window can refuse anything. 40 x 80s stays inside the hour.
    for (let i = 0; i < 40; i += 1) {
      expect(checkRateLimit(ip).ok, `request ${i + 1}`).toBe(true);
      vi.advanceTimersByTime(80_000);
    }
    const fortyFirstWithinTheHour = checkRateLimit(ip);
    expect(fortyFirstWithinTheHour.ok).toBe(false);
  });
});

describe("checkStaffDraftLimit", () => {
  it("keeps its own window, so public traffic cannot throttle staff", () => {
    const ip = freshIp();
    for (let i = 0; i < 6; i += 1) checkRateLimit(ip);
    expect(checkRateLimit(ip).ok).toBe(false);

    // Same string, different bucket.
    expect(checkStaffDraftLimit(ip).ok).toBe(true);
  });

  it("allows a real drafting session and stops a stuck retry loop", () => {
    const userId = `user_${(seq += 1)}`;
    for (let i = 0; i < 10; i += 1) {
      expect(checkStaffDraftLimit(userId).ok, `draft ${i + 1}`).toBe(true);
    }
    expect(checkStaffDraftLimit(userId).ok).toBe(false);
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.test/api/chat", { headers });

  it("takes the first entry of x-forwarded-for", () => {
    expect(
      clientIp(req({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" })),
    ).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("buckets unidentifiable callers together rather than exempting them", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
