import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { MemberRsvpButtons } from "@/components/member/events/member-rsvp-button";
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
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { countGoingFor, getEvent } from "@/server/queries/events";
import { formatJakarta } from "@/lib/datetime";

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
  const tStatus = await getTranslations("events.rsvpStatus");

  const past = event.endsAt < new Date();
  const registrationOpen =
    event.registrationOpen && event.requiresRsvp && !past;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/me/events">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          {past ? (
            <Badge variant="outline" className="w-fit">
              {t("statusPast")}
            </Badge>
          ) : null}
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              {format(event.startsAt, "EEEE, dd MMM yyyy")} ·{" "}
              {formatJakarta(event.startsAt, "HH:mm")}
              {" — "}
              {formatJakarta(event.endsAt, "HH:mm")}
            </div>
          </div>
          {event.location ? (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>{event.location}</div>
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              {goingCount}
              {event.capacity ? `/${event.capacity}` : ""} {t("goingLabel")}
            </div>
          </div>
          {event.fee ? (
            <div className="text-sm">
              <span className="text-muted-foreground">{t("feeLabel")}: </span>
              <span className="font-semibold">{formatRupiah(event.fee)}</span>
            </div>
          ) : null}
          {event.description ? (
            <p className="whitespace-pre-wrap text-sm">{event.description}</p>
          ) : null}
        </CardContent>
      </Card>

      {event.requiresRsvp ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("rsvpTitle")}</CardTitle>
            <CardDescription>
              {myRsvp
                ? t("yourCurrentStatus", {
                    status: tStatus(statusKey(myRsvp.status)),
                  })
                : t("rsvpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberRsvpButtons
              eventId={id}
              current={myRsvp?.status ?? null}
              rsvpId={myRsvp?.id ?? null}
              registrationOpen={registrationOpen}
            />
          </CardContent>
        </Card>
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
