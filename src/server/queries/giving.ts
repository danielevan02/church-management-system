import "server-only";

import type { Prisma, ServiceType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage } from "./_pagination";

export type GivingFilters = {
  fundId?: string;
  serviceId?: string;
  serviceType?: ServiceType;
  /** When set, includes only entries that have / don't have a service link. */
  withService?: boolean;
  from?: Date;
  to?: Date;
};

const givingEntrySelect = {
  id: true,
  amount: true,
  receivedAt: true,
  notes: true,
  recordedBy: true,
  createdAt: true,
  fund: { select: { id: true, name: true, category: true } },
  service: {
    select: { id: true, name: true, type: true, startsAt: true },
  },
} as const satisfies Prisma.GivingEntrySelect;

export type GivingEntryListItem = Prisma.GivingEntryGetPayload<{
  select: typeof givingEntrySelect;
}>;

function buildWhere(filters: GivingFilters): Prisma.GivingEntryWhereInput {
  const where: Prisma.GivingEntryWhereInput = {};
  if (filters.fundId) where.fundId = filters.fundId;
  if (filters.serviceId) where.serviceId = filters.serviceId;
  if (filters.withService === true) where.serviceId = { not: null };
  if (filters.withService === false) where.serviceId = null;

  if (filters.serviceType) {
    where.service = { type: filters.serviceType };
  }

  if (filters.from || filters.to) {
    where.receivedAt = {};
    if (filters.from) where.receivedAt.gte = filters.from;
    if (filters.to) where.receivedAt.lte = filters.to;
  }

  return where;
}

export async function listGivingEntries(opts: {
  filters?: GivingFilters;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts);
  const filters = opts.filters ?? {};
  const where = buildWhere(filters);

  const [items, total, sumResult] = await Promise.all([
    prisma.givingEntry.findMany({
      where,
      orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take,
      select: givingEntrySelect,
    }),
    prisma.givingEntry.count({ where }),
    prisma.givingEntry.aggregate({ where, _sum: { amount: true } }),
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

export async function getGivingEntry(id: string) {
  return prisma.givingEntry.findUnique({
    where: { id },
    include: {
      fund: { select: { id: true, name: true, category: true } },
      service: {
        select: { id: true, name: true, type: true, startsAt: true },
      },
    },
  });
}

/**
 * Sundays anchor the week (Sun 00:00 → next Sun 00:00). Returns last `weeks`
 * weeks ending in the current week, with each entry attached to its bucket
 * by `receivedAt`.
 */
export async function getGivingByWeek(opts?: {
  filters?: GivingFilters;
  weeks?: number;
}) {
  const weeks = opts?.weeks ?? 8;
  const now = new Date();
  const currentWeekStart = startOfWeekSunday(now);
  const earliestWeekStart = new Date(currentWeekStart);
  earliestWeekStart.setDate(earliestWeekStart.getDate() - 7 * (weeks - 1));

  const filters = opts?.filters ?? {};
  const where = buildWhere({
    ...filters,
    from:
      filters.from && filters.from > earliestWeekStart
        ? filters.from
        : earliestWeekStart,
  });

  const items = await prisma.givingEntry.findMany({
    where,
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    select: givingEntrySelect,
  });

  type Bucket = {
    weekStart: Date;
    weekEnd: Date;
    total: number;
    entries: GivingEntryListItem[];
  };

  const buckets: Bucket[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - 7 * i);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    buckets.push({ weekStart, weekEnd, total: 0, entries: [] });
  }

  for (const entry of items) {
    const ts = entry.receivedAt.getTime();
    const bucket = buckets.find(
      (b) => ts >= b.weekStart.getTime() && ts < b.weekEnd.getTime(),
    );
    if (!bucket) continue;
    bucket.entries.push(entry);
    bucket.total += Number(entry.amount.toString());
  }

  return buckets;
}

/** Last 12 months trend, anchored to receivedAt. */
export async function getMonthlyGivingTrend(months = 12) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const entries = await prisma.givingEntry.findMany({
    where: { receivedAt: { gte: start } },
    select: { amount: true, receivedAt: true },
  });

  const bucket = new Map<string, number>();
  for (let i = 0; i < months; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    bucket.set(monthKey(d), 0);
  }

  for (const e of entries) {
    const key = monthKey(e.receivedAt);
    if (bucket.has(key)) {
      bucket.set(key, (bucket.get(key) ?? 0) + Number(e.amount.toString()));
    }
  }

  return Array.from(bucket.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}

/** Sum per fund within a date range (default = current month). */
export async function getFundBreakdown(opts?: { from?: Date; to?: Date }) {
  const now = new Date();
  const from = opts?.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const to =
    opts?.to ??
    new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const grouped = await prisma.givingEntry.groupBy({
    by: ["fundId"],
    where: { receivedAt: { gte: from, lte: to } },
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

/**
 * Sum per service type within a date range (default = current month).
 * Entries without a service link are bucketed under a synthetic "STANDALONE"
 * row so the breakdown still totals correctly.
 */
export async function getServiceTypeBreakdown(opts?: {
  from?: Date;
  to?: Date;
}) {
  const now = new Date();
  const from = opts?.from ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const to =
    opts?.to ??
    new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const entries = await prisma.givingEntry.findMany({
    where: { receivedAt: { gte: from, lte: to } },
    select: {
      amount: true,
      service: { select: { type: true } },
    },
  });

  const totals = new Map<ServiceType | "STANDALONE", { total: number; count: number }>();
  for (const e of entries) {
    const key: ServiceType | "STANDALONE" = e.service?.type ?? "STANDALONE";
    const cur = totals.get(key) ?? { total: 0, count: 0 };
    cur.total += Number(e.amount.toString());
    cur.count += 1;
    totals.set(key, cur);
  }

  return Array.from(totals.entries())
    .map(([type, value]) => ({ type, ...value }))
    .sort((a, b) => b.total - a.total);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function startOfWeekSunday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}
