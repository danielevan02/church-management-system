import { formatInTimeZone } from "date-fns-tz";
import { describe, expect, it } from "vitest";

import {
  SERVICE_SLOTS,
  countdownSchedule,
  nextOccurrence,
  nextService,
} from "./campus";

const jkt = (d: Date) => formatInTimeZone(d, "Asia/Jakarta", "EEE HH:mm");

describe("nextOccurrence", () => {
  it("resolves each slot to its Jakarta wall-clock time", () => {
    // Wed 2026-09-09 10:00 Jakarta (03:00 UTC)
    const now = new Date("2026-09-09T03:00:00Z");
    const byKey = Object.fromEntries(
      SERVICE_SLOTS.map((s) => [s.key, jkt(nextOccurrence(s, now))]),
    );
    expect(byKey).toEqual({
      umumEarly: "Sun 07:00",
      umumLate: "Sun 10:00",
      tyog: "Sun 10:00",
      sekolahMinggu: "Sun 10:00",
      doa: "Wed 19:00",
    });
  });

  it("skips to next week once a slot has started", () => {
    const slot = SERVICE_SLOTS.find((s) => s.key === "umumLate")!;
    // Sun 09:30 Jakarta — still ahead
    const before = nextOccurrence(slot, new Date("2026-09-13T02:30:00Z"));
    expect(before.toISOString()).toBe("2026-09-13T03:00:00.000Z");
    // Sun 10:30 Jakarta — rolled to the following Sunday
    const after = nextOccurrence(slot, new Date("2026-09-13T03:30:00Z"));
    expect(after.toISOString()).toBe("2026-09-20T03:00:00.000Z");
  });

  it("resolves the midweek slot on its own weekday", () => {
    const doa = SERVICE_SLOTS.find((s) => s.key === "doa")!;
    // Wed 10:00 Jakarta — the same day, later on
    expect(jkt(nextOccurrence(doa, new Date("2026-09-09T03:00:00Z")))).toBe(
      "Wed 19:00",
    );
    // Wed 20:00 Jakarta — already gone, so next week
    const next = nextOccurrence(doa, new Date("2026-09-09T13:00:00Z"));
    expect(next.toISOString()).toBe("2026-09-16T12:00:00.000Z");
  });

  it("uses the Jakarta calendar day, not the UTC one", () => {
    // 17:01 UTC Sat = 00:01 Sunday in Jakarta. A UTC-day implementation would
    // still think it is Saturday and return Saturday 18:00 — i.e. the past.
    const slot = SERVICE_SLOTS.find((s) => s.key === "umumEarly")!;
    const at = nextOccurrence(slot, new Date("2026-09-12T17:01:00Z"));
    expect(jkt(at)).toBe("Sun 07:00");
    expect(at.toISOString()).toBe("2026-09-13T00:00:00.000Z");
  });
});

describe("nextService", () => {
  // Times are UTC; the comment gives the Jakarta wall clock. Cases marked
  // "running" are the ones that used to be wrong: the reported slot is the one
  // in progress at that moment, not the next one after it.
  it.each([
    ["2026-09-09T03:00:00Z", "doa"], // Wed 10:00 -> prayer fellowship tonight
    ["2026-09-09T12:27:00Z", "doa"], // Wed 19:27 -> running
    ["2026-09-09T13:31:00Z", "umumEarly"], // Wed 20:31 -> over, so Sunday
    ["2026-09-12T08:00:00Z", "umumEarly"], // Sat 15:00 -> Sunday morning
    ["2026-09-13T00:30:00Z", "umumEarly"], // Sun 07:30 -> running
    ["2026-09-13T02:00:00Z", "umumLate"], // Sun 09:00 -> between the two
    ["2026-09-13T03:30:00Z", "umumLate"], // Sun 10:30 -> running
    ["2026-09-13T05:00:00Z", "doa"], // Sun 12:00 -> over, so Wednesday
  ])("picks the running or soonest countdown slot from %s", (iso, expected) => {
    expect(nextService(new Date(iso)).slotKey).toBe(expected);
  });

  it("never names a slot that shares its instant with another", () => {
    // TYOG and Sunday School both start at 10:00 alongside Ibadah Umum II.
    // If any of them were countdown-eligible the hero would pick one of three
    // simultaneous services by sort order and call it "next".
    const counted = SERVICE_SLOTS.filter((s) => s.countdown).map((s) => s.key);
    expect(counted).not.toContain("tyog");
    expect(counted).not.toContain("sekolahMinggu");
    const instants = counted.map((k) =>
      nextOccurrence(SERVICE_SLOTS.find((s) => s.key === k)!, new Date("2026-09-09T03:00:00Z"))
        .toISOString(),
    );
    expect(new Set(instants).size).toBe(instants.length);
  });

  it("never returns a gathering that has already finished", () => {
    // Deliberately not "never in the past": a service that has started is
    // reported so the hero can say "in progress". What must never happen is
    // reporting one that is over.
    for (let h = 0; h < 24 * 7; h++) {
      const now = new Date(Date.UTC(2026, 8, 9) + h * 3_600_000);
      const ns = nextService(now);
      expect(new Date(ns.endsAtIso).getTime()).toBeGreaterThan(now.getTime());
    }
  });
});

describe("in-progress services", () => {
  // Wed 19:27 Jakarta = 12:27 UTC. Persekutuan Doa runs 19:00-20:30.
  const midPrayer = new Date("2026-09-09T12:27:00Z");

  it("reports the running occurrence rather than next week's", () => {
    const doa = countdownSchedule(midPrayer).find((r) => r.slotKey === "doa")!;
    expect(doa.startsAtIso).toBe("2026-09-09T12:00:00.000Z");
    expect(new Date(doa.startsAtIso).getTime()).toBeLessThan(
      midPrayer.getTime(),
    );
    expect(new Date(doa.endsAtIso).getTime()).toBeGreaterThan(
      midPrayer.getTime(),
    );
  });

  it("names the running service as the next gathering", () => {
    expect(nextService(midPrayer).slotKey).toBe("doa");
  });

  it("rolls forward once it has finished", () => {
    // Wed 20:31 Jakarta — one minute after the 90-minute service ends.
    const after = new Date("2026-09-09T13:31:00Z");
    const doa = countdownSchedule(after).find((r) => r.slotKey === "doa")!;
    expect(doa.startsAtIso).toBe("2026-09-16T12:00:00.000Z");
    expect(nextService(after).slotKey).toBe("umumEarly");
  });

  it("keeps every reported occurrence either running or ahead", () => {
    for (let h = 0; h < 24 * 7; h++) {
      const now = new Date(Date.UTC(2026, 8, 9) + h * 3_600_000);
      for (const row of countdownSchedule(now)) {
        expect(new Date(row.endsAtIso).getTime()).toBeGreaterThan(
          now.getTime(),
        );
      }
    }
  });
});

describe("countdownSchedule", () => {
  it("returns the countdown slots in chronological order", () => {
    // Wed 10:00 Jakarta: nothing is running, so every row is strictly ahead.
    const rows = countdownSchedule(new Date("2026-09-09T03:00:00Z"));
    expect(rows.map((r) => r.slotKey)).toEqual([
      "doa",
      "umumEarly",
      "umumLate",
    ]);
    const times = rows.map((r) => new Date(r.startsAtIso).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
