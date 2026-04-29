import "server-only";

import type { Prisma, ServiceType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

export type ServiceFilters = {
  q?: string;
  type?: ServiceType;
  isActive?: boolean;
  /** Inclusive bounds. */
  from?: Date;
  to?: Date;
};

const serviceListSelect = {
  id: true,
  name: true,
  type: true,
  startsAt: true,
  durationMin: true,
  location: true,
  isActive: true,
  _count: { select: { attendances: true } },
} as const satisfies Prisma.ServiceSelect;

export type ServiceListItem = Prisma.ServiceGetPayload<{
  select: typeof serviceListSelect;
}>;

export async function listServices(opts: {
  filters?: ServiceFilters;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts);
  const filters = opts.filters ?? {};

  const where: Prisma.ServiceWhereInput = {};
  if (filters.q) where.name = { contains: filters.q, mode: "insensitive" };
  if (filters.type) where.type = filters.type;
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (filters.from || filters.to) {
    where.startsAt = {};
    if (filters.from) where.startsAt.gte = filters.from;
    if (filters.to) where.startsAt.lte = filters.to;
  }

  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip,
      take,
      select: serviceListSelect,
    }),
    prisma.service.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getService(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

/**
 * Services within a check-in window: from `bufferBeforeMin` before startsAt
 * to `bufferAfterMin` after the service ends. Used for the member self-checkin
 * and the usher console (so check-ins outside this window are blocked).
 */
export async function getCheckInOpenServices(opts?: {
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
}) {
  const before = opts?.bufferBeforeMin ?? 60;
  const after = opts?.bufferAfterMin ?? 60;
  const now = new Date();
  const earliest = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const latest = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const candidates = await prisma.service.findMany({
    where: { isActive: true, startsAt: { gte: earliest, lte: latest } },
    orderBy: { startsAt: "asc" },
    select: serviceListSelect,
  });

  return candidates.filter((s) => isCheckInOpen(s, now, before, after));
}

export function isCheckInOpen(
  service: { startsAt: Date; durationMin: number },
  at: Date,
  bufferBeforeMin = 60,
  bufferAfterMin = 60,
): boolean {
  const start = new Date(service.startsAt.getTime() - bufferBeforeMin * 60 * 1000);
  const end = new Date(
    service.startsAt.getTime() + (service.durationMin + bufferAfterMin) * 60 * 1000,
  );
  return at >= start && at <= end;
}

export async function getUpcomingServices(limit = 10) {
  const now = new Date();
  return prisma.service.findMany({
    where: { isActive: true, startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: limit,
    select: serviceListSelect,
  });
}
