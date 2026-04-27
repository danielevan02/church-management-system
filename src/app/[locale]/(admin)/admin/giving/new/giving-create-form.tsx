"use client";

import { GivingForm } from "@/components/admin/giving/giving-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createGivingAction } from "@/server/actions/giving/create";

export function GivingCreateForm({
  funds,
  submitLabel,
}: {
  funds: Array<{ id: string; name: string }>;
  submitLabel: string;
}) {
  const router = useRouter();
  return (
    <GivingForm
      funds={funds}
      submitLabel={submitLabel}
      onSubmit={createGivingAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/giving/${result.id}`);
      }}
    />
  );
}
