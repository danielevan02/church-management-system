"use server";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { listAssignmentsForWeek } from "@/server/queries/volunteers";

export type WeekAssignmentItem = {
  id: string;
  memberId: string;
  memberName: string;
  teamName: string;
  positionName: string | null;
  serviceDate: string;
  status: string;
};

export type GetWeekAssignmentsResult =
  | { ok: true; data: WeekAssignmentItem[] }
  | { ok: false; error: string };

export async function getWeekAssignmentsAction(
  serviceDate: string,
): Promise<GetWeekAssignmentsResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const date = new Date(serviceDate);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "INVALID_DATE" };
  }

  try {
    const items = await listAssignmentsForWeek(date);
    return {
      ok: true,
      data: items.map((a) => ({
        id: a.id,
        memberId: a.member.id,
        memberName: a.member.fullName,
        teamName: a.team.name,
        positionName: a.position?.name ?? null,
        serviceDate: a.serviceDate.toISOString(),
        status: a.status,
      })),
    };
  } catch (e) {
    console.error("[getWeekAssignments]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
