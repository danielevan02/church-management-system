import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  hasAtLeastRole,
  hasRole,
  requireRole,
} from "./permissions";

describe("hasRole", () => {
  it("returns true when role is in allowed list", () => {
    expect(hasRole("ADMIN", ["ADMIN", "STAFF"])).toBe(true);
  });

  it("returns false when role is not in allowed list", () => {
    expect(hasRole("MEMBER", ["ADMIN", "STAFF"])).toBe(false);
  });
});

describe("hasAtLeastRole", () => {
  it("ADMIN >= STAFF", () => {
    expect(hasAtLeastRole("ADMIN", "STAFF")).toBe(true);
  });

  it("STAFF >= STAFF", () => {
    expect(hasAtLeastRole("STAFF", "STAFF")).toBe(true);
  });

  it("LEADER < STAFF", () => {
    expect(hasAtLeastRole("LEADER", "STAFF")).toBe(false);
  });

  it("MEMBER < ADMIN", () => {
    expect(hasAtLeastRole("MEMBER", "ADMIN")).toBe(false);
  });
});

describe("requireRole", () => {
  it("does not throw for an allowed role", () => {
    expect(() => requireRole("ADMIN", ["ADMIN", "STAFF"])).not.toThrow();
  });

  it("throws AuthorizationError for a non-allowed role", () => {
    expect(() => requireRole("MEMBER", ["ADMIN", "STAFF"])).toThrow(
      AuthorizationError,
    );
  });

  it("throws when role is undefined", () => {
    expect(() => requireRole(undefined, ["ADMIN"])).toThrow(
      AuthorizationError,
    );
  });
});
