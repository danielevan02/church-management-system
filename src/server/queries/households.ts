import "server-only";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

import type { Prisma } from "@prisma/client";

export async function listHouseholds(opts?: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});

  const where: Prisma.HouseholdWhereInput = { deletedAt: null };
  const q = opts?.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.household.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        _count: { select: { members: { where: { deletedAt: null } } } },
      },
    }),
    prisma.household.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function listAllHouseholds() {
  return prisma.household.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getHousehold(id: string) {
  return prisma.household.findFirst({
    where: { id, deletedAt: null },
    include: {
      members: {
        where: { deletedAt: null },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true,
          householdRole: true,
          phone: true,
          email: true,
          status: true,
        },
      },
    },
  });
}

export async function listMembersAvailableForHousehold(currentHouseholdId?: string) {
  return prisma.member.findMany({
    where: {
      deletedAt: null,
      OR: currentHouseholdId
        ? [{ householdId: null }, { householdId: currentHouseholdId }]
        : [{ householdId: null }],
    },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, phone: true },
  });
}
