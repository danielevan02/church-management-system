import { getTranslations } from "next-intl/server";

import { CampaignForm } from "@/components/admin/communications/campaign-form";
import { listAllCellGroups } from "@/server/queries/cell-groups";
import { listAllTemplates } from "@/server/queries/communications";
import { listAllHouseholds } from "@/server/queries/households";

export default async function NewCampaignPage() {
  const t = await getTranslations("communications.campaign.new");

  const [templates, cellGroups, households] = await Promise.all([
    listAllTemplates(),
    listAllCellGroups(),
    listAllHouseholds(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <CampaignForm
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          channel: t.channel,
          subject: t.subject,
          body: t.body,
        }))}
        cellGroups={cellGroups.map((g) => ({ id: g.id, name: g.name }))}
        households={households.map((h) => ({ id: h.id, name: h.name }))}
        submitLabel={t("submit")}
      />
    </div>
  );
}
