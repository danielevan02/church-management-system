import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/m3/page-header";
import { EventCreateForm } from "./event-create-form";

export default async function NewEventPage() {
  const t = await getTranslations("events.new");
  const tEyebrow = await getTranslations("eyebrow");
  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={tEyebrow("events")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <EventCreateForm submitLabel={t("submit")} />
    </div>
  );
}
