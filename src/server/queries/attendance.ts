import "server-only";

import type { Prisma } from "@prisma/client";

import { formatJakarta } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

import { clampPage } from "./_pagination";

const attendanceRowSelect = {
  id: true,
  checkedInAt: true,
  checkedInBy: true,
  source: true,
  visitorName: true,
  visitorPhone: true,
  member: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      photoUrl: true,
      status: true,
    },
  },
} as const satisfies Prisma.AttendanceRecordSelect;

export type AttendanceRow = Prisma.AttendanceRecordGetPayload<{
  select: typeof attendanceRowSelect;
}>;

export async function listAttendanceForService(
  serviceId: string,
  opts?: { page?: number; pageSize?: number },
) {
  const { page, pageSize, skip, take } = clampPage(opts ?? {});
  const [items, memberCount, visitorCount, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { serviceId },
      orderBy: { checkedInAt: "desc" },
      skip,
      take,
      select: attendanceRowSelect,
    }),
    prisma.attendanceRecord.count({
      where: { serviceId, memberId: { not: null } },
    }),
    prisma.attendanceRecord.count({
      where: { serviceId, memberId: null },
    }),
    prisma.attendanceRecord.count({ where: { serviceId } }),
  ]);
  return {
    items,
    memberCount,
    visitorCount,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAttendanceForMember(memberId: string, limit = 25) {
  return prisma.attendanceRecord.findMany({
    where: { memberId },
    orderBy: { checkedInAt: "desc" },
    take: limit,
    select: {
      id: true,
      checkedInAt: true,
      source: true,
      service: {
        select: {
          id: true,
          name: true,
          type: true,
          startsAt: true,
        },
      },
    },
  });
}

export async function isMemberCheckedIn(serviceId: string, memberId: string) {
  const existing = await prisma.attendanceRecord.findFirst({
    where: { serviceId, memberId },
    select: { id: true, checkedInAt: true, source: true },
  });
  return existing;
}

/**
 * One bucket per Sunday in the past `weeks` Sundays. Sunday morning + evening
 * services on the same Sunday share a bucket. Sundays with zero check-ins are
 * still emitted (as 0) so the chart shows continuity instead of skipping
 * empty Sundays. Bucketing is by the service's Jakarta-local date — UTC
 * accessors would shift early-morning Sunday services into Saturday on
 * Vercel.
 */
export async function getWeeklyAttendanceTrend(weeks = 12) {
  const now = new Date();
  const earliest = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      checkedInAt: { gte: earliest },
      service: { type: { in: ["SUNDAY_MORNING", "SUNDAY_EVENING"] } },
    },
    select: {
      memberId: true,
      service: { select: { startsAt: true } },
    },
  });

  const buckets = new Map<string, { members: number; visitors: number }>();
  // Seed every recent Sunday so empty weeks render as 0-bars.
  for (const sunday of recentSundays(now, weeks)) {
    buckets.set(sunday, { members: 0, visitors: 0 });
  }
  for (const r of records) {
    const key = formatJakarta(r.service.startsAt, "yyyy-MM-dd");
    const b = buckets.get(key) ?? { members: 0, visitors: 0 };
    if (r.memberId) b.members += 1;
    else b.visitors += 1;
    buckets.set(key, b);
  }

  return Array.from(buckets.entries())
    .map(([sundayDate, counts]) => ({
      sundayDate,
      members: counts.members,
      visitors: counts.visitors,
      total: counts.members + counts.visitors,
    }))
    .sort((a, b) => a.sundayDate.localeCompare(b.sundayDate));
}

/** Yesterday/today/tomorrow can each be the Sunday — caller picks the timezone. */
function recentSundays(now: Date, weeks: number): string[] {
  const todayJakarta = formatJakarta(now, "yyyy-MM-dd");
  const [y, m, d] = todayJakarta.split("-").map(Number);
  const today = new Date(Date.UTC(y, m - 1, d));
  // dayOfWeek using UTC because `today` is UTC midnight of the Jakarta date.
  const dayOfWeek = today.getUTCDay(); // 0 = Sunday
  const lastSunday = new Date(today);
  lastSunday.setUTCDate(today.getUTCDate() - dayOfWeek);

  const out: string[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const d2 = new Date(lastSunday);
    d2.setUTCDate(lastSunday.getUTCDate() - i * 7);
    out.push(d2.toISOString().slice(0, 10));
  }
  return out;
}

/** Active members with no attendance in the past `weeks` weeks. */
export async function getInactiveMembers(weeks = 6) {
  const cutoff = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  const presentMemberIds = await prisma.attendanceRecord.findMany({
    where: { checkedInAt: { gte: cutoff }, memberId: { not: null } },
    distinct: ["memberId"],
    select: { memberId: true },
  });
  const presentSet = new Set(
    presentMemberIds.map((r) => r.memberId!).filter(Boolean),
  );

  const candidates = await prisma.member.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      ...(presentSet.size > 0
        ? { id: { notIn: Array.from(presentSet) } }
        : {}),
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      photoUrl: true,
      attendances: {
        orderBy: { checkedInAt: "desc" },
        take: 1,
        select: { checkedInAt: true },
      },
    },
  });

  return candidates.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    phone: m.phone,
    photoUrl: m.photoUrl,
    lastSeenAt: m.attendances[0]?.checkedInAt ?? null,
  }));
}
