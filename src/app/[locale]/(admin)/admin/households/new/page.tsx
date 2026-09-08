
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { HouseholdCreateForm } from "./household-create-form";

export default async function NewHouseholdPage() {
  const t = await getTranslations("households");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/households"
        backLabel={t("list.title")}
        title={t("new.title")}
      />

      <HouseholdCreateForm submitLabel={t("new.submit")} />
    </div>
  );
}
