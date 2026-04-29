import { getTranslations } from "next-intl/server";

import { GivingCreateForm } from "./giving-create-form";
import { listAllFunds } from "@/server/queries/funds";

export default async function NewGivingPage() {
  const t = await getTranslations("giving.new");
  const funds = await listAllFunds({ onlyActive: true });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <GivingCreateForm
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        submitLabel={t("submit")}
      />
    </div>
  );
}
