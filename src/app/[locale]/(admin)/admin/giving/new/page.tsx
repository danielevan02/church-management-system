import { getTranslations } from "next-intl/server";

import { GivingCreateForm } from "./giving-create-form";
import { toJakartaDateInput } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { listAllFunds } from "@/server/queries/funds";

export default async function NewGivingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const preselectedServiceId =
    typeof sp.serviceId === "string" ? sp.serviceId : undefined;

  const t = await getTranslations("giving.new");

  const [funds, services] = await Promise.all([
    listAllFunds({ onlyActive: true }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { startsAt: "desc" },
      take: 60,
      select: { id: true, name: true, startsAt: true },
    }),
  ]);

  const preselectedService = preselectedServiceId
    ? services.find((s) => s.id === preselectedServiceId)
    : null;
  const defaultReceivedAt = preselectedService
    ? toJakartaDateInput(preselectedService.startsAt)
    : toJakartaDateInput(new Date());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>
      <GivingCreateForm
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        services={services}
        defaultServiceId={preselectedServiceId}
        defaultReceivedAt={defaultReceivedAt}
        submitLabel={t("submit")}
      />
    </div>
  );
}
