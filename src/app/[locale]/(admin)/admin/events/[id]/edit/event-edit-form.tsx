"use client";

import { EventForm } from "@/components/admin/events/event-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateEventAction } from "@/server/actions/events/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof EventForm>["initialValues"]>;

export function EventEditForm({
  id,
  initialValues,
  submitLabel,
}: {
  id: string;
  initialValues: Initial;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <EventForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateEventAction(id, input)}
      onSuccess={() => router.push(`/admin/events/${id}`)}
    />
  );
}
