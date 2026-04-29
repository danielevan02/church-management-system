import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

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

export async function listFunds(opts?: {
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.FundWhereInput = opts?.onlyActive ? { isActive: true } : {};

  const [items, total] = await Promise.all([
    prisma.fund.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      skip,
      take,
      select: fundListSelect,
    }),
    prisma.fund.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function listAllFunds(opts?: { onlyActive?: boolean }) {
  return prisma.fund.findMany({
    where: opts?.onlyActive ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: fundListSelect,
  });
}

export async function getFund(id: string) {
  return prisma.fund.findUnique({ where: { id } });
}
