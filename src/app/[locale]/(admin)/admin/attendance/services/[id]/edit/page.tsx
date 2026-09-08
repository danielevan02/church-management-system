
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { ServiceEditForm } from "./service-edit-form";

import { getService } from "@/server/queries/services";
import { formatJakarta } from "@/lib/datetime";

function toDateTimeLocal(date: Date): string {
  return formatJakarta(date, "yyyy-MM-dd'T'HH:mm");
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  const t = await getTranslations("services");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/attendance/services/${id}`}
        backLabel={service.name}
        title={t("edit.title")}
      />

      <ServiceEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: service.name,
          type: service.type,
          startsAt: toDateTimeLocal(service.startsAt),
          durationMin: service.durationMin,
          location: service.location ?? "",
          notes: service.notes ?? "",
          isActive: service.isActive,
        }}
      />
    </div>
  );
}
