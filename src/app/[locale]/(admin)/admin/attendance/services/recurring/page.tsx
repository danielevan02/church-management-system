import { getTranslations } from "next-intl/server";

import { RecurringServiceForm } from "@/components/admin/attendance/recurring-service-form";

export default async function RecurringServicePage() {
  const t = await getTranslations("services.recurring");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <RecurringServiceForm />
    </div>
  );
}
