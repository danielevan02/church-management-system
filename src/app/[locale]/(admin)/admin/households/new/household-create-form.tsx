"use client";

import { HouseholdForm } from "@/components/admin/households/household-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createHouseholdAction } from "@/server/actions/households";

export function HouseholdCreateForm({
  submitLabel,
}: {
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <HouseholdForm
      submitLabel={submitLabel}
      onSubmit={createHouseholdAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/households/${result.id}`);
      }}
    />
  );
}
