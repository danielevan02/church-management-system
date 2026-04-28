"use server";

import { auth } from "@/lib/auth";
import { hasAtLeastRole } from "@/lib/permissions";
import { searchChildren, type ChildSearchResult } from "@/server/queries/children";

export type ChildSearchActionResult =
  | { ok: true; data: ChildSearchResult[] }
  | { ok: false; error: string };

export async function searchChildrenAction(
  query: string,
): Promise<ChildSearchActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "UNAUTHORIZED" };
  if (!hasAtLeastRole(session.user.role, "STAFF")) {
    return { ok: false, error: "FORBIDDEN" };
  }
  const q = query.trim();
  if (q.length < 2) return { ok: true, data: [] };
  try {
    const data = await searchChildren(q, 10);
    return { ok: true, data };
  } catch (e) {
    console.error("[searchChildren]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
