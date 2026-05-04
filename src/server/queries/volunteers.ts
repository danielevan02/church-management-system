import "server-only";

import { addDays, addMonths, addWeeks, endOfWeek, startOfWeek } from "date-fns";

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
      defaults: {
        select: {
          id: true,
          positionId: true,
          member: {
            select: {
              id: true,
              fullName: true,
              photoUrl: true,
            },
          },
        },
      },
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

/**
 * List all assignments inside the Mon–Sun week containing `date`. Used by
 * the assignment form to surface "already busy this week" volunteers as
 * the admin picks a service date.
 */
export async function listAssignmentsForWeek(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return prisma.volunteerAssignment.findMany({
    where: {
      serviceDate: { gte: weekStart, lte: weekEnd },
      status: { not: "DECLINED" },
    },
    orderBy: { serviceDate: "asc" },
    select: assignmentListSelect,
  });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export type WeeklyTeamGroup = {
  teamId: string;
  teamName: string;
  /** Active positions in the team (for the per-team add picker). */
  positions: Array<{ id: string; name: string }>;
  assignments: AssignmentListItem[];
};

export type ActiveTeam = {
  id: string;
  name: string;
  positions: Array<{ id: string; name: string }>;
};

export type WeekGroup = {
  weekStart: Date;
  weekEnd: Date;
  /** Sunday in this week — used to pre-fill new assignments. */
  serviceDate: Date;
  total: number;
  teams: WeeklyTeamGroup[];
  /** Member IDs assigned to 2+ different teams in this week. */
  conflictMemberIds: string[];
};

/**
 * Return every Mon–Sun week in the planning window with all active teams
 * as cards — even teams with no assignments yet — so admins can see at a
 * glance which slots are still empty for each Sunday.
 *
 * Window starts at `from` (defaults to current Monday) and lasts
 * `monthsAhead` months (defaults to 3). `conflictMemberIds` flags members
 * who appear in 2+ different teams within a single week.
 */
export async function listUpcomingByWeek(opts?: {
  from?: Date;
  monthsAhead?: number;
}): Promise<{
  weeks: WeekGroup[];
  total: number;
  rangeStart: Date;
  rangeEnd: Date;
  /** All active teams — passed to the week-level "Add team" dialog. */
  activeTeams: ActiveTeam[];
}> {
  const monthsAhead = opts?.monthsAhead ?? 3;
  const baseFrom = opts?.from ?? new Date();
  const horizonStart = startOfWeek(baseFrom, { weekStartsOn: 1 });
  const horizonEnd = endOfWeek(addMonths(horizonStart, monthsAhead), {
    weekStartsOn: 1,
  });

  const [all, activeTeams] = await Promise.all([
    prisma.volunteerAssignment.findMany({
      where: { serviceDate: { gte: horizonStart, lte: horizonEnd } },
      orderBy: { serviceDate: "asc" },
      select: assignmentListSelect,
    }),
    prisma.volunteerTeam.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        positions: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const byWeek = new Map<string, AssignmentListItem[]>();
  for (const a of all) {
    const wkStart = startOfWeek(a.serviceDate, { weekStartsOn: 1 });
    const key = wkStart.toISOString();
    const bucket = byWeek.get(key) ?? [];
    bucket.push(a);
    byWeek.set(key, bucket);
  }

  const weeks: WeekGroup[] = [];
  for (
    let wkStart = horizonStart;
    wkStart <= horizonEnd;
    wkStart = addWeeks(wkStart, 1)
  ) {
    const wkEnd = endOfWeek(wkStart, { weekStartsOn: 1 });
    const sunday = addDays(wkStart, 6);
    const items = byWeek.get(wkStart.toISOString()) ?? [];

    const teamItemsById = new Map<string, AssignmentListItem[]>();
    const memberTeams = new Map<string, Set<string>>();
    for (const a of items) {
      const bucket = teamItemsById.get(a.team.id) ?? [];
      bucket.push(a);
      teamItemsById.set(a.team.id, bucket);

      const memberSet = memberTeams.get(a.member.id) ?? new Set<string>();
      memberSet.add(a.team.id);
      memberTeams.set(a.member.id, memberSet);
    }

    const conflictMemberIds = [...memberTeams.entries()]
      .filter(([, teams]) => teams.size > 1)
      .map(([memberId]) => memberId);

    weeks.push({
      weekStart: wkStart,
      weekEnd: wkEnd,
      serviceDate: sunday,
      total: items.length,
      teams: activeTeams
        .filter((t) => teamItemsById.has(t.id))
        .map((t) => ({
          teamId: t.id,
          teamName: t.name,
          positions: t.positions,
          assignments: teamItemsById.get(t.id) ?? [],
        })),
      conflictMemberIds,
    });
  }

  return {
    weeks,
    total: all.length,
    rangeStart: horizonStart,
    rangeEnd: horizonEnd,
    activeTeams,
  };
}
