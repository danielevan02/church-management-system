import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { DeleteMemberButton } from "./delete-member-button";
import { SetPinDialog } from "@/components/admin/members/set-pin-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
import { getAttendanceForMember } from "@/server/queries/attendance";
import { getMilestonesForMember } from "@/server/queries/discipleship";
import { getRsvpsForMember } from "@/server/queries/events";
import { getGivingForMember } from "@/server/queries/giving";
import { getMember } from "@/server/queries/members";
import { getVisitsForMember } from "@/server/queries/pastoral";

function fmtDate(d: Date | null | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : "—";
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const member = await getMember(id);
  if (!member) notFound();

  const t = await getTranslations("members.detail");
  const tStatus = await getTranslations("members.form.status");
  const tMarital = await getTranslations("members.form.marital");
  const tType = await getTranslations("services.type");
  const tFundCategory = await getTranslations("giving.fund.category");
  const tMethod = await getTranslations("giving.method");
  const tRsvp = await getTranslations("events.rsvpStatus");
  const tMilestone = await getTranslations("discipleship.type");
  const tVisitType = await getTranslations("pastoral.visitType");
  const canPastoral =
    session?.user.role === "ADMIN" || session?.user.role === "STAFF";
  const [attendanceHistory, givingHistory, rsvpHistory, milestones, visits] =
    await Promise.all([
      getAttendanceForMember(id, 25),
      getGivingForMember(id, 25),
      getRsvpsForMember(id, 25),
      getMilestonesForMember(id),
      canPastoral ? getVisitsForMember(id, 25) : Promise.resolve([]),
    ]);

  const canDelete = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {member.photoUrl ? (
              <AvatarImage src={member.photoUrl} alt={member.fullName} />
            ) : null}
            <AvatarFallback className="text-lg">
              {member.firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {member.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge>{tStatus(member.status.toLowerCase() as never)}</Badge>
              <span>•</span>
              <span>{member.gender === "MALE" ? "Pria" : "Wanita"}</span>
              {member.phone ? (
                <>
                  <span>•</span>
                  <span>{member.phone}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/members/${id}/edit`}>
              <Pencil className="h-4 w-4" />
              {t("edit")}
            </Link>
          </Button>
          {canDelete ? <DeleteMemberButton id={id} /> : null}
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full min-w-0">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList>
            <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
            <TabsTrigger value="cellGroups">
              {t("tabs.cellGroups")}
            </TabsTrigger>
            <TabsTrigger value="attendance">
              {t("tabs.attendance")}
            </TabsTrigger>
            <TabsTrigger value="giving">{t("tabs.giving")}</TabsTrigger>
            <TabsTrigger value="events">{t("tabs.events")}</TabsTrigger>
            <TabsTrigger value="discipleship">
              {t("tabs.discipleship")}
            </TabsTrigger>
            {canPastoral ? (
              <TabsTrigger value="pastoral">{t("tabs.pastoral")}</TabsTrigger>
            ) : null}
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.identity")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label={t("fields.firstName")} value={member.firstName} />
                <Field label={t("fields.lastName")} value={member.lastName} />
                <Field label={t("fields.nickname")} value={member.nickname} />
                <Separator />
                <Field
                  label={t("fields.birthDate")}
                  value={fmtDate(member.birthDate)}
                />
                <Field
                  label={t("fields.maritalStatus")}
                  value={
                    member.maritalStatus
                      ? tMarital(member.maritalStatus.toLowerCase() as never)
                      : "—"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("profile.contact")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label={t("fields.phone")} value={member.phone} />
                <Field label={t("fields.email")} value={member.email} />
                <Separator />
                <Field label={t("fields.address")} value={member.address} />
                <Field label={t("fields.city")} value={member.city} />
                <Field label={t("fields.province")} value={member.province} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("profile.church")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field
                  label={t("fields.joinedAt")}
                  value={fmtDate(member.joinedAt)}
                />
                <Field
                  label={t("fields.baptismDate")}
                  value={fmtDate(member.baptismDate)}
                />
                <Field
                  label={t("fields.baptismChurch")}
                  value={member.baptismChurch}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("profile.household")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {member.household ? (
                  <>
                    <Field
                      label={t("fields.householdName")}
                      value={
                        <Link
                          href={`/admin/households/${member.household.id}`}
                          className="text-primary hover:underline"
                        >
                          {member.household.name}
                        </Link>
                      }
                    />
                    <Field
                      label={t("fields.householdRole")}
                      value={member.householdRole}
                    />
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    {t("profile.noHousehold")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("login.title")}</CardTitle>
                <CardDescription>{t("login.description")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <Field
                  label={t("login.statusLabel")}
                  value={
                    member.user?.pinHash ? (
                      <Badge>{t("login.statusActive")}</Badge>
                    ) : (
                      <Badge variant="secondary">
                        {t("login.statusNoPin")}
                      </Badge>
                    )
                  }
                />
                {member.user?.lastLoginAt ? (
                  <Field
                    label={t("login.lastLoginLabel")}
                    value={format(member.user.lastLoginAt, "dd MMM yyyy, HH:mm")}
                  />
                ) : null}
                <SetPinDialog
                  memberId={id}
                  hasExistingPin={Boolean(member.user?.pinHash)}
                  hasPhone={Boolean(member.phone)}
                />
                {!member.phone ? (
                  <p className="text-xs text-muted-foreground">
                    {t("login.noPhoneHint")}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {member.notes ? (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t("profile.notes")}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm whitespace-pre-wrap">
                  {member.notes}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="cellGroups" className="mt-6">
          {member.cellGroupMembers.length === 0 ? (
            <PlaceholderCard
              title={t("tabs.cellGroups")}
              description={t("placeholders.noCellGroups")}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="flex flex-col gap-2 text-sm">
                  {member.cellGroupMembers.map((cgm) => (
                    <li key={cgm.id}>
                      <Link
                        href={`/admin/cell-groups/${cgm.cellGroup.id}`}
                        className="font-medium hover:underline"
                      >
                        {cgm.cellGroup.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          {attendanceHistory.length === 0 ? (
            <PlaceholderCard
              title={t("tabs.attendance")}
              description={t("placeholders.attendance")}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="flex flex-col gap-2 text-sm">
                  {attendanceHistory.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/attendance/services/${row.service.id}`}
                          className="font-medium hover:underline"
                        >
                          {row.service.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {tType(serviceTypeKey(row.service.type))} ·{" "}
                          {format(row.service.startsAt, "EEE dd MMM yyyy, HH:mm")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {format(row.checkedInAt, "HH:mm")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="giving" className="mt-6">
          {givingHistory.items.length === 0 ? (
            <PlaceholderCard
              title={t("tabs.giving")}
              description={t("placeholders.giving")}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      {t("giving.totalThisYear")}
                    </div>
                    <div className="text-2xl font-bold tabular-nums">
                      {formatRupiah(givingHistory.totalThisYear)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      {t("giving.totalAllTime")}
                    </div>
                    <div className="text-2xl font-bold tabular-nums">
                      {formatRupiah(givingHistory.totalAllTime)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <ul className="flex flex-col gap-2 text-sm">
                    {givingHistory.items.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-3"
                      >
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/giving/${row.id}`}
                            className="font-medium hover:underline"
                          >
                            {row.fund.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {tFundCategory(
                              row.fund.category.toLowerCase() as never,
                            )}{" "}
                            · {tMethod(givingMethodKey(row.method))} ·{" "}
                            {format(row.receivedAt, "dd MMM yyyy")}
                          </span>
                        </div>
                        <span className="font-semibold tabular-nums">
                          {formatRupiah(row.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="events" className="mt-6">
          {rsvpHistory.length === 0 ? (
            <PlaceholderCard
              title={t("tabs.events")}
              description={t("placeholders.events")}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="flex flex-col gap-2 text-sm">
                  {rsvpHistory.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/events/${row.event.id}`}
                          className="font-medium hover:underline"
                        >
                          {row.event.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {format(row.event.startsAt, "EEE dd MMM yyyy, HH:mm")}
                          {row.event.location ? ` · ${row.event.location}` : ""}
                        </span>
                      </div>
                      <Badge>{tRsvp(rsvpStatusKey(row.status))}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="discipleship" className="mt-6">
          {milestones.length === 0 ? (
            <PlaceholderCard
              title={t("tabs.discipleship")}
              description={t("placeholders.discipleship")}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ul className="flex flex-col gap-2 text-sm">
                  {milestones.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {tMilestone(milestoneTypeKey(m.type))}
                        </span>
                        {m.notes ? (
                          <span className="text-xs text-muted-foreground">
                            {m.notes}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {format(m.achievedAt, "dd MMM yyyy")}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={`/admin/discipleship/new?member=${id}`}>
                    + {t("discipleship.addMilestone")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {canPastoral ? (
          <TabsContent value="pastoral" className="mt-6">
            {visits.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tabs.pastoral")}
                  </CardTitle>
                  <CardDescription>{t("placeholders.pastoral")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/pastoral/new?member=${id}`}>
                      + {t("pastoral.addVisit")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <ul className="flex flex-col gap-2 text-sm">
                    {visits.map((v) => (
                      <li
                        key={v.id}
                        className="flex flex-col gap-1 rounded-md border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {tVisitType(visitTypeKey(v.visitType))}
                            </Badge>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {format(v.visitedAt, "dd MMM yyyy")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {v.visitedBy}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{v.notes}</p>
                        {v.followUp ? (
                          <div className="mt-1 rounded-md bg-muted px-2 py-1 text-xs">
                            <span className="font-medium">
                              {t("pastoral.followUpLabel")}:
                            </span>{" "}
                            {v.followUp}
                            {v.followUpDate
                              ? ` · ${format(v.followUpDate, "dd MMM yyyy")}`
                              : ""}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={`/admin/pastoral/new?member=${id}`}>
                      + {t("pastoral.addVisit")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2">{value || "—"}</dd>
    </div>
  );
}

function PlaceholderCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function serviceTypeKey(t: string): string {
  switch (t) {
    case "SUNDAY_MORNING":
      return "sundayMorning";
    case "SUNDAY_EVENING":
      return "sundayEvening";
    case "MIDWEEK":
      return "midweek";
    case "YOUTH":
      return "youth";
    case "CHILDREN":
      return "children";
    case "SPECIAL":
      return "special";
    default:
      return "other";
  }
}

function givingMethodKey(m: string): string {
  switch (m) {
    case "BANK_TRANSFER":
      return "bankTransfer";
    case "QRIS":
      return "qris";
    case "EWALLET":
      return "ewallet";
    case "CASH":
      return "cash";
    case "CARD":
      return "card";
    default:
      return "other";
  }
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

function visitTypeKey(type: string): string {
  switch (type) {
    case "HOSPITAL":
      return "hospital";
    case "HOME":
      return "home";
    case "OFFICE":
      return "office";
    case "PHONE":
      return "phone";
    default:
      return "other";
  }
}

function rsvpStatusKey(s: string): string {
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
