import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { clampPage, paginate } from "./_pagination";

const teamListSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  positions: {
    where: { isActive: true },
    select: { id: true, name: true, isActive: true },
    orderBy: { name: "asc" },
  },
  _count: { select: { assignments: true } },
} as const satisfies Prisma.VolunteerTeamSelect;

export type TeamListItem = Prisma.VolunteerTeamGetPayload<{
  select: typeof teamListSelect;
}>;

export async function listTeams(opts?: { page?: number; pageSize?: number }) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const [items, total] = await Promise.all([
    prisma.volunteerTeam.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      skip,
      take,
      select: teamListSelect,
    }),
    prisma.volunteerTeam.count(),
  ]);
  return paginate(items, total, page, pageSize);
}

export async function listAllTeams() {
  return prisma.volunteerTeam.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: teamListSelect,
  });
}

export async function getTeam(id: string) {
  return prisma.volunteerTeam.findUnique({
    where: { id },
    include: {
      positions: { orderBy: { name: "asc" } },
    },
  });
}

const assignmentListSelect = {
  id: true,
  serviceDate: true,
  status: true,
  notes: true,
  team: { select: { id: true, name: true } },
  position: { select: { id: true, name: true } },
  member: {
    select: { id: true, fullName: true, phone: true, photoUrl: true },
  },
} as const satisfies Prisma.VolunteerAssignmentSelect;

export type AssignmentListItem = Prisma.VolunteerAssignmentGetPayload<{
  select: typeof assignmentListSelect;
}>;

export type AssignmentFilters = {
  teamId?: string;
  memberId?: string;
  from?: Date;
  to?: Date;
  status?: string;
};

export async function listAssignments(opts?: {
  filters?: AssignmentFilters;
  upcomingOnly?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const where: Prisma.VolunteerAssignmentWhereInput = {};
  if (opts?.filters?.teamId) where.teamId = opts.filters.teamId;
  if (opts?.filters?.memberId) where.memberId = opts.filters.memberId;
  if (opts?.filters?.status) where.status = opts.filters.status;
  if (opts?.upcomingOnly) where.serviceDate = { gte: startOfToday() };
  if (opts?.filters?.from || opts?.filters?.to) {
    where.serviceDate = {
      ...((where.serviceDate as { gte?: Date; lte?: Date }) ?? {}),
      ...(opts.filters.from ? { gte: opts.filters.from } : {}),
      ...(opts.filters.to ? { lte: opts.filters.to } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.volunteerAssignment.findMany({
      where,
      orderBy: { serviceDate: "asc" },
      skip,
      take,
      select: assignmentListSelect,
    }),
    prisma.volunteerAssignment.count({ where }),
  ]);

  return paginate(items, total, page, pageSize);
}

export async function getAssignmentsForMember(memberId: string, limit = 25) {
  return prisma.volunteerAssignment.findMany({
    where: { memberId, serviceDate: { gte: startOfToday() } },
    orderBy: { serviceDate: "asc" },
    take: limit,
    select: assignmentListSelect,
  });
}

export async function getAssignmentHistoryForMember(
  memberId: string,
  limit = 25,
) {
  return prisma.volunteerAssignment.findMany({
    where: { memberId },
    orderBy: { serviceDate: "desc" },
    take: limit,
    select: assignmentListSelect,
  });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
