import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { FundCreateForm } from "./fund-create-form";

export default async function NewFundPage() {
  const t = await getTranslations("giving.fund.new");
  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("giving")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <FundCreateForm submitLabel={t("submit")} />
    </div>
  );
}
