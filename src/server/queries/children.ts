import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// =====================================================================
// Child classes
// =====================================================================

export async function listChildClasses(opts?: { activeOnly?: boolean }) {
  return prisma.childClass.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ isActive: "desc" }, { ageMin: "asc" }],
  });
}

export async function getChildClass(id: string) {
  return prisma.childClass.findUnique({ where: { id } });
}

// =====================================================================
// Children (Members under maxAge), with optional search
// =====================================================================

export type ChildSearchResult = {
  id: string;
  fullName: string;
  birthDate: Date | null;
  photoUrl: string | null;
  age: number | null;
};

const CHILD_AGE_CUTOFF = 13;

export async function searchChildren(query: string, take = 20): Promise<ChildSearchResult[]> {
  const q = query.trim();
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - CHILD_AGE_CUTOFF);

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    birthDate: { gte: cutoff, not: null },
  };
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { nickname: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.member.findMany({
    where,
    orderBy: { firstName: "asc" },
    take,
    select: {
      id: true,
      fullName: true,
      birthDate: true,
      photoUrl: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    birthDate: r.birthDate,
    photoUrl: r.photoUrl,
    age: r.birthDate ? computeAge(r.birthDate) : null,
  }));
}

function computeAge(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Members in the same household as the given child (potential guardians). */
export async function getHouseholdGuardians(childId: string) {
  const child = await prisma.member.findUnique({
    where: { id: childId },
    select: { householdId: true },
  });
  if (!child?.householdId) return [];

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - CHILD_AGE_CUTOFF);

  return prisma.member.findMany({
    where: {
      deletedAt: null,
      householdId: child.householdId,
      id: { not: childId },
      OR: [
        { birthDate: null },
        { birthDate: { lt: cutoff } },
      ],
    },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      fullName: true,
      photoUrl: true,
      householdRole: true,
    },
  });
}

// =====================================================================
// Check-ins
// =====================================================================

const checkInSelect = {
  id: true,
  securityCode: true,
  checkedInAt: true,
  checkedOutAt: true,
  notes: true,
  child: { select: { id: true, fullName: true, birthDate: true, photoUrl: true } },
  guardian: { select: { id: true, fullName: true, phone: true } },
  pickupGuardian: { select: { id: true, fullName: true } },
  childClass: { select: { id: true, name: true } },
} as const satisfies Prisma.ChildCheckInSelect;

export type ChildCheckInItem = Prisma.ChildCheckInGetPayload<{
  select: typeof checkInSelect;
}>;

/** Children currently checked in (not yet checked out). */
export async function listActiveCheckIns() {
  return prisma.childCheckIn.findMany({
    where: { checkedOutAt: null },
    orderBy: { checkedInAt: "desc" },
    select: checkInSelect,
  });
}

export async function listCheckInsForDay(day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return prisma.childCheckIn.findMany({
    where: { checkedInAt: { gte: start, lte: end } },
    orderBy: { checkedInAt: "desc" },
    select: checkInSelect,
  });
}

export async function listCheckInsHistory(opts?: {
  childId?: string;
  classId?: string;
  from?: Date;
  to?: Date;
  take?: number;
}) {
  const where: Prisma.ChildCheckInWhereInput = {};
  if (opts?.childId) where.childId = opts.childId;
  if (opts?.classId) where.classId = opts.classId;
  if (opts?.from || opts?.to) {
    where.checkedInAt = {};
    if (opts.from) where.checkedInAt.gte = opts.from;
    if (opts.to) where.checkedInAt.lte = opts.to;
  }
  return prisma.childCheckIn.findMany({
    where,
    orderBy: { checkedInAt: "desc" },
    take: opts?.take ?? 100,
    select: checkInSelect,
  });
}

export async function findActiveCheckInByCode(code: string) {
  return prisma.childCheckIn.findFirst({
    where: { securityCode: code.toUpperCase().trim(), checkedOutAt: null },
    select: checkInSelect,
  });
}

export async function getCheckInsForChild(childId: string, take = 25) {
  return prisma.childCheckIn.findMany({
    where: { childId },
    orderBy: { checkedInAt: "desc" },
    take,
    select: checkInSelect,
  });
}

export async function listChildrenForGuardian(memberId: string) {
  // children = anyone in same household born after cutoff
  return getHouseholdChildren(memberId);
}

async function getHouseholdChildren(memberId: string) {
  const me = await prisma.member.findUnique({
    where: { id: memberId },
    select: { householdId: true },
  });
  if (!me?.householdId) return [];

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - CHILD_AGE_CUTOFF);

  return prisma.member.findMany({
    where: {
      deletedAt: null,
      householdId: me.householdId,
      id: { not: memberId },
      birthDate: { gte: cutoff, not: null },
    },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      fullName: true,
      birthDate: true,
      photoUrl: true,
    },
  });
}
