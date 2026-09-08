import { format } from "date-fns";
import { HeartHandshake, History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { BlockRow, BlockSection } from "@/components/m3/block-section";
import { EmptyState } from "@/components/m3/empty-state";
import { PageHeader } from "@/components/m3/page-header";
import { MemberAssignmentActions } from "@/components/member/volunteer/member-assignment-actions";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import {
  getAssignmentHistoryForMember,
  getAssignmentsForMember,
} from "@/server/queries/volunteers";

export default async function MemberVolunteerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const memberId = session.user.memberId;
  if (!memberId) redirect("/me/dashboard");

  const t = await getTranslations("memberPortal.volunteer");
  const tStatus = await getTranslations("volunteers.assignmentStatus");

  const [upcoming, history] = await Promise.all([
    getAssignmentsForMember(memberId, 25),
    getAssignmentHistoryForMember(memberId, 25),
  ]);

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        icon={HeartHandshake}
        iconTone="secondary"
        title={t("upcomingTitle")}
        description={t("upcomingDescription")}
        bodyClassName="space-y-2"
        staggerChildren
      >
        {upcoming.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            tone="quiet"
            title={t("upcomingEmpty")}
            className="py-6"
          />
        ) : (
          upcoming.map((a) => (
            <BlockRow
              key={a.id}
              className="flex-col items-stretch gap-2 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-on-surface">
                  {a.team.name}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {format(a.serviceDate, "EEE dd MMM yyyy")}
                  {a.position ? ` · ${a.position.name}` : ""}
                </span>
                {a.notes ? (
                  <span className="mt-1 text-xs text-on-surface-variant">
                    {a.notes}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{tStatus(a.status.toLowerCase() as never)}</Badge>
                <MemberAssignmentActions id={a.id} status={a.status as never} />
              </div>
            </BlockRow>
          ))
        )}
      </BlockSection>

      {history.length > 0 ? (
        <BlockSection
          icon={History}
          iconTone="neutral"
          title={t("historyTitle")}
          bodyClassName="space-y-2"
          staggerChildren
        >
          {history.map((a) => (
            <BlockRow key={a.id}>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-on-surface">
                  {a.team.name}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {format(a.serviceDate, "EEE dd MMM yyyy")}
                  {a.position ? ` · ${a.position.name}` : ""}
                </span>
              </div>
              <Badge variant="outline" className="shrink-0">
                {tStatus(a.status.toLowerCase() as never)}
              </Badge>
            </BlockRow>
          ))}
        </BlockSection>
      ) : null}
    </div>
  );
}
