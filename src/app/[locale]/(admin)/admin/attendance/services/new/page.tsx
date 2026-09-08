import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { ServiceCreateForm } from "./service-create-form";

export default async function NewServicePage() {
  const t = await getTranslations("services.new");
  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("services")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <ServiceCreateForm submitLabel={t("submit")} />
    </div>
  );
}
