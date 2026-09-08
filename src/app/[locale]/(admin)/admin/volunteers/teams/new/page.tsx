import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { TeamCreateForm } from "./team-create-form";

export default async function NewTeamPage() {
  const t = await getTranslations("volunteers.team.new");
  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("volunteers")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <TeamCreateForm submitLabel={t("submit")} />
    </div>
  );
}
