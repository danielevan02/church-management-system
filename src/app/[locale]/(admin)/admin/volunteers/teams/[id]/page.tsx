import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { AddPositionForm } from "@/components/admin/volunteers/add-position-form";
import { DeletePositionButton } from "@/components/admin/volunteers/delete-position-button";
import { TeamDefaultsSection } from "@/components/admin/volunteers/team-defaults-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Link } from "@/lib/i18n/navigation";
import {
  getTeam,
  listAssignments,
} from "@/server/queries/volunteers";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const t = await getTranslations("volunteers.team.detail");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const recent = (
    await listAssignments({
      filters: { teamId: id },
      upcomingOnly: true,
      pageSize: 20,
    })
  ).items;

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/volunteers/teams"
        backLabel={t("backToList")}
        title={team.name}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={team.isActive ? "default" : "secondary"}>
              {team.isActive ? t("statusActive") : t("statusInactive")}
            </Badge>
            {team.description ? (
              <span>· {team.description}</span>
            ) : null}
          </div>
        }
        action={
          <>
            <Button asChild variant="outline">
              <Link href={`/admin/volunteers/teams/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/volunteers/assignments/new?team=${id}`}>
                <Plus className="h-4 w-4" />
                {t("assign")}
              </Link>
            </Button>
          </>
        }
      />

      <BlockSection
        title={t("positionsTitle")}
        description={t("positionsDescription")}
        bodyClassName="flex flex-col gap-4"
      >
        <AddPositionForm teamId={id} />
        {team.positions.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("positionsEmpty")}</p>
        ) : (
          <ul suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2 text-sm">
            {team.positions.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-2xl p-3 bg-surface-container-high"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {!p.isActive ? (
                    <Badge variant="secondary" className="text-xs">
                      {t("statusInactive")}
                    </Badge>
                  ) : null}
                </div>
                <DeletePositionButton id={p.id} />
              </li>
            ))}
          </ul>
        )}
      </BlockSection>

      <BlockSection
        title={t("defaultsTitle")}
        description={t("defaultsDescription")}
      >
        <TeamDefaultsSection
          teamId={id}
          positions={team.positions.map((p) => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive,
          }))}
          defaults={team.defaults}
        />
      </BlockSection>

      <BlockSection
        title={t("upcomingTitle")}
        description={t("upcomingDescription")}
      >
        {recent.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("upcomingEmpty")}</p>
        ) : (
          <ul suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2 text-sm">
            {recent.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-2xl p-3 bg-surface-container-high"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/admin/members/${a.member.id}`}
                    className="font-medium hover:underline"
                  >
                    {a.member.fullName}
                  </Link>
                  <span className="text-xs text-on-surface-variant">
                    {format(a.serviceDate, "EEE dd MMM yyyy")}
                    {a.position ? ` · ${a.position.name}` : ""}
                  </span>
                </div>
                <Badge>{tStatus(a.status.toLowerCase() as never)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </BlockSection>
    </div>
  );
}
