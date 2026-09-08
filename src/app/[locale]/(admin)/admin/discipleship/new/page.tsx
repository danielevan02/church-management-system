import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { MilestoneCreateForm } from "./milestone-create-form";

export default async function NewMilestonePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const memberParam = Array.isArray(sp.member) ? sp.member[0] : sp.member;

  const t = await getTranslations("discipleship.new");

  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("discipleship")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <MilestoneCreateForm
        submitLabel={t("submit")}
        initialMemberId={memberParam ?? undefined}
      />
    </div>
  );
}
