"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { buildFullName, memberInputSchema, type MemberInput } from "@/lib/validation/member";

export type CreateMemberResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createMemberAction(
  input: MemberInput,
): Promise<CreateMemberResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = memberInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const fullName = buildFullName(data.firstName, data.lastName);

  try {
    const member = await prisma.member.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName,
        fullName,
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        birthDate: data.birthDate,
        maritalStatus: data.maritalStatus,
        status: data.status,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country ?? "ID",
        baptismDate: data.baptismDate,
        baptismChurch: data.baptismChurch,
        joinedAt: data.joinedAt,
        notes: data.notes,
        excludeFromBroadcasts: data.excludeFromBroadcasts,
      },
      select: { id: true },
    });

    revalidatePath("/admin/members");
    return { ok: true, data: { id: member.id } };
  } catch (e) {
    console.error("[createMember]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
