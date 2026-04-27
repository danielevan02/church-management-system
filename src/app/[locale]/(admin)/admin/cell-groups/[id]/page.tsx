import { format } from "date-fns";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { AssignCellGroupMemberForm } from "@/components/admin/cell-groups/assign-member-form";
import { RemoveCellGroupMemberButton } from "@/components/admin/cell-groups/remove-member-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { canAccessCellGroup } from "@/lib/permissions";
import {
  getCellGroup,
  getCellGroupReports,
} from "@/server/queries/cell-groups";

export default async function CellGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const allowed = await canAccessCellGroup(
    {
      id: session.user.id ?? "",
      role: session.user.role,
      memberId: session.user.memberId ?? null,
    },
    id,
  );
  if (!allowed) redirect("/admin/cell-groups");

  const group = await getCellGroup(id);
  if (!group) notFound();

  const reports = await getCellGroupReports(id, 10);

  const t = await getTranslations("cellGroups.detail");
  const tDay = await getTranslations("cellGroups.day");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/cell-groups">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={group.isActive ? "default" : "secondary"}>
                {group.isActive ? t("statusActive") : t("statusInactive")}
              </Badge>
              {group.parentGroup ? (
                <>
                  <span>•</span>
                  <span>
                    {t("parentLabel")}:{" "}
                    <Link
                      href={`/admin/cell-groups/${group.parentGroup.id}`}
                      className="text-primary hover:underline"
                    >
                      {group.parentGroup.name}
                    </Link>
                  </span>
                </>
              ) : null}
            </div>
            {group.description ? (
              <p className="text-sm text-muted-foreground">{group.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/cell-groups/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/cell-groups/${id}/reports/new`}>
                <Plus className="h-4 w-4" />
                {t("submitReport")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("scheduleTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("dayLabel")}</span>
              <span className="font-medium">
                {group.meetingDay ? tDay(group.meetingDay as never) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("timeLabel")}</span>
              <span className="font-medium">{group.meetingTime ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("locationLabel")}</span>
              <span className="font-medium">{group.meetingLocation ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("leaderTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {group.leader.photoUrl ? (
                  <AvatarImage
                    src={group.leader.photoUrl}
                    alt={group.leader.fullName}
                  />
                ) : null}
                <AvatarFallback>
                  {group.leader.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Link
                  href={`/admin/members/${group.leader.id}`}
                  className="font-medium hover:underline"
                >
                  {group.leader.fullName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {group.leader.phone ?? "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {group.childGroups.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("childGroupsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {group.childGroups.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/cell-groups/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                    {!c.isActive ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({t("statusInactive")})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("membersTitle")}</CardTitle>
          <CardDescription>
            {t("membersDescription", { count: group.members.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AssignCellGroupMemberForm cellGroupId={id} />
          {group.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("membersEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {group.members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {m.member.photoUrl ? (
                        <AvatarImage
                          src={m.member.photoUrl}
                          alt={m.member.fullName}
                        />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {m.member.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/members/${m.member.id}`}
                        className="font-medium hover:underline"
                      >
                        {m.member.fullName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {t("joinedOn")}: {format(m.joinedAt, "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                  <RemoveCellGroupMemberButton
                    cellGroupId={id}
                    memberId={m.member.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("reportsTitle")}</CardTitle>
          <CardDescription>{t("reportsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("reportsEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(r.meetingDate, "EEEE, dd MMM yyyy")}
                    </span>
                    {r.topic ? (
                      <span className="text-xs text-muted-foreground">
                        {r.topic}
                      </span>
                    ) : null}
                    {r.notes ? (
                      <span className="mt-1 text-xs whitespace-pre-wrap">
                        {r.notes}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold tabular-nums">
                      {r.attendeeCount} {t("attendeesAbbr")}
                    </div>
                    {r.visitorCount > 0 ? (
                      <div className="text-muted-foreground tabular-nums">
                        +{r.visitorCount} {t("visitorsAbbr")}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
