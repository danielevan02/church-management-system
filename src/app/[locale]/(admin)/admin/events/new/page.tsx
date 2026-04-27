import { getTranslations } from "next-intl/server";

import { EventCreateForm } from "./event-create-form";

export default async function NewEventPage() {
  const t = await getTranslations("events.new");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <EventCreateForm submitLabel={t("submit")} />
    </div>
  );
}
