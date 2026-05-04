"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/lib/auth";

const schema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1),
});

export type SignInState =
  | null
  | {
      error: "invalidCredentials" | "internal";
      fieldErrors?: Record<string, string[]>;
    };

export async function signInCredentialsAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = schema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "invalidCredentials",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/admin/dashboard",
    });
    return null;
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw e;
  }
}
