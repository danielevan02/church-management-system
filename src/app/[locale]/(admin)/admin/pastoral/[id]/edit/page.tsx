import { format } from "date-fns";

import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { VisitEditForm } from "./visit-edit-form";

import { features } from "@/config/features";
import { auth } from "@/lib/auth";

import { hasAtLeastRole } from "@/lib/permissions";
import { getPastoralVisit } from "@/server/queries/pastoral";

export default async function EditPastoralVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!features.pastoralCare) notFound();

  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "LEADER")) notFound();

  const { id } = await params;
  const visit = await getPastoralVisit(id);
  if (!visit) notFound();

  const t = await getTranslations("pastoral");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/pastoral"
        backLabel={t("edit.back")}
        title={t("edit.title")}
      />
      <VisitEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialMemberName={visit.member.fullName}
        initialValues={{
          memberId: visit.memberId,
          visitType: visit.visitType as never,
          visitedAt: format(visit.visitedAt, "yyyy-MM-dd"),
          notes: visit.notes,
          followUp: visit.followUp ?? "",
          followUpDate: visit.followUpDate
            ? format(visit.followUpDate, "yyyy-MM-dd")
            : "",
        }}
      />
    </div>
  );
}
