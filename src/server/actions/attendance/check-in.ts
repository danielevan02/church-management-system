"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  memberCheckInSchema,
  type MemberCheckInInput,
  qrCheckInSchema,
  type QrCheckInInput,
  visitorCheckInSchema,
  type VisitorCheckInInput,
} from "@/lib/validation/attendance";
import { verifyMemberQrToken } from "@/lib/qr";
import { isCheckInOpen } from "@/server/queries/services";

export type CheckInResult =
  | {
      ok: true;
      data: {
        recordId: string;
        memberId: string | null;
        memberName: string | null;
        alreadyCheckedIn: boolean;
      };
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function checkInMemberAction(
  input: MemberCheckInInput,
): Promise<CheckInResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const isStaff = ["ADMIN", "STAFF", "LEADER"].includes(
    session.user.role,
  );
  const isSelf =
    input.source === "self" &&
    session.user.role === "MEMBER" &&
    session.user.memberId === input.memberId;

  if (!isStaff && !isSelf) return { ok: false, error: "FORBIDDEN" };

  const parsed = memberCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  return performMemberCheckIn({
    serviceId: data.serviceId,
    memberId: data.memberId,
    source: data.source,
    actorUsername: session.user.username ?? null,
    enforceWindow: !isStaff,
  });
}

export async function checkInByQrAction(
  input: QrCheckInInput,
): Promise<CheckInResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF", "LEADER"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = qrCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "VALIDATION_FAILED" };
  }

  let memberId: string;
  try {
    memberId = await verifyMemberQrToken(parsed.data.token);
  } catch {
    return { ok: false, error: "INVALID_QR" };
  }

  return performMemberCheckIn({
    serviceId: parsed.data.serviceId,
    memberId,
    source: "qr_usher",
    actorUsername: session.user.username ?? null,
    enforceWindow: false,
  });
}

export async function checkInVisitorAction(
  input: VisitorCheckInInput,
): Promise<CheckInResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF", "LEADER"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = visitorCheckInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    select: { id: true, isActive: true },
  });
  if (!service) return { ok: false, error: "SERVICE_NOT_FOUND" };
  if (!service.isActive) return { ok: false, error: "SERVICE_INACTIVE" };

  try {
    const record = await prisma.attendanceRecord.create({
      data: {
        serviceId: data.serviceId,
        visitorName: data.visitorName.trim(),
        visitorPhone: data.visitorPhone,
        source: "visitor_usher",
        checkedInBy: session.user.username ?? null,
      },
      select: { id: true },
    });
    revalidatePath(`/admin/attendance/services/${data.serviceId}`);
    revalidatePath(`/admin/attendance/check-in/${data.serviceId}`);
    return {
      ok: true,
      data: {
        recordId: record.id,
        memberId: null,
        memberName: data.visitorName.trim(),
        alreadyCheckedIn: false,
      },
    };
  } catch (e) {
    console.error("[checkInVisitor]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

async function performMemberCheckIn(opts: {
  serviceId: string;
  memberId: string;
  source: "qr_usher" | "manual_usher" | "self";
  actorUsername: string | null;
  enforceWindow: boolean;
}): Promise<CheckInResult> {
  const service = await prisma.service.findUnique({
    where: { id: opts.serviceId },
    select: { id: true, isActive: true, startsAt: true, durationMin: true },
  });
  if (!service) return { ok: false, error: "SERVICE_NOT_FOUND" };
  if (!service.isActive) return { ok: false, error: "SERVICE_INACTIVE" };
  if (opts.enforceWindow && !isCheckInOpen(service, new Date())) {
    return { ok: false, error: "CHECK_IN_CLOSED" };
  }

  const member = await prisma.member.findFirst({
    where: { id: opts.memberId, deletedAt: null },
    select: { id: true, fullName: true },
  });
  if (!member) return { ok: false, error: "MEMBER_NOT_FOUND" };

  try {
    const existing = await prisma.attendanceRecord.findFirst({
      where: { serviceId: opts.serviceId, memberId: opts.memberId },
      select: { id: true },
    });
    if (existing) {
      return {
        ok: true,
        data: {
          recordId: existing.id,
          memberId: member.id,
          memberName: member.fullName,
          alreadyCheckedIn: true,
        },
      };
    }
    const record = await prisma.attendanceRecord.create({
      data: {
        serviceId: opts.serviceId,
        memberId: opts.memberId,
        source: opts.source,
        checkedInBy: opts.actorUsername,
      },
      select: { id: true },
    });
    revalidatePath(`/admin/attendance/services/${opts.serviceId}`);
    revalidatePath(`/admin/attendance/check-in/${opts.serviceId}`);
    revalidatePath(`/admin/members/${opts.memberId}`);
    return {
      ok: true,
      data: {
        recordId: record.id,
        memberId: member.id,
        memberName: member.fullName,
        alreadyCheckedIn: false,
      },
    };
  } catch (e) {
    console.error("[checkInMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
