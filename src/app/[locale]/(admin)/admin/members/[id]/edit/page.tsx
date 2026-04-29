import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { MemberEditForm } from "./member-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/members/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {member.fullName}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>

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
          country: member.country ?? "ID",
          baptismDate: toDateInput(member.baptismDate),
          baptismChurch: member.baptismChurch ?? "",
          joinedAt: toDateInput(member.joinedAt),
          notes: member.notes ?? "",
        }}
      />
    </div>
  );
}
