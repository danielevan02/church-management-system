import "server-only";

import { prisma } from "@/lib/prisma";

export async function listHouseholds() {
  return prisma.household.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: { where: { deletedAt: null } } } },
    },
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
