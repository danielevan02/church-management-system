import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { DeleteMemberButton } from "./delete-member-button";
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
import { Link } from "@/lib/i18n/navigation";
import { getMember } from "@/server/queries/members";

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

  const canPastoral =
    session?.user.role === "SUPER_ADMIN" || session?.user.role === "ADMIN";
  const canDelete = canPastoral;

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

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="cellGroups">{t("tabs.cellGroups")}</TabsTrigger>
          <TabsTrigger value="attendance">{t("tabs.attendance")}</TabsTrigger>
          <TabsTrigger value="giving">{t("tabs.giving")}</TabsTrigger>
          <TabsTrigger value="events">{t("tabs.events")}</TabsTrigger>
          <TabsTrigger value="discipleship">
            {t("tabs.discipleship")}
          </TabsTrigger>
          {canPastoral ? (
            <TabsTrigger value="pastoral">{t("tabs.pastoral")}</TabsTrigger>
          ) : null}
        </TabsList>

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
          <PlaceholderCard
            title={t("tabs.attendance")}
            description={t("placeholders.attendance")}
          />
        </TabsContent>
        <TabsContent value="giving" className="mt-6">
          <PlaceholderCard
            title={t("tabs.giving")}
            description={t("placeholders.giving")}
          />
        </TabsContent>
        <TabsContent value="events" className="mt-6">
          <PlaceholderCard
            title={t("tabs.events")}
            description={t("placeholders.events")}
          />
        </TabsContent>
        <TabsContent value="discipleship" className="mt-6">
          <PlaceholderCard
            title={t("tabs.discipleship")}
            description={t("placeholders.discipleship")}
          />
        </TabsContent>
        {canPastoral ? (
          <TabsContent value="pastoral" className="mt-6">
            <PlaceholderCard
              title={t("tabs.pastoral")}
              description={t("placeholders.pastoral")}
            />
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
