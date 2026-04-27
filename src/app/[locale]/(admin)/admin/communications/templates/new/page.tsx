import { getTranslations } from "next-intl/server";

import { TemplateCreateForm } from "./template-create-form";

export default async function NewTemplatePage() {
  const t = await getTranslations("communications.template.new");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <TemplateCreateForm submitLabel={t("submit")} />
    </div>
  );
}
