
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { EventEditForm } from "./event-edit-form";

import { getEvent } from "@/server/queries/events";
import { formatJakarta } from "@/lib/datetime";

function toDateTimeLocal(date: Date): string {
  return formatJakarta(date, "yyyy-MM-dd'T'HH:mm");
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const t = await getTranslations("events");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref={`/admin/events/${id}`}
        backLabel={event.title}
        title={t("edit.title")}
      />
      <EventEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          title: event.title,
          description: event.description ?? "",
          startsAt: toDateTimeLocal(event.startsAt),
          endsAt: toDateTimeLocal(event.endsAt),
          location: event.location ?? "",
          capacity: event.capacity ?? "",
          registrationOpen: event.registrationOpen,
          requiresRsvp: event.requiresRsvp,
          fee: event.fee ? event.fee.toString() : "",
          isPublished: event.isPublished,
          coverImageUrl: event.coverImageUrl ?? "",
        }}
      />
    </div>
  );
}
