import { Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { ExpandableEventCard } from "@/components/member/events/expandable-event-card";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getUpcomingPublishedEventsForMember } from "@/server/queries/events";

export default async function MemberEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.events");
  const events = await getUpcomingPublishedEventsForMember(memberId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-on-surface-variant">{t("subtitle")}</p>
      </header>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-on-surface-variant">
            <Calendar className="h-8 w-8" />
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((e) => (
            <ExpandableEventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
