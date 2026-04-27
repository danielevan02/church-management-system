"use client";

import { EventForm } from "@/components/admin/events/event-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createEventAction } from "@/server/actions/events/create";

export function EventCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <EventForm
      submitLabel={submitLabel}
      onSubmit={createEventAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/events/${result.id}`);
      }}
    />
  );
}
