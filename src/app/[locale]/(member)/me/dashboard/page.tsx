import { format } from "date-fns";
import {
  ArrowRight,
  Baby,
  Calendar,
  HeartHandshake,
  Megaphone,
  Sprout,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { ExpandableAnnouncementCard } from "@/components/member/announcements/expandable-announcement-card";
import { ActionChips } from "@/components/member/dashboard/action-chips";
import { DevotionalHeroCard } from "@/components/member/dashboard/devotional-hero-card";
import { SmartWorshipPass } from "@/components/member/dashboard/smart-worship-pass";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { renderMemberQrDataUrl } from "@/lib/qr";
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
    qrResult,
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
    memberId ? renderMemberQrDataUrl(memberId).catch(() => null) : Promise.resolve(null),
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
    <div className="flex flex-col gap-6 pb-28 sm:pb-12">
      {/* 1. Contextual M3 Header Bar */}
      <header className="flex items-center justify-between gap-4 pt-1">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            {t("welcome", { name: member?.firstName ?? "Jemaat" })}
          </h1>
        </div>

        {/* Member Profile Avatar Pill */}
        <Link
          href="/me/profile"
          className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-level-0 transition-all duration-200 hover:bg-secondary-container/80 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Profil Saya"
        >
          <span className="text-sm font-bold">
            {member?.firstName ? member.firstName[0] : "J"}
            {member?.lastName ? member.lastName[0] : ""}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-on-primary font-bold shadow-xs">
            ✓
          </span>
        </Link>
      </header>

      {/* 2. The Smart Worship Pass (Google Wallet Inspired Centerpiece) */}
      <SmartWorshipPass
        member={member ? { id: member.id, fullName: member.fullName, firstName: member.firstName } : null}
        upcomingService={upcomingService}
        volunteerAssignment={nextAssignment}
        qrDataUrl={qrResult?.dataUrl ?? null}
        hasSelfCheckIn={features.selfCheckIn}
      />

      {/* 3. Minimalist M3 Action Chips (Ergonomic Pill Cluster) */}
      <ActionChips
        hasGiving={features.giving}
        hasDevotionals={features.devotionals}
        hasChildren={features.childrensCheckIn && children.length > 0}
        hasCellGroup={true}
      />

      {/* 4. Renungan Firman Hari Ini (M3 Journal Editorial Card) */}
      {features.devotionals && todayDevotional ? (
        <DevotionalHeroCard devotional={todayDevotional} />
      ) : null}

      {/* 5. Asymmetric Bento: Komunitas & Langkah Iman */}
      <section aria-label="Komunitas dan Langkah Iman" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Cell Group Live Tile */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6 transition-all duration-200 hover:bg-surface-container shadow-level-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
                <UsersRound className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">
                Komunitas Sel
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-on-surface">
                {cellGroup ? cellGroup.name : t("noCellGroup")}
              </h3>
              {cellGroup?.nextMeetingAt ? (
                <p className="text-xs text-on-surface-variant">
                  {formatJakarta(cellGroup.nextMeetingAt, "EEEE, dd MMM · HH:mm")}
                  {cellGroup.nextMeetingLocation ? ` · ${cellGroup.nextMeetingLocation}` : ""}
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  {cellGroup
                    ? "Belum ada jadwal pertemuan komsel berikutnya."
                    : "Bergabunglah untuk bertumbuh dalam persekutuan doa."}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="tonal" size="sm" className="rounded-full text-xs h-8 px-4 w-fit">
            <Link href="/me/cell-group" className="flex items-center gap-1.5">
              <span>{cellGroup ? "Buka Komsel" : t("joinCellGroup")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Next Event or Discipleship Milestone */}
        {nextEvent ? (
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6 transition-all duration-200 hover:bg-surface-container shadow-level-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {t("nextEvent")}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface line-clamp-1">
                  {nextEvent.event.title}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {formatJakarta(nextEvent.event.startsAt, "EEE, dd MMM · HH:mm")} WIB
                  {nextEvent.event.location ? ` · ${nextEvent.event.location}` : ""}
                </p>
              </div>
            </div>

            <Button asChild variant="tonal" size="sm" className="rounded-full text-xs h-8 px-4 w-fit">
              <Link href={`/me/events/${nextEvent.event.id}`} className="flex items-center gap-1.5">
                <span>Lihat Acara</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        ) : features.discipleship ? (
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-surface-container-low p-5 sm:p-6 transition-all duration-200 hover:bg-surface-container shadow-level-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sprout className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {t("discipleship.title")}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-on-surface">
                  {milestones.length > 0
                    ? t("discipleship.completed", { count: milestones.length })
                    : t("discipleship.empty")}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {latestMilestone
                    ? `${tType(milestoneTypeKey(latestMilestone.type))} · ${format(latestMilestone.achievedAt, "dd MMM yyyy")}`
                    : "Mulai perjalanan pemuridan Anda bersama gereja."}
                </p>
              </div>
            </div>

            <Button asChild variant="tonal" size="sm" className="rounded-full text-xs h-8 px-4 w-fit">
              <Link href="/me/discipleship" className="flex items-center gap-1.5">
                <span>{t("discipleship.viewAll")}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      {/* 6. Warta & Pengumuman Terbaru (Container Transform Feed) */}
      {latestAnnouncements.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Warta Jemaat">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-base font-bold text-on-surface">
                {t("announcements.title")}
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary rounded-full hover:bg-primary/5">
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

      {/* 7. Children Section for Guardians */}
      {features.childrensCheckIn && children.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Data Anak">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                <Baby className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-base font-bold text-on-surface">
                {t("children.title")}
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-primary rounded-full hover:bg-primary/5">
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
                className="flex items-center justify-between gap-3 rounded-3xl bg-surface-container-low p-4 shadow-level-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
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
                <Button asChild variant="tonal" size="sm" className="h-8 rounded-full text-xs shrink-0 px-3.5">
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
