import "server-only";

import { prisma } from "@/lib/prisma";

// =====================================================================
// Membership
// =====================================================================

export async function getMembershipSnapshot() {
  const [byStatus, byGender, totalActive, joinedThisYear, joinedThisMonth] =
    await Promise.all([
      prisma.member.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.member.groupBy({
        by: ["gender"],
        where: { deletedAt: null, status: "ACTIVE" },
        _count: { _all: true },
      }),
      prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.member.count({
        where: {
          deletedAt: null,
          joinedAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      }),
      prisma.member.count({
        where: {
          deletedAt: null,
          joinedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  return {
    totalActive,
    joinedThisYear,
    joinedThisMonth,
    byStatus: byStatus.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    byGender: byGender.map((g) => ({
      gender: g.gender,
      count: g._count._all,
    })),
  };
}

/** Cumulative active member growth over the past N months (snapshot at month-end). */
export async function getMembershipGrowth(months = 12) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const members = await prisma.member.findMany({
    where: { deletedAt: null, joinedAt: { not: null } },
    select: { joinedAt: true, status: true },
  });

  const buckets: { month: string; cumulative: number; joined: number }[] = [];
  for (let i = 0; i < months; i++) {
    const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const monthEnd = new Date(
      start.getFullYear(),
      start.getMonth() + i + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const cumulative = members.filter(
      (m) => m.joinedAt && m.joinedAt <= monthEnd,
    ).length;
    const joined = members.filter(
      (m) =>
        m.joinedAt && m.joinedAt >= monthStart && m.joinedAt <= monthEnd,
    ).length;
    buckets.push({
      month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      cumulative,
      joined,
    });
  }
  return buckets;
}

export async function getTopCities(limit = 5) {
  const grouped = await prisma.member.groupBy({
    by: ["city"],
    where: { deletedAt: null, status: "ACTIVE", city: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
    take: limit,
  });
  return grouped
    .filter((g) => g.city)
    .map((g) => ({ city: g.city as string, count: g._count._all }));
}

// =====================================================================
// Attendance (cross-feature snapshot — reuses queries/attendance for charts)
// =====================================================================

export async function getAttendanceSnapshot() {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [last4WeeksRecords, monthlyUnique] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        checkedInAt: { gte: fourWeeksAgo },
        service: { type: { in: ["SUNDAY_MORNING", "SUNDAY_EVENING"] } },
      },
      select: {
        service: { select: { id: true, startsAt: true } },
        memberId: true,
      },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        checkedInAt: { gte: startOfMonth },
        memberId: { not: null },
      },
      distinct: ["memberId"],
      select: { memberId: true },
    }),
  ]);

  // group by service to find "last sunday total"
  const byService = new Map<
    string,
    { startsAt: Date; total: number }
  >();
  for (const r of last4WeeksRecords) {
    const cur = byService.get(r.service.id) ?? {
      startsAt: r.service.startsAt,
      total: 0,
    };
    cur.total += 1;
    byService.set(r.service.id, cur);
  }
  const services = Array.from(byService.values()).sort(
    (a, b) => b.startsAt.getTime() - a.startsAt.getTime(),
  );

  const lastService = services[0] ?? null;
  const last4Total = services.reduce((acc, s) => acc + s.total, 0);
  const last4Avg = services.length > 0 ? last4Total / services.length : 0;

  return {
    lastService:
      lastService != null
        ? { startsAt: lastService.startsAt, total: lastService.total }
        : null,
    avgLast4Weeks: Math.round(last4Avg),
    uniqueAttendeesThisMonth: monthlyUnique.length,
  };
}

// =====================================================================
// Giving (sensitive — caller enforces ADMIN+)
// =====================================================================

export async function getGivingSnapshot() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ytd, lastYear, thisMonth] = await Promise.all([
    prisma.givingRecord.aggregate({
      where: { status: "COMPLETED", receivedAt: { gte: yearStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.givingRecord.aggregate({
      where: {
        status: "COMPLETED",
        receivedAt: { gte: lastYearStart, lte: lastYearEnd },
      },
      _sum: { amount: true },
    }),
    prisma.givingRecord.aggregate({
      where: { status: "COMPLETED", receivedAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  return {
    ytdTotal: Number((ytd._sum.amount ?? "0").toString()),
    ytdCount: ytd._count._all,
    lastYearTotal: Number((lastYear._sum.amount ?? "0").toString()),
    thisMonthTotal: Number((thisMonth._sum.amount ?? "0").toString()),
    thisMonthCount: thisMonth._count._all,
  };
}

// =====================================================================
// Cell groups
// =====================================================================

export async function getCellGroupSnapshot() {
  const [groups, activeGroupCount, totalActiveMembers, distinctLeaders] =
    await Promise.all([
      prisma.cellGroup.findMany({
        where: { deletedAt: null, isActive: true },
        select: {
          id: true,
          _count: { select: { members: true } },
        },
      }),
      prisma.cellGroup.count({ where: { deletedAt: null, isActive: true } }),
      prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.cellGroup.findMany({
        where: { deletedAt: null, isActive: true },
        distinct: ["leaderId"],
        select: { leaderId: true },
      }),
    ]);
  const leaderCount = distinctLeaders.length;

  // Members covered (in at least one active group)
  const coveredMembers = await prisma.cellGroupMember.findMany({
    where: { cellGroup: { deletedAt: null, isActive: true } },
    distinct: ["memberId"],
    select: { memberId: true },
  });
  const coveredCount = coveredMembers.length;

  const totalSlots = groups.reduce((acc, g) => acc + g._count.members, 0);
  const avgGroupSize = activeGroupCount > 0 ? totalSlots / activeGroupCount : 0;

  return {
    activeGroupCount,
    leaderCount,
    coveredCount,
    totalActiveMembers,
    coveredPercent:
      totalActiveMembers > 0
        ? Math.round((coveredCount / totalActiveMembers) * 100)
        : 0,
    avgGroupSize: Number(avgGroupSize.toFixed(1)),
  };
}

// =====================================================================
// Discipleship
// =====================================================================

export async function getDiscipleshipSnapshot() {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [byTypeThisYear, totalAllTime] = await Promise.all([
    prisma.discipleshipMilestone.groupBy({
      by: ["type"],
      where: { achievedAt: { gte: yearStart } },
      _count: { _all: true },
      orderBy: { _count: { type: "desc" } },
    }),
    prisma.discipleshipMilestone.count(),
  ]);

  return {
    totalThisYear: byTypeThisYear.reduce((acc, g) => acc + g._count._all, 0),
    totalAllTime,
    byType: byTypeThisYear.map((g) => ({
      type: g.type,
      count: g._count._all,
    })),
  };
}
