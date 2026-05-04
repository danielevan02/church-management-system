"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendPushToMember } from "@/lib/push";

const setDefaultSchema = z.object({
  teamId: z.string().min(1),
  positionId: z.string().min(1),
  memberId: z.string().min(1),
});

export type DefaultActionResult =
  | { ok: true; data?: { id: string } }
  | { ok: false; error: string };

/**
 * Upsert "siapa yang biasa di posisi ini di tim ini". Unique on
 * (teamId, positionId) — replacing the existing default if any.
 */
export async function setTeamDefaultAction(input: {
  teamId: string;
  positionId: string;
  memberId: string;
}): Promise<DefaultActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = setDefaultSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };
  const data = parsed.data;

  const position = await prisma.volunteerPosition.findUnique({
    where: { id: data.positionId },
    select: { teamId: true },
  });
  if (!position || position.teamId !== data.teamId) {
    return { ok: false, error: "POSITION_TEAM_MISMATCH" };
  }

  try {
    const record = await prisma.volunteerTeamDefault.upsert({
      where: {
        teamId_positionId: {
          teamId: data.teamId,
          positionId: data.positionId,
        },
      },
      create: data,
      update: { memberId: data.memberId },
      select: { id: true },
    });
    revalidatePath(`/admin/volunteers/teams/${data.teamId}`);
    return { ok: true, data: { id: record.id } };
  } catch (e) {
    console.error("[setTeamDefault]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function removeTeamDefaultAction(
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
    const existing = await prisma.volunteerTeamDefault.findUnique({
      where: { id },
      select: { teamId: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" };
    await prisma.volunteerTeamDefault.delete({ where: { id } });
    revalidatePath(`/admin/volunteers/teams/${existing.teamId}`);
    return { ok: true };
  } catch (e) {
    console.error("[removeTeamDefault]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

const generateSchema = z.object({
  serviceDate: z.string().min(1),
  teamIds: z.array(z.string()).optional(),
});

export type GenerateResult =
  | {
      ok: true;
      data: { created: number; skippedExisting: number };
    }
  | { ok: false; error: string };

/**
 * Auto-create VolunteerAssignment records for the given service date,
 * one per (team, position) that has a default. Skips any (team, position,
 * date) combo that already has an assignment so it's safe to run twice.
 */
export async function generateWeekAssignmentsAction(input: {
  serviceDate: string;
  teamIds?: string[];
}): Promise<GenerateResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  const serviceDate = new Date(parsed.data.serviceDate);
  if (Number.isNaN(serviceDate.getTime())) {
    return { ok: false, error: "INVALID_DATE" };
  }

  try {
    const defaults = await prisma.volunteerTeamDefault.findMany({
      where: {
        ...(parsed.data.teamIds?.length
          ? { teamId: { in: parsed.data.teamIds } }
          : {}),
        team: { isActive: true },
        position: { isActive: true },
      },
      select: {
        teamId: true,
        positionId: true,
        memberId: true,
        team: { select: { name: true } },
        position: { select: { name: true } },
      },
    });

    if (defaults.length === 0) {
      return { ok: true, data: { created: 0, skippedExisting: 0 } };
    }

    // Find existing (team, position, date) combos so we skip duplicates.
    const existing = await prisma.volunteerAssignment.findMany({
      where: {
        serviceDate,
        OR: defaults.map((d) => ({
          teamId: d.teamId,
          positionId: d.positionId,
        })),
      },
      select: { teamId: true, positionId: true },
    });
    const existingKey = new Set(
      existing.map((e) => `${e.teamId}:${e.positionId ?? ""}`),
    );

    const toCreate = defaults.filter(
      (d) => !existingKey.has(`${d.teamId}:${d.positionId}`),
    );

    if (toCreate.length === 0) {
      return {
        ok: true,
        data: { created: 0, skippedExisting: defaults.length },
      };
    }

    // Create one-by-one (instead of createMany) so we can fan-out a push
    // per assigned member with the new assignment's id as the tag.
    const dateLabel = formatJakarta(serviceDate, "EEE, dd MMM yyyy");
    const created = await Promise.all(
      toCreate.map((d) =>
        prisma.volunteerAssignment.create({
          data: {
            teamId: d.teamId,
            positionId: d.positionId,
            memberId: d.memberId,
            serviceDate,
            status: "PENDING",
          },
          select: { id: true },
        }),
      ),
    );

    void Promise.all(
      created.map((rec, i) => {
        const d = toCreate[i];
        const bodyParts = [d.team.name];
        if (d.position?.name) bodyParts.push(d.position.name);
        bodyParts.push(dateLabel);
        return sendPushToMember(d.memberId, {
          title: "Anda dijadwalkan melayani",
          body: bodyParts.join(" · "),
          url: "/me/volunteer",
          tag: `volunteer:${rec.id}`,
        });
      }),
    ).catch((e) => console.error("[volunteer generate push]", e));

    revalidatePath("/admin/volunteers");
    return {
      ok: true,
      data: {
        created: toCreate.length,
        skippedExisting: defaults.length - toCreate.length,
      },
    };
  } catch (e) {
    console.error("[generateWeekAssignments]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
