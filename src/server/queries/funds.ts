import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const fundListSelect = {
  id: true,
  name: true,
  category: true,
  description: true,
  isActive: true,
  _count: { select: { givings: true } },
} as const satisfies Prisma.FundSelect;

export type FundListItem = Prisma.FundGetPayload<{
  select: typeof fundListSelect;
}>;

export async function listFunds(opts?: { onlyActive?: boolean }) {
  return prisma.fund.findMany({
    where: opts?.onlyActive ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: fundListSelect,
  });
}

export async function getFund(id: string) {
  return prisma.fund.findUnique({ where: { id } });
}
