import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const visitListSelect = {
  id: true,
  visitType: true,
  visitedAt: true,
  visitedBy: true,
  notes: true,
  followUp: true,
  followUpDate: true,
  createdAt: true,
  member: {
    select: { id: true, fullName: true, phone: true, photoUrl: true },
  },
} as const satisfies Prisma.PastoralVisitSelect;

export type PastoralVisitListItem = Prisma.PastoralVisitGetPayload<{
  select: typeof visitListSelect;
}>;

export type PastoralVisitFilters = {
  memberId?: string;
  visitType?: string;
  from?: Date;
  to?: Date;
  /** Restrict to members in these cell groups (used for LEADER scope). */
  cellGroupIds?: string[];
  /** Only visits with a follow-up scheduled. */
  withFollowUp?: boolean;
};

export async function listPastoralVisits(opts?: {
  filters?: PastoralVisitFilters;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.PastoralVisitWhereInput = {};
  const f = opts?.filters;
  if (f?.memberId) where.memberId = f.memberId;
  if (f?.visitType) where.visitType = f.visitType as never;
  if (f?.from || f?.to) {
    where.visitedAt = {};
    if (f.from) where.visitedAt.gte = f.from;
    if (f.to) where.visitedAt.lte = f.to;
  }
  if (f?.cellGroupIds && f.cellGroupIds.length > 0) {
    where.member = {
      cellGroupMembers: {
        some: { cellGroupId: { in: f.cellGroupIds } },
      },
    };
  }
  if (f?.withFollowUp) {
    where.followUpDate = { not: null };
  }

  const [items, total] = await Promise.all([
    prisma.pastoralVisit.findMany({
      where,
      orderBy: { visitedAt: "desc" },
      skip,
      take,
      select: visitListSelect,
    }),
    prisma.pastoralVisit.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getVisitsForMember(memberId: string, take = 50) {
  return prisma.pastoralVisit.findMany({
    where: { memberId },
    orderBy: { visitedAt: "desc" },
    take,
    select: {
      id: true,
      visitType: true,
      visitedAt: true,
      visitedBy: true,
      notes: true,
      followUp: true,
      followUpDate: true,
    },
  });
}

export async function getPastoralVisit(id: string) {
  return prisma.pastoralVisit.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, fullName: true } },
    },
  });
}

export async function getUpcomingFollowUps(limit = 10) {
  const now = new Date();
  return prisma.pastoralVisit.findMany({
    where: {
      followUpDate: { gte: now },
    },
    orderBy: { followUpDate: "asc" },
    take: limit,
    select: {
      id: true,
      visitType: true,
      followUp: true,
      followUpDate: true,
      member: { select: { id: true, fullName: true } },
    },
  });
}
