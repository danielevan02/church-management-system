import { format } from "date-fns";
import { CalendarClock, UserRound, UsersRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { BlockSection, BlockRow } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { ExpressiveCard } from "@/components/m3/expressive-card";
import { IconChip } from "@/components/m3/icon-chip";
import { PageHeader } from "@/components/m3/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { formatJakarta } from "@/lib/datetime";
import { getCellGroupsForMember } from "@/server/queries/cell-groups";

export default async function MemberCellGroupPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.cellGroup");

  const memberships = await getCellGroupsForMember(memberId);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {memberships.length === 0 ? (
        <EmptyState icon={UsersRound} title={t("empty")} />
      ) : (
        memberships.map(({ cellGroup, joinedAt }) => (
          <div key={cellGroup.id} className="flex flex-col gap-4">
            <BlockSection
              icon={UsersRound}
              iconTone="secondary"
              title={cellGroup.name}
              description={cellGroup.description ?? undefined}
              bodyClassName="space-y-3"
              staggerChildren
            >
              {/* The next meeting is the only thing a member opens this page
                  for, so it gets the accent block rather than a metadata row. */}
              <ExpressiveCard tone="nested" padding="compact" className="gap-1">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {t("nextMeetingLabel")}
                  </span>
                </div>
                {cellGroup.nextMeetingAt ? (
                  <>
                    <p className="text-sm font-bold text-on-surface">
                      {formatJakarta(
                        cellGroup.nextMeetingAt,
                        "EEEE, d MMM yyyy · HH:mm",
                      )}
                    </p>
                    {cellGroup.nextMeetingLocation ? (
                      <p className="text-sm text-on-surface-variant">
                        {cellGroup.nextMeetingLocation}
                      </p>
                    ) : null}
                    {cellGroup.nextMeetingNotes ? (
                      <p className="mt-1 text-xs whitespace-pre-wrap text-on-surface-variant">
                        {cellGroup.nextMeetingNotes}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    {t("nextMeetingEmpty")}
                  </p>
                )}
              </ExpressiveCard>

              <BlockRow>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {cellGroup.leader.photoUrl ? (
                      <AvatarImage
                        src={cellGroup.leader.photoUrl}
                        alt={cellGroup.leader.fullName}
                      />
                    ) : null}
                    <AvatarFallback>
                      {cellGroup.leader.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t("leaderLabel")}
                    </p>
                    <p className="truncate text-sm font-bold text-on-surface">
                      {cellGroup.leader.fullName}
                    </p>
                    {cellGroup.leader.phone ? (
                      <p className="text-xs text-on-surface-variant">
                        {cellGroup.leader.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
                <IconChip icon={UserRound} size="sm" tone="neutral" />
              </BlockRow>

              <p className="text-xs text-on-surface-variant">
                {t("memberSince", { date: format(joinedAt, "dd MMM yyyy") })}
              </p>
            </BlockSection>

            <BlockSection
              icon={UserRound}
              title={t("membersTitle", { count: cellGroup.members.length })}
              bodyClassName="grid grid-cols-1 gap-2 sm:grid-cols-2"
              staggerChildren
            >
              {cellGroup.members.map((m) => (
                <BlockRow key={m.id} className="justify-start">
                  <Avatar className="h-8 w-8">
                    {m.member.photoUrl ? (
                      <AvatarImage
                        src={m.member.photoUrl}
                        alt={m.member.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {m.member.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium text-on-surface">
                    {m.member.fullName}
                  </span>
                </BlockRow>
              ))}
            </BlockSection>
          </div>
        ))
      )}
    </div>
  );
}
