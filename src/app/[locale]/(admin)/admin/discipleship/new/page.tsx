import { getTranslations } from "next-intl/server";

import { MilestoneCreateForm } from "./milestone-create-form";

export default async function NewMilestonePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const memberParam = Array.isArray(sp.member) ? sp.member[0] : sp.member;

  const t = await getTranslations("discipleship.new");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <MilestoneCreateForm
        submitLabel={t("submit")}
        initialMemberId={memberParam ?? undefined}
      />
    </div>
  );
}
