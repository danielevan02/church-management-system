import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { RecurringServiceForm } from "@/components/admin/attendance/recurring-service-form";

export default async function RecurringServicePage() {
  const t = await getTranslations("services.recurring");
  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("services")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <RecurringServiceForm />
    </div>
  );
}
