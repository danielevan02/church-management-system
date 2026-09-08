
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { CellGroupReportForm } from "@/components/admin/cell-groups/report-form";

import { auth } from "@/lib/auth";

import { canAccessCellGroup } from "@/lib/permissions";
import { getCellGroup } from "@/server/queries/cell-groups";

export default async function NewCellGroupReportPage({
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

  const group = await getCellGroup(id);
  if (!group) notFound();

  const t = await getTranslations("cellGroups.report");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/cell-groups/${id}`}
        backLabel={group.name}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <CellGroupReportForm cellGroupId={id} />
    </div>
  );
}
