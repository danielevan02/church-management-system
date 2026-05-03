"use client";

import { GivingForm } from "@/components/admin/giving/giving-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateGivingAction } from "@/server/actions/giving/update";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof GivingForm>["initialValues"]>;

export function GivingEditForm({
  id,
  funds,
  services,
  initialValues,
  submitLabel,
}: {
  id: string;
  funds: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; startsAt: Date }>;
  initialValues: Initial;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <GivingForm
      funds={funds}
      services={services}
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateGivingAction(id, input)}
      onSuccess={() => router.push(`/admin/giving/${id}`)}
    />
  );
}
