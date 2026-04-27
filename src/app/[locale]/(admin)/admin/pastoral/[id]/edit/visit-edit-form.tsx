"use client";

import { PastoralVisitForm } from "@/components/admin/pastoral/visit-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updatePastoralVisitAction } from "@/server/actions/pastoral/visits";

import type { ComponentProps } from "react";

type Initial = NonNullable<ComponentProps<typeof PastoralVisitForm>["initialValues"]>;

export function VisitEditForm({
  id,
  initialValues,
  initialMemberName,
  submitLabel,
}: {
  id: string;
  initialValues: Initial;
  initialMemberName: string;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <PastoralVisitForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      initialMemberName={initialMemberName}
      onSubmit={(input) => updatePastoralVisitAction(id, input)}
      onSuccess={() => router.push("/admin/pastoral")}
    />
  );
}
