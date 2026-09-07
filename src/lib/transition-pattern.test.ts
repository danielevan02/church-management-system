import { describe, expect, it } from "vitest";

import { pickTransitionPattern } from "./transition-pattern";

describe("pickTransitionPattern", () => {
  it("does not animate the first screen", () => {
    expect(pickTransitionPattern(null, "/me/dashboard")).toBeNull();
  });

  it("does not animate when the path is unchanged", () => {
    expect(pickTransitionPattern("/me/giving", "/me/giving")).toBeNull();
  });

  it("goes forward on the shared axis when the route deepens", () => {
    expect(pickTransitionPattern("/admin/members", "/admin/members/abc123")).toBe(
      "m3-axis-forward"
    );
  });

  it("goes backward on the shared axis when the route shallows", () => {
    expect(pickTransitionPattern("/admin/members/abc123", "/admin/members")).toBe(
      "m3-axis-backward"
    );
  });

  it("fades through between siblings with no relationship", () => {
    expect(pickTransitionPattern("/me/dashboard", "/me/giving")).toBe(
      "m3-fade-through"
    );
  });

  it("fades through between unrelated branches at equal depth", () => {
    expect(
      pickTransitionPattern("/admin/attendance/reports", "/admin/giving/funds")
    ).toBe("m3-fade-through");
  });

  it("ignores trailing slashes when comparing depth", () => {
    expect(pickTransitionPattern("/me/events/", "/me/events")).toBeNull();
  });

  it("treats a deeper nested detail as forward, not a fade", () => {
    expect(
      pickTransitionPattern(
        "/admin/cell-groups/g1",
        "/admin/cell-groups/g1/reports/new"
      )
    ).toBe("m3-axis-forward");
  });
});
