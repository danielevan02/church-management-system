import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  role: Role;
  memberId: string | null;
};

const ROLE_RANK: Record<Role, number> = {
  ADMIN: 4,
  STAFF: 3,
  LEADER: 2,
  MEMBER: 1,
};

/**
 * Exact-match check: is `role` one of the allowed roles? Use when you want
 * to allow a specific set without any hierarchy implication, e.g.
 * `hasRole(role, ["ADMIN", "STAFF"])`.
 */
export function hasRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}

/**
 * Hierarchical check: is `role` at least as privileged as `minimum`?
 * Order: ADMIN > STAFF > LEADER > MEMBER. Use when "this and anyone above"
 * is the natural rule, e.g. `hasAtLeastRole(role, "STAFF")` allows ADMIN+STAFF.
 */
export function hasAtLeastRole(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export class AuthorizationError extends Error {
  constructor(message = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Throws AuthorizationError if `role` is missing or not in `allowed`.
 * Acts as a TypeScript assertion — code after the call sees `role: Role`
 * (non-undefined). Wrap in try/catch at the action boundary to convert
 * the throw into a `{ ok: false, error: "FORBIDDEN" }` Result.
 */
export function requireRole(
  role: Role | undefined,
  allowed: readonly Role[],
): asserts role is Role {
  if (!role || !hasRole(role, allowed)) {
    throw new AuthorizationError();
  }
}

/**
 * Cell-group scoped permission. STAFF and ADMIN see every group;
 * a LEADER only sees the group they lead. MEMBERs always return false.
 * Use this in actions that mutate or read cell-group internals.
 */
export async function canAccessCellGroup(
  user: SessionUser,
  cellGroupId: string,
): Promise<boolean> {
  if (hasAtLeastRole(user.role, "STAFF")) return true;
  if (user.role !== "LEADER" || !user.memberId) return false;

  const group = await prisma.cellGroup.findUnique({
    where: { id: cellGroupId },
    select: { leaderId: true },
  });
  return group?.leaderId === user.memberId;
}
