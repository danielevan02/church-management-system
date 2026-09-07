import { format } from "date-fns";
import {
  ArrowRight,
  Baby,
  Calendar,
  CalendarDays,
  HandCoins,
  Heart,
  HeartHandshake,
  MapPin,
  Megaphone,
  QrCode,
  ScanLine,
  Sprout,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { ExpandableAnnouncementCard } from "@/components/member/announcements/expandable-announcement-card";
import { DevotionalHeroCard } from "@/components/member/dashboard/devotional-hero-card";

import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getLatestAnnouncementsForMember } from "@/server/queries/announcements";
import { listChildrenForGuardian } from "@/server/queries/children";
import { getTodayDevotionalForMember } from "@/server/queries/devotionals";
import { getMilestonesForMember } from "@/server/queries/discipleship";
import { getRsvpsForMember } from "@/server/queries/events";
import { getAssignmentsForMember } from "@/server/queries/volunteers";

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const t = await getTranslations("dashboard.member");
  const tQuick = await getTranslations("dashboard.member.quickActions");
  const tType = await getTranslations("discipleship.type");

  const memberId = session.user.memberId;

  const member = memberId
    ? await prisma.member.findUnique({
        where: { id: memberId },
        include: {
          cellGroupMembers: {
            where: { leftAt: null },
            include: {
              cellGroup: {
                select: {
                  id: true,
                  name: true,
                  nextMeetingAt: true,
                  nextMeetingLocation: true,
                },
              },
            },
          },
        },
      })
    : null;

  const [
    upcomingService,
    rsvps,
    volunteerAssignments,
    milestones,
    children,
    todayDevotional,
    latestAnnouncements,
  ] = await Promise.all([
    prisma.service.findFirst({
      where: { isActive: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      select: { id: true, name: true, startsAt: true, location: true },
    }),
    memberId ? getRsvpsForMember(memberId, 5) : Promise.resolve([]),
    memberId && features.volunteers
      ? getAssignmentsForMember(memberId, 1)
      : Promise.resolve([]),
    memberId && features.discipleship
      ? getMilestonesForMember(memberId)
      : Promise.resolve([]),
    memberId && features.childrensCheckIn
      ? listChildrenForGuardian(memberId)
      : Promise.resolve([]),
    features.devotionals
      ? getTodayDevotionalForMember()
      : Promise.resolve(null),
    getLatestAnnouncementsForMember(3),
  ]);

  const cellGroup = member?.cellGroupMembers[0]?.cellGroup ?? null;
  const nextEvent =
    rsvps.find(
      (r) =>
        r.event.endsAt >= new Date() &&
        (r.status === "GOING" || r.status === "WAITLIST"),
    ) ?? null;
  const nextAssignment = volunteerAssignments[0] ?? null;
  const latestMilestone =
    milestones.length > 0 ? milestones[milestones.length - 1] : null;

  return (
    <div className="flex flex-col gap-6 pb-24 sm:pb-12">
      {/* 1. Contextual Mobile-First Greeting Header */}
      <header className="flex items-start justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-semibold text-on-secondary-container">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Jemaat Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            {t("welcome", { name: member?.firstName ?? "Jemaat" })}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-on-surface-variant">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        {/* Member Initials Avatar Link */}
        <Link
          href="/me/profile"
          className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-primary border border-outline-variant/60 shadow-level-0 transition-all hover:bg-surface-container-highest hover:shadow-level-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Lihat Profil"
        >
          <span className="text-base font-bold">
            {member?.firstName ? member.firstName[0] : "J"}
            {member?.lastName ? member.lastName[0] : ""}
          </span>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-on-primary font-bold shadow-xs">
            ✓
          </span>
        </Link>
      </header>

      {/* 2. Renungan Hari Ini (Hero M3 Container Transform) */}
      {features.devotionals && todayDevotional ? (
        <DevotionalHeroCard devotional={todayDevotional} />
      ) : null}

      {/* 3. Quick Actions (Ergonomic 3x2 Matrix on Mobile, 6x1 on Desktop) */}
      <section aria-label="Aksi Cepat">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-6">
          <QuickAction href="/me/qr" icon={QrCode} label={tQuick("myQr")} />
          {features.selfCheckIn ? (
            <QuickAction
              href="/me/check-in"
              icon={ScanLine}
              label={tQuick("checkIn")}
            />
          ) : null}
          <QuickAction
            href="/me/giving"
            icon={HandCoins}
            label={tQuick("giveNow")}
          />
          <QuickAction
            href="/me/events"
            icon={Calendar}
            label={tQuick("events")}
          />
          <QuickAction
            href="/me/prayer-requests"
            icon={Heart}
            label={tQuick("prayer")}
          />
          <QuickAction
            href="/me/profile"
            icon={UserCircle}
            label={tQuick("myProfile")}
          />
        </div>
      </section>

      {/* 4. Ibadah & Jadwal Terdekat (Active Sunday Service Ticket & Passes) */}
      <section className="flex flex-col gap-3" aria-label="Jadwal Mendatang">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">
              {t("upcoming.title")}
            </h2>
            <p className="text-xs text-on-surface-variant hidden sm:block">
              {t("upcoming.description")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Sunday Service Pass */}
          {upcomingService ? (
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-surface-container-low to-surface-container-low p-4 transition-all hover:border-primary/40 hover:shadow-level-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  {/* Calendar Date Block */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-on-primary shadow-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">
                      {formatJakarta(upcomingService.startsAt, "EEE")}
                    </span>
                    <span className="text-xl font-bold leading-none tabular-nums">
                      {formatJakarta(upcomingService.startsAt, "dd")}
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-wider opacity-90">
                      {formatJakarta(upcomingService.startsAt, "MMM")}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {t("nextService")}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {formatJakarta(upcomingService.startsAt, "HH:mm")} WIB
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-on-surface leading-snug truncate">
                      {upcomingService.name}
                    </h3>
                    {upcomingService.location ? (
                      <p className="flex items-center gap-1 text-xs text-on-surface-variant truncate">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{upcomingService.location}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Instant Check-in Action */}
                {features.selfCheckIn ? (
                  <Button asChild variant="filled" size="sm" className="w-full sm:w-auto shrink-0 shadow-xs">
                    <Link href="/me/check-in" className="flex items-center justify-center gap-2">
                      <ScanLine className="h-4 w-4" />
                      <span>{tQuick("checkIn")} Mandiri</span>
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyHint text={t("noNextService")} />
          )}

          {/* Additional Passes (Events & Volunteer in grid) */}
          {(nextEvent || nextAssignment) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Event RSVP Pass */}
              {nextEvent ? (
                <Link
                  href={`/me/events/${nextEvent.event.id}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-3.5 transition-all hover:bg-surface-container hover:border-primary/30 hover:shadow-level-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {t("nextEvent")}
                      </p>
                      <p className="font-semibold text-sm text-on-surface truncate">
                        {nextEvent.event.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {formatJakarta(nextEvent.event.startsAt, "EEE, dd MMM · HH:mm")}
                        {nextEvent.event.location ? ` · ${nextEvent.event.location}` : ""}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-on-surface-variant transition-transform group-hover:translate-x-0.5 shrink-0" />
                </Link>
              ) : null}

              {/* Volunteer Service Assignment */}
              {nextAssignment ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {t("nextVolunteer")}
                      </p>
                      <p className="font-semibold text-sm text-on-surface truncate">
                        {nextAssignment.team.name}
                        {nextAssignment.position ? ` · ${nextAssignment.position.name}` : ""}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatJakarta(nextAssignment.serviceDate, "EEE, dd MMM · HH:mm")}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
                    {nextAssignment.status}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* 5. Warta & Pengumuman Terbaru (Interactive M3 ContainerTransform) */}
      {latestAnnouncements.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Pengumuman Terbaru">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">
                  {t("announcements.title")}
                </h2>
                <p className="text-xs text-on-surface-variant hidden sm:block">
                  {t("announcements.description")}
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/5">
              <Link href="/me/announcements" className="flex items-center gap-1">
                <span>{t("announcements.viewAll")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-2.5">
            {latestAnnouncements.map((a) => {
              const isFresh =
                Date.now() - a.publishedAt.getTime() < 24 * 60 * 60 * 1000;
              return (
                <ExpandableAnnouncementCard
                  key={a.id}
                  announcement={a}
                  isFresh={isFresh}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 6. Komunitas & Pertumbuhan Rohani (Cell Group & Discipleship) */}
      <section className="flex flex-col gap-3" aria-label="Komunitas & Pemuridan">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Cell Group Card */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4 transition-all hover:bg-surface-container">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">
                    {t("myCellGroup")}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {cellGroup ? cellGroup.name : t("noCellGroup")}
                  </p>
                </div>
              </div>
              {cellGroup ? (
                <Button asChild variant="tonal" size="sm" className="text-xs h-8 px-3">
                  <Link href="/me/cell-group">
                    <span>Buka</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outlined" size="sm" className="text-xs h-8 px-3">
                  <Link href="/me/cell-group">{t("joinCellGroup")}</Link>
                </Button>
              )}
            </div>

            {cellGroup?.nextMeetingAt ? (
              <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">
                  {formatJakarta(cellGroup.nextMeetingAt, "EEEE, dd MMM · HH:mm")}
                  {cellGroup.nextMeetingLocation ? ` · ${cellGroup.nextMeetingLocation}` : ""}
                </span>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">
                {cellGroup
                  ? "Belum ada jadwal pertemuan komsel berikutnya."
                  : "Bergabunglah dengan kelompok sel untuk bertumbuh bersama."}
              </p>
            )}
          </div>

          {/* Discipleship Milestone Card */}
          {features.discipleship ? (
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4 transition-all hover:bg-surface-container">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">
                      {t("discipleship.title")}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {milestones.length > 0
                        ? t("discipleship.completed", { count: milestones.length })
                        : t("discipleship.empty")}
                    </p>
                  </div>
                </div>
                <Button asChild variant="tonal" size="sm" className="text-xs h-8 px-3">
                  <Link href="/me/discipleship">
                    <span>{t("discipleship.viewAll")}</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>

              {latestMilestone ? (
                <div className="flex items-center justify-between rounded-xl bg-surface-container px-3 py-2 text-xs">
                  <span className="font-medium text-on-surface truncate">
                    {tType(milestoneTypeKey(latestMilestone.type))}
                  </span>
                  <span className="text-on-surface-variant shrink-0 text-[11px]">
                    {format(latestMilestone.achievedAt, "dd MMM yyyy")}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  Mulai perjalanan pemuridan Anda bersama gereja.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* 7. Children Section for Guardians */}
      {features.childrensCheckIn && children.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Data Anak">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                <Baby className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">
                  {t("children.title")}
                </h2>
                <p className="text-xs text-on-surface-variant hidden sm:block">
                  {t("children.description")}
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/5">
              <Link href="/me/children" className="flex items-center gap-1">
                <span>{t("children.viewAll")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {children.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">
                      {c.fullName}
                    </p>
                    {c.birthDate ? (
                      <p className="text-xs text-on-surface-variant">
                        {format(c.birthDate, "dd MMMM yyyy")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button asChild variant="outlined" size="sm" className="h-8 text-xs shrink-0">
                  <Link href={`/me/children`}>Check-in</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-lowest px-4 py-4 text-center text-xs text-on-surface-variant">
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full min-h-[96px] sm:min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-2.5 sm:p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container hover:shadow-level-1 active:translate-y-0 active:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-xs">
        <Icon className="h-5 w-5 transition-transform" />
      </div>
      <span className="line-clamp-2 text-balance text-[11px] sm:text-xs font-medium leading-tight text-on-surface transition-colors group-hover:text-primary">
        {label}
      </span>
    </Link>
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
