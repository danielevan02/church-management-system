"use server";

import { endOfWeek, startOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendPushToMember } from "@/lib/push";
import {
  assignmentInputSchema,
  assignmentStatusEnum,
  type AssignmentInput,
} from "@/lib/validation/volunteer";

/**
 * Push payload for "you've been scheduled to serve". Reused across
 * create, generate, and swap so the notification body looks the same.
 */
function schedulePushPayload(
  assignmentId: string,
  teamName: string,
  positionName: string | null,
  serviceDate: Date,
) {
  const date = formatJakarta(serviceDate, "EEE, dd MMM yyyy");
  const bodyParts = [teamName];
  if (positionName) bodyParts.push(positionName);
  bodyParts.push(date);
  return {
    title: "Anda dijadwalkan melayani",
    body: bodyParts.join(" · "),
    url: "/me/volunteer",
    tag: `volunteer:${assignmentId}`,
  };
}

/**
 * Week conflict info returned to the client when a member is already
 * assigned to a different team in the same Mon–Sun week. The admin can
 * acknowledge and retry with `forceAssign: true` to override.
 */
export type WeekConflict = {
  existingTeamName: string;
  existingPositionName: string | null;
  existingServiceDate: string;
};

export type AssignmentResult =
  | { ok: true; data: { id: string } }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      conflict?: WeekConflict;
    };

export async function createAssignmentAction(
  input: AssignmentInput,
  options?: { forceAssign?: boolean },
): Promise<AssignmentResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = assignmentInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  // Week-conflict check. A member can only serve in one team per week.
  // Week is Mon–Sun (Indonesian convention). DECLINED assignments don't count
  // since the member already opted out. Admin can override via forceAssign.
  if (!options?.forceAssign) {
    const weekStart = startOfWeek(data.serviceDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(data.serviceDate, { weekStartsOn: 1 });
    const existing = await prisma.volunteerAssignment.findFirst({
      where: {
        memberId: data.memberId,
        serviceDate: { gte: weekStart, lte: weekEnd },
        status: { not: "DECLINED" },
      },
      select: {
        serviceDate: true,
        team: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    if (existing) {
      return {
        ok: false,
        error: "WEEK_CONFLICT",
        conflict: {
          existingTeamName: existing.team.name,
          existingPositionName: existing.position?.name ?? null,
          existingServiceDate: existing.serviceDate.toISOString(),
        },
      };
    }
  }

  try {
    const record = await prisma.volunteerAssignment.create({
      data: {
        teamId: data.teamId,
        positionId: data.positionId,
        memberId: data.memberId,
        serviceDate: data.serviceDate,
        status: data.status,
        notes: data.notes,
      },
      select: {
        id: true,
        serviceDate: true,
        team: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/members/${data.memberId}`);
    revalidatePath("/me/volunteer");

    void sendPushToMember(
      data.memberId,
      schedulePushPayload(
        record.id,
        record.team.name,
        record.position?.name ?? null,
        record.serviceDate,
      ),
    ).catch((e) => console.error("[volunteer assignment push]", e));

    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[createAssignment]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

const setStatusSchema = z.object({
  id: z.string().min(1),
  status: assignmentStatusEnum,
});

export async function setAssignmentStatusAction(input: {
  id: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "COMPLETED";
  /** When true, the action allows MEMBER role to set status only for own
   *  assignments and only to CONFIRMED or DECLINED. */
  selfAction?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = setStatusSchema.safeParse({
    id: input.id,
    status: input.status,
  });
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "STAFF";

  if (!isStaff) {
    if (
      !input.selfAction ||
      (input.status !== "CONFIRMED" && input.status !== "DECLINED")
    ) {
      return { ok: false, error: "FORBIDDEN" };
    }
    const own = await prisma.volunteerAssignment.findUnique({
      where: { id: input.id },
      select: { memberId: true, teamId: true },
    });
    if (!own) return { ok: false, error: "NOT_FOUND" };
    if (own.memberId !== session.user.memberId) {
      return { ok: false, error: "FORBIDDEN" };
    }
  }

  try {
    const record = await prisma.volunteerAssignment.update({
      where: { id: input.id },
      data: { status: input.status },
      select: { teamId: true, memberId: true },
    });
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/members/${record.memberId}`);
    revalidatePath("/me/volunteer");
    return { ok: true };
  } catch (e) {
    console.error("[setAssignmentStatus]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

const updateMemberSchema = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
});

/**
 * Swap the member on an existing assignment — used for one-week
 * substitutions. The default roster on the team is unchanged, so the next
 * "Generate" run still picks up the regular member.
 */
export async function updateAssignmentMemberAction(input: {
  id: string;
  memberId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  try {
    const record = await prisma.volunteerAssignment.update({
      where: { id: parsed.data.id },
      data: { memberId: parsed.data.memberId },
      select: {
        id: true,
        memberId: true,
        serviceDate: true,
        team: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/members/${record.memberId}`);
    revalidatePath("/me/volunteer");

    void sendPushToMember(
      record.memberId,
      schedulePushPayload(
        record.id,
        record.team.name,
        record.position?.name ?? null,
        record.serviceDate,
      ),
    ).catch((e) => console.error("[volunteer swap push]", e));

    return { ok: true };
  } catch (e) {
    console.error("[updateAssignmentMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function deleteAssignmentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  try {
    const record = await prisma.volunteerAssignment.findUnique({
      where: { id },
      select: { memberId: true, teamId: true },
    });
    if (!record) return { ok: false, error: "NOT_FOUND" };
    await prisma.volunteerAssignment.delete({ where: { id } });
    revalidatePath("/admin/volunteers");
    revalidatePath(`/admin/members/${record.memberId}`);
    revalidatePath("/me/volunteer");
    return { ok: true };
  } catch (e) {
    console.error("[deleteAssignment]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
