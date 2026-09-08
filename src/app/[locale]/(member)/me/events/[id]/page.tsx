import { format } from "date-fns";
import { Calendar, CircleDollarSign, MapPin, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { DetailList, DetailRow } from "@/components/m3/detail-list";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { PageHeader } from "@/components/m3/page-header";
import { MemberRsvpButtons } from "@/components/member/events/member-rsvp-button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { countGoingFor, getEvent } from "@/server/queries/events";

export default async function MemberEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const event = await getEvent(id);
  if (!event || !event.isPublished) notFound();

  const [myRsvp, goingCount] = await Promise.all([
    prisma.eventRsvp.findFirst({
      where: { eventId: id, memberId },
      select: { id: true, status: true, notes: true },
    }),
    countGoingFor(id),
  ]);

  const t = await getTranslations("memberPortal.events.detail");
  const tEvents = await getTranslations("memberPortal.events");
  const tStatus = await getTranslations("events.rsvpStatus");

  const past = event.endsAt < new Date();
  const registrationOpen =
    event.registrationOpen && event.requiresRsvp && !past;

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        backHref="/me/events"
        backLabel={t("backToList")}
        eyebrow={tEvents("eyebrow")}
        title={event.title}
        action={
          past ? <Badge variant="outline">{t("statusPast")}</Badge> : undefined
        }
      />

      <ExpressiveCard className="gap-4">
        <DetailList>
          <DetailRow icon={Calendar} label={t("dateLabel")}>
            {format(event.startsAt, "EEEE, dd MMM yyyy")} ·{" "}
            {formatJakarta(event.startsAt, "HH:mm")}
            {" — "}
            {formatJakarta(event.endsAt, "HH:mm")}
          </DetailRow>
          {event.location ? (
            <DetailRow icon={MapPin} label={t("locationLabel")}>
              {event.location}
            </DetailRow>
          ) : null}
          <DetailRow icon={Users} label={t("goingLabel")}>
            <span className="tabular-nums">
              {goingCount}
              {event.capacity ? `/${event.capacity}` : ""}
            </span>
          </DetailRow>
          {event.fee ? (
            <DetailRow icon={CircleDollarSign} label={t("feeLabel")}>
              {formatRupiah(event.fee)}
            </DetailRow>
          ) : null}
        </DetailList>

        {event.description ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-on-surface-variant">
            {event.description}
          </p>
        ) : null}
      </ExpressiveCard>

      {event.requiresRsvp ? (
        <BlockSection
          icon={Users}
          iconTone="secondary"
          title={t("rsvpTitle")}
          description={
            myRsvp
              ? t("yourCurrentStatus", {
                  status: tStatus(statusKey(myRsvp.status)),
                })
              : t("rsvpDescription")
          }
        >
          <MemberRsvpButtons
            eventId={id}
            current={myRsvp?.status ?? null}
            rsvpId={myRsvp?.id ?? null}
            registrationOpen={registrationOpen}
          />
        </BlockSection>
      ) : null}
    </div>
  );
}

function statusKey(s: string): string {
  switch (s) {
    case "GOING":
      return "going";
    case "MAYBE":
      return "maybe";
    case "NOT_GOING":
      return "notGoing";
    case "WAITLIST":
      return "waitlist";
    default:
      return s.toLowerCase();
  }
}
