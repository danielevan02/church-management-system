import { format } from "date-fns";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { MilestoneEditForm } from "./milestone-edit-form";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/discipleship"
        backLabel={t("edit.back")}
        title={t("edit.title")}
      />
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
