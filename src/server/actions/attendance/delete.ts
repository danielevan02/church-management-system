"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeleteAttendanceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteAttendanceAction(
  recordId: string,
): Promise<DeleteAttendanceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      select: { serviceId: true, memberId: true },
    });
    if (!record) return { ok: false, error: "NOT_FOUND" };
    await prisma.attendanceRecord.delete({ where: { id: recordId } });
    revalidatePath(`/admin/attendance/services/${record.serviceId}`);
    revalidatePath(`/admin/attendance/check-in/${record.serviceId}`);
    if (record.memberId) {
      revalidatePath(`/admin/members/${record.memberId}`);
    }
    return { ok: true };
  } catch (e) {
    console.error("[deleteAttendance]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
