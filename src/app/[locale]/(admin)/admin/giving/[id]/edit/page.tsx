
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { GivingEditForm } from "./giving-edit-form";

import { toJakartaDateInput } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";

import { prisma } from "@/lib/prisma";
import { listAllFunds } from "@/server/queries/funds";
import { getGivingEntry } from "@/server/queries/giving";

export default async function EditGivingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, funds, services] = await Promise.all([
    getGivingEntry(id),
    listAllFunds(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { startsAt: "desc" },
      take: 60,
      select: { id: true, name: true, startsAt: true },
    }),
  ]);
  if (!entry) notFound();

  const t = await getTranslations("giving");

  // Make sure the entry's existing service is in the dropdown even if it
  // falls outside the recent-60 window (or has been deactivated).
  const servicesWithCurrent =
    entry.service && !services.some((s) => s.id === entry.serviceId)
      ? [
          {
            id: entry.service.id,
            name: entry.service.name,
            startsAt: entry.service.startsAt,
          },
          ...services,
        ]
      : services;

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/giving/${id}`}
        backLabel={formatRupiah(entry.amount)}
        title={t("edit.title")}
      />
      <GivingEditForm
        id={id}
        funds={funds.map((f) => ({ id: f.id, name: f.name }))}
        services={servicesWithCurrent}
        submitLabel={t("edit.submit")}
        initialValues={{
          serviceId: entry.serviceId ?? "_none",
          fundId: entry.fundId,
          amount: entry.amount.toString(),
          receivedAt: toJakartaDateInput(entry.receivedAt),
          notes: entry.notes ?? "",
        }}
      />
    </div>
  );
}
