import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarClock,
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

import { BlockRow, BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { QuickActionGrid, QuickActionTile } from "@/components/m3/quick-action";
import { SectionHeader } from "@/components/m3/section-header";
import { StatGrid, StatTile } from "@/components/m3/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { getAuditDisplay } from "@/lib/audit-display";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
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

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const canSeeGiving =
    hasAtLeastRole(session.user.role, "ADMIN") && features.giving;
  const canSeeAudit = hasAtLeastRole(session.user.role, "ADMIN");

  const t = await getTranslations("dashboard.admin");
  const tEyebrow = await getTranslations("eyebrow");
  const tEvents = await getTranslations("events.list");

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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("dashboard")}
        title={t("title")}
        subtitle={`${t("welcome", { name: greetingName })} ${t("subtitle", {
          date: format(new Date(), "EEEE, dd MMM yyyy"),
        })}`}
      />

      {/* KPI strip */}
      <StatGrid>
        <StatTile
          icon={Users}
          label={t("kpi.activeMembers")}
          value={membership.totalActive.toLocaleString("id-ID")}
          hint={t("kpi.activeMembersHint", {
            count: membership.joinedThisMonth,
          })}
          href="/admin/members"
        />
        <StatTile
          icon={UserCheck}
          tone="secondary"
          label={t("kpi.lastService")}
          /* When there is no service yet the tile shows an em dash, not the
             sentence: a `text-3xl` fallback string sits at display size next to
             four numerals and reads as the largest number on the page. */
          value={
            attendance.lastService?.total != null
              ? attendance.lastService.total.toLocaleString("id-ID")
              : "—"
          }
          hint={
            attendance.lastService
              ? t("kpi.lastServiceHint", { avg: attendance.avgLast4Weeks })
              : t("kpi.noService")
          }
          href="/admin/attendance"
        />
        {canSeeGiving && giving ? (
          <StatTile
            icon={HandCoins}
            tone="tertiary"
            label={t("kpi.thisMonthGiving")}
            value={formatRupiah(giving.thisMonthTotal)}
            hint={t("kpi.thisMonthGivingHint", { count: giving.thisMonthCount })}
            href="/admin/giving"
          />
        ) : (
          <StatTile
            icon={UsersRound}
            tone="tertiary"
            label={t("kpi.cellCoverage")}
            value={`${cellGroups.coveredPercent}%`}
            hint={t("kpi.cellCoverageHint", {
              covered: cellGroups.coveredCount,
              total: cellGroups.totalActiveMembers,
            })}
            href="/admin/cell-groups"
          />
        )}
        <StatTile
          icon={HeartHandshake}
          tone="neutral"
          label={t("kpi.openPrayer")}
          value={openPrayerCount.toLocaleString("id-ID")}
          hint={t("kpi.openPrayerHint")}
          href="/admin/prayer-requests"
        />
      </StatGrid>

      {/* Today + Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BlockSection
          icon={CalendarDays}
          title={t("today.title")}
          description={t("today.description")}
          bodyClassName="flex flex-col gap-5"
          staggerChildren
        >
          <section className="flex flex-col gap-2">
            <SectionHeader
              title={t("today.services")}
              action={{
                href: "/admin/attendance/services",
                label: t("today.manageServices"),
              }}
              size="sm"
              className="px-0"
            />
            {upcomingServices.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                tone="quiet"
                size="sm"
                title={t("today.noServices")}
              />
            ) : (
              <div suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2">
                {upcomingServices.map((s) => (
                  <BlockRow key={s.id} interactive asChild>
                    <Link href={`/admin/attendance/services/${s.id}`}>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-on-surface">
                          {s.name}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {formatJakarta(s.startsAt, "EEE dd MMM · HH:mm")}
                          {s.location ? ` · ${s.location}` : ""}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    </Link>
                  </BlockRow>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <SectionHeader
              title={t("today.events")}
              action={{ href: "/admin/events", label: t("today.manageEvents") }}
              size="sm"
              className="px-0"
            />
            {topEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                tone="quiet"
                size="sm"
                title={t("today.noEvents")}
              />
            ) : (
              <div suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2">
                {topEvents.map((e) => (
                  <BlockRow key={e.id} interactive asChild>
                    <Link href={`/admin/events/${e.id}`}>
                      <div className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-2 text-sm font-bold text-on-surface">
                          <span className="truncate">{e.title}</span>
                          {!e.isPublished ? (
                            <Badge variant="outline" className="text-[10px]">
                              {tEvents("statusDraft")}
                            </Badge>
                          ) : null}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {formatJakarta(e.startsAt, "EEE dd MMM · HH:mm")}
                          {e.location ? ` · ${e.location}` : ""}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
                        {e._count.rsvps} RSVP
                      </span>
                    </Link>
                  </BlockRow>
                ))}
              </div>
            )}
          </section>
        </BlockSection>

        <BlockSection
          icon={AlertCircle}
          iconTone="warning"
          title={t("attention.title")}
          description={t("attention.description")}
          bodyClassName="flex flex-col gap-5"
          staggerChildren
        >
          {features.pastoralCare ? (
            <section className="flex flex-col gap-2">
              <SectionHeader
                title={t("attention.followUps")}
                action={{
                  href: "/admin/pastoral",
                  label: t("attention.viewFollowUps"),
                }}
                size="sm"
                className="px-0"
              />
              {followUps.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  tone="quiet"
                  size="sm"
                  title={t("attention.noFollowUps")}
                />
              ) : (
                <div suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2">
                  {followUps.map((f) => (
                    <BlockRow key={f.id}>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-on-surface">
                          {f.member.fullName}
                        </span>
                        {f.followUp ? (
                          <span className="line-clamp-1 text-xs text-on-surface-variant">
                            {f.followUp}
                          </span>
                        ) : null}
                      </div>
                      {f.followUpDate ? (
                        <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
                          {format(f.followUpDate, "dd MMM")}
                        </span>
                      ) : null}
                    </BlockRow>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="flex flex-col gap-2">
            <SectionHeader
              title={t("attention.openPrayer")}
              action={{
                href: "/admin/prayer-requests",
                label: t("attention.viewPrayer"),
              }}
              size="sm"
              className="px-0"
            />
            {openPrayerCount === 0 ? (
              <EmptyState
                icon={HeartHandshake}
                tone="quiet"
                size="sm"
                title={t("attention.noOpenPrayer")}
              />
            ) : (
              <BlockRow interactive asChild>
                <Link href="/admin/prayer-requests">
                  <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <HeartHandshake className="h-4 w-4 text-primary" />
                    {t("kpi.openPrayer")}
                  </span>
                  <span className="text-base font-bold tabular-nums text-on-surface">
                    {openPrayerCount}
                  </span>
                </Link>
              </BlockRow>
            )}
          </section>
        </BlockSection>
      </div>

      {/* Quick actions */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon={PlusCircle} title={t("quickActions.title")} />
        <QuickActionGrid>
          <QuickActionTile
            href="/admin/members/new"
            icon={PlusCircle}
            label={t("quickActions.newMember")}
          />
          <QuickActionTile
            href="/admin/attendance"
            icon={ScanLine}
            label={t("quickActions.checkIn")}
          />
          {canSeeGiving ? (
            <QuickActionTile
              href="/admin/giving/new"
              icon={HandCoins}
              label={t("quickActions.newGiving")}
            />
          ) : null}
          <QuickActionTile
            href="/admin/announcements/new"
            icon={Megaphone}
            label={t("quickActions.newAnnouncement")}
          />
          <QuickActionTile
            href="/admin/events/new"
            icon={Calendar}
            label={t("quickActions.newEvent")}
          />
          <QuickActionTile
            href="/admin/reports"
            icon={BarChart3}
            label={t("quickActions.reports")}
          />
        </QuickActionGrid>
      </section>

      {/* Recent activity (ADMIN+) */}
      {canSeeAudit ? (
        <BlockSection
          icon={Activity}
          iconTone="neutral"
          title={t("activity.title")}
          description={t("activity.description")}
          staggerChildren
          action={
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-xs text-primary"
            >
              <Link href="/admin/settings/audit">{t("activity.viewAll")}</Link>
            </Button>
          }
          bodyClassName="flex flex-col gap-2"
        >
          {auditLogs.length === 0 ? (
            <EmptyState
              icon={Activity}
              tone="quiet"
              size="sm"
              title={t("activity.empty")}
            />
          ) : (
            auditLogs.map((log) => {
              const display = getAuditDisplay(log.action);
              const AuditIcon = display.icon;

              return (
                <BlockRow key={log.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                        display.tone === "primary" && "bg-primary/10 text-primary",
                        display.tone === "secondary" && "bg-secondary-container text-on-secondary-container",
                        display.tone === "tertiary" && "bg-tertiary-container text-on-tertiary-container",
                        display.tone === "error" && "bg-error-container text-on-error-container",
                        display.tone === "neutral" && "bg-surface-container-highest text-on-surface-variant",
                      )}
                    >
                      <AuditIcon className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-on-surface">
                        {t(`activity.actions.${display.labelKey}`)}
                      </span>
                      <span className="truncate text-xs text-on-surface-variant">
                        {t("activity.by", {
                          actor: log.user?.username ?? "system",
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
                    {formatJakarta(log.createdAt, "dd MMM HH:mm")}
                  </span>
                </BlockRow>
              );
            })
          )}
        </BlockSection>
      ) : null}
    </div>
  );
}
