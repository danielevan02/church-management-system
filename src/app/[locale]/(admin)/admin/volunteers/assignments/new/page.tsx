import { getTranslations } from "next-intl/server";

import { AssignmentForm } from "@/components/admin/volunteers/assignment-form";
import { listAllTeams } from "@/server/queries/volunteers";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const teamParam = Array.isArray(sp.team) ? sp.team[0] : sp.team;

  const t = await getTranslations("volunteers.assignment.new");
  const teams = await listAllTeams();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AssignmentForm
        teams={teams.map((t) => ({
          id: t.id,
          name: t.name,
          positions: t.positions,
        }))}
        initialTeamId={teamParam ?? undefined}
        submitLabel={t("submit")}
      />
    </div>
  );
}
