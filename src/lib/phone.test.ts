import { describe, expect, it } from "vitest";

import { normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("converts leading 0 to +62 (Indonesian local prefix)", () => {
    expect(normalizePhone("081234567890")).toBe("+6281234567890");
  });

  it("preserves a fully valid E.164 number", () => {
    expect(normalizePhone("+6281234567890")).toBe("+6281234567890");
  });

  it("adds + when input begins with 62", () => {
    expect(normalizePhone("6281234567890")).toBe("+6281234567890");
  });

  it("prepends +62 when input begins with 8 (without country code)", () => {
    expect(normalizePhone("81234567890")).toBe("+6281234567890");
  });

  it("strips spaces and dashes before normalizing", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("+6281234567890");
    expect(normalizePhone("+62 812 3456 7890")).toBe("+6281234567890");
  });
});
