import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
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

  const tEyebrow = await getTranslations("eyebrow");
  const teams = await listAllTeams();

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("volunteers")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
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
