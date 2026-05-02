"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { canAccessCellGroup } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  nextMeetingInputSchema,
  type NextMeetingInput,
} from "@/lib/validation/cell-group";

export type SetNextMeetingResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function setNextMeetingAction(
  id: string,
  input: NextMeetingInput,
): Promise<SetNextMeetingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";
  if (!isStaff) {
    const allowed = await canAccessCellGroup(
      {
        id: session.user.id ?? "",
        role: session.user.role,
        memberId: session.user.memberId ?? null,
      },
      id,
    );
    if (!allowed) return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = nextMeetingInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.cellGroup.update({
      where: { id },
      data: {
        nextMeetingAt: parsed.data.nextMeetingAt,
        nextMeetingLocation: parsed.data.nextMeetingLocation,
        nextMeetingNotes: parsed.data.nextMeetingNotes,
      },
    });
    revalidatePath("/admin/cell-groups");
    revalidatePath(`/admin/cell-groups/${id}`);
    revalidatePath("/me/cell-group");
    revalidatePath("/me/dashboard");
    return { ok: true };
  } catch (e) {
    console.error("[setNextMeeting]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
