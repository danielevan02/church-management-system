import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServiceEditForm } from "./service-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getService } from "@/server/queries/services";

function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/attendance/services/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {service.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>

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
