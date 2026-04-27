"use client";

import { ServiceForm } from "@/components/admin/attendance/service-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateServiceAction } from "@/server/actions/services/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof ServiceForm>["initialValues"]>;

export function ServiceEditForm({
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
    <ServiceForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateServiceAction(id, input)}
      onSuccess={() => router.push(`/admin/attendance/services/${id}`)}
    />
  );
}
