import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { ChangePinForm } from "./change-pin-form";
import { ProfileEditForm } from "./profile-edit-form";
import { PushUnsubscribeRow } from "@/components/member/push-banner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function fmtDate(d: Date | null | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : "—";
}

export default async function MemberProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!session.user.memberId) notFound();

  const member = await prisma.member.findUnique({
    where: { id: session.user.memberId },
  });
  if (!member) notFound();

  const t = await getTranslations("memberPortal.profile");
  const tStatus = await getTranslations("members.form.status");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("readonly.title")}</CardTitle>
          <CardDescription>{t("readonly.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Field label={t("fields.fullName")} value={member.fullName} />
          <Field
            label={t("fields.gender")}
            value={member.gender === "MALE" ? "Pria" : "Wanita"}
          />
          <Field
            label={t("fields.birthDate")}
            value={fmtDate(member.birthDate)}
          />
          <Separator />
          <Field
            label={t("fields.status")}
            value={
              <Badge>
                {tStatus(member.status.toLowerCase() as never)}
              </Badge>
            }
          />
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
          <CardTitle className="text-base">{t("editable.title")}</CardTitle>
          <CardDescription>{t("editable.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            initialValues={{
              phone: member.phone ?? "",
              address: member.address ?? "",
              city: member.city ?? "",
              province: member.province ?? "",
              postalCode: member.postalCode ?? "",
              country: member.country ?? "ID",
              maritalStatus: member.maritalStatus ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("pin.title")}</CardTitle>
          <CardDescription>{t("pin.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePinForm />
        </CardContent>
      </Card>

      <PushUnsubscribeRow />
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
