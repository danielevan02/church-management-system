import { format } from "date-fns";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { MemberEditForm } from "./member-edit-form";

import { getMember } from "@/server/queries/members";

function toDateInput(date: Date | null | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  const t = await getTranslations("members");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/members/${id}`}
        backLabel={member.fullName}
        title={t("edit.title")}
      />

      <MemberEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          firstName: member.firstName,
          lastName: member.lastName ?? "",
          nickname: member.nickname ?? "",
          email: member.email ?? "",
          phone: member.phone ?? "",
          gender: member.gender,
          birthDate: toDateInput(member.birthDate),
          maritalStatus: member.maritalStatus ?? "",
          status: member.status,
          address: member.address ?? "",
          city: member.city ?? "",
          province: member.province ?? "",
          postalCode: member.postalCode ?? "",
          baptismDate: toDateInput(member.baptismDate),
          baptismChurch: member.baptismChurch ?? "",
          joinedAt: toDateInput(member.joinedAt),
          notes: member.notes ?? "",
        }}
      />
    </div>
  );
}
