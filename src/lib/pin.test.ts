import { describe, expect, it } from "vitest";

import { isValidPinFormat } from "./pin";

describe("isValidPinFormat", () => {
  it("accepts 4-digit PIN", () => {
    expect(isValidPinFormat("1234")).toBe(true);
  });

  it("accepts 6-digit PIN", () => {
    expect(isValidPinFormat("123456")).toBe(true);
  });

  it("rejects PIN shorter than 4 digits", () => {
    expect(isValidPinFormat("123")).toBe(false);
  });

  it("rejects PIN longer than 6 digits", () => {
    expect(isValidPinFormat("1234567")).toBe(false);
  });

  it("rejects PIN with letters", () => {
    expect(isValidPinFormat("12a4")).toBe(false);
  });

  it("rejects PIN with whitespace", () => {
    expect(isValidPinFormat("12 34")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidPinFormat("")).toBe(false);
  });
});
