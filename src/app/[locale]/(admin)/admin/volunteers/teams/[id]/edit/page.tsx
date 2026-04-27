import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { TeamEditForm } from "./team-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getTeam } from "@/server/queries/volunteers";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const t = await getTranslations("volunteers.team");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/volunteers/teams/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {team.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
      <TeamEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: team.name,
          description: team.description ?? "",
          isActive: team.isActive,
        }}
      />
    </div>
  );
}
