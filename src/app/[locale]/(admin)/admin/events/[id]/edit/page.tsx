import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { EventEditForm } from "./event-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getEvent } from "@/server/queries/events";

function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/admin/events/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {event.title}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
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
