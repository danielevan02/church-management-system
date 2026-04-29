import { Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { getUpcomingPublishedEventsForMember } from "@/server/queries/events";
import { formatJakarta } from "@/lib/datetime";

export default async function MemberEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.events");
  const tStatus = await getTranslations("events.rsvpStatus");

  const events = await getUpcomingPublishedEventsForMember(memberId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Calendar className="h-8 w-8" />
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/me/events/${e.id}`}
                    className="text-lg font-semibold tracking-tight hover:underline"
                  >
                    {e.title}
                  </Link>
                  {e.myRsvp ? (
                    <Badge>
                      {tStatus(statusKey(e.myRsvp.status))}
                    </Badge>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatJakarta(e.startsAt, "EEE, dd MMM yyyy · HH:mm")}
                  {e.location ? ` · ${e.location}` : ""}
                </div>
                {e.capacity ? (
                  <div className="text-xs text-muted-foreground">
                    {e._count.rsvps}/{e.capacity} {t("rsvpsAbbr")}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
