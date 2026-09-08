import { format } from "date-fns";
import { Sprout } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { auth } from "@/lib/auth";
import { getMilestonesForMember } from "@/server/queries/discipleship";

export default async function MemberDiscipleshipPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.discipleship");
  const tType = await getTranslations("discipleship.type");

  const items = await getMilestonesForMember(memberId);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        icon={Sprout}
        iconTone="secondary"
        title={t("journeyTitle")}
        description={t("journeyDescription")}
      >
        {items.length === 0 ? (
          <EmptyState
            icon={Sprout}
            tone="quiet"
            title={t("empty")}
            className="py-6"
          />
        ) : (
          /* A timeline, not a list. The rail is `outline-variant` at 1dp with a
             filled `primary` node per milestone: this is the one screen where the
             *order* of the records is the content, and tonal blocks alone cannot
             express a sequence. */
          <ol suppressHydrationWarning data-stagger="items" className="relative ml-1 flex flex-col gap-5 border-l border-outline-variant pl-6">
            {items.map((m) => (
              <li key={m.id} className="relative">
                <span
                  aria-hidden
                  className="absolute top-0.5 -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary shadow-level-1"
                >
                  <Sprout className="h-3 w-3" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="w-fit rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-on-surface-variant">
                    {format(m.achievedAt, "dd MMM yyyy")}
                  </span>
                  <span className="text-sm font-bold text-on-surface">
                    {tType(typeKey(m.type))}
                  </span>
                  {m.notes ? (
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {m.notes}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </BlockSection>
    </div>
  );
}

function typeKey(type: string): string {
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
