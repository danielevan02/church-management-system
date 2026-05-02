import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { CellGroupEditForm } from "./cell-group-edit-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toJakartaInput } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { canAccessCellGroup, hasAtLeastRole } from "@/lib/permissions";
import {
  getCellGroup,
  listAllCellGroups,
  listLeaderCandidates,
} from "@/server/queries/cell-groups";

export default async function EditCellGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const allowed = await canAccessCellGroup(
    {
      id: session.user.id ?? "",
      role: session.user.role,
      memberId: session.user.memberId ?? null,
    },
    id,
  );
  if (!allowed) redirect("/admin/cell-groups");

  const [group, leaders, parents] = await Promise.all([
    getCellGroup(id),
    listLeaderCandidates(),
    listAllCellGroups(),
  ]);
  if (!group) notFound();

  const t = await getTranslations("cellGroups");
  const isStaff = hasAtLeastRole(session.user.role, "STAFF");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/cell-groups/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {group.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
      <CellGroupEditForm
        id={id}
        canChangeLeader={isStaff}
        leaders={leaders.map((m) => ({ id: m.id, fullName: m.fullName }))}
        parentGroups={parents
          .filter((g) => g.id !== id)
          .map((g) => ({ id: g.id, name: g.name }))}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: group.name,
          description: group.description ?? "",
          leaderId: group.leader.id,
          parentGroupId: group.parentGroup?.id ?? "",
          nextMeetingAt: group.nextMeetingAt
            ? toJakartaInput(group.nextMeetingAt)
            : "",
          nextMeetingLocation: group.nextMeetingLocation ?? "",
          nextMeetingNotes: group.nextMeetingNotes ?? "",
          isActive: group.isActive,
        }}
      />
    </div>
  );
}
