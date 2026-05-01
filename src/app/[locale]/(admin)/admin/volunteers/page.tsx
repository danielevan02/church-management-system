import { addMonths, format, startOfWeek } from "date-fns";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AssignmentRowActions } from "@/components/admin/volunteers/assignment-row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import { listUpcomingByWeek } from "@/server/queries/volunteers";

const MONTHS_AHEAD = 3;

export default async function VolunteersHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("volunteers.schedule");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const sp = await searchParams;
  const fromParam = typeof sp.from === "string" ? sp.from : null;
  const fromDate = fromParam ? new Date(fromParam) : new Date();
  const from = startOfWeek(
    Number.isNaN(fromDate.getTime()) ? new Date() : fromDate,
    { weekStartsOn: 1 },
  );

  const result = await listUpcomingByWeek({ from, monthsAhead: MONTHS_AHEAD });

  const prevHref = `/admin/volunteers?from=${format(addMonths(from, -MONTHS_AHEAD), "yyyy-MM-dd")}`;
  const nextHref = `/admin/volunteers?from=${format(addMonths(from, MONTHS_AHEAD), "yyyy-MM-dd")}`;
  const todayHref = `/admin/volunteers`;
  const isAtCurrent =
    format(from, "yyyy-MM-dd") ===
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("rangeSubtitle", {
              start: format(result.rangeStart, "dd MMM yyyy"),
              end: format(result.rangeEnd, "dd MMM yyyy"),
              total: result.total,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/volunteers/teams">
              <Layers className="h-4 w-4" />
              {t("manageTeams")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/volunteers/assignments/new">
              <Plus className="h-4 w-4" />
              {t("newAssignment")}
            </Link>
          </Button>
        </div>
      </header>

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

      {result.weeks.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {result.weeks.map((week) => {
            const conflictSet = new Set(week.conflictMemberIds);
            return (
              <Card key={week.weekStart.toISOString()}>
                <CardHeader className="flex flex-row items-baseline justify-between gap-3 border-b pb-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-lg font-semibold">
                      {t("weekHeader", {
                        date: format(week.weekEnd, "EEEE, dd MMM yyyy"),
                      })}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {format(week.weekStart, "dd MMM")} —{" "}
                      {format(week.weekEnd, "dd MMM yyyy")} ·{" "}
                      {t("totalAssignments", { count: week.total })}
                    </p>
                  </div>
                  {conflictSet.size > 0 ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {t("weekConflictCount", { count: conflictSet.size })}
                    </Badge>
                  ) : null}
                </CardHeader>
                <CardContent className="flex flex-col gap-5 pt-5">
                  {week.teams.map((team) => (
                    <div
                      key={team.teamId}
                      className="border-l-2 border-primary/20 pl-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {team.teamName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          ({team.assignments.length})
                        </span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {team.assignments.map((a) => {
                          const hasConflict = conflictSet.has(a.member.id);
                          return (
                            <li
                              key={a.id}
                              className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
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
                                        variant="outline"
                                        className="gap-1 border-amber-500/40 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                                      >
                                        <AlertTriangle className="h-3 w-3" />
                                        {t("conflictBadge")}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
    <Badge variant={variant} className="px-1.5 py-0 text-[10px]">
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
