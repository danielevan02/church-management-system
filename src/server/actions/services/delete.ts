"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export type DeleteServiceResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteServiceAction(
  id: string,
): Promise<DeleteServiceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const count = await prisma.attendanceRecord.count({
      where: { serviceId: id },
    });
    if (count > 0) {
      return { ok: false, error: "HAS_ATTENDANCE" };
    }
    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/attendance/services");
    return { ok: true };
  } catch (e) {
    console.error("[deleteService]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
