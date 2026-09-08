
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { MemberCreateForm } from "./member-create-form";

export default async function NewMemberPage() {
  const t = await getTranslations("members");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/members"
        backLabel={t("list.title")}
        title={t("new.title")}
        subtitle={t("new.subtitle")}
      />

      <MemberCreateForm submitLabel={t("new.submit")} />
    </div>
  );
}
