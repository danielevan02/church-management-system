import "server-only";

import type { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const userListSelect = {
  id: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  member: {
    select: { id: true, fullName: true, photoUrl: true },
  },
} as const satisfies Prisma.UserSelect;

export type UserListItem = Prisma.UserGetPayload<{
  select: typeof userListSelect;
}>;

export type UserFilters = {
  role?: Role;
  isActive?: boolean;
  search?: string;
};

export async function listUsers(opts?: { filters?: UserFilters }) {
  const where: Prisma.UserWhereInput = {};
  const f = opts?.filters;
  if (f?.role) where.role = f.role;
  if (f?.isActive !== undefined) where.isActive = f.isActive;
  if (f?.search) {
    const q = f.search.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { member: { fullName: { contains: q, mode: "insensitive" } } },
    ];
  }

  return prisma.user.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: userListSelect,
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      ...userListSelect,
      memberId: true,
    },
  });
}

export async function isEmailTaken(email: string, exceptId?: string) {
  const found = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!found) return false;
  return exceptId ? found.id !== exceptId : true;
}

export async function isMemberLinked(memberId: string, exceptUserId?: string) {
  const found = await prisma.user.findFirst({
    where: { memberId },
    select: { id: true },
  });
  if (!found) return false;
  return exceptUserId ? found.id !== exceptUserId : true;
}
