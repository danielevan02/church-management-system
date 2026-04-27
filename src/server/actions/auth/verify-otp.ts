"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/lib/auth";

const schema = z.object({
  phone: z.string().min(6).max(20),
  code: z.string().regex(/^\d{6}$/),
});

export type VerifyOtpState =
  | null
  | {
      error: "invalidCode" | "codeExpired" | "tooManyAttempts" | "internal";
    };

export async function verifyOtpAction(
  _prev: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: "invalidCode" };

  try {
    await signIn("otp", {
      phone: parsed.data.phone,
      code: parsed.data.code,
      redirectTo: "/me/dashboard",
    });
    return null;
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCode" };
    }
    throw e;
  }
}
