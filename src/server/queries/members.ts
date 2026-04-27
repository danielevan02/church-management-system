import "server-only";

import type { Gender, MemberStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type MemberFilters = {
  q?: string;
  status?: MemberStatus;
  gender?: Gender;
  cellGroupId?: string;
  householdId?: string;
};

export type MemberSort =
  | "name_asc"
  | "name_desc"
  | "joined_desc"
  | "joined_asc"
  | "created_desc";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

const memberListSelect = {
  id: true,
  fullName: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  gender: true,
  status: true,
  photoUrl: true,
  joinedAt: true,
  household: { select: { id: true, name: true } },
} as const satisfies Prisma.MemberSelect;

export type MemberListItem = Prisma.MemberGetPayload<{
  select: typeof memberListSelect;
}>;

export async function listMembers(opts: {
  filters?: MemberFilters;
  page?: number;
  pageSize?: number;
  sort?: MemberSort;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, opts.pageSize ?? DEFAULT_PAGE_SIZE));
  const filters = opts.filters ?? {};
  const sort = opts.sort ?? "name_asc";

  const where: Prisma.MemberWhereInput = { deletedAt: null };

  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: "insensitive" } },
      { phone: { contains: filters.q } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.gender) where.gender = filters.gender;
  if (filters.householdId) where.householdId = filters.householdId;
  if (filters.cellGroupId) {
    where.cellGroupMembers = {
      some: { cellGroupId: filters.cellGroupId, leftAt: null },
    };
  }

  const orderBy: Prisma.MemberOrderByWithRelationInput =
    sort === "name_desc"
      ? { fullName: "desc" }
      : sort === "joined_desc"
        ? { joinedAt: "desc" }
        : sort === "joined_asc"
          ? { joinedAt: "asc" }
          : sort === "created_desc"
            ? { createdAt: "desc" }
            : { fullName: "asc" };

  const [items, total] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: memberListSelect,
    }),
    prisma.member.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMember(id: string) {
  return prisma.member.findFirst({
    where: { id, deletedAt: null },
    include: {
      household: true,
      cellGroupMembers: {
        where: { leftAt: null },
        include: { cellGroup: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function getMemberCounts() {
  const [active, total, visitor] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { deletedAt: null, status: "VISITOR" } }),
  ]);
  return { active, total, visitor };
}
