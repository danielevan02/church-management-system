"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/lib/auth";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, signInWithPin } from "@/lib/pin";

const schema = z.object({
  phone: z.string().min(6).max(20),
  pin: z
    .string()
    .regex(new RegExp(`^\\d{${PIN_MIN_LENGTH},${PIN_MAX_LENGTH}}$`)),
});

export type SignInPinState =
  | null
  | {
      error:
        | "invalidCredentials"
        | "noPinSet"
        | "accountInactive"
        | "throttled"
        | "internal";
      retryAfterS?: number;
    };

export async function signInPinAction(
  _prev: SignInPinState,
  formData: FormData,
): Promise<SignInPinState> {
  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { error: "invalidCredentials" };

  // Run sign-in logic first (without NextAuth) so we can surface specific
  // errors like throttled / no-pin-set rather than a generic Auth.js failure.
  const probe = await signInWithPin(parsed.data.phone, parsed.data.pin);
  if (!probe.ok) {
    switch (probe.reason) {
      case "THROTTLED":
        return { error: "throttled", retryAfterS: probe.retryAfterS };
      case "NO_PIN_SET":
        return { error: "noPinSet" };
      case "ACCOUNT_INACTIVE":
        return { error: "accountInactive" };
      case "INVALID_CREDENTIALS":
        return { error: "invalidCredentials" };
      default:
        return { error: "internal" };
    }
  }

  const redirectTo =
    probe.user.role === "MEMBER" ? "/me/dashboard" : "/admin/dashboard";

  try {
    await signIn("pin", {
      phone: parsed.data.phone,
      pin: parsed.data.pin,
      redirectTo,
    });
    return null;
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw e;
  }
}
