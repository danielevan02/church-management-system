import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { GivingEditForm } from "./giving-edit-form";
import { Button } from "@/components/ui/button";
import { toJakartaDateInput } from "@/lib/datetime";
import { formatRupiah } from "@/lib/format";
import { Link } from "@/lib/i18n/navigation";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/giving/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {formatRupiah(entry.amount)}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
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
