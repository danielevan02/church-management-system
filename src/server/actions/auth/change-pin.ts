"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { changeOwnPin, PIN_MAX_LENGTH, PIN_MIN_LENGTH } from "@/lib/pin";

const schema = z
  .object({
    currentPin: z
      .string()
      .regex(new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`)),
    newPin: z
      .string()
      .regex(new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`)),
  })
  .refine((d) => d.currentPin !== d.newPin, {
    path: ["newPin"],
    message: "SAME_AS_CURRENT",
  });

export type ChangePinResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "UNAUTHORIZED"
        | "VALIDATION_FAILED"
        | "INVALID_CURRENT"
        | "INTERNAL_ERROR";
    };

export async function changePinAction(
  currentPin: string,
  newPin: string,
): Promise<ChangePinResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = schema.safeParse({ currentPin, newPin });
  if (!parsed.success) return { ok: false, error: "VALIDATION_FAILED" };

  try {
    const result = await changeOwnPin(
      session.user.id,
      parsed.data.currentPin,
      parsed.data.newPin,
    );
    if (!result.ok) {
      if (result.reason === "INVALID_CURRENT")
        return { ok: false, error: "INVALID_CURRENT" };
      return { ok: false, error: "INTERNAL_ERROR" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[changePin]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
