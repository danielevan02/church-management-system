import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarDays,
  HandCoins,
  HeartHandshake,
  Megaphone,
  PlusCircle,
  ScanLine,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { listRecentAuditLogs } from "@/server/queries/audit";
import { listEvents } from "@/server/queries/events";
import { getUpcomingFollowUps } from "@/server/queries/pastoral";
import { countOpenPrayerRequests } from "@/server/queries/prayer-requests";
import {
  getAttendanceSnapshot,
  getCellGroupSnapshot,
  getGivingSnapshot,
  getMembershipSnapshot,
} from "@/server/queries/reports";
import { getUpcomingServices } from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const canSeeGiving = hasAtLeastRole(session.user.role, "ADMIN") && features.giving;
  const canSeeAudit = hasAtLeastRole(session.user.role, "ADMIN");

  const t = await getTranslations("dashboard.admin");

  const [
    membership,
    attendance,
    cellGroups,
    giving,
    openPrayerCount,
    upcomingServices,
    upcomingEvents,
    followUps,
    auditLogs,
  ] = await Promise.all([
    getMembershipSnapshot(),
    getAttendanceSnapshot(),
    getCellGroupSnapshot(),
    canSeeGiving ? getGivingSnapshot() : Promise.resolve(null),
    countOpenPrayerRequests(),
    getUpcomingServices(3),
    listEvents({ upcomingOnly: true, publishedOnly: false, pageSize: 3 }),
    features.pastoralCare ? getUpcomingFollowUps(5) : Promise.resolve([]),
    canSeeAudit ? listRecentAuditLogs(10) : Promise.resolve([]),
  ]);

  const topEvents = upcomingEvents.items;
  const greetingName = session.user.username ?? "Admin";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcome", { name: greetingName })}{" "}
          {t("subtitle", { date: format(new Date(), "EEEE, dd MMM yyyy") })}
        </p>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label={t("kpi.activeMembers")}
          value={membership.totalActive.toLocaleString("id-ID")}
          hint={t("kpi.activeMembersHint", { count: membership.joinedThisMonth })}
        />
        <KpiCard
          icon={UserCheck}
          label={t("kpi.lastService")}
          value={
            attendance.lastService?.total != null
              ? attendance.lastService.total.toLocaleString("id-ID")
              : t("kpi.noService")
          }
          hint={
            attendance.lastService
              ? t("kpi.lastServiceHint", { avg: attendance.avgLast4Weeks })
              : undefined
          }
        />
        {canSeeGiving && giving ? (
          <KpiCard
            icon={HandCoins}
            label={t("kpi.thisMonthGiving")}
            value={formatRupiah(giving.thisMonthTotal)}
            hint={t("kpi.thisMonthGivingHint", { count: giving.thisMonthCount })}
          />
        ) : (
          <KpiCard
            icon={UsersRound}
            label={t("kpi.cellCoverage")}
            value={`${cellGroups.coveredPercent}%`}
            hint={t("kpi.cellCoverageHint", {
              covered: cellGroups.coveredCount,
              total: cellGroups.totalActiveMembers,
            })}
          />
        )}
        <KpiCard
          icon={HeartHandshake}
          label={t("kpi.openPrayer")}
          value={openPrayerCount.toLocaleString("id-ID")}
          hint={t("kpi.openPrayerHint")}
        />
      </div>

      {/* Today + Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5" />
              {t("today.title")}
            </CardTitle>
            <CardDescription>{t("today.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <section className="flex flex-col gap-2">
              <SectionLabel
                title={t("today.services")}
                href="/admin/attendance/services"
                cta={t("today.manageServices")}
              />
              {upcomingServices.length === 0 ? (
                <EmptyHint text={t("today.noServices")} />
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {upcomingServices.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/admin/attendance/services/${s.id}`}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted/60"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatJakarta(s.startsAt, "EEE dd MMM · HH:mm")}
                            {s.location ? ` · ${s.location}` : ""}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <SectionLabel
                title={t("today.events")}
                href="/admin/events"
                cta={t("today.manageEvents")}
              />
              {topEvents.length === 0 ? (
                <EmptyHint text={t("today.noEvents")} />
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {topEvents.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/admin/events/${e.id}`}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted/60"
                      >
                        <div className="flex flex-col">
                          <span className="flex items-center gap-2 font-medium">
                            {e.title}
                            {!e.isPublished ? (
                              <Badge variant="outline" className="text-[10px]">
                                Draft
                              </Badge>
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatJakarta(e.startsAt, "EEE dd MMM · HH:mm")}
                            {e.location ? ` · ${e.location}` : ""}
                          </span>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {e._count.rsvps} RSVP
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5" />
              {t("attention.title")}
            </CardTitle>
            <CardDescription>{t("attention.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {features.pastoralCare ? (
              <section className="flex flex-col gap-2">
                <SectionLabel
                  title={t("attention.followUps")}
                  href="/admin/pastoral"
                  cta={t("attention.viewFollowUps")}
                />
                {followUps.length === 0 ? (
                  <EmptyHint text={t("attention.noFollowUps")} />
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {followUps.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{f.member.fullName}</span>
                          {f.followUp ? (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                              {f.followUp}
                            </span>
                          ) : null}
                        </div>
                        {f.followUpDate ? (
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {format(f.followUpDate, "dd MMM")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="flex flex-col gap-2">
              <SectionLabel
                title={t("attention.openPrayer")}
                href="/admin/prayer-requests"
                cta={t("attention.viewPrayer")}
              />
              {openPrayerCount === 0 ? (
                <EmptyHint text={t("attention.noOpenPrayer")} />
              ) : (
                <Link
                  href="/admin/prayer-requests"
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    {t("kpi.openPrayer")}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {openPrayerCount}
                  </span>
                </Link>
              )}
            </section>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("quickActions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <QuickAction
              href="/admin/members/new"
              icon={PlusCircle}
              label={t("quickActions.newMember")}
            />
            <QuickAction
              href="/admin/attendance"
              icon={ScanLine}
              label={t("quickActions.checkIn")}
            />
            {canSeeGiving ? (
              <QuickAction
                href="/admin/giving/new"
                icon={HandCoins}
                label={t("quickActions.newGiving")}
              />
            ) : null}
            <QuickAction
              href="/admin/announcements/new"
              icon={Megaphone}
              label={t("quickActions.newAnnouncement")}
            />
            <QuickAction
              href="/admin/events/new"
              icon={Calendar}
              label={t("quickActions.newEvent")}
            />
            <QuickAction
              href="/admin/reports"
              icon={BarChart3}
              label={t("quickActions.reports")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent activity (ADMIN+) */}
      {canSeeAudit ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" />
                {t("activity.title")}
              </CardTitle>
              <CardDescription>{t("activity.description")}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/settings/audit">{t("activity.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <EmptyHint text={t("activity.empty")} />
            ) : (
              <ul className="flex flex-col divide-y">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2 font-medium">
                        <Badge variant="outline" className="text-[10px]">
                          {log.action}
                        </Badge>
                        <span className="truncate">{log.entityType}</span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {log.user?.username ?? "system"}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatJakarta(log.createdAt, "dd MMM HH:mm")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs">{label}</span>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

function SectionLabel({
  title,
  href,
  cta,
}: {
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{title}</span>
      <Button asChild variant="link" size="sm" className="h-auto px-0">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
      {text}
    </p>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
      <Link href={href}>
        <Icon className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </Link>
    </Button>
  );
}
