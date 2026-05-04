"use server";

import { signOut } from "@/lib/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/sign-in" });
}

export async function signOutMemberAction() {
  await signOut({ redirectTo: "/auth/member" });
}
