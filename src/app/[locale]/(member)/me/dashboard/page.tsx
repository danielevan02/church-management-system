import { format } from "date-fns";
import {
  ArrowRight,
  Baby,
  BookOpen,
  Calendar,
  CalendarDays,
  HandCoins,
  Heart,
  HeartHandshake,
  Megaphone,
  QrCode,
  ScanLine,
  Sprout,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { features } from "@/config/features";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { excerpt } from "@/lib/markdown";
import { prisma } from "@/lib/prisma";
import { getLatestAnnouncementsForMember } from "@/server/queries/announcements";
import { listChildrenForGuardian } from "@/server/queries/children";
import { getTodayDevotionalForMember } from "@/server/queries/devotionals";
import { getMilestonesForMember } from "@/server/queries/discipleship";
import { getRsvpsForMember } from "@/server/queries/events";
import { getGivingForMember } from "@/server/queries/giving";
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
                  meetingDay: true,
                  meetingTime: true,
                  meetingLocation: true,
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
    giving,
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
    memberId && features.giving
      ? getGivingForMember(memberId, 1)
      : Promise.resolve(null),
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
  const lastGiving = giving?.items[0] ?? null;
  const ytdGiving = giving ? Number((giving.totalThisYear ?? "0").toString()) : 0;
  const latestMilestone =
    milestones.length > 0 ? milestones[milestones.length - 1] : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcome", { name: member?.firstName ?? "Jemaat" })}{" "}
          {t("subtitle", { date: format(new Date(), "EEEE, dd MMM yyyy") })}
        </p>
      </header>

      {/* Renungan Hari Ini */}
      {features.devotionals && todayDevotional ? (
        <Link
          href={`/me/devotionals/${todayDevotional.id}`}
          className="block focus-visible:outline-none"
        >
          <Card className="border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader className="space-y-1.5 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                {t("devotionalToday.label")}
              </div>
              <CardTitle className="text-xl">{todayDevotional.title}</CardTitle>
              <CardDescription>
                {formatJakarta(todayDevotional.publishedAt, "EEE, dd MMM yyyy")}
                {todayDevotional.verseRef ? ` · ${todayDevotional.verseRef}` : ""}
                {todayDevotional.authorName ? ` · ${todayDevotional.authorName}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {excerpt(todayDevotional.body, 220)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t("devotionalToday.read")}
                <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      ) : null}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <QuickAction href="/me/qr" icon={QrCode} label={tQuick("myQr")} />
        {features.selfCheckIn ? (
          <QuickAction
            href="/me/check-in"
            icon={ScanLine}
            label={tQuick("checkIn")}
          />
        ) : null}
        <QuickAction
          href="/me/profile"
          icon={UserCircle}
          label={tQuick("myProfile")}
        />
        {features.giving ? (
          <QuickAction
            href="/me/giving/give"
            icon={HandCoins}
            label={tQuick("giveNow")}
          />
        ) : null}
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
      </div>

      {/* Pengumuman Terbaru */}
      {latestAnnouncements.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-5 w-5" />
                {t("announcements.title")}
              </CardTitle>
              <CardDescription>{t("announcements.description")}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/me/announcements">{t("announcements.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {latestAnnouncements.map((a) => (
                <Link
                  key={a.id}
                  href={`/me/announcements/${a.id}`}
                  className="block rounded-md border p-3 transition-colors hover:bg-accent/30"
                >
                  <p className="font-medium leading-tight line-clamp-1">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatJakarta(a.publishedAt, "EEE, dd MMM yyyy · HH:mm")}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {excerpt(a.body)}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Upcoming + About me */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5" />
              {t("upcoming.title")}
            </CardTitle>
            <CardDescription>{t("upcoming.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Section title={t("nextService")}>
              {upcomingService ? (
                <div className="flex flex-col gap-1 rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{upcomingService.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatJakarta(upcomingService.startsAt, "EEEE, dd MMM yyyy · HH:mm")}
                    {upcomingService.location ? ` · ${upcomingService.location}` : ""}
                  </span>
                </div>
              ) : (
                <EmptyHint text={t("noNextService")} />
              )}
            </Section>

            <Section
              title={t("nextEvent")}
              cta={{ href: "/me/events", label: t("viewEvents") }}
            >
              {nextEvent ? (
                <Link
                  href={`/me/events/${nextEvent.event.id}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted/60"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{nextEvent.event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatJakarta(nextEvent.event.startsAt, "EEE dd MMM · HH:mm")}
                      {nextEvent.event.location
                        ? ` · ${nextEvent.event.location}`
                        : ""}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ) : (
                <EmptyHint text={t("noNextEvent")} />
              )}
            </Section>

            {features.volunteers ? (
              <Section
                title={t("nextVolunteer")}
                cta={{ href: "/me/volunteer", label: t("viewVolunteer") }}
              >
                {nextAssignment ? (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {nextAssignment.team.name}
                        {nextAssignment.position
                          ? ` · ${nextAssignment.position.name}`
                          : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatJakarta(nextAssignment.serviceDate, "EEE dd MMM · HH:mm")}
                      </span>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {nextAssignment.status}
                    </span>
                  </div>
                ) : (
                  <EmptyHint text={t("noNextVolunteer")} />
                )}
              </Section>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              {t("about.title")}
            </CardTitle>
            <CardDescription>{t("about.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Section
              title={t("myCellGroup")}
              cta={
                cellGroup
                  ? undefined
                  : { href: "/me/cell-group", label: t("joinCellGroup") }
              }
            >
              {cellGroup ? (
                <Link
                  href="/me/cell-group"
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted/60"
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 font-medium">
                      <UsersRound className="h-4 w-4 text-muted-foreground" />
                      {cellGroup.name}
                    </span>
                    {cellGroup.meetingDay || cellGroup.meetingTime ? (
                      <span className="text-xs text-muted-foreground">
                        {[cellGroup.meetingDay, cellGroup.meetingTime]
                          .filter(Boolean)
                          .join(" · ")}
                        {cellGroup.meetingLocation
                          ? ` · ${cellGroup.meetingLocation}`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ) : (
                <EmptyHint text={t("noCellGroup")} />
              )}
            </Section>

            {features.giving && giving ? (
              <Section
                title={t("giving.title")}
                cta={{ href: "/me/giving", label: t("giving.viewAll") }}
              >
                {ytdGiving > 0 || lastGiving ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Stat
                      label={t("giving.ytd")}
                      value={formatRupiah(ytdGiving)}
                    />
                    <Stat
                      label={t("giving.lastGift")}
                      value={
                        lastGiving
                          ? formatRupiah(
                              Number(lastGiving.amount.toString()),
                            )
                          : "—"
                      }
                      hint={
                        lastGiving
                          ? format(lastGiving.receivedAt, "dd MMM yyyy")
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <EmptyHint text={t("giving.noGiving")} />
                )}
              </Section>
            ) : null}

            {features.discipleship ? (
              <Section
                title={t("discipleship.title")}
                cta={{
                  href: "/me/discipleship",
                  label: t("discipleship.viewAll"),
                }}
              >
                {milestones.length === 0 ? (
                  <EmptyHint text={t("discipleship.empty")} />
                ) : (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 font-medium">
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                        {t("discipleship.completed", {
                          count: milestones.length,
                        })}
                      </span>
                      {latestMilestone ? (
                        <span className="text-xs text-muted-foreground">
                          {t("discipleship.lastMilestone")}:{" "}
                          {tType(milestoneTypeKey(latestMilestone.type))} ·{" "}
                          {format(latestMilestone.achievedAt, "dd MMM yyyy")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </Section>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Children (only if guardian has children at home) */}
      {features.childrensCheckIn && children.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Baby className="h-5 w-5" />
                {t("children.title")}
              </CardTitle>
              <CardDescription>{t("children.description")}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/me/children">{t("children.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {children.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{c.fullName}</span>
                    {c.birthDate ? (
                      <span className="text-xs text-muted-foreground">
                        {format(c.birthDate, "dd MMM yyyy")}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Section({
  title,
  cta,
  children,
}: {
  title: string;
  cta?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        {cta ? (
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
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
  icon: typeof QrCode;
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
