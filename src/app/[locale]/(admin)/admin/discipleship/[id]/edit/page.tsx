import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { MilestoneEditForm } from "./milestone-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getMilestone } from "@/server/queries/discipleship";

export default async function EditMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const milestone = await getMilestone(id);
  if (!milestone) notFound();

  const t = await getTranslations("discipleship");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/discipleship">
            <ArrowLeft className="h-4 w-4" />
            {t("edit.back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
      <MilestoneEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialMemberName={milestone.member.fullName}
        initialValues={{
          memberId: milestone.memberId,
          type: milestone.type as never,
          achievedAt: format(milestone.achievedAt, "yyyy-MM-dd"),
          notes: milestone.notes ?? "",
        }}
      />
    </div>
  );
}
