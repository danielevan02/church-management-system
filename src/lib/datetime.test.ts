import { describe, expect, it } from "vitest";

import {
  formatJakarta,
  parseJakartaInput,
  toJakartaDateInput,
  toJakartaInput,
} from "./datetime";

describe("formatJakarta", () => {
  it("formats UTC midnight as Jakarta 07:00 (UTC+7)", () => {
    const utcMidnight = new Date("2026-05-01T00:00:00Z");
    expect(formatJakarta(utcMidnight, "HH:mm")).toBe("07:00");
  });

  it("formats UTC date with Jakarta wall-clock day", () => {
    // 2026-05-01 18:30 UTC = 2026-05-02 01:30 Jakarta
    const date = new Date("2026-05-01T18:30:00Z");
    expect(formatJakarta(date, "yyyy-MM-dd")).toBe("2026-05-02");
  });
});

describe("parseJakartaInput", () => {
  it("returns null for empty input", () => {
    expect(parseJakartaInput("")).toBeNull();
    expect(parseJakartaInput("   ")).toBeNull();
  });

  it("parses Jakarta wall-clock string to corresponding UTC Date", () => {
    // 2026-05-01 09:00 Jakarta = 2026-05-01 02:00 UTC
    const result = parseJakartaInput("2026-05-01T09:00");
    expect(result?.toISOString()).toBe("2026-05-01T02:00:00.000Z");
  });

  it("returns null on garbage input", () => {
    expect(parseJakartaInput("not-a-date")).toBeNull();
  });
});

describe("toJakartaInput / toJakartaDateInput round-trip", () => {
  it("toJakartaInput is the inverse of parseJakartaInput", () => {
    const wall = "2026-05-01T09:00";
    const utc = parseJakartaInput(wall);
    expect(utc).not.toBeNull();
    expect(toJakartaInput(utc!)).toBe(wall);
  });

  it("toJakartaDateInput returns yyyy-MM-dd in Jakarta zone", () => {
    // 2026-05-01 22:00 UTC = 2026-05-02 05:00 Jakarta
    const date = new Date("2026-05-01T22:00:00Z");
    expect(toJakartaDateInput(date)).toBe("2026-05-02");
  });
});
