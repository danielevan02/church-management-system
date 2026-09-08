import { addMonths, format, startOfWeek } from "date-fns";
import { BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { AddAssignmentDialog } from "@/components/admin/volunteers/add-assignment-dialog";
import { AddTeamForWeekDialog } from "@/components/admin/volunteers/add-team-for-week-dialog";
import { AssignmentRowActions } from "@/components/admin/volunteers/assignment-row-actions";
import { GenerateWeekButton } from "@/components/admin/volunteers/generate-week-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Link } from "@/lib/i18n/navigation";
import {
  listTeamsWithDefaults,
  listUpcomingByWeek,
} from "@/server/queries/volunteers";

const MONTHS_AHEAD = 3;

export default async function VolunteersHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("volunteers.schedule");
  const tEyebrow = await getTranslations("eyebrow");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const sp = await searchParams;
  const fromParam = typeof sp.from === "string" ? sp.from : null;
  const fromDate = fromParam ? new Date(fromParam) : new Date();
  const from = startOfWeek(
    Number.isNaN(fromDate.getTime()) ? new Date() : fromDate,
    { weekStartsOn: 1 },
  );

  const [result, teamsWithDefaults] = await Promise.all([
    listUpcomingByWeek({ from, monthsAhead: MONTHS_AHEAD }),
    listTeamsWithDefaults(),
  ]);

  const prevHref = `/admin/volunteers?from=${format(addMonths(from, -MONTHS_AHEAD), "yyyy-MM-dd")}`;
  const nextHref = `/admin/volunteers?from=${format(addMonths(from, MONTHS_AHEAD), "yyyy-MM-dd")}`;
  const todayHref = `/admin/volunteers`;
  const isAtCurrent =
    format(from, "yyyy-MM-dd") ===
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("volunteers")}
        title={t("title")}
        subtitle={t("rangeSubtitle", {
              start: format(result.rangeStart, "dd MMM yyyy"),
              end: format(result.rangeEnd, "dd MMM yyyy"),
              total: result.total,
            })}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/volunteers/teams">
                <Layers className="h-4 w-4" />
                {t("manageTeams")}
              </Link>
            </Button>
            <GenerateWeekButton teams={teamsWithDefaults} />
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={prevHref}>
            <ChevronLeft className="h-4 w-4" />
            {t("prevQuarter")}
          </Link>
        </Button>
        {!isAtCurrent ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={todayHref}>{t("today")}</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link href={nextHref}>
            {t("nextQuarter")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {result.activeTeams.length === 0 ? (
        <EmptyState icon={HeartHandshake} title={t("noTeamsYet")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="flex flex-col gap-6">
          {result.weeks.map((week) => {
            const conflictSet = new Set(week.conflictMemberIds);
            return (
              <BlockSection
                key={week.weekStart.toISOString()}
                icon={CalendarRange}
                staggerChildren
                title={t("weekHeader", {
                  date: format(week.serviceDate, "dd MMM yyyy"),
                })}
                description={
                  <>
                    {format(week.weekStart, "dd MMM")} —{" "}
                    {format(week.weekEnd, "dd MMM yyyy")} ·{" "}
                    {t("totalAssignments", { count: week.total })}
                  </>
                }
                action={
                  <div className="flex items-center gap-2">
                    {conflictSet.size > 0 ? (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {t("weekConflictCount", { count: conflictSet.size })}
                      </Badge>
                    ) : null}
                    <AddTeamForWeekDialog
                      teams={result.activeTeams}
                      serviceDate={week.serviceDate}
                    />
                  </div>
                }
                bodyClassName="flex flex-col gap-5"
              >
                  {week.teams.map((team) => (
                    <div
                      key={team.teamId}
                      className="border-l-2 border-primary/20 pl-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {team.teamName}
                          </h3>
                          <span className="text-xs text-on-surface-variant">
                            ({team.assignments.length})
                          </span>
                        </div>
                        <AddAssignmentDialog
                          teamId={team.teamId}
                          teamName={team.teamName}
                          positions={team.positions}
                          serviceDate={week.serviceDate}
                        />
                      </div>
                      <ul className="flex flex-col gap-2">
                          {team.assignments.map((a) => {
                            const hasConflict = conflictSet.has(a.member.id);
                            return (
                              <li
                                key={a.id}
                                className="flex flex-col gap-2 rounded-2xl bg-surface-container-low p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {a.member.photoUrl ? (
                                      <AvatarImage
                                        src={a.member.photoUrl}
                                        alt={a.member.fullName}
                                      />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                      {a.member.fullName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex min-w-0 flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <Link
                                        href={`/admin/members/${a.member.id}`}
                                        className="truncate text-sm font-medium hover:underline"
                                      >
                                        {a.member.fullName}
                                      </Link>
                                      {hasConflict ? (
                                        <Badge
                                          variant="warning"
                                          className="h-5 gap-1 px-2.5 text-label-sm"
                                        >
                                          <AlertTriangle className="h-3 w-3" />
                                          {t("conflictBadge")}
                                        </Badge>
                                      ) : null}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                      {a.position?.name ? (
                                        <span className="truncate">
                                          {a.position.name}
                                        </span>
                                      ) : null}
                                      <span className="tabular-nums">
                                        {format(a.serviceDate, "EEE, dd MMM")}
                                      </span>
                                      <StatusBadge
                                        status={a.status}
                                        label={tStatus(statusKey(a.status))}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <AssignmentRowActions
                                  id={a.id}
                                  status={a.status as never}
                                  memberName={a.member.fullName}
                                />
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
              </BlockSection>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "CONFIRMED"
      ? "default"
      : status === "PENDING"
        ? "outline"
        : status === "DECLINED"
          ? "destructive"
          : "secondary";
  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  );
}

function statusKey(s: string): string {
  switch (s) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "DECLINED":
      return "declined";
    case "COMPLETED":
      return "completed";
    default:
      return s.toLowerCase();
  }
}
