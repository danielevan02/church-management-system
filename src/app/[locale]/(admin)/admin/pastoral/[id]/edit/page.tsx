import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { VisitEditForm } from "./visit-edit-form";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/pastoral">
            <ArrowLeft className="h-4 w-4" />
            {t("edit.back")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
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
