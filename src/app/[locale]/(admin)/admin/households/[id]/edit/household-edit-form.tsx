"use client";

import { HouseholdForm } from "@/components/admin/households/household-form";
import { useRouter } from "@/lib/i18n/navigation";
import { updateHouseholdAction } from "@/server/actions/households/update";

export function HouseholdEditForm({
  id,
  initialValues,
  submitLabel,
}: {
  id: string;
  initialValues: { name: string; address: string };
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <HouseholdForm
      submitLabel={submitLabel}
      initialValues={initialValues}
      onSubmit={(input) => updateHouseholdAction(id, input)}
      onSuccess={() => router.push(`/admin/households/${id}`)}
    />
  );
}
