"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, setMemberPin } from "@/lib/pin";

const schema = z.object({
  memberId: z.string().min(1),
  pin: z
    .string()
    .regex(new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`)),
});

export type SetMemberPinResult =
  | { ok: true }
  | { ok: false; error: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION_FAILED" | "NO_PHONE" | "INTERNAL_ERROR" };

export async function setMemberPinAction(
  memberId: string,
  pin: string,
): Promise<SetMemberPinResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  try {
    requireRole(session.user.role, ["ADMIN", "STAFF"]);
  } catch {
    return { ok: false, error: "FORBIDDEN" };
  }

  const parsed = schema.safeParse({ memberId, pin });
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  try {
    const result = await setMemberPin(parsed.data.memberId, parsed.data.pin);
    if (!result.ok) {
      if (result.reason === "NO_PHONE") return { ok: false, error: "NO_PHONE" };
      return { ok: false, error: "INTERNAL_ERROR" };
    }
    revalidatePath(`/admin/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    console.error("[setMemberPin]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
