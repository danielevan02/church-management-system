import { format } from "date-fns";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { AddPositionForm } from "@/components/admin/volunteers/add-position-form";
import { DeletePositionButton } from "@/components/admin/volunteers/delete-position-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/volunteers/teams">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={team.isActive ? "default" : "secondary"}>
                {team.isActive ? t("statusActive") : t("statusInactive")}
              </Badge>
              {team.description ? (
                <span>· {team.description}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("positionsTitle")}</CardTitle>
          <CardDescription>{t("positionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddPositionForm teamId={id} />
          {team.positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("positionsEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {team.positions.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("upcomingTitle")}</CardTitle>
          <CardDescription>{t("upcomingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("upcomingEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/members/${a.member.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.member.fullName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {format(a.serviceDate, "EEE dd MMM yyyy")}
                      {a.position ? ` · ${a.position.name}` : ""}
                    </span>
                  </div>
                  <Badge>{tStatus(a.status.toLowerCase() as never)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
