import "server-only";

import type { GivingMethod, GivingStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type GivingFilters = {
  fundId?: string;
  memberId?: string;
  status?: GivingStatus;
  method?: GivingMethod;
  from?: Date;
  to?: Date;
};

export const GIVING_PAGE_SIZE = 25;

const givingListSelect = {
  id: true,
  amount: true,
  currency: true,
  method: true,
  status: true,
  receivedAt: true,
  giverName: true,
  giverPhone: true,
  externalRef: true,
  notes: true,
  fund: { select: { id: true, name: true, category: true } },
  member: { select: { id: true, fullName: true, phone: true } },
} as const satisfies Prisma.GivingRecordSelect;

export type GivingListItem = Prisma.GivingRecordGetPayload<{
  select: typeof givingListSelect;
}>;

function buildWhere(filters: GivingFilters): Prisma.GivingRecordWhereInput {
  const where: Prisma.GivingRecordWhereInput = {};
  if (filters.fundId) where.fundId = filters.fundId;
  if (filters.memberId) where.memberId = filters.memberId;
  if (filters.status) where.status = filters.status;
  if (filters.method) where.method = filters.method;
  if (filters.from || filters.to) {
    where.receivedAt = {};
    if (filters.from) where.receivedAt.gte = filters.from;
    if (filters.to) where.receivedAt.lte = filters.to;
  }
  return where;
}

export async function listGiving(opts: {
  filters?: GivingFilters;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.max(1, opts.pageSize ?? GIVING_PAGE_SIZE);
  const filters = opts.filters ?? {};
  const where = buildWhere(filters);

  const [items, total, sumResult] = await Promise.all([
    prisma.givingRecord.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: givingListSelect,
    }),
    prisma.givingRecord.count({ where }),
    prisma.givingRecord.aggregate({
      where: { ...where, status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ]);

  return {
    items,
    total,
    sum: sumResult._sum.amount ?? "0",
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getGiving(id: string) {
  return prisma.givingRecord.findUnique({
    where: { id },
    include: {
      fund: { select: { id: true, name: true, category: true } },
      member: { select: { id: true, fullName: true, phone: true } },
    },
  });
}

export async function getGivingForMember(memberId: string, limit = 50) {
  const [items, sumYear, sumAll] = await Promise.all([
    prisma.givingRecord.findMany({
      where: { memberId, status: "COMPLETED" },
      orderBy: { receivedAt: "desc" },
      take: limit,
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        receivedAt: true,
        fund: { select: { id: true, name: true, category: true } },
      },
    }),
    prisma.givingRecord.aggregate({
      where: {
        memberId,
        status: "COMPLETED",
        receivedAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
      _sum: { amount: true },
    }),
    prisma.givingRecord.aggregate({
      where: { memberId, status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ]);

  return {
    items,
    totalThisYear: sumYear._sum.amount ?? "0",
    totalAllTime: sumAll._sum.amount ?? "0",
  };
}

/** Last 12 months of completed giving, grouped by month. */
export async function getMonthlyGivingTrend(months = 12) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const records = await prisma.givingRecord.findMany({
    where: { status: "COMPLETED", receivedAt: { gte: start } },
    select: { receivedAt: true, amount: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < months; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    buckets.set(monthKey(d), 0);
  }

  for (const r of records) {
    const key = monthKey(r.receivedAt);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(r.amount.toString()));
    }
  }

  return Array.from(buckets.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Sum of completed giving per fund within a date range (defaults to current month). */
export async function getFundBreakdown(opts?: { from?: Date; to?: Date }) {
  const now = new Date();
  const from = opts?.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const to =
    opts?.to ??
    new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const grouped = await prisma.givingRecord.groupBy({
    by: ["fundId"],
    where: {
      status: "COMPLETED",
      receivedAt: { gte: from, lte: to },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const fundIds = grouped.map((g) => g.fundId);
  const funds = fundIds.length
    ? await prisma.fund.findMany({
        where: { id: { in: fundIds } },
        select: { id: true, name: true, category: true },
      })
    : [];
  const fundMap = new Map(funds.map((f) => [f.id, f]));

  return grouped
    .map((g) => ({
      fund: fundMap.get(g.fundId),
      total: Number((g._sum.amount ?? "0").toString()),
      count: g._count._all,
    }))
    .filter((row) => row.fund != null)
    .sort((a, b) => b.total - a.total);
}

/** Top givers within a date range. ADMIN-only — caller must enforce. */
export async function getTopGivers(opts: {
  from?: Date;
  to?: Date;
  limit?: number;
}) {
  const limit = opts.limit ?? 10;
  const where: Prisma.GivingRecordWhereInput = {
    status: "COMPLETED",
    memberId: { not: null },
  };
  if (opts.from || opts.to) {
    where.receivedAt = {};
    if (opts.from) where.receivedAt.gte = opts.from;
    if (opts.to) where.receivedAt.lte = opts.to;
  }

  const grouped = await prisma.givingRecord.groupBy({
    by: ["memberId"],
    where,
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  const memberIds = grouped
    .map((g) => g.memberId)
    .filter((id): id is string => id != null);
  const members = memberIds.length
    ? await prisma.member.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, fullName: true, phone: true, photoUrl: true },
      })
    : [];
  const memberMap = new Map(members.map((m) => [m.id, m]));

  return grouped
    .map((g) => ({
      member: g.memberId ? memberMap.get(g.memberId) : undefined,
      total: Number((g._sum.amount ?? "0").toString()),
      count: g._count._all,
    }))
    .filter((row) => row.member != null);
}
