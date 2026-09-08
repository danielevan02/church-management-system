import { format } from "date-fns";
import { KeyRound, ShieldCheck, UserRoundPen } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { ChangePinForm } from "./change-pin-form";
import { ProfileEditForm } from "./profile-edit-form";
import { BlockSection } from "@/components/m3/block-section";
import { DetailList, DetailRow } from "@/components/m3/detail-list";
import { PageHeader } from "@/components/m3/page-header";
import { PushUnsubscribeRow } from "@/components/member/push-banner";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function fmtDate(d: Date | null | undefined): string {
  return d ? format(d, "dd MMM yyyy") : "—";
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
  const tGender = await getTranslations("members.form.gender");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        icon={ShieldCheck}
        iconTone="neutral"
        title={t("readonly.title")}
        description={t("readonly.description")}
      >
        <DetailList>
          <DetailRow label={t("fields.fullName")}>{member.fullName}</DetailRow>
          <DetailRow label={t("fields.gender")}>
            {member.gender === "MALE" ? tGender("male") : tGender("female")}
          </DetailRow>
          <DetailRow label={t("fields.birthDate")}>
            {fmtDate(member.birthDate)}
          </DetailRow>
          <DetailRow label={t("fields.status")}>
            <Badge>{tStatus(member.status.toLowerCase() as never)}</Badge>
          </DetailRow>
          <DetailRow label={t("fields.joinedAt")}>
            {fmtDate(member.joinedAt)}
          </DetailRow>
          <DetailRow label={t("fields.baptismDate")}>
            {fmtDate(member.baptismDate)}
          </DetailRow>
          <DetailRow label={t("fields.baptismChurch")} span>
            {member.baptismChurch || "—"}
          </DetailRow>
        </DetailList>
      </BlockSection>

      <BlockSection
        icon={UserRoundPen}
        title={t("editable.title")}
        description={t("editable.description")}
      >
        <ProfileEditForm
          initialValues={{
            phone: member.phone ?? "",
            address: member.address ?? "",
            city: member.city ?? "",
            province: member.province ?? "",
            postalCode: member.postalCode ?? "",
            maritalStatus: member.maritalStatus ?? "",
          }}
        />
      </BlockSection>

      <BlockSection
        icon={KeyRound}
        iconTone="secondary"
        title={t("pin.title")}
        description={t("pin.description")}
      >
        <ChangePinForm />
      </BlockSection>

      <PushUnsubscribeRow />
    </div>
  );
}
