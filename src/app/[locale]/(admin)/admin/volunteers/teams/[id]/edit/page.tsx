
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { TeamEditForm } from "./team-edit-form";

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/volunteers/teams/${id}`}
        backLabel={team.name}
        title={t("edit.title")}
      />
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
