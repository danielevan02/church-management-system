import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  HandCoins,
  HeartHandshake,
  Sprout,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { MembershipGrowthChart } from "@/components/admin/reports/membership-growth-chart";
import { WeeklyTrendChart } from "@/components/admin/attendance/weekly-trend-chart";
import { MonthlyTrendChart } from "@/components/admin/giving/monthly-trend-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";
import { hasAtLeastRole } from "@/lib/permissions";
import { getWeeklyAttendanceTrend } from "@/server/queries/attendance";
import { getFundBreakdown, getMonthlyGivingTrend } from "@/server/queries/giving";
import {
  getAttendanceSnapshot,
  getCellGroupSnapshot,
  getDiscipleshipSnapshot,
  getGivingSnapshot,
  getMembershipGrowth,
  getMembershipSnapshot,
  getTopCities,
} from "@/server/queries/reports";
import { notFound } from "next/navigation";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const canSeeGiving = hasAtLeastRole(session.user.role, "ADMIN");

  const t = await getTranslations("reports");
  const tStatus = await getTranslations("members.form.status");
  const tMilestone = await getTranslations("discipleship.type");
  const tFundCategory = await getTranslations("giving.fund.category");

  const [
    membership,
    growth,
    cities,
    attendance,
    weeklyTrend,
    cellGroups,
    discipleship,
    giving,
    monthlyGiving,
    fundBreakdown,
  ] = await Promise.all([
    getMembershipSnapshot(),
    getMembershipGrowth(12),
    getTopCities(5),
    getAttendanceSnapshot(),
    getWeeklyAttendanceTrend(12),
    getCellGroupSnapshot(),
    getDiscipleshipSnapshot(),
    canSeeGiving ? getGivingSnapshot() : Promise.resolve(null),
    canSeeGiving ? getMonthlyGivingTrend(12) : Promise.resolve([]),
    canSeeGiving ? getFundBreakdown() : Promise.resolve([]),
  ]);

  const givingDelta =
    giving && giving.lastYearTotal > 0
      ? ((giving.ytdTotal - giving.lastYearTotal) / giving.lastYearTotal) * 100
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle", { date: format(new Date(), "dd MMM yyyy") })}
        </p>
      </header>

      {/* Membership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {t("membership.title")}
          </CardTitle>
          <CardDescription>{t("membership.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label={t("membership.totalActive")} value={membership.totalActive} />
            <Stat
              label={t("membership.joinedThisYear")}
              value={`+${membership.joinedThisYear}`}
            />
            <Stat
              label={t("membership.joinedThisMonth")}
              value={`+${membership.joinedThisMonth}`}
            />
            <Stat
              label={t("membership.cellGroupCoverage")}
              value={`${cellGroups.coveredPercent}%`}
            />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">{t("membership.growthTitle")}</h3>
            {growth.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("membership.empty")}</p>
            ) : (
              <MembershipGrowthChart data={growth} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t("membership.byStatusTitle")}
              </h3>
              <ul className="flex flex-col gap-1 text-sm">
                {membership.byStatus.map((row) => (
                  <li
                    key={row.status}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span>{tStatus(row.status.toLowerCase() as never)}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">{t("membership.topCitiesTitle")}</h3>
              {cities.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("membership.noCities")}</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {cities.map((c) => (
                    <li
                      key={c.city}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span>{c.city}</span>
                      <span className="font-semibold tabular-nums">{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5" />
            {t("attendance.title")}
          </CardTitle>
          <CardDescription>{t("attendance.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Stat
              label={t("attendance.lastService")}
              value={attendance.lastService?.total ?? 0}
              hint={
                attendance.lastService
                  ? format(attendance.lastService.startsAt, "EEE dd MMM")
                  : undefined
              }
            />
            <Stat
              label={t("attendance.avgLast4Weeks")}
              value={attendance.avgLast4Weeks}
            />
            <Stat
              label={t("attendance.uniqueThisMonth")}
              value={attendance.uniqueAttendeesThisMonth}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">{t("attendance.trendTitle")}</h3>
            {weeklyTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("attendance.empty")}</p>
            ) : (
              <WeeklyTrendChart data={weeklyTrend} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Giving (ADMIN+) */}
      {canSeeGiving && giving ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HandCoins className="h-5 w-5" />
              {t("giving.title")}
            </CardTitle>
            <CardDescription>{t("giving.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Stat label={t("giving.ytd")} value={formatRupiah(giving.ytdTotal)}>
                {givingDelta != null ? (
                  <Badge variant={givingDelta >= 0 ? "default" : "outline"}>
                    {givingDelta >= 0 ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(givingDelta).toFixed(1)}%
                  </Badge>
                ) : null}
              </Stat>
              <Stat
                label={t("giving.lastYear")}
                value={formatRupiah(giving.lastYearTotal)}
              />
              <Stat
                label={t("giving.thisMonth")}
                value={formatRupiah(giving.thisMonthTotal)}
                hint={t("giving.thisMonthHint", { count: giving.thisMonthCount })}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">{t("giving.trendTitle")}</h3>
              {monthlyGiving.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("giving.empty")}</p>
              ) : (
                <MonthlyTrendChart data={monthlyGiving} />
              )}
            </div>
            {fundBreakdown.length > 0 ? (
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  {t("giving.fundBreakdownTitle")}
                </h3>
                <ul className="flex flex-col gap-1 text-sm">
                  {fundBreakdown.map((row) => (
                    <li
                      key={row.fund?.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{row.fund?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.fund
                            ? tFundCategory(row.fund.category.toLowerCase() as never)
                            : ""}{" "}
                          · {row.count}
                        </span>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatRupiah(row.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Cell groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersRound className="h-5 w-5" />
            {t("cellGroups.title")}
          </CardTitle>
          <CardDescription>{t("cellGroups.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label={t("cellGroups.activeCount")}
              value={cellGroups.activeGroupCount}
            />
            <Stat label={t("cellGroups.leaders")} value={cellGroups.leaderCount} />
            <Stat
              label={t("cellGroups.coverage")}
              value={`${cellGroups.coveredPercent}%`}
              hint={t("cellGroups.coverageHint", {
                covered: cellGroups.coveredCount,
                total: cellGroups.totalActiveMembers,
              })}
            />
            <Stat
              label={t("cellGroups.avgGroupSize")}
              value={cellGroups.avgGroupSize.toFixed(1)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Discipleship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sprout className="h-5 w-5" />
            {t("discipleship.title")}
          </CardTitle>
          <CardDescription>{t("discipleship.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label={t("discipleship.thisYear")}
              value={discipleship.totalThisYear}
            />
            <Stat
              label={t("discipleship.allTime")}
              value={discipleship.totalAllTime}
            />
          </div>
          {discipleship.byType.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("discipleship.empty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {discipleship.byType.map((row) => (
                <li
                  key={row.type}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    {tMilestone(milestoneTypeKey(row.type))}
                  </span>
                  <span className="font-semibold tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {hint ? (
        <div className="text-xs text-muted-foreground">{hint}</div>
      ) : null}
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}

function milestoneTypeKey(type: string): string {
  switch (type) {
    case "DECISION_TO_FOLLOW":
      return "decisionToFollow";
    case "BAPTISM":
      return "baptism";
    case "MEMBERSHIP":
      return "membership";
    case "FOUNDATIONS_CLASS":
      return "foundationsClass";
    case "DISCIPLESHIP_CLASS":
      return "discipleshipClass";
    case "LEADERSHIP_TRAINING":
      return "leadershipTraining";
    case "CELL_GROUP_LEADER":
      return "cellGroupLeader";
    case "MISSION_TRIP":
      return "missionTrip";
    default:
      return "other";
  }
}
