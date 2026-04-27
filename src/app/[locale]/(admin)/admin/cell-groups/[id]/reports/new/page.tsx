import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { CellGroupReportForm } from "@/components/admin/cell-groups/report-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/cell-groups/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {group.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <CellGroupReportForm cellGroupId={id} />
    </div>
  );
}
