import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { AssignCellGroupMemberForm } from "@/components/admin/cell-groups/assign-member-form";
import { NextMeetingForm } from "@/components/admin/cell-groups/next-meeting-form";
import { RemoveCellGroupMemberButton } from "@/components/admin/cell-groups/remove-member-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { formatJakarta, toJakartaInput } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { canAccessCellGroup } from "@/lib/permissions";
import {
  getCellGroup,
  getCellGroupReports,
} from "@/server/queries/cell-groups";

export default async function CellGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const allowed = await canAccessCellGroup(
    {
      id: session.user.id ?? "",
      role: session.user.role,
      memberId: session.user.memberId ?? null,
    },
    id,
  );
  if (!allowed) redirect("/admin/cell-groups");

  const group = await getCellGroup(id);
  if (!group) notFound();

  const reports = await getCellGroupReports(id, 10);

  const t = await getTranslations("cellGroups.detail");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/cell-groups"
        backLabel={t("backToList")}
        title={group.name}
        subtitle={
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={group.isActive ? "default" : "secondary"}>
                {group.isActive ? t("statusActive") : t("statusInactive")}
              </Badge>
              {group.parentGroup ? (
                <>
                  <span>•</span>
                  <span>
                    {t("parentLabel")}:{" "}
                    <Link
                      href={`/admin/cell-groups/${group.parentGroup.id}`}
                      className="text-primary hover:underline"
                    >
                      {group.parentGroup.name}
                    </Link>
                  </span>
                </>
              ) : null}
            </div>
            {group.description ? <p>{group.description}</p> : null}
          </div>
        }
        action={
          <>
            <Button asChild variant="outline">
              <Link href={`/admin/cell-groups/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/cell-groups/${id}/reports/new`}>
                <Plus className="h-4 w-4" />
                {t("submitReport")}
              </Link>
            </Button>
          </>
        }
      />

      <div suppressHydrationWarning data-stagger="cards" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BlockSection
          title={t("nextMeetingTitle")}
          description={t("nextMeetingDescription")}
          className="lg:col-span-2"
          bodyClassName="space-y-3 text-sm"
        >
          {group.nextMeetingAt ? (
            <div className="rounded-2xl bg-surface-container-high p-3 text-sm">
              <div className="font-medium">
                {formatJakarta(group.nextMeetingAt, "EEEE, d MMM yyyy · HH:mm")}
              </div>
              {group.nextMeetingLocation ? (
                <div className="text-on-surface-variant">
                  {group.nextMeetingLocation}
                </div>
              ) : null}
              {group.nextMeetingNotes ? (
                <div className="mt-1 text-xs whitespace-pre-wrap">
                  {group.nextMeetingNotes}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant italic">
              {t("nextMeetingEmpty")}
            </p>
          )}
          <NextMeetingForm
            cellGroupId={id}
            hasExisting={Boolean(group.nextMeetingAt)}
            initialValues={{
              nextMeetingAt: group.nextMeetingAt
                ? toJakartaInput(group.nextMeetingAt)
                : "",
              nextMeetingLocation: group.nextMeetingLocation ?? "",
              nextMeetingNotes: group.nextMeetingNotes ?? "",
            }}
          />
        </BlockSection>

        <BlockSection
          title={t("leaderTitle")}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {group.leader.photoUrl ? (
                <AvatarImage
                  src={group.leader.photoUrl}
                  alt={group.leader.fullName}
                />
              ) : null}
              <AvatarFallback>
                {group.leader.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                href={`/admin/members/${group.leader.id}`}
                className="font-medium hover:underline"
              >
                {group.leader.fullName}
              </Link>
              <span className="text-xs text-on-surface-variant">
                {group.leader.phone ?? "—"}
              </span>
            </div>
          </div>
        </BlockSection>

        {group.childGroups.length > 0 ? (
          <BlockSection
            title={t("childGroupsTitle")}
          >
            <ul suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2 text-sm">
              {group.childGroups.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/cell-groups/${c.id}`}
                    className="font-medium hover:underline"
                  >
                    {c.name}
                  </Link>
                  {!c.isActive ? (
                    <span className="ml-2 text-xs text-on-surface-variant">
                      ({t("statusInactive")})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </BlockSection>
        ) : null}
      </div>

      <BlockSection
        title={t("membersTitle")}
        description={t("membersDescription", { count: group.members.length })}
        bodyClassName="flex flex-col gap-4"
      >
        <AssignCellGroupMemberForm cellGroupId={id} />
        {group.members.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("membersEmpty")}</p>
        ) : (
          <ul suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2 text-sm">
            {group.members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-2xl p-3 bg-surface-container-high"
              >
                <div className="flex items-center gap-3">
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
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/members/${m.member.id}`}
                      className="font-medium hover:underline"
                    >
                      {m.member.fullName}
                    </Link>
                    <span className="text-xs text-on-surface-variant">
                      {t("joinedOn")}: {format(m.joinedAt, "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <RemoveCellGroupMemberButton
                  cellGroupId={id}
                  memberId={m.member.id}
                />
              </li>
            ))}
          </ul>
        )}
      </BlockSection>

      <BlockSection
        title={t("reportsTitle")}
        description={t("reportsDescription")}
      >
        {reports.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{t("reportsEmpty")}</p>
        ) : (
          <ul suppressHydrationWarning data-stagger="items" className="flex flex-col gap-2 text-sm">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-2xl p-3 bg-surface-container-high"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {format(r.meetingDate, "EEEE, dd MMM yyyy")}
                  </span>
                  {r.topic ? (
                    <span className="text-xs text-on-surface-variant">
                      {r.topic}
                    </span>
                  ) : null}
                  {r.notes ? (
                    <span className="mt-1 text-xs whitespace-pre-wrap">
                      {r.notes}
                    </span>
                  ) : null}
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold tabular-nums">
                    {r.attendeeCount} {t("attendeesAbbr")}
                  </div>
                  {r.visitorCount > 0 ? (
                    <div className="text-on-surface-variant tabular-nums">
                      +{r.visitorCount} {t("visitorsAbbr")}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </BlockSection>

    </div>
  );
}
