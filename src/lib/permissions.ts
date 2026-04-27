import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  role: Role;
  memberId: string | null;
};

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  STAFF: 3,
  LEADER: 2,
  MEMBER: 1,
};

export function hasRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}

export function hasAtLeastRole(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export class AuthorizationError extends Error {
  constructor(message = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function requireRole(
  role: Role | undefined,
  allowed: readonly Role[],
): asserts role is Role {
  if (!role || !hasRole(role, allowed)) {
    throw new AuthorizationError();
  }
}

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
