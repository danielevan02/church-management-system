import { Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { ExpandableEventCard } from "@/components/member/events/expandable-event-card";
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
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {events.length === 0 ? (
        <EmptyState icon={Calendar} title={t("empty")} />
      ) : (
        <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((e) => (
            <ExpandableEventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
