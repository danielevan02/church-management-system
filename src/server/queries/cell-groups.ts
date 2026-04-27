import "server-only";

import type { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const cellGroupListSelect = {
  id: true,
  name: true,
  description: true,
  meetingDay: true,
  meetingTime: true,
  meetingLocation: true,
  isActive: true,
  parentGroup: { select: { id: true, name: true } },
  leader: { select: { id: true, fullName: true, phone: true } },
  _count: { select: { members: { where: { leftAt: null } } } },
} as const satisfies Prisma.CellGroupSelect;

export type CellGroupListItem = Prisma.CellGroupGetPayload<{
  select: typeof cellGroupListSelect;
}>;

export type CellGroupFilters = {
  q?: string;
  isActive?: boolean;
  leaderId?: string;
  parentGroupId?: string;
};

export async function listCellGroups(opts?: {
  filters?: CellGroupFilters;
  scope?: { role: Role; memberId: string | null };
}) {
  const filters = opts?.filters ?? {};
  const where: Prisma.CellGroupWhereInput = { deletedAt: null };

  if (filters.q) {
    where.name = { contains: filters.q, mode: "insensitive" };
  }
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (filters.leaderId) where.leaderId = filters.leaderId;
  if (filters.parentGroupId) where.parentGroupId = filters.parentGroupId;

  if (opts?.scope) {
    const { role, memberId } = opts.scope;
    if (role === "LEADER" && memberId) {
      where.leaderId = memberId;
    }
  }

  return prisma.cellGroup.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: cellGroupListSelect,
  });
}

export async function getCellGroup(id: string) {
  return prisma.cellGroup.findFirst({
    where: { id, deletedAt: null },
    include: {
      leader: { select: { id: true, fullName: true, phone: true, photoUrl: true } },
      parentGroup: { select: { id: true, name: true } },
      childGroups: {
        where: { deletedAt: null },
        select: { id: true, name: true, isActive: true },
        orderBy: { name: "asc" },
      },
      members: {
        where: { leftAt: null },
        orderBy: { joinedAt: "asc" },
        include: {
          member: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function getCellGroupReports(cellGroupId: string, limit = 20) {
  return prisma.cellGroupReport.findMany({
    where: { cellGroupId },
    orderBy: { meetingDate: "desc" },
    take: limit,
    select: {
      id: true,
      meetingDate: true,
      attendeeCount: true,
      visitorCount: true,
      topic: true,
      notes: true,
      submittedBy: true,
      submittedAt: true,
    },
  });
}

/** Members eligible to join a given cell group (active, not already a member). */
export async function getJoinCandidates(cellGroupId: string, query?: string) {
  const existing = await prisma.cellGroupMember.findMany({
    where: { cellGroupId, leftAt: null },
    select: { memberId: true },
  });
  const exclude = existing.map((m) => m.memberId);

  return prisma.member.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      id: exclude.length ? { notIn: exclude } : undefined,
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { fullName: "asc" },
    take: 20,
    select: { id: true, fullName: true, phone: true },
  });
}

export async function listLeaderCandidates() {
  return prisma.member.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
  });
}

/** The cell group(s) the given member is currently in. */
export async function getCellGroupsForMember(memberId: string) {
  return prisma.cellGroupMember.findMany({
    where: { memberId, leftAt: null },
    include: {
      cellGroup: {
        select: {
          id: true,
          name: true,
          description: true,
          meetingDay: true,
          meetingTime: true,
          meetingLocation: true,
          isActive: true,
          leader: {
            select: { id: true, fullName: true, phone: true, photoUrl: true },
          },
          members: {
            where: { leftAt: null },
            select: {
              id: true,
              joinedAt: true,
              member: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  photoUrl: true,
                },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });
}
