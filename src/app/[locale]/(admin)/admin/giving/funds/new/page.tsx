import { getTranslations } from "next-intl/server";

import { FundCreateForm } from "./fund-create-form";

export default async function NewFundPage() {
  const t = await getTranslations("giving.fund.new");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <FundCreateForm submitLabel={t("submit")} />
    </div>
  );
}
